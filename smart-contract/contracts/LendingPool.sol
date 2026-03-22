// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LendingPool is Ownable, ReentrancyGuard {
    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------

    uint256 public constant LTV = 7000;            // 70% loan-to-value (base 10000)
    uint256 public constant INTEREST_RATE = 500;   // 5% interest (base 10000)
    uint256 public constant LOAN_DURATION = 30 days;

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    enum LoanStatus { Active, Paid, Defaulted }

    struct Loan {
        address borrower;
        uint256 collateral;   // MON locked as collateral for this loan
        uint256 principal;    // MON sent to marketplace escrow
        uint256 totalDue;     // principal + interest
        uint256 paidAmount;
        uint256 dueDate;
        uint256 listingId;
        LoanStatus status;
    }

    address public marketplace;

    mapping(address => uint256) public collateral;   // total collateral deposited per user
    mapping(address => uint256) public activeDebt;   // principal currently owed per user
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    uint256 public loanCounter;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------

    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 collateral,
        uint256 principal,
        uint256 totalDue,
        uint256 dueDate
    );
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 remaining);
    event LoanPaidOff(uint256 indexed loanId, address indexed borrower);
    event LoanLiquidated(uint256 indexed loanId, address indexed borrower, uint256 collateralSeized);

    // -----------------------------------------------------------------------
    // Admin
    // -----------------------------------------------------------------------

    modifier onlyMarketplace() {
        require(msg.sender == marketplace, "Only marketplace");
        _;
    }

    function setMarketplace(address _marketplace) external onlyOwner {
        require(marketplace == address(0), "Already set");
        require(_marketplace != address(0), "Invalid address");
        marketplace = _marketplace;
    }

    // -----------------------------------------------------------------------
    // Collateral management
    // -----------------------------------------------------------------------

    /// @notice Deposit MON as collateral to unlock borrowing power
    function depositCollateral() external payable nonReentrant {
        require(msg.value > 0, "Must send MON");
        collateral[msg.sender] += msg.value;
        emit CollateralDeposited(msg.sender, msg.value);
    }

    /// @notice Withdraw free (unlocked) collateral
    function withdrawCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        uint256 free = freeCollateral(msg.sender);
        require(free >= amount, "Collateral locked by active loans");
        collateral[msg.sender] -= amount;
        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Withdraw failed");
        emit CollateralWithdrawn(msg.sender, amount);
    }

    // -----------------------------------------------------------------------
    // Views
    // -----------------------------------------------------------------------

    /// @notice How much the user can still borrow (in MON)
    function borrowingPower(address user) public view returns (uint256) {
        uint256 maxBorrow = (collateral[user] * LTV) / 10000;
        if (maxBorrow <= activeDebt[user]) return 0;
        return maxBorrow - activeDebt[user];
    }

    /// @notice Collateral not locked by any active loan
    function freeCollateral(address user) public view returns (uint256) {
        return collateral[user] - _lockedCollateral(user);
    }

    function getUserLoanIds(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }

    function getPoolStats() external view returns (
        uint256 _poolBalance,
        uint256 _totalLoans
    ) {
        return (address(this).balance, loanCounter);
    }

    // -----------------------------------------------------------------------
    // Lending — called by marketplace.makeFinancedOffer
    // -----------------------------------------------------------------------

    /// @notice Called by marketplace. Sends `principal` to escrow and locks collateral.
    function financePurchase(
        address borrower,
        uint256 totalPrice,
        uint256 downPayment,
        uint256 listingId
    ) external nonReentrant onlyMarketplace returns (uint256 loanId) {
        uint256 principal = totalPrice - downPayment;
        require(principal > 0, "No loan needed");
        require(borrowingPower(borrower) >= principal, "Insufficient borrowing power");

        // Collateral required to back this loan (inverse of LTV)
        uint256 collateralRequired = (principal * 10000 + LTV - 1) / LTV;
        require(freeCollateral(borrower) >= collateralRequired, "Not enough free collateral");
        require(address(this).balance >= principal, "Pool has insufficient liquidity");

        uint256 interest = (principal * INTEREST_RATE) / 10000;
        uint256 totalDue = principal + interest;
        uint256 dueDate = block.timestamp + LOAN_DURATION;

        loanCounter++;
        loanId = loanCounter;

        loans[loanId] = Loan({
            borrower: borrower,
            collateral: collateralRequired,
            principal: principal,
            totalDue: totalDue,
            paidAmount: 0,
            dueDate: dueDate,
            listingId: listingId,
            status: LoanStatus.Active
        });

        userLoans[borrower].push(loanId);
        activeDebt[borrower] += principal;

        // Transfer principal to marketplace escrow
        (bool ok,) = payable(marketplace).call{value: principal}("");
        require(ok, "Transfer to escrow failed");

        emit LoanCreated(loanId, borrower, collateralRequired, principal, totalDue, dueDate);
    }

    // -----------------------------------------------------------------------
    // Repayment
    // -----------------------------------------------------------------------

    function repayLoan(uint256 loanId) external payable nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not your loan");
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(msg.value > 0, "Must send MON");

        uint256 remaining = loan.totalDue - loan.paidAmount;
        require(msg.value <= remaining, "Overpayment");

        loan.paidAmount += msg.value;
        emit LoanRepaid(loanId, msg.sender, msg.value, loan.totalDue - loan.paidAmount);

        if (loan.paidAmount >= loan.totalDue) {
            loan.status = LoanStatus.Paid;
            activeDebt[msg.sender] -= loan.principal;
            // Collateral automatically unlocked (tracked via _lockedCollateral)
            emit LoanPaidOff(loanId, msg.sender);
        }
    }

    // -----------------------------------------------------------------------
    // Liquidation — callable by anyone after dueDate
    // -----------------------------------------------------------------------

    function liquidate(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(block.timestamp > loan.dueDate, "Not yet due");

        loan.status = LoanStatus.Defaulted;
        collateral[loan.borrower] -= loan.collateral;
        activeDebt[loan.borrower] -= loan.principal;
        // Seized collateral stays in pool to replenish liquidity

        emit LoanLiquidated(loanId, loan.borrower, loan.collateral);
    }

    // -----------------------------------------------------------------------
    // Internal
    // -----------------------------------------------------------------------

    function _lockedCollateral(address user) internal view returns (uint256) {
        uint256 locked = 0;
        uint256[] storage ids = userLoans[user];
        for (uint256 i = 0; i < ids.length; i++) {
            if (loans[ids[i]].status == LoanStatus.Active) {
                locked += loans[ids[i]].collateral;
            }
        }
        return locked;
    }

    receive() external payable {}
}
