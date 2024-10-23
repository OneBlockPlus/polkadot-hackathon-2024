# Oracle Pallet

## Overview

The Oracle Pallet is a crucial component of the protocol, responsible for providing and managing price feeds for various synthetic assets and collateral assets used in the system. It allows for the integration of both on-chain and off-chain price data sources, ensuring that the protocol has access to accurate and up-to-date price information for risk management, liquidations, and other core functions.

## Core Functionality

1. Price Feed Management: Handle the addition, updating, and removal of price feeds for different assets.
2. Price Retrieval: Provide functions to fetch the latest price for any supported asset.
3. Multi-Source Support: Allow for multiple price sources per asset for increased reliability.
4. Staleness Checks: Implement mechanisms to detect and handle stale price data.
5. Access Control: Manage which accounts or pallets can update price feeds.

## Responsibilities

- Maintain accurate and up-to-date price information for all supported assets.
- Provide a reliable interface for other pallets to fetch price data.
- Ensure price feeds are updated regularly and stale data is handled appropriately.
- Manage the list of authorized price feed providers.

## Storage Items

1. `Prices: map AssetId => (Price, Timestamp)`
   - Stores the latest price and timestamp for each asset.

2. `PriceSources: map AssetId => Vec<AccountId>`
   - Stores the list of authorized price feed providers for each asset.

3. `StalenessThreshold: map AssetId => BlockNumber`
   - Stores the maximum allowed age of price data for each asset.

4. `MinimumSources: map AssetId => u32`
   - Stores the minimum number of sources required for a valid price update.

## Extrinsics (Functions)

1. `update_price(origin, asset_id, new_price)`
   - Allows authorized accounts to update the price for a specific asset.

2. `add_price_source(origin, asset_id, account_id)`
   - Adds a new authorized price feed provider for an asset (admin function).

3. `remove_price_source(origin, asset_id, account_id)`
   - Removes an authorized price feed provider for an asset (admin function).

4. `set_staleness_threshold(origin, asset_id, threshold)`
   - Sets the staleness threshold for an asset (admin function).

5. `set_minimum_sources(origin, asset_id, minimum)`
   - Sets the minimum number of sources required for a valid price update (admin function).

## Hooks

1. `on_initialize`: Check for stale prices and emit warnings if necessary.
2. `on_finalize`: Perform any end-of-block cleanup or aggregation if needed.

## Events

1. `PriceUpdated(AssetId, Price, AccountId)`
2. `PriceSourceAdded(AssetId, AccountId)`
3. `PriceSourceRemoved(AssetId, AccountId)`
4. `StalenessThresholdUpdated(AssetId, BlockNumber)`
5. `MinimumSourcesUpdated(AssetId, u32)`
6. `StalePrice(AssetId)`

## Errors

1. `AssetNotSupported`
2. `UnauthorizedPriceProvider`
3. `InsufficientPriceSources`
4. `StalePrice`
5. `InvalidPrice`
6. `UnauthorizedOperation`

## Helper Functions (not extrinsics)

1. `get_price(asset_id) -> Option<Price>`
   - Returns the latest price for an asset if it's not stale.

2. `is_price_valid(asset_id) -> bool`
   - Checks if the price for an asset is valid (not stale and has sufficient sources).

3. `get_price_sources(asset_id) -> Vec<AccountId>`
   - Returns the list of authorized price feed providers for an asset.

4. `is_price_fresh(asset_id) -> bool`
   - Allows other pallets to check price staleness easily.

## Interaction with Other Pallets

- Pools Pallet: Provide price data for synthetic asset minting and burning.
- Reserve Pallet: Provide price data for collateral valuation and liquidations.
- Risk Management Pallet: Provide price data for health factor calculations.

## Notes and Considerations

1. Implement proper access control for admin functions and price updates.
2. Ensure all mathematical operations are done using safe math to prevent overflows.
3. Implement thorough checks to prevent price manipulation attacks.
4. Consider implementing a circuit breaker mechanism for extreme price movements.
5. Optimize storage usage, especially for frequently updated price data.
6. Implement thorough unit and integration tests, including scenarios with multiple price sources.
7. Consider gas optimization for price retrieval functions.
8. Implement proper event emission for all significant state changes.
9. Consider implementing a mechanism for price feed redundancy and failover.
10. Ensure that the oracle can handle different decimal precisions for various assets.

## Future Improvements

1. Implement support for more sophisticated price aggregation methods (e.g., median, TWAP).
2. Add support for off-chain workers to fetch price data from external APIs.
3. Implement a reputation system for price feed providers.
4. Add support for price feeds with confidence intervals or volatility information.
5. Implement cross-chain price oracles using XCM for multi-chain deployments.