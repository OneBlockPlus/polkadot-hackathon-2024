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
use pallet_risk_manager_runtime_api::RiskManagerApi as RiskManagerRuntimeApi;
use serde::{Serialize, Deserialize};

#[rpc(client, server)]
pub trait RiskManagerApi<BlockHash, AccountId, PoolId, AssetId, Balance>
where
    AccountId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    PoolId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    AssetId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    Balance: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
{
    #[method(name = "riskManager_getHealthFactor")]
    fn get_health_factor(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<BlockHash>,
    ) -> RpcResult<Balance>;

    #[method(name = "riskManager_isLiquidatable")]
    fn is_liquidatable(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<BlockHash>,
    ) -> RpcResult<bool>;

    #[method(name = "riskManager_isPositionHealthy")]
    fn is_position_healthy(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<BlockHash>,
    ) -> RpcResult<bool>;

    #[method(name = "riskManager_canMint")]
    fn can_mint(
        &self,
        account: AccountId,
        pool_id: PoolId,
        amount: Balance,
        at: Option<BlockHash>,
    ) -> RpcResult<bool>;

    #[method(name = "riskManager_getUserPosition")]
    fn get_user_position(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<BlockHash>,
    ) -> RpcResult<Option<common::UserPosition<Balance>>>;
}

pub struct RiskManager<C, B> {
    client: Arc<C>,
    _marker: std::marker::PhantomData<B>,
}

impl<C, B> RiskManager<C, B> {
    pub fn new(client: Arc<C>) -> Self {
        Self {
            client,
            _marker: Default::default(),
        }
    }
}

impl<C, Block, AccountId, PoolId, AssetId, Balance> RiskManagerApiServer<
    <Block as BlockT>::Hash,
    AccountId,
    PoolId,
    AssetId,
    Balance,
> for RiskManager<C, Block>
where
    Block: BlockT,
    C: Send + Sync + 'static + ProvideRuntimeApi<Block> + HeaderBackend<Block>,
    C::Api: RiskManagerRuntimeApi<Block, AccountId, PoolId, AssetId, Balance>,
    AccountId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    PoolId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    AssetId: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
    Balance: Codec + MaybeDisplay + Serialize + for<'de> Deserialize<'de>,
{
    fn get_health_factor(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<Balance> {
        let api = self.client.runtime_api();
        let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.get_health_factor(at, pool_id, account)
            .map_err(runtime_error_into_rpc_err)
    }

    fn is_liquidatable(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<bool> {
        let api = self.client.runtime_api();
		let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.is_liquidatable(at, pool_id, account)
            .map_err(runtime_error_into_rpc_err)
    }

    fn is_position_healthy(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<bool> {
        let api = self.client.runtime_api();
		let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.is_position_healthy(at, pool_id, account)
            .map_err(runtime_error_into_rpc_err)
    }

    fn can_mint(
        &self,
        account: AccountId,
        pool_id: PoolId,
        amount: Balance,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<bool> {
        let api = self.client.runtime_api();
		let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.can_mint(at, account, pool_id, amount)
            .map_err(runtime_error_into_rpc_err)
    }

    fn get_user_position(
        &self,
        pool_id: PoolId,
        account: AccountId,
        at: Option<<Block as BlockT>::Hash>,
    ) -> RpcResult<Option<common::UserPosition<Balance>>> {
        let api = self.client.runtime_api();
		let at = at.unwrap_or_else(|| self.client.info().best_hash);

        api.get_user_position(at, pool_id, account)
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