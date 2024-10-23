# Risk Management Pallet

## Overview

The Risk Management Pallet is a critical component of the 24x DeFi protocol, responsible for managing risk parameters across different pools and collateral assets. It handles the configuration and updates of risk parameters, and provides functions to check the health of user positions.

## Core Functionality

1. Risk Parameter Management: Handle the creation and updates of risk parameters for pools and collateral assets.
2. Health Factor Calculation: Provide functions to calculate the health factor of user positions.
3. Liquidation Threshold Checks: Determine when positions are eligible for liquidation.
4. Interaction with other pallets: Coordinate with Pools and Reserve pallets to enforce risk parameters.

## Responsibilities

- Maintain accurate records of risk parameters for each pool and collateral asset.
- Provide functions to calculate and check the health of user positions.
- Ensure all operations in the protocol adhere to the defined risk parameters.
- Facilitate the update of risk parameters by authorized entities.

## Storage Items

1. `PoolParameters: map PoolId => PoolParams`
   - Stores configurable parameters for each pool, such as (debtCeiling, minDebtAmount, isMintingAllowed, isBurningAllowed)

2. `CollateralParameters: map Hash(PoolId, CollateralAssetId) => CollateralParams`
   - Stores configurable parameters for each collateral asset in a pool, such as (isEnabled, maxCeiling, baseLTV, liquidationThreshold, liquidationPenalty, liquidationFee)

3. `GlobalRiskState: GlobalRiskState`
   - Stores the current state of the global risk management system, including any global risk parameters or settings.

## Extrinsics (Functions)

1. `update_pool_parameters(origin, pool_id, new_parameters)`
   - Updates the risk parameters for a specific pool (admin function).

2. `update_collateral_parameters(origin, pool_id, collateral_asset, new_parameters)`
   - Updates the risk parameters for a specific collateral asset in a pool (admin function).

3. `update_global_risk_state()` to reassess overall system risk periodically.

## Hooks

1. `on_initialize`: Perform any necessary updates or checks at the beginning of each block.
2. `on_finalize`: Perform end-of-block operations, if needed.

## Events

1. `PoolParametersUpdated(PoolId)`
2. `CollateralParametersUpdated(PoolId, AssetId)`
3. `PositionBecameLiquidatable(AccountId, PoolId)`

## Errors

1. `PoolNotFound`
2. `CollateralAssetNotFound`
3. `InvalidParameter`
4. `UnauthorizedOperation`
5. `PositionNotFound`

## Helper Functions (not extrinsics)

1. `calculate_health_factor(pool_id, account_id) -> HealthFactor`
   - Internal function to calculate the health factor of a position.

2. `get_pool_risk_params(pool_id)` and `get_collateral_risk_params(pool_id, asset_id)` functions for other pallets to access risk parameters.

3. `is_liquidatable(pool_id, account_id) -> bool`
   - Checks if a user's position is eligible for liquidation.

4. `is_position_healthy(pool_id, account_id) -> bool`
   - Checks if a user's position is healthy.

5. `get_user_position(pool_id, account_id) -> UserPosition`
   - Internal function to get the user's position in a pool, includes debt and collateral amounts (total, base [multiplied by baseLTV], and liq [multiplied by liquidationThreshold]) in USD values.

## Interaction with Other Pallets

- Pools Pallet: Provide risk parameters for minting and burning operations.
- Reserve Pallet: Provide risk parameters for collateral management and liquidations.
- Oracle Pallet: Use price data to calculate position health and LTV ratios.

## Notes and Considerations

1. Implement proper access control for admin functions (e.g., updating risk parameters).
2. Ensure all mathematical operations are done using safe math to prevent overflows.
3. Implement thorough checks to prevent economic attacks (e.g., manipulation of risk parameters).
4. Consider implementing a time-lock or governance mechanism for significant parameter changes.
5. Optimize storage usage to minimize chain bloat.
6. Implement thorough unit and integration tests, especially for health factor calculations.
7. Consider gas optimization for frequently called functions like health checks.
8. Implement proper event emission for all significant state changes.
9. Ensure that risk parameters are consistent across the system and cannot lead to contradictory states.
10. Consider implementing a global "emergency stop" function that can freeze risky operations across all pools.

## Future Improvements

1. Implement dynamic risk parameters that adjust based on market conditions.
2. Add support for more sophisticated risk models (e.g., VaR, Monte Carlo simulations).
3. Implement a risk score for each pool and collateral asset.
4. Add support for cross-pool risk management.
5. Implement a governance mechanism for community-driven risk parameter updates.