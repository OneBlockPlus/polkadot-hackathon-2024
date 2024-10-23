import { ethers } from "hardhat";
const { expect } = require("chai");

describe("Lending Contract", function () {
    let Lending, lending;
    let USDT, BTC;
    let owner, liquidator, lender1, lender2, borrower, lender0;

    const LTV = 70; // Loan to value ratio (70%)
    const LIQUIDATION_THRESHOLD = 80; // Liquidation threshold (80%)

    beforeEach(async function () {
        [owner, liquidator, lender1, lender2, borrower, lender0] = await ethers.getSigners();

        // Create a mock for the USDT and BTC tokens
        const USDTMock = await ethers.getContractFactory("MockERC20");
        const BTCMock = await ethers.getContractFactory("MockERC20");

        // Deploy the USDT and BTC mock tokens
        USDT = await USDTMock.deploy();
        BTC = await BTCMock.deploy();

        // Wait for the deployment to be completed
        await USDT.waitForDeployment();
        await BTC.waitForDeployment();

        // Mint some USDT to lender1 for testing
        await USDT.mint(lender1.address, ethers.parseUnits("10000", 18)); // Lender1 gets 10,000 USDT
        await BTC.mint(borrower.address, ethers.parseUnits("10", 18)); // Borrower gets 10 BTC

        await USDT.mint(lender0.address, ethers.parseUnits("1000000", 18));


        // Deploy the Lending contract
        Lending = await ethers.getContractFactory("Lending");
        lending = await Lending.deploy(USDT.target, BTC.target, liquidator.address);
        await lending.waitForDeployment();
        await USDT.connect(lender0).approve(lending.target, ethers.parseUnits("100000", 18));
        await lending.connect(lender0).depositLending(ethers.parseUnits("100000", 18));


    });

    it("should allow a lender to deposit USDT", async function () {
        const depositAmount = ethers.parseUnits("1000", 18); // 1000 USDT

        // Approve Lending contract to transfer lender1's USDT
        await USDT.connect(lender1).approve(lending.target, depositAmount);

        // Deposit USDT into the Lending contract
        await lending.connect(lender1).depositLending(depositAmount);

        const lenderInfo = await lending.lenders(lender1.address);
        expect(lenderInfo.depositAmount).to.equal(depositAmount);
    });

    it("should accrue lending interest over time", async function () {
        const depositAmount = ethers.parseUnits("1000", 18); // 1000 USDT

        // Approve and deposit USDT
        await USDT.connect(lender1).approve(lending.target, depositAmount);
        await lending.connect(lender1).depositLending(depositAmount);

        // Fast forward time by 1 hour
        await ethers.provider.send("evm_increaseTime", [3600]); // Increase by 3600 seconds (1 hour)
        await ethers.provider.send("evm_mine", []); // Mine the next block

        const interest = await lending.calculateLendingInterest(lender1.address);
        expect(interest).to.be.gt(0); // Ensure interest is accrued
    });

    it("should allow a lender to withdraw USDT including accrued interest", async function () {
        const depositAmount = ethers.parseUnits("1000", 18); // 1000 USDT

        // Approve and deposit USDT
        await USDT.connect(lender1).approve(lending.target, depositAmount);
        await lending.connect(lender1).depositLending(depositAmount);

        // Fast forward time by 1 hour
        await ethers.provider.send("evm_increaseTime", [3600]); // Increase by 3600 seconds (1 hour)
        await ethers.provider.send("evm_mine", []); // Mine the next block

        const interest = await lending.calculateLendingInterest(lender1.address);
        const totalWithdraw = depositAmount.add(interest); // Using BigNumber add

        // Withdraw USDT including accrued interest
        await lending.connect(lender1).withdrawLending(totalWithdraw);

        const lenderBalance = await USDT.balanceOf(lender1.address);
        expect(lenderBalance).to.be.closeTo(totalWithdraw, ethers.parseUnits("1", 18));
    });

    it("should allow a borrower to deposit BTC and borrow USDT", async function () {
        const btcAmount = ethers.parseUnits("1", 18); // 1 BTC
        const btcPriceInUSD = 50000; // 1 BTC = 50,000 USDT
        const expectedLoan = ethers.parseUnits("35000", 18); // 70% of 1 BTC in USDT

        // Set BTC price
        await lending.connect(owner).setBTCPriceInUSD(btcPriceInUSD);

        // Approve Lending contract to transfer borrower's BTC
        await BTC.connect(borrower).approve(lending.target, btcAmount);

        // Deposit BTC and borrow USDT
        await lending.connect(borrower).depositAndBorrow(btcAmount);

        const loanInfo = await lending.loans(borrower.address);
        expect(loanInfo.loanAmount).to.equal(expectedLoan);
    });

    it("should accrue interest on a borrowed loan over time", async function () {
        const btcAmount = ethers.parseUnits("1", 18); // 1 BTC
        const btcPriceInUSD = 50000; // 1 BTC = 50,000 USDT

        // Set BTC price and approve Lending contract to transfer BTC
        await lending.connect(owner).setBTCPriceInUSD(btcPriceInUSD);
        await BTC.connect(borrower).approve(lending.target, btcAmount);

        // Borrow USDT
        await lending.connect(borrower).depositAndBorrow(btcAmount);

        // Fast forward time by 1 hour
        await ethers.provider.send("evm_increaseTime", [3600]); // Increase by 3600 seconds (1 hour)
        await ethers.provider.send("evm_mine", []); // Mine the next block

        const interest = await lending.calculateBorrowInterest(borrower.address);
        expect(interest).to.be.gt(0); // Ensure interest is accrued
    });

    it("should allow a borrower to repay a loan and retrieve their BTC", async function () {
        const btcAmount = ethers.parseUnits("1", 18); // 1 BTC
        const btcPriceInUSD = 50000; // 1 BTC = 50,000 USDT

        // Set BTC price and approve Lending contract to transfer BTC
        await lending.connect(owner).setBTCPriceInUSD(btcPriceInUSD);
        await BTC.connect(borrower).approve(lending.target, btcAmount);

        // Borrow USDT
        await lending.connect(borrower).depositAndBorrow(btcAmount);

        const loanAmount = ethers.parseUnits("35000", 18); // 70% of 1 BTC in USDT

        // Repay the loan
        await lending.connect(borrower).repayLoan(loanAmount);

        const loanInfo = await lending.loans(borrower.address);
        expect(loanInfo.loanAmount).to.equal(0);

        const btcBalance = await BTC.balanceOf(borrower.address);
        expect(btcBalance).to.equal(btcAmount); // Collateral is returned after repayment
    });

    it("should liquidate a borrower when BTC price drops below liquidation threshold", async function () {
        const btcAmount = ethers.parseUnits("1", 18); // 1 BTC
        const btcPriceInUSD = 50000; // 1 BTC = 50,000 USDT
        const newBtcPriceInUSD = 3000; // 1 BTC drops to 3,000 USDT, causing liquidation

        // Set BTC price and approve Lending contract to transfer BTC
        await lending.connect(owner).setBTCPriceInUSD(btcPriceInUSD);
        await BTC.connect(borrower).approve(lending.target, btcAmount);

        await lending.connect(borrower).depositAndBorrow(btcAmount);

        // Set new BTC price and liquidate borrower
        await lending.connect(owner).setBTCPriceInUSD(newBtcPriceInUSD);
        await ethers.provider.send("evm_mine", []);

        await lending.liquidate(borrower.address);

        const loanInfo = await lending.loans(borrower.address);
        expect(loanInfo.loanAmount).to.equal(0);
    });
});
