// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LendingPool is Ownable, ReentrancyGuard {
    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------

    uint256 public constant INTEREST_RATE = 500;       // 5% (base 10000)
    uint256 public constant LOAN_DURATION = 30 days;
    uint256 public constant MIN_DOWN_PAYMENT = 3000;   // 30% min (base 10000)

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    enum LoanStatus { Active, Paid, Defaulted }

    struct Loan {
        address borrower;
        uint256 principal;      // MON borrowed (without interest)
        uint256 totalDue;       // principal + 5% interest
        uint256 paidAmount;     // amount paid so far
        uint256 dueDate;        // timestamp to repay by
        uint256 listingId;      // marketplace listing reference
        LoanStatus status;
    }

    address public marketplace;

    uint256 public totalDeposited;  // total LP deposits (principal only)
    uint256 public totalBorrowed;   // principal currently lent out
    uint256 public loanCounter;

    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    mapping(address => uint256) public deposits;    // LP → deposited amount
    mapping(address => bool) public defaulters;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------

    event Deposited(address indexed lp, uint256 amount);
    event Withdrawn(address indexed lp, uint256 amount);
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 totalDue,
        uint256 dueDate
    );
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 remaining);
    event LoanPaidOff(uint256 indexed loanId, address indexed borrower);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower, uint256 amountLost);

    // -----------------------------------------------------------------------
    // Modifiers
    // -----------------------------------------------------------------------

    modifier onlyMarketplace() {
        require(msg.sender == marketplace, "Only marketplace");
        _;
    }

    // -----------------------------------------------------------------------
    // Admin
    // -----------------------------------------------------------------------

    function setMarketplace(address _marketplace) external onlyOwner {
        require(marketplace == address(0), "Already set");
        require(_marketplace != address(0), "Invalid address");
        marketplace = _marketplace;
    }

    // -----------------------------------------------------------------------
    // LP functions
    // -----------------------------------------------------------------------

    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Must send MON");
        deposits[msg.sender] += msg.value;
        totalDeposited += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(deposits[msg.sender] >= amount, "Insufficient deposit");
        require(getAvailableLiquidity() >= amount, "Insufficient liquidity");

        deposits[msg.sender] -= amount;
        totalDeposited -= amount;

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Withdraw failed");

        emit Withdrawn(msg.sender, amount);
    }

    // -----------------------------------------------------------------------
    // Credit — called by marketplace
    // -----------------------------------------------------------------------

    function financePurchase(
        address borrower,
        uint256 totalPrice,
        uint256 downPayment,
        uint256 listingId
    ) external nonReentrant onlyMarketplace returns (uint256 loanId) {
        require(!defaulters[borrower], "Borrower is defaulter");

        uint256 minDown = (totalPrice * MIN_DOWN_PAYMENT) / 10000;
        require(downPayment >= minDown, "Down payment below 30%");
        require(downPayment < totalPrice, "Down covers full price");

        uint256 principal = totalPrice - downPayment;
        require(getAvailableLiquidity() >= principal, "Insufficient pool liquidity");

        uint256 interest = (principal * INTEREST_RATE) / 10000;
        uint256 totalDue = principal + interest;
        uint256 dueDate = block.timestamp + LOAN_DURATION;

        loanCounter++;
        loanId = loanCounter;

        loans[loanId] = Loan({
            borrower: borrower,
            principal: principal,
            totalDue: totalDue,
            paidAmount: 0,
            dueDate: dueDate,
            listingId: listingId,
            status: LoanStatus.Active
        });

        userLoans[borrower].push(loanId);
        totalBorrowed += principal;

        // Transfer loan amount to marketplace (the escrow)
        (bool ok,) = payable(marketplace).call{value: principal}("");
        require(ok, "Transfer to escrow failed");

        emit LoanCreated(loanId, borrower, principal, totalDue, dueDate);
    }

    // -----------------------------------------------------------------------
    // Repayment — called by borrower
    // -----------------------------------------------------------------------

    function repayLoan(uint256 loanId) external payable nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not your loan");
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(msg.value > 0, "Must send MON");

        uint256 remaining = loan.totalDue - loan.paidAmount;
        require(msg.value <= remaining, "Overpayment");

        loan.paidAmount += msg.value;
        uint256 newRemaining = loan.totalDue - loan.paidAmount;

        emit LoanRepaid(loanId, msg.sender, msg.value, newRemaining);

        if (loan.paidAmount >= loan.totalDue) {
            loan.status = LoanStatus.Paid;
            totalBorrowed -= loan.principal;
            // Interest (msg.value - principal portion) stays in pool for LPs
            emit LoanPaidOff(loanId, msg.sender);
        }
    }

    // -----------------------------------------------------------------------
    // Default — callable by anyone after due date
    // -----------------------------------------------------------------------

    function markDefault(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(block.timestamp > loan.dueDate, "Not yet due");

        uint256 lost = loan.principal - (loan.paidAmount > 0 ? _principalPaid(loan) : 0);

        loan.status = LoanStatus.Defaulted;
        defaulters[loan.borrower] = true;

        // Write off the unborrowed principal from accounting
        uint256 actualLost = loan.principal;
        if (totalBorrowed >= actualLost) {
            totalBorrowed -= actualLost;
        } else {
            totalBorrowed = 0;
        }

        emit LoanDefaulted(loanId, loan.borrower, lost);
    }

    // -----------------------------------------------------------------------
    // Views
    // -----------------------------------------------------------------------

    function getAvailableLiquidity() public view returns (uint256) {
        uint256 bal = address(this).balance;
        return bal > totalBorrowed ? bal - totalBorrowed : 0;
    }

    function getUserLoans(address user) external view returns (Loan[] memory) {
        uint256[] storage ids = userLoans[user];
        Loan[] memory result = new Loan[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = loans[ids[i]];
        }
        return result;
    }

    function getUserLoanIds(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }

    function getPoolStats() external view returns (
        uint256 _totalDeposited,
        uint256 _totalBorrowed,
        uint256 _totalLoans,
        uint256 _availableLiquidity
    ) {
        return (totalDeposited, totalBorrowed, loanCounter, getAvailableLiquidity());
    }

    function isDefaulter(address user) external view returns (bool) {
        return defaulters[user];
    }

    // -----------------------------------------------------------------------
    // Internal
    // -----------------------------------------------------------------------

    function _principalPaid(Loan storage loan) internal view returns (uint256) {
        // Approximate principal portion of paidAmount
        // (interest is proportional to principal / totalDue)
        if (loan.totalDue == 0) return 0;
        return (loan.paidAmount * loan.principal) / loan.totalDue;
    }

    receive() external payable {}
}
