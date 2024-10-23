//! A collection of node-specific RPC methods.
//! Substrate provides the `sc-rpc` crate, which defines the core RPC layer
//! used by Substrate nodes. This file extends those RPC definitions with
//! capabilities that are specific to this project's runtime configuration.

#![warn(missing_docs)]

use std::sync::Arc;

use parachain_template_runtime::{opaque::Block, AccountId, Balance, Nonce, Price, AssetId};

pub use sc_rpc::DenyUnsafe;
use sc_transaction_pool_api::TransactionPool;
use sp_api::ProvideRuntimeApi;
use sp_block_builder::BlockBuilder;
use sp_blockchain::{Error as BlockChainError, HeaderBackend, HeaderMetadata};
/// A type representing all RPC extensions.
pub type RpcExtension = jsonrpsee::RpcModule<()>;

/// Full client dependencies
pub struct FullDeps<C, P> {
	/// The client instance to use.
	pub client: Arc<C>,
	/// Transaction pool instance.
	pub pool: Arc<P>,
	/// Whether to deny unsafe calls
	pub deny_unsafe: DenyUnsafe,
}

/// Instantiate all RPC extensions.
use jsonrpsee::RpcModule;
use parachain_template_runtime::PoolId;

pub fn create_full<C, P>(
    deps: FullDeps<C, P>,
) -> Result<RpcModule<()>, Box<dyn std::error::Error + Send + Sync>>
where
    C: Send + Sync + 'static,
    C: ProvideRuntimeApi<Block> + HeaderBackend<Block>,
    C::Api: substrate_frame_rpc_system::AccountNonceApi<Block, AccountId, Nonce>
        + pallet_transaction_payment_rpc::TransactionPaymentRuntimeApi<Block, Balance>
        + BlockBuilder<Block>
        + pallet_risk_manager_runtime_api::RiskManagerApi<Block, AccountId, PoolId, u64, Balance>
        + pallet_reserve_runtime_api::ReserveApi<Block, AccountId, PoolId, AssetId, Balance, Price>
        + pallet_pools_runtime_api::PoolsApi<Block, AccountId, PoolId, AssetId, Balance, Price>,
    P: TransactionPool + 'static,
{
    use substrate_frame_rpc_system::{System, SystemApiServer};
    use pallet_transaction_payment_rpc::{TransactionPayment, TransactionPaymentApiServer};
    use pallet_risk_manager_rpc::{RiskManager, RiskManagerApiServer};
    use pallet_reserve_rpc::{Reserve, ReserveApiServer};
    use pallet_pools_rpc::{Pools, PoolsApiServer};

    let mut module = RpcModule::new(());
    let FullDeps { client, pool, deny_unsafe } = deps;

    module.merge(System::new(client.clone(), pool.clone()).into_rpc())?;
    module.merge(TransactionPayment::new(client.clone()).into_rpc())?;
    module.merge(RiskManager::new(client.clone()).into_rpc())?;
    module.merge(Reserve::new(client.clone()).into_rpc())?;
    module.merge(Pools::new(client.clone()).into_rpc())?;

    Ok(module)
}