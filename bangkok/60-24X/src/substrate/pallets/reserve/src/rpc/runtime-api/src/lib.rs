#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Codec, Decode, Encode};
use scale_info::TypeInfo;
use sp_runtime::traits::MaybeDisplay;
use common::{UserCollateralData, AssetMetadata};
use sp_runtime::Vec;

sp_api::decl_runtime_apis! {
    pub trait ReserveApi<AccountId, PoolId, AssetId, AssetBalance, Price>
    where
        AccountId: Codec + MaybeDisplay,
        PoolId: Codec + MaybeDisplay,
        AssetId: Codec + MaybeDisplay,
        AssetBalance: Codec + MaybeDisplay,
        Price: Codec + MaybeDisplay,
    {
        /// Get the collateral index for a given pool and asset
        fn get_collateral_index(pool_id: PoolId, asset_id: AssetId) -> u16;

        /// Get user's position details including all collateral assets
        fn get_user_position(pool_id: PoolId, account: AccountId) -> Vec<UserCollateralData<AssetId, AssetBalance, Price>>;

        /// Get user's collateral balance for a specific asset
        fn get_user_collateral(pool_id: PoolId, asset_id: AssetId, account: AccountId) -> AssetBalance;

        /// Get total collateral balance for a pool and asset
        fn get_total_collateral_balance(pool_id: PoolId, asset_id: AssetId) -> AssetBalance;
    }
}