import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LendingPool, MonadMarketplace } from "../typechain-types";

describe("LendingPool", function () {
    let pool: LendingPool;
    let marketplace: MonadMarketplace;
    let owner: SignerWithAddress;
    let lp1: SignerWithAddress;
    let lp2: SignerWithAddress;
    let borrower: SignerWithAddress;
    let stranger: SignerWithAddress;

    const PRICE = ethers.utils.parseEther("1.0");
    const DOWN_30 = ethers.utils.parseEther("0.3"); // 30% of 1 MON
    const LOAN_AMOUNT = ethers.utils.parseEther("0.7"); // 70%
    const INTEREST = LOAN_AMOUNT.mul(500).div(10000); // 5%
    const TOTAL_DUE = LOAN_AMOUNT.add(INTEREST);

    beforeEach(async () => {
        [owner, lp1, lp2, borrower, stranger] = await ethers.getSigners();

        const MarketplaceFactory = await ethers.getContractFactory("MonadMarketplace");
        marketplace = (await MarketplaceFactory.deploy()) as MonadMarketplace;
        await marketplace.deployed();

        const PoolFactory = await ethers.getContractFactory("LendingPool");
        pool = (await PoolFactory.deploy()) as LendingPool;
        await pool.deployed();

        // Wire up
        await pool.connect(owner).setMarketplace(marketplace.address);
        await marketplace.connect(owner).setLendingPool(pool.address);
    });

    // -----------------------------------------------------------------------
    // deposit & withdraw
    // -----------------------------------------------------------------------
    describe("deposit", () => {
        it("tracks LP deposits", async () => {
            await pool.connect(lp1).deposit({ value: ethers.utils.parseEther("5") });
            expect(await pool.deposits(lp1.address)).to.equal(ethers.utils.parseEther("5"));
            expect(await pool.totalDeposited()).to.equal(ethers.utils.parseEther("5"));
        });

        it("reverts with zero value", async () => {
            await expect(pool.connect(lp1).deposit({ value: 0 })).to.be.revertedWith("Must send MON");
        });

        it("multiple LPs can deposit", async () => {
            await pool.connect(lp1).deposit({ value: ethers.utils.parseEther("3") });
            await pool.connect(lp2).deposit({ value: ethers.utils.parseEther("2") });
            expect(await pool.totalDeposited()).to.equal(ethers.utils.parseEther("5"));
        });
    });

    describe("withdraw", () => {
        beforeEach(async () => {
            await pool.connect(lp1).deposit({ value: ethers.utils.parseEther("5") });
        });

        it("allows LP to withdraw deposited amount", async () => {
            const before = await lp1.getBalance();
            const tx = await pool.connect(lp1).withdraw(ethers.utils.parseEther("2"));
            const receipt = await tx.wait();
            const gas = receipt.gasUsed.mul(tx.gasPrice!);
            const after = await lp1.getBalance();
            expect(after.sub(before).add(gas)).to.equal(ethers.utils.parseEther("2"));
            expect(await pool.deposits(lp1.address)).to.equal(ethers.utils.parseEther("3"));
        });

        it("reverts when withdrawing more than deposited", async () => {
            await expect(
                pool.connect(lp1).withdraw(ethers.utils.parseEther("6"))
            ).to.be.revertedWith("Insufficient deposit");
        });

        it("reverts when insufficient liquidity (loan outstanding)", async () => {
            // Create a listing and financed offer to lock funds
            await marketplace.connect(owner).listItem(PRICE, "Bike", "Desc", "c", "img");
            await marketplace.connect(borrower).makeFinancedOffer(1, { value: DOWN_30 });

            // LP now has only 0.3 available (0.7 was lent out + 0.3 down payment in marketplace)
            await expect(
                pool.connect(lp1).withdraw(ethers.utils.parseEther("5"))
            ).to.be.revertedWith("Insufficient liquidity");
        });
    });

    // -----------------------------------------------------------------------
    // financePurchase (via marketplace.makeFinancedOffer)
    // -----------------------------------------------------------------------
    describe("financePurchase via makeFinancedOffer", () => {
        beforeEach(async () => {
            await pool.connect(lp1).deposit({ value: ethers.utils.parseEther("5") });
            await marketplace.connect(owner).listItem(PRICE, "Bike", "Desc", "c", "img");
        });

        it("creates a loan and funds the marketplace escrow", async () => {
            const marketplaceBefore = await ethers.provider.getBalance(marketplace.address);
            await marketplace.connect(borrower).makeFinancedOffer(1, { value: DOWN_30 });

            // Marketplace should have the full price (down + loan)
            const marketplaceAfter = await ethers.provider.getBalance(marketplace.address);
            expect(marketplaceAfter.sub(marketplaceBefore)).to.equal(PRICE);

            // Loan created correctly
            const loanId = await pool.loanCounter();
            const loan = await pool.loans(loanId);
            expect(loan.borrower).to.equal(borrower.address);
            expect(loan.principal).to.equal(LOAN_AMOUNT);
            expect(loan.totalDue).to.equal(TOTAL_DUE);
            expect(loan.status).to.equal(0); // Active
        });

        it("reverts if down payment is below 30%", async () => {
            const lowDown = ethers.utils.parseEther("0.29");
            await expect(
                marketplace.connect(borrower).makeFinancedOffer(1, { value: lowDown })
            ).to.be.revertedWith("Insufficient down payment (min 30%)");
        });

        it("reverts if pool has insufficient liquidity", async () => {
            // Drain most pool liquidity first
            await pool.connect(lp1).withdraw(ethers.utils.parseEther("4.5"));
            // Only 0.5 available, need 0.7
            await expect(
                marketplace.connect(borrower).makeFinancedOffer(1, { value: DOWN_30 })
            ).to.be.revertedWith("Insufficient pool liquidity");
        });

        it("reverts if borrower is a defaulter", async () => {
            // Create and default a loan first
            await marketplace.connect(owner).listItem(PRICE, "Bike2", "Desc", "c", "img");
            await marketplace.connect(borrower).makeFinancedOffer(2, { value: DOWN_30 });
            const loanId = await pool.loanCounter();
            // Fast-forward 30 days + 1 sec
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60 + 1]);
            await ethers.provider.send("evm_mine", []);
            await pool.connect(stranger).markDefault(loanId);

            // Now borrower is a defaulter — cannot get more credit
            await marketplace.connect(owner).listItem(PRICE, "Bike3", "Desc", "c", "img");
            await expect(
                marketplace.connect(borrower).makeFinancedOffer(3, { value: DOWN_30 })
            ).to.be.revertedWith("Borrower is defaulter");
        });

        it("reverts when called directly (not marketplace)", async () => {
            await expect(
                pool.connect(stranger).financePurchase(
                    borrower.address,
                    PRICE,
                    DOWN_30,
                    1
                )
            ).to.be.revertedWith("Only marketplace");
        });
    });

    // -----------------------------------------------------------------------
    // repayLoan
    // -----------------------------------------------------------------------
    describe("repayLoan", () => {
        let loanId: number;

        beforeEach(async () => {
            await pool.connect(lp1).deposit({ value: ethers.utils.parseEther("5") });
            await marketplace.connect(owner).listItem(PRICE, "Bike", "Desc", "c", "img");
            await marketplace.connect(borrower).makeFinancedOffer(1, { value: DOWN_30 });
            loanId = (await pool.loanCounter()).toNumber();
        });

        it("marks loan as paid when full amount is sent", async () => {
            await pool.connect(borrower).repayLoan(loanId, { value: TOTAL_DUE });

            const loan = await pool.loans(loanId);
            expect(loan.status).to.equal(1); // Paid
            expect(loan.paidAmount).to.equal(TOTAL_DUE);
        });

        it("allows partial repayment", async () => {
            const partial = ethers.utils.parseEther("0.3");
            await pool.connect(borrower).repayLoan(loanId, { value: partial });

            const loan = await pool.loans(loanId);
            expect(loan.status).to.equal(0); // Active
            expect(loan.paidAmount).to.equal(partial);
        });

        it("decreases totalBorrowed on full repayment", async () => {
            const before = await pool.totalBorrowed();
            await pool.connect(borrower).repayLoan(loanId, { value: TOTAL_DUE });
            const after = await pool.totalBorrowed();
            expect(before.sub(after)).to.equal(LOAN_AMOUNT);
        });

        it("reverts overpayment", async () => {
            const over = TOTAL_DUE.add(1);
            await expect(
                pool.connect(borrower).repayLoan(loanId, { value: over })
            ).to.be.revertedWith("Overpayment");
        });

        it("reverts when non-borrower tries to repay", async () => {
            await expect(
                pool.connect(stranger).repayLoan(loanId, { value: TOTAL_DUE })
            ).to.be.revertedWith("Not your loan");
        });
    });

    // -----------------------------------------------------------------------
    // markDefault
    // -----------------------------------------------------------------------
    describe("markDefault", () => {
        let loanId: number;

        beforeEach(async () => {
            await pool.connect(lp1).deposit({ value: ethers.utils.parseEther("5") });
            await marketplace.connect(owner).listItem(PRICE, "Bike", "Desc", "c", "img");
            await marketplace.connect(borrower).makeFinancedOffer(1, { value: DOWN_30 });
            loanId = (await pool.loanCounter()).toNumber();
        });

        it("marks loan as defaulted after due date", async () => {
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60 + 1]);
            await ethers.provider.send("evm_mine", []);

            await pool.connect(stranger).markDefault(loanId);

            const loan = await pool.loans(loanId);
            expect(loan.status).to.equal(2); // Defaulted
            expect(await pool.defaulters(borrower.address)).to.be.true;
        });

        it("reverts before due date", async () => {
            await expect(
                pool.connect(stranger).markDefault(loanId)
            ).to.be.revertedWith("Not yet due");
        });

        it("reverts on already paid loan", async () => {
            await pool.connect(borrower).repayLoan(loanId, { value: TOTAL_DUE });
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60 + 1]);
            await ethers.provider.send("evm_mine", []);

            await expect(
                pool.connect(stranger).markDefault(loanId)
            ).to.be.revertedWith("Loan not active");
        });
    });

    // -----------------------------------------------------------------------
    // Pool stats & views
    // -----------------------------------------------------------------------
    describe("pool stats", () => {
        it("returns correct stats after deposit and loan", async () => {
            await pool.connect(lp1).deposit({ value: ethers.utils.parseEther("5") });
            await marketplace.connect(owner).listItem(PRICE, "Bike", "Desc", "c", "img");
            await marketplace.connect(borrower).makeFinancedOffer(1, { value: DOWN_30 });

            const [dep, bor, loans, avail] = await pool.getPoolStats();
            expect(dep).to.equal(ethers.utils.parseEther("5"));
            expect(bor).to.equal(LOAN_AMOUNT);
            expect(loans).to.equal(1);
        });

        it("getUserLoans returns borrower loans", async () => {
            await pool.connect(lp1).deposit({ value: ethers.utils.parseEther("5") });
            await marketplace.connect(owner).listItem(PRICE, "Bike", "Desc", "c", "img");
            await marketplace.connect(borrower).makeFinancedOffer(1, { value: DOWN_30 });

            const userLoans = await pool.getUserLoans(borrower.address);
            expect(userLoans.length).to.equal(1);
            expect(userLoans[0].borrower).to.equal(borrower.address);
        });
    });

    // -----------------------------------------------------------------------
    // setMarketplace
    // -----------------------------------------------------------------------
    describe("setMarketplace", () => {
        it("can only be set once", async () => {
            await expect(
                pool.connect(owner).setMarketplace(stranger.address)
            ).to.be.revertedWith("Already set");
        });

        it("reverts for non-owner", async () => {
            const newPool = (await (await ethers.getContractFactory("LendingPool")).deploy()) as LendingPool;
            await newPool.deployed();
            await expect(
                newPool.connect(stranger).setMarketplace(marketplace.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
