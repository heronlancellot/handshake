// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface ILendingPool {
    function financePurchase(
        address borrower,
        uint256 totalPrice,
        uint256 downPayment,
        uint256 listingId
    ) external returns (uint256 loanId);
}

contract MonadMarketplace is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _listingIds;

    uint256 public constant PLATFORM_FEE_BPS = 100;    // 1%
    uint256 public constant DEAL_TIMEOUT = 3 days;

    address public lendingPool;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        string title;
        string description;
        string contact;
        string imageURI;
        bool active;
    }

    struct Offer {
        uint256 listingId;
        address buyer;
        uint256 amount;
        bool active;
        bool financed;
    }

    struct Deal {
        uint256 listingId;
        address seller;
        address buyer;
        uint256 amount;
        bool sellerConfirmed;
        bool buyerConfirmed;
        uint256 acceptedAt;
        bool completed;
        bool cancelled;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => string) private _tokenURIs;

    // listingId => offerId => Offer
    mapping(uint256 => mapping(uint256 => Offer)) public offers;
    mapping(uint256 => uint256) public offerCounts;

    // dealId => Deal
    mapping(uint256 => Deal) public deals;
    uint256 public dealCount;

    // listingId => active dealId (0 = none)
    mapping(uint256 => uint256) public listingActiveDeal;

    event ItemListed(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price, string title);
    event OfferMade(uint256 indexed listingId, uint256 indexed offerId, address indexed buyer, uint256 amount, bool financed);
    event OfferAccepted(uint256 indexed listingId, uint256 indexed offerId, uint256 indexed dealId);
    event DeliveryConfirmed(uint256 indexed dealId, address confirmer);
    event DealCompleted(uint256 indexed dealId, address seller, address buyer, uint256 amount);
    event DealCancelled(uint256 indexed dealId);

    constructor() ERC721("MonadMarket", "MKTPL") {}

    function setLendingPool(address _lendingPool) external onlyOwner {
        lendingPool = _lendingPool;
    }

    // -----------------------------------------------------------------------
    // Listing
    // -----------------------------------------------------------------------

    function listItem(
        uint256 price,
        string calldata title,
        string calldata description,
        string calldata contact,
        string calldata imageURI
    ) external returns (uint256 listingId) {
        require(price > 0, "Price must be > 0");

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _mint(msg.sender, tokenId);
        _tokenURIs[tokenId] = imageURI;

        _listingIds.increment();
        listingId = _listingIds.current();

        listings[listingId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            title: title,
            description: description,
            contact: contact,
            imageURI: imageURI,
            active: true
        });

        emit ItemListed(listingId, tokenId, msg.sender, price, title);
    }

    // -----------------------------------------------------------------------
    // Offers
    // -----------------------------------------------------------------------

    function makeOffer(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value > 0, "Must send MON");
        require(msg.sender != listing.seller, "Seller cannot make offer");

        uint256 offerId = ++offerCounts[listingId];
        offers[listingId][offerId] = Offer({
            listingId: listingId,
            buyer: msg.sender,
            amount: msg.value,
            active: true,
            financed: false
        });

        emit OfferMade(listingId, offerId, msg.sender, msg.value, false);
    }

    function makeFinancedOffer(uint256 listingId) external payable nonReentrant {
        require(lendingPool != address(0), "LendingPool not set");
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.sender != listing.seller, "Seller cannot make offer");

        require(msg.value < listing.price, "Use makeOffer instead");

        // LendingPool sends (listing.price - msg.value) to this contract and creates the loan
        ILendingPool(lendingPool).financePurchase(
            msg.sender,
            listing.price,
            msg.value,
            listingId
        );

        uint256 offerId = ++offerCounts[listingId];
        offers[listingId][offerId] = Offer({
            listingId: listingId,
            buyer: msg.sender,
            amount: listing.price,
            active: true,
            financed: true
        });

        emit OfferMade(listingId, offerId, msg.sender, listing.price, true);
    }

    // -----------------------------------------------------------------------
    // Deal lifecycle
    // -----------------------------------------------------------------------

    function acceptOffer(uint256 listingId, uint256 offerId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        Offer storage offer = offers[listingId][offerId];
        require(offer.active, "Offer not active");

        // Refund all other active offers (non-financed only — financed handled by LendingPool)
        uint256 count = offerCounts[listingId];
        for (uint256 i = 1; i <= count; i++) {
            if (i != offerId && offers[listingId][i].active) {
                Offer storage other = offers[listingId][i];
                other.active = false;
                if (!other.financed) {
                    (bool ok,) = payable(other.buyer).call{value: other.amount}("");
                    require(ok, "Refund failed");
                }
            }
        }

        offer.active = false;
        listing.active = false;

        dealCount++;
        deals[dealCount] = Deal({
            listingId: listingId,
            seller: listing.seller,
            buyer: offer.buyer,
            amount: offer.amount,
            sellerConfirmed: false,
            buyerConfirmed: false,
            acceptedAt: block.timestamp,
            completed: false,
            cancelled: false
        });

        listingActiveDeal[listingId] = dealCount;

        emit OfferAccepted(listingId, offerId, dealCount);
    }

    function confirmDelivery(uint256 dealId) external nonReentrant {
        Deal storage deal = deals[dealId];
        require(!deal.completed && !deal.cancelled, "Deal not active");
        require(msg.sender == deal.seller || msg.sender == deal.buyer, "Not a party");

        if (msg.sender == deal.seller) {
            deal.sellerConfirmed = true;
        } else {
            deal.buyerConfirmed = true;
        }

        emit DeliveryConfirmed(dealId, msg.sender);

        if (deal.sellerConfirmed && deal.buyerConfirmed) {
            _completeDeal(dealId);
        }
    }

    function cancelDeal(uint256 dealId) external nonReentrant {
        Deal storage deal = deals[dealId];
        require(!deal.completed && !deal.cancelled, "Deal not active");

        bool isParty = msg.sender == deal.seller || msg.sender == deal.buyer;
        bool isTimeout = block.timestamp >= deal.acceptedAt + DEAL_TIMEOUT;
        require(isParty || isTimeout, "Not authorized");

        deal.cancelled = true;
        listings[deal.listingId].active = true; // re-activate listing

        (bool ok,) = payable(deal.buyer).call{value: deal.amount}("");
        require(ok, "Refund failed");

        emit DealCancelled(dealId);
    }

    // -----------------------------------------------------------------------
    // Internal
    // -----------------------------------------------------------------------

    function _completeDeal(uint256 dealId) internal {
        Deal storage deal = deals[dealId];
        deal.completed = true;

        uint256 fee = (deal.amount * PLATFORM_FEE_BPS) / 10000;
        uint256 sellerAmount = deal.amount - fee;

        // Transfer NFT to buyer
        _transfer(deal.seller, deal.buyer, listings[deal.listingId].tokenId);

        // Pay seller
        (bool sellerPaid,) = payable(deal.seller).call{value: sellerAmount}("");
        require(sellerPaid, "Seller payment failed");

        // Pay platform fee to owner
        if (fee > 0) {
            (bool feePaid,) = payable(owner()).call{value: fee}("");
            require(feePaid, "Fee payment failed");
        }

        emit DealCompleted(dealId, deal.seller, deal.buyer, deal.amount);
    }

    // -----------------------------------------------------------------------
    // Views
    // -----------------------------------------------------------------------

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function totalListings() external view returns (uint256) {
        return _listingIds.current();
    }

    function totalTokens() external view returns (uint256) {
        return _tokenIds.current();
    }

    receive() external payable {}
}
