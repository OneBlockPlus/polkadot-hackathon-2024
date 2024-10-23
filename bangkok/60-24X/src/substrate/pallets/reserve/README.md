# Reserve Pallet

## Overview

The Reserve Pallet is a crucial component of the 24x DeFi protocol, responsible for managing user collateral across different pools. It handles the deposit, withdrawal, and tracking of collateral assets, as well as facilitating liquidations when necessary.

## Core Functionality

1. Collateral Management: Handle deposits and withdrawals of collateral assets.
2. Balance Tracking: Keep track of user collateral balances for each pool and asset.
3. Liquidation Support: Provide functionality to liquidate under-collateralized positions.
4. Interaction with other pallets: Coordinate with Pools, Risk Management, and Oracle pallets.

## Responsibilities

- Maintain accurate records of user collateral balances.
- Handle collateral deposits and withdrawals safely and efficiently.
- Provide collateral information to the Pools pallet for minting and burning operations.
- Facilitate the liquidation process for under-collateralized positions.
- Ensure collateral operations adhere to risk parameters set by the Risk Management pallet.

## Storage Items

1. `UserCollateral: map Hash(PoolId, CollateralAssetId, AccountId) => Balance`
   - Tracks user collateral balances for each pool and asset.

2. `PoolCollateral: map Hash(PoolId, CollateralAssetId) => Balance`
   - Tracks total collateral for each asset in a pool.

3. `CollateralParameters: map Hash(PoolId, CollateralAssetId) => CollateralParams`
   - Stores configurable parameters for each collateral asset in a pool (to be decided).

## Extrinsics (Functions)

1. `deposit_collateral(origin, pool_id, collateral_asset, amount)`
   - Allows users to deposit collateral into a specific pool.

2. `withdraw_collateral(origin, pool_id, collateral_asset, amount)`
   - Allows users to withdraw collateral from a specific pool, checks health factor from risk management pallet to make sure they are not undercollateralized.

3. `liquidate(origin, pool_id, account, collateral_asset, max_amount)`
   - Initiates liquidation of an under-collateralized position, checks health factor from risk management pallet, and liquidates the position if it is under-collateralized. Burns debt from pools pallet, and transfers collateral from reserve pallet.

4. `add_collateral_asset(origin, pool_id, collateral_asset, initial_parameters)`
   - Adds a new collateral asset to a pool (admin function).

5. `update_collateral_parameters(origin, pool_id, collateral_asset, new_parameters)`
   - Updates the parameters for a collateral asset in a pool (admin function).

## Hooks

1. `on_initialize`: Perform any necessary updates or checks at the beginning of each block.
2. `on_finalize`: Perform end-of-block operations, if needed.

## Events

1. `CollateralDeposited(AccountId, PoolId, AssetId, Balance)`
2. `CollateralWithdrawn(AccountId, PoolId, AssetId, Balance)`
3. `Liquidated(AccountId, PoolId, AssetId, Balance)`
4. `CollateralAssetAdded(PoolId, AssetId)`
5. `CollateralParametersUpdated(PoolId, AssetId)`

## Errors

1. `InsufficientCollateral`
2. `CollateralAssetNotFound`
3. `InvalidCollateralAmount`
4. `WithdrawalWouldUndercollateralize`
5. `PositionNotLiquidatable`
6. `CollateralAssetAlreadyExists`
7. `UnauthorizedOperation`

## Interaction with Other Pallets

- Pools Pallet: Provide collateral information for minting and burning operations.
- Risk Management Pallet: Fetch risk parameters for collateral assets.
- Assets Pallet: Interact for asset transfers and balance checks.

## Notes and Considerations

1. Implement proper access control for admin functions (e.g., adding collateral assets, updating parameters).
2. Ensure all mathematical operations are done using safe math to prevent overflows.
3. Implement thorough checks to prevent economic attacks (e.g., flash loan attacks).
4. Consider implementing a fee mechanism for collateral operations.
5. Ensure that the pallet can handle multiple collateral types per pool efficiently.
6. Optimize storage usage to minimize chain bloat.
7. Implement thorough unit and integration tests.
8. Consider gas optimization for frequently called functions.
9. Implement proper event emission for all significant state changes.
10. Ensure the liquidation process is fair and efficient.

## Future Improvements

1. Implement a more sophisticated liquidation mechanism (e.g., Dutch auctions).
2. Add support for cross-pool collateralization.
3. Implement collateral yield strategies for idle collateral.
4. Add support for NFTs or other non-fungible assets as collateral.
5. Implement a collateral swap feature to allow users to change their collateral type without closing their position.