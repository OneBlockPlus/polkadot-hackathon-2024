#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Codec, Decode, Encode};
use common::{AssetMetadata, UserPoolData};
use scale_info::TypeInfo;
use sp_runtime::traits::MaybeDisplay;
use sp_runtime::Vec;

sp_api::decl_runtime_apis! {
    pub trait PoolsApi<AccountId, PoolId, AssetId, AssetBalance, Price>
    where
        AccountId: Codec + MaybeDisplay,
        PoolId: Codec + MaybeDisplay,
        AssetId: Codec + MaybeDisplay,
        AssetBalance: Codec + MaybeDisplay,
        Price: Codec + MaybeDisplay,
    {
        fn get_all_pools(account: AccountId) -> Vec<UserPoolData<AssetId, AssetBalance, PoolId, Price>>;
        fn get_total_pools() -> PoolId;

        /// Get pool's total debt
        fn get_pool_total_debt(pool_id: PoolId) -> AssetBalance;

        /// Get user's debt in a pool
        fn get_user_debt(pool_id: PoolId, account: AccountId) -> AssetBalance;
    }
}
