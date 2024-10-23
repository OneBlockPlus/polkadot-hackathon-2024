// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Lending is Ownable(msg.sender) {
    IERC20 public usdtToken;
    IERC20 public btcToken;
    uint256 public constant LTV = 70;
    uint256 public constant LIQUIDATION_THRESHOLD = 80;
    uint256 public constant BORROW_INTEREST_RATE_PER_HOUR = 10;
    uint256 public constant LENDING_APR = 8;
    uint256 public constant SECONDS_PER_HOUR = 3600;

    address public liquidator;
    uint256 public btcPriceInUSD;

    struct Loan {
        uint256 collateralAmount;
        uint256 loanAmount;
        uint256 startTime;
        uint256 lastInterestAccrued;
    }

    struct Lender {
        uint256 depositAmount;
        uint256 lastInterestAccrued;
    }

    mapping(address => Loan) public loans;
    mapping(address => Lender) public lenders;

    uint256 public totalLended;
    uint256 public totalBorrowed;

    event LoanTaken(address indexed borrower, uint256 collateralAmount, uint256 loanAmount);
    event LoanRepaid(address indexed borrower, uint256 loanAmount, uint256 remainingDebt);
    event Liquidated(address indexed borrower, uint256 loanAmount, uint256 collateralSold, uint256 remainingCollateral);
    event LenderDeposited(address indexed lender, uint256 depositAmount);
    event LenderWithdrew(address indexed lender, uint256 withdrawAmount);
    event BTCPriceUpdated(uint256 newPrice);

    constructor(address _usdtToken, address _btcToken, address _liquidator) {
        usdtToken = IERC20(_usdtToken);
        btcToken = IERC20(_btcToken);
        liquidator = _liquidator;
    }

    function setBTCPriceInUSD(uint256 _btcPriceInUSD) external onlyOwner {
        btcPriceInUSD = _btcPriceInUSD;
        emit BTCPriceUpdated(_btcPriceInUSD);
    }

    function depositLending(uint256 usdtAmount) external {
        usdtToken.transferFrom(msg.sender, address(this), usdtAmount);

        if (lenders[msg.sender].depositAmount > 0) {
            uint256 interest = calculateLendingInterest(msg.sender);
            lenders[msg.sender].depositAmount += interest;
        }

        lenders[msg.sender].depositAmount += usdtAmount;
        lenders[msg.sender].lastInterestAccrued = block.timestamp;
        totalLended += usdtAmount;

        emit LenderDeposited(msg.sender, usdtAmount);
    }

    function calculateLendingInterest(address lender) public view returns (uint256) {
        Lender memory l = lenders[lender];
        uint256 hoursPassed = (block.timestamp - l.lastInterestAccrued) / SECONDS_PER_HOUR;
        uint256 interest = (l.depositAmount * LENDING_APR * hoursPassed) / (100 * 365 * 24);
        return interest;
    }

    function withdrawLending(uint256 usdtAmount) external {
        Lender storage lender = lenders[msg.sender];
        uint256 interest = calculateLendingInterest(msg.sender);
        uint256 totalBalance = lender.depositAmount + interest;

        require(usdtAmount <= totalBalance, "Insufficient balance");

        lender.depositAmount = totalBalance - usdtAmount;
        lender.lastInterestAccrued = block.timestamp;
        totalLended -= usdtAmount;

        usdtToken.transfer(msg.sender, usdtAmount);

        emit LenderWithdrew(msg.sender, usdtAmount);
    }

    function depositAndBorrow(uint256 btcAmount) external {
        require(btcPriceInUSD > 0, "BTC price not set");

        uint256 maxLoan = (btcAmount * btcPriceInUSD * LTV) / 100;
        require(usdtToken.balanceOf(address(this)) >= maxLoan, "Not enough USDT liquidity");

        btcToken.transferFrom(msg.sender, address(this), btcAmount);

        loans[msg.sender] = Loan({
            collateralAmount: btcAmount,
            loanAmount: maxLoan,
            startTime: block.timestamp,
            lastInterestAccrued: block.timestamp
        });

        totalBorrowed += maxLoan;

        usdtToken.transfer(msg.sender, maxLoan);

        emit LoanTaken(msg.sender, btcAmount, maxLoan);
    }

    function calculateBorrowInterest(address borrower) public view returns (uint256) {
        Loan memory loan = loans[borrower];
        uint256 hoursPassed = (block.timestamp - loan.lastInterestAccrued) / SECONDS_PER_HOUR;
        uint256 interest = (loan.loanAmount * BORROW_INTEREST_RATE_PER_HOUR * hoursPassed) / (100 * 365 * 24);
        return interest;
    }

    function repayLoan(uint256 usdtAmount) external {
        Loan storage loan = loans[msg.sender];
        require(loan.loanAmount > 0, "No active loan");

        uint256 interest = calculateBorrowInterest(msg.sender);
        uint256 totalDebt = loan.loanAmount + interest;
        require(usdtAmount <= totalDebt, "Repaying more than debt");

        loan.loanAmount -= usdtAmount;

        usdtToken.transferFrom(msg.sender, address(this), usdtAmount);
        totalBorrowed -= usdtAmount;

        if (loan.loanAmount == 0) {
            btcToken.transfer(msg.sender, loan.collateralAmount);
            delete loans[msg.sender];
        } else {
            loan.lastInterestAccrued = block.timestamp;
        }

        emit LoanRepaid(msg.sender, usdtAmount, loan.loanAmount);
    }

    function liquidate(address borrower) external onlyOwner {
        require(btcPriceInUSD > 0, "BTC price not set");

        Loan storage loan = loans[borrower];
        require(loan.loanAmount > 0, "No active loan");

        uint256 collateralValueInUSD = loan.collateralAmount * btcPriceInUSD;
        uint256 liquidationThreshold = (loan.loanAmount * LIQUIDATION_THRESHOLD) / 100;

        require(collateralValueInUSD < liquidationThreshold, "Loan not eligible for liquidation");

        uint256 loanAmount = loan.loanAmount;
        uint256 collateralSold = (loanAmount * 100) / btcPriceInUSD;
        uint256 remainingCollateral = loan.collateralAmount - collateralSold;

        btcToken.transfer(liquidator, collateralSold);

        if (remainingCollateral > 0) {
            btcToken.transfer(borrower, remainingCollateral);
        }

        delete loans[borrower];
        totalBorrowed -= loanAmount;

        emit Liquidated(borrower, loanAmount, collateralSold, remainingCollateral);
    }
}
