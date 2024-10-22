use crate::{ChargeInfo, GasInfo, KVServiceInfo, TARGET};
use async_trait::async_trait;
use futures::{future, FutureExt};
use hyper::body::Bytes;
use jsonrpsee::http_client::HttpBody;
use sp_core::traits::SpawnNamed;
use std::{
    fmt::{Debug, Display},
    future::Future,
    sync::Arc,
};
use substk_client_kv_store::{AccountId, Domain};
use tokio::sync::broadcast::Receiver;

#[async_trait]
pub trait EventListener: Send {
    type Event: Send;

    /// The task name.
    fn name() -> &'static str;

    /// Subscribe the events.
    fn subscribe(&self) -> Receiver<Self::Event>;

    /// A blocking listen finalized blocks and collect transfer events to subscriber.
    async fn listening(self) -> anyhow::Result<()>;

    /// listen the transfer events and send to subscribers.
    fn listen(&self, spawner: Arc<dyn SpawnNamed>)
    where
        Self: 'static + Clone,
    {
        let this = self.clone();
        spawner.spawn_blocking(
            Self::name(),
            None,
            async move {
                log::info!(target: TARGET, "{} Start to listen transfer events", Self::name());
                if let Err(err) = this.listening().await {
                    log::error!(target: TARGET, "Error occurred in {}: {err}", Self::name());
                }
            }
            .boxed(),
        )
    }
}

/// The http route for rented service.
///
/// Note: should support cheap clone.
pub trait HttpRoute: Sync + Send + Clone {
    type Error: Send + Debug + Display;

    /// Returns when the service is able to process requests.
    fn ready(&self) -> impl Future<Output = ()> + Send + Unpin {
        future::ready(()).boxed()
    }

    fn register_domain(
        &self,
        account: AccountId,
        domain: Domain,
    ) -> impl Future<Output = Result<(), Self::Error>> + Send;

    fn service_info(&self) -> impl Future<Output = Result<KVServiceInfo, Self::Error>> + Send;

    fn gas_info(&self, account_id: AccountId) -> impl Future<Output = Result<Option<GasInfo>, Self::Error>> + Send;

    /// The account id is the address string.
    fn get(&self, account_id: String, path: String) -> impl Future<Output = Result<HttpBody, Self::Error>> + Send;

    fn set(
        &self,
        account_id: String,
        path: String,
        bytes: Bytes,
    ) -> impl Future<Output = Result<(), Self::Error>> + Send;

    fn charge(
        &self,
        account_id: String,
        info: &ChargeInfo,
    ) -> impl Future<Output = Result<(), Self::Error>> + Send;
}

pub trait GasCharger: Sync + Send {
    type ChargeInfo: Send;

    /// Charge fee for one or many calls of services. Should charge before operation.
    ///
    /// Return true if charge in success.
    fn charge(&self, account: AccountId, info: &Self::ChargeInfo) -> bool;

    /// Recharge token to an account.
    ///
    /// Return true if charge in success.
    fn recharge(&self, account: AccountId, amount: u128) -> bool;
}
