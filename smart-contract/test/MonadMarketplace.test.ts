import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MonadMarketplace } from "../typechain-types";

describe("MonadMarketplace", function () {
    let marketplace: MonadMarketplace;
    let owner: SignerWithAddress;
    let seller: SignerWithAddress;
    let buyer1: SignerWithAddress;
    let buyer2: SignerWithAddress;

    const PRICE = ethers.utils.parseEther("1.0"); // 1 MON

    beforeEach(async () => {
        [owner, seller, buyer1, buyer2] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("MonadMarketplace");
        marketplace = (await Factory.deploy()) as MonadMarketplace;
        await marketplace.deployed();
    });

    // -----------------------------------------------------------------------
    // listItem
    // -----------------------------------------------------------------------
    describe("listItem", () => {
        it("mints NFT and creates listing", async () => {
            await marketplace.connect(seller).listItem(
                PRICE, "Bike", "Mountain bike", "seller@test.com", "ipfs://img"
            );

            const listing = await marketplace.listings(1);
            expect(listing.seller).to.equal(seller.address);
            expect(listing.price).to.equal(PRICE);
            expect(listing.title).to.equal("Bike");
            expect(listing.active).to.be.true;
            expect(await marketplace.ownerOf(1)).to.equal(seller.address);
        });

        it("reverts when price is zero", async () => {
            await expect(
                marketplace.connect(seller).listItem(0, "X", "X", "x", "x")
            ).to.be.revertedWith("Price must be > 0");
        });

        it("increments listing counter", async () => {
            await marketplace.connect(seller).listItem(PRICE, "A", "A", "a", "a");
            await marketplace.connect(seller).listItem(PRICE, "B", "B", "b", "b");
            expect(await marketplace.totalListings()).to.equal(2);
        });
    });

    // -----------------------------------------------------------------------
    // makeOffer
    // -----------------------------------------------------------------------
    describe("makeOffer", () => {
        beforeEach(async () => {
            await marketplace.connect(seller).listItem(PRICE, "Bike", "Desc", "c", "img");
        });

        it("stores offer and keeps MON in contract", async () => {
            const offerAmount = ethers.utils.parseEther("0.8");
            await marketplace.connect(buyer1).makeOffer(1, { value: offerAmount });

            const offer = await marketplace.offers(1, 1);
            expect(offer.buyer).to.equal(buyer1.address);
            expect(offer.amount).to.equal(offerAmount);
            expect(offer.active).to.be.true;
        });

        it("allows multiple offers on the same listing", async () => {
            await marketplace.connect(buyer1).makeOffer(1, { value: ethers.utils.parseEther("0.5") });
            await marketplace.connect(buyer2).makeOffer(1, { value: ethers.utils.parseEther("0.9") });
            expect(await marketplace.offerCounts(1)).to.equal(2);
        });

        it("reverts when seller tries to make offer", async () => {
            await expect(
                marketplace.connect(seller).makeOffer(1, { value: PRICE })
            ).to.be.revertedWith("Seller cannot make offer");
        });

        it("reverts when value is 0", async () => {
            await expect(
                marketplace.connect(buyer1).makeOffer(1, { value: 0 })
            ).to.be.revertedWith("Must send MON");
        });

        it("reverts on inactive listing", async () => {
            // accept an offer to deactivate listing
            await marketplace.connect(buyer1).makeOffer(1, { value: PRICE });
            await marketplace.connect(seller).acceptOffer(1, 1);

            await expect(
                marketplace.connect(buyer2).makeOffer(1, { value: PRICE })
            ).to.be.revertedWith("Listing not active");
        });
    });

    // -----------------------------------------------------------------------
    // acceptOffer
    // -----------------------------------------------------------------------
    describe("acceptOffer", () => {
        beforeEach(async () => {
            await marketplace.connect(seller).listItem(PRICE, "Bike", "Desc", "c", "img");
            await marketplace.connect(buyer1).makeOffer(1, { value: ethers.utils.parseEther("0.8") });
            await marketplace.connect(buyer2).makeOffer(1, { value: ethers.utils.parseEther("0.9") });
        });

        it("creates a deal and deactivates listing", async () => {
            await marketplace.connect(seller).acceptOffer(1, 2);

            const deal = await marketplace.deals(1);
            expect(deal.seller).to.equal(seller.address);
            expect(deal.buyer).to.equal(buyer2.address);
            expect(deal.amount).to.equal(ethers.utils.parseEther("0.9"));
            expect(deal.completed).to.be.false;

            const listing = await marketplace.listings(1);
            expect(listing.active).to.be.false;
        });

        it("refunds rejected offers", async () => {
            const buyer1BalanceBefore = await buyer1.getBalance();
            await marketplace.connect(seller).acceptOffer(1, 2);
            const buyer1BalanceAfter = await buyer1.getBalance();

            expect(buyer1BalanceAfter.sub(buyer1BalanceBefore)).to.equal(
                ethers.utils.parseEther("0.8")
            );
        });

        it("reverts when called by non-seller", async () => {
            await expect(
                marketplace.connect(buyer1).acceptOffer(1, 1)
            ).to.be.revertedWith("Not the seller");
        });
    });

    // -----------------------------------------------------------------------
    // confirmDelivery
    // -----------------------------------------------------------------------
    describe("confirmDelivery", () => {
        beforeEach(async () => {
            await marketplace.connect(seller).listItem(PRICE, "Bike", "Desc", "c", "img");
            await marketplace.connect(buyer1).makeOffer(1, { value: PRICE });
            await marketplace.connect(seller).acceptOffer(1, 1);
        });

        it("completes deal when both parties confirm", async () => {
            const sellerBalanceBefore = await seller.getBalance();

            const tx1 = await marketplace.connect(seller).confirmDelivery(1);
            const receipt1 = await tx1.wait();
            const gas1 = receipt1.gasUsed.mul(tx1.gasPrice!);

            const tx2 = await marketplace.connect(buyer1).confirmDelivery(1);
            const receipt2 = await tx2.wait();

            const deal = await marketplace.deals(1);
            expect(deal.completed).to.be.true;

            // Seller received 99% (1% fee)
            const expectedPayout = PRICE.mul(9900).div(10000);
            const sellerBalanceAfter = await seller.getBalance();
            expect(sellerBalanceAfter.sub(sellerBalanceBefore).add(gas1)).to.equal(expectedPayout);

            // NFT transferred to buyer
            expect(await marketplace.ownerOf(1)).to.equal(buyer1.address);
        });

        it("emits DeliveryConfirmed for each party", async () => {
            await expect(marketplace.connect(seller).confirmDelivery(1))
                .to.emit(marketplace, "DeliveryConfirmed")
                .withArgs(1, seller.address);
            await expect(marketplace.connect(buyer1).confirmDelivery(1))
                .to.emit(marketplace, "DealCompleted");
        });

        it("reverts when non-party calls confirmDelivery", async () => {
            await expect(
                marketplace.connect(buyer2).confirmDelivery(1)
            ).to.be.revertedWith("Not a party");
        });
    });

    // -----------------------------------------------------------------------
    // cancelDeal
    // -----------------------------------------------------------------------
    describe("cancelDeal", () => {
        beforeEach(async () => {
            await marketplace.connect(seller).listItem(PRICE, "Bike", "Desc", "c", "img");
            await marketplace.connect(buyer1).makeOffer(1, { value: PRICE });
            await marketplace.connect(seller).acceptOffer(1, 1);
        });

        it("refunds buyer and re-activates listing", async () => {
            const buyerBalanceBefore = await buyer1.getBalance();

            const tx = await marketplace.connect(buyer1).cancelDeal(1);
            const receipt = await tx.wait();
            const gas = receipt.gasUsed.mul(tx.gasPrice!);

            const buyerBalanceAfter = await buyer1.getBalance();
            expect(buyerBalanceAfter.sub(buyerBalanceBefore).add(gas)).to.equal(PRICE);

            const deal = await marketplace.deals(1);
            expect(deal.cancelled).to.be.true;

            const listing = await marketplace.listings(1);
            expect(listing.active).to.be.true;
        });

        it("allows seller to cancel", async () => {
            await marketplace.connect(seller).cancelDeal(1);
            const deal = await marketplace.deals(1);
            expect(deal.cancelled).to.be.true;
        });

        it("allows anyone to cancel after timeout", async () => {
            await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60 + 1]);
            await ethers.provider.send("evm_mine", []);

            // third party can cancel after timeout
            await marketplace.connect(buyer2).cancelDeal(1);
            const deal = await marketplace.deals(1);
            expect(deal.cancelled).to.be.true;
        });

        it("reverts before timeout for non-party", async () => {
            await expect(
                marketplace.connect(buyer2).cancelDeal(1)
            ).to.be.revertedWith("Not authorized");
        });

        it("reverts on already completed deal", async () => {
            await marketplace.connect(seller).confirmDelivery(1);
            await marketplace.connect(buyer1).confirmDelivery(1);

            await expect(
                marketplace.connect(buyer1).cancelDeal(1)
            ).to.be.revertedWith("Deal not active");
        });
    });

    // -----------------------------------------------------------------------
    // Platform fee
    // -----------------------------------------------------------------------
    describe("Platform fee", () => {
        it("owner receives 1% fee on deal completion", async () => {
            await marketplace.connect(seller).listItem(PRICE, "Bike", "Desc", "c", "img");
            await marketplace.connect(buyer1).makeOffer(1, { value: PRICE });
            await marketplace.connect(seller).acceptOffer(1, 1);

            const ownerBalanceBefore = await owner.getBalance();
            await marketplace.connect(seller).confirmDelivery(1);
            await marketplace.connect(buyer1).confirmDelivery(1);
            const ownerBalanceAfter = await owner.getBalance();

            const expectedFee = PRICE.mul(100).div(10000); // 1%
            expect(ownerBalanceAfter.sub(ownerBalanceBefore)).to.equal(expectedFee);
        });
    });

    // -----------------------------------------------------------------------
    // setLendingPool
    // -----------------------------------------------------------------------
    describe("setLendingPool", () => {
        it("owner can set lending pool", async () => {
            await marketplace.connect(owner).setLendingPool(buyer1.address);
            expect(await marketplace.lendingPool()).to.equal(buyer1.address);
        });

        it("reverts when non-owner tries to set", async () => {
            await expect(
                marketplace.connect(seller).setLendingPool(buyer1.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
