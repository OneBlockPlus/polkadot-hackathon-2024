# Pools Pallet

## Overview

The Pools Pallet is a core component of the protocol, responsible for managing synthetic asset pools. Each pool represents a unique synthetic asset and its associated collateral types. This pallet handles the creation, management, and interaction with these pools, including minting and burning of synthetic assets.

## Core Functionality

1. Pool Management: Create, update, and manage synthetic asset pools.
2. Synth Minting: Allow users to mint synthetic assets by providing collateral.
3. Synth Burning: Allow users to burn synthetic assets to repay debt.
4. Debt Tracking: Monitor and manage user debt and total pool debt.
5. Interaction with other pallets: Coordinate with Reserve, Risk Management, and Oracle pallets.

## Responsibilities

- Maintain an up-to-date registry of all synthetic asset pools.
- Enforce minting and burning rules based on collateralization ratios and risk parameters.
- Track individual user debt and total pool debt.
- Facilitate the minting and burning processes in coordination with the Reserve pallet.
- Implement checks and balances to ensure system stability and user safety.
- Prepare debt transfer from account to liquidator in before executing liquidation (in terms of token amount). Reserve pallet makes sure to take enough collateral from liquidator to back the debt.
## Storage Items

1. `PoolsByAsset: map AssetId => PoolId`
   - Allows lookup of a pool by its synthetic asset ID.

2. `PoolTotalDebt: map PoolId => Balance`
   - Tracks the total debt for each pool (in terms of token amount).

3. `UserDebt: map Hash(PoolId, AccountId) => Balance`
   - Tracks individual user debt for each pool (token amount).

4. `PoolParameters: map PoolId => PoolParameters`
   - Stores configurable parameters for each pool (e.g., fees, interest rates).

## Extrinsics (Functions)

1. `create_pool(origin, pool_id, synthetic_asset, initial_parameters)`
   - Creates a new synthetic asset pool.

3. `mint(origin, asset_id, amount)`
   - Mints synthetic assets by ensuring sufficient collateral $ value and creating debt. Makes sure health factor is positive from risk management pallet.

4. `burn(origin, asset_id, amount)`
   - Burns synthetic assets to repay debt.

5. `get_pool_info(pool_id)`
   - Allows other pallets to query pool details.

6. `prepare_liquidation(pool_id, liquidator_id, account_id, amount)`
   - Allows the Reserve pallet to transfer debt from account to liquidator in before executing liquidation (in terms of token amount). Reserve pallet makes sure to take enough collateral from liquidator to back the debt.

## Hooks

1. `on_initialize`: Perform any necessary updates or checks at the beginning of each block.
2. `on_finalize`: Perform end-of-block operations, if needed.

## Events

1. `PoolCreated(PoolId, AssetId)`
2. `SyntheticMinted(AccountId, PoolId, Balance)`
3. `SyntheticBurned(AccountId, PoolId, Balance)`
4. `DebtTransferred(LiquidatorId, AccountId, PoolId, Balance)`

## Errors

1. `PoolAlreadyExists`
2. `PoolNotFound`
3. `InsufficientCollateral`
4. `ExceedsDebtCeiling`
5. `InvalidCollateralAsset`
6. `InvalidSyntheticAmount`
7. `PositionNotFound`


## Interaction with Other Pallets

- Reserve Pallet: Allows transfer of debt in liquidations.
- Risk Management Pallet: Coordinate for ensuring sufficient collateral $ value to mint synthetic assets and fetch risk parameters for pools.
- Assets Pallet: Interact for asset transfers and balance checks.

## Notes and Considerations

1. Implement proper access control for admin functions (e.g., creating pools, updating parameters).
2. Ensure all mathematical operations are done using safe math to prevent overflows.
3. Implement thorough checks to prevent economic attacks (e.g., flash loan attacks).
4. Consider implementing a fee mechanism for minting and burning operations.
5. Implement proper event emission for all significant state changes.
6. Ensure that the pallet can handle multiple collateral types per pool efficiently.
7. Consider implementing emergency functions (e.g., pause minting/burning) for risk management.
8. Optimize storage usage to minimize chain bloat.
9. Implement thorough unit and integration tests.
10. Consider gas optimization for frequently called functions.

## Future Improvements

1. Implement a more sophisticated debt tracking system that accounts for interest accrual.
2. Add support for multi-collateral positions within a single pool.
3. Implement a liquidation queue system for more efficient liquidations.
4. Add support for flash minting of synthetic assets.