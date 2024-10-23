use jsonrpsee::{
    core::RpcResult,
    proc_macros::rpc,
    types::error::{ErrorObject, ErrorCode},
};
use sp_api::ProvideRuntimeApi;
use sp_blockchain::HeaderBackend;
use sp_runtime::traits::{Block as BlockT, MaybeDisplay};
use std::sync::Arc;
use codec::Codec;
use pallet_reserve_runtime_api::ReserveApi as ReserveRuntimeApi;
use serde::{Serialize, Deserialize};
use common::{UserCollateralData, AssetMetadata};

#[rpc(client, server)]
pub trait ReserveApi<BlockHash, AccountId, PoolId, AssetId, AssetBalance, Price>
where
    AccountId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    PoolId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    AssetId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    AssetBalance: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    Price: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
{
    #[method(name = "reserve_getCollateralIndex")]
    fn get_collateral_index(
        &self,
        pool_id: PoolId,
        asset_id: AssetId,
        at: Option<BlockHash>,
    ) -> RpcResult<u16>;

    #[method(name = "reserve_getUserPosition")]
    fn get_user_position(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<BlockHash>,
    ) -> RpcResult<Vec<UserCollateralData<AssetId, AssetBalance, Price>>>;

    #[method(name = "reserve_getUserCollateral")]
    fn get_user_collateral(
        &self,
        pool_id: PoolId,
        asset_id: AssetId,
        account: AccountId,
        at: Option<BlockHash>,
    ) -> RpcResult<AssetBalance>;

    #[method(name = "reserve_getTotalCollateralBalance")]
    fn get_total_collateral_balance(
        &self,
        pool_id: PoolId,
        asset_id: AssetId,
        at: Option<BlockHash>,
    ) -> RpcResult<AssetBalance>;
}

pub struct Reserve<C, B> {
    client: Arc<C>,
    _marker: std::marker::PhantomData<B>,
}

impl<C, B> Reserve<C, B> {
    pub fn new(client: Arc<C>) -> Self {
        Self {
            client,
            _marker: Default::default(),
        }
    }
}

impl<C, Block, AccountId, PoolId, AssetId, AssetBalance, Price> ReserveApiServer<
    <Block as BlockT>::Hash,
    AccountId,
    PoolId,
    AssetId,
    AssetBalance,
    Price,
> for Reserve<C, Block>
where
    Block: BlockT,
    C: Send + Sync + 'static + ProvideRuntimeApi<Block> + HeaderBackend<Block>,
    C::Api: ReserveRuntimeApi<Block, AccountId, PoolId, AssetId, AssetBalance, Price>,
    AccountId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    PoolId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    AssetId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    AssetBalance: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    Price: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
{
    fn get_collateral_index(
        &self,
        pool_id: PoolId,
        asset_id: AssetId,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<u16> {
        let api = self.client.runtime_api();
        let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.get_collateral_index(at, pool_id, asset_id)
            .map_err(runtime_error_into_rpc_err)
    }

    fn get_user_position(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<Vec<UserCollateralData<AssetId, AssetBalance, Price>>> {
        let api = self.client.runtime_api();
        let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.get_user_position(at, pool_id, account)
            .map_err(runtime_error_into_rpc_err)
    }

    fn get_user_collateral(
        &self,
        pool_id: PoolId,
        asset_id: AssetId,
        account: AccountId,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<AssetBalance> {
        let api = self.client.runtime_api();
        let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.get_user_collateral(at, pool_id, asset_id, account)
            .map_err(runtime_error_into_rpc_err)
    }

    fn get_total_collateral_balance(
        &self,
        pool_id: PoolId,
        asset_id: AssetId,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<AssetBalance> {
        let api = self.client.runtime_api();
        let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.get_total_collateral_balance(at, pool_id, asset_id)
            .map_err(runtime_error_into_rpc_err)
    }
}

const RUNTIME_ERROR: i32 = 1;

fn runtime_error_into_rpc_err(err: impl std::fmt::Debug) -> ErrorObject<'static> {
    ErrorObject::owned(
        ErrorCode::InternalError.code(),
        "Runtime error",
        Some(format!("{:?}", err)),
    )
}