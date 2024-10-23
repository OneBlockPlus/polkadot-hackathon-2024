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
use pallet_pools_runtime_api::PoolsApi as PoolsRuntimeApi;
use serde::{Serialize, Deserialize};
use common::{UserPoolData, AssetMetadata};

#[rpc(client, server)]
pub trait PoolsApi<BlockHash, AccountId, PoolId, AssetId, AssetBalance, Price>
where
    AccountId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    PoolId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    AssetId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    AssetBalance: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    Price: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
{
    #[method(name = "pools_getAllPools")]
    fn get_all_pools(
        &self,
        account: AccountId,
        at: Option<BlockHash>,
    ) -> RpcResult<Vec<UserPoolData<AssetId, AssetBalance, PoolId, Price>>>;

    #[method(name = "pools_getTotalPools")]
    fn get_total_pools(
        &self,
        at: Option<BlockHash>,
    ) -> RpcResult<PoolId>;

    #[method(name = "pools_getPoolTotalDebt")]
    fn get_pool_total_debt(
        &self,
        pool_id: PoolId,
        at: Option<BlockHash>,
    ) -> RpcResult<AssetBalance>;

    #[method(name = "pools_getUserDebt")]
    fn get_user_debt(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<BlockHash>,
    ) -> RpcResult<AssetBalance>;
}

pub struct Pools<C, B> {
    client: Arc<C>,
    _marker: std::marker::PhantomData<B>,
}

impl<C, B> Pools<C, B> {
    pub fn new(client: Arc<C>) -> Self {
        Self {
            client,
            _marker: Default::default(),
        }
    }
}

impl<C, Block, AccountId, PoolId, AssetId, AssetBalance, Price> PoolsApiServer<
    <Block as BlockT>::Hash,
    AccountId,
    PoolId,
    AssetId,
    AssetBalance,
    Price,
> for Pools<C, Block>
where
    Block: BlockT,
    C: Send + Sync + 'static + ProvideRuntimeApi<Block> + HeaderBackend<Block>,
    C::Api: PoolsRuntimeApi<Block, AccountId, PoolId, AssetId, AssetBalance, Price>,
    AccountId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    PoolId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    AssetId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    AssetBalance: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    Price: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
{
    fn get_all_pools(
        &self,
        account: AccountId,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<Vec<UserPoolData<AssetId, AssetBalance, PoolId, Price>>> {
        let api = self.client.runtime_api();
        let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.get_all_pools(at, account)
            .map_err(runtime_error_into_rpc_err)
    }

    fn get_total_pools(
        &self,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<PoolId> {
        let api = self.client.runtime_api();
        let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.get_total_pools(at)
            .map_err(runtime_error_into_rpc_err)
    }

    fn get_pool_total_debt(
        &self,
        pool_id: PoolId,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<AssetBalance> {
        let api = self.client.runtime_api();
        let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.get_pool_total_debt(at, pool_id)
            .map_err(runtime_error_into_rpc_err)
    }

    fn get_user_debt(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<AssetBalance> {
        let api = self.client.runtime_api();
        let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.get_user_debt(at, pool_id, account)
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