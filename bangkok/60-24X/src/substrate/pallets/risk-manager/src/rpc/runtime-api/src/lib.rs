#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Codec, Decode, Encode};
use scale_info::TypeInfo;
use sp_runtime::traits::MaybeDisplay;

// We need to import the UserPosition struct from the main pallet
use common::UserPosition;

sp_api::decl_runtime_apis! {
    pub trait RiskManagerApi<AccountId, PoolId, AssetId, Balance>
    where
        AccountId: Codec + MaybeDisplay,
        PoolId: Codec + MaybeDisplay,
        AssetId: Codec + MaybeDisplay,
        Balance: Codec + MaybeDisplay,
    {
        /// Get the health factor for a given account in a specific pool
        fn get_health_factor(pool_id: PoolId, account: AccountId) -> Balance;

        /// Check if a position is liquidatable
        fn is_liquidatable(pool_id: PoolId, account: AccountId) -> bool;

        /// Check if a position is within safe limits
        fn is_position_healthy(pool_id: PoolId, account: AccountId) -> bool;

        /// Check if a user can mint a specific amount
        fn can_mint(account: AccountId, pool_id: PoolId, amount: Balance) -> bool;

        /// Get the user's position in a specific pool
        fn get_user_position(pool_id: PoolId, account: AccountId) -> Option<UserPosition<Balance>>;
    }
}