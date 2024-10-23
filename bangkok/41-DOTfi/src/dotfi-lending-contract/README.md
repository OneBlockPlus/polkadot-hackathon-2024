
# DOTfi - Lending and Borrowing Contract

This contract is designed for **DOTfi**, a project participating in the **Polkadot Hackathon 2024 - Bangkok**. The contract enables users to lend USDT and borrow BTC with a dynamic lending and borrowing model. Below is an outline of the main methods and their functionality.

## Key Methods

### 1. **setBTCPriceInUSD(uint256 _btcPriceInUSD)**:

-   **Purpose**: Allows the contract owner to set the current price of BTC in USD.
-   **Access**: Only the owner can call this method.
-   **Event**: Emits a `BTCPriceUpdated` event with the new BTC price.

### 2. **depositLending(uint256 usdtAmount)**:

-   **Purpose**: Enables users to deposit USDT as lenders. Interest is accrued based on the deposited amount.
-   **Event**: Emits a `LenderDeposited` event with the deposit amount.

### 3. **calculateLendingInterest(address lender)**:

-   **Purpose**: Calculates the interest accrued for a lender based on the lending APR.
-   **Returns**: The amount of interest earned.

### 4. **withdrawLending(uint256 usdtAmount)**:

-   **Purpose**: Allows lenders to withdraw their USDT, including any accrued interest.
-   **Event**: Emits a `LenderWithdrew` event with the withdrawal amount.

### 5. **depositAndBorrow(uint256 btcAmount)**:

-   **Purpose**: Allows users to deposit BTC as collateral and borrow up to 70% of its value in USDT.
-   **Event**: Emits a `LoanTaken` event with the collateral and loan amount.

### 6. **calculateBorrowInterest(address borrower)**:

-   **Purpose**: Calculates the interest accrued for a borrower based on the borrowing interest rate per hour.
-   **Returns**: The amount of interest owed by the borrower.

### 7. **repayLoan(uint256 usdtAmount)**:

-   **Purpose**: Allows borrowers to repay their loans, including the accrued interest. Once the loan is fully repaid, the collateral (BTC) is returned to the borrower.
-   **Event**: Emits a `LoanRepaid` event with the repayment amount and the remaining debt.

### 8. **liquidate(address borrower)**:

-   **Purpose**: Allows the contract owner to liquidate a borrower’s collateral if the collateral’s value falls below the liquidation threshold (80% of the loan amount).
-   **Event**: Emits a `Liquidated` event with details of the liquidation process.

## Key Contract Variables

-   **LTV**: Loan-to-Value ratio set at 70%.
-   **Liquidation Threshold**: Set at 80%.
-   **Borrow Interest Rate**: 10% annually, accrued per hour.
-   **Lending APR**: Lenders earn 8% annual interest on their deposited USDT.

## Events

-   **LoanTaken**: Triggered when a loan is taken.
-   **LoanRepaid**: Triggered when a borrower repays a portion or the entirety of their loan.
-   **Liquidated**: Triggered when a borrower’s collateral is liquidated due to insufficient collateral value.
-   **LenderDeposited**: Triggered when a lender deposits USDT.
-   **LenderWithdrew**: Triggered when a lender withdraws USDT.
-   **BTCPriceUpdated**: Triggered when the BTC price in USD is updated by the owner.
