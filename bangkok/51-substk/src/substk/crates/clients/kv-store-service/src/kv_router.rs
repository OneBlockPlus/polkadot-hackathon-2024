use crate::{ChargeInfo, GasCharger, GasInfo, HttpRoute, KVServiceInfo, ServiceRecharger};
use anyhow::{anyhow, bail};
use futures::{future, FutureExt};
use hyper::body::Bytes;
use jsonrpsee::server::HttpBody;
use std::{future::Future, sync::Arc};
use substk_client_kv_store::{AccountId, Domain, KVStore};

#[derive(Clone)]
pub struct KVRouter {
    store: Arc<KVStore>,
    recharger: ServiceRecharger,
}

impl KVRouter {
    pub fn new(store: Arc<KVStore>, recharger: ServiceRecharger) -> Self {
        Self { store, recharger }
    }
}

impl HttpRoute for KVRouter {
    type Error = anyhow::Error;

    fn ready(&self) -> impl Future<Output = ()> + Send + Unpin {
        future::ready(()).boxed()
    }

    async fn register_domain(&self, account: AccountId, domain: Domain) -> Result<(), Self::Error> {
        self.store.register_domain(account, domain)?;

        Ok(())
    }

    async fn service_info(&self) -> Result<KVServiceInfo, Self::Error> {
        Ok(self.recharger.service_info().clone())
    }

    async fn gas_info(&self, account_id: AccountId) -> Result<Option<GasInfo>, Self::Error> {
        Ok(self.recharger.gas_info(&account_id))
    }
    async fn get(&self, account_id: String, path: String) -> Result<HttpBody, Self::Error> {
        let account = AccountId::try_from(account_id.as_str()).map_err(|_| anyhow!("Invalid address format"))?;
        let val = self.store.get(account, path.as_bytes().to_vec())?;
        match val {
            None => Ok(HttpBody::empty()),
            Some(val) => Ok(jsonrpsee::http_client::HttpBody::from(val)),
        }
    }

    async fn set(&self, account_id: String, path: String, bytes: Bytes) -> Result<(), Self::Error> {
        let account = AccountId::try_from(account_id.as_str()).map_err(|_| anyhow!("Invalid address format"))?;
        let info = ChargeInfo {
            input_bytes_size: bytes.len(),
        };
        self.charge(account_id, &info).await?;

        self.store
            .put(account.clone(), path.as_bytes().to_vec(), Some(bytes.to_vec()))?;

        Ok(())
    }

    async fn charge(&self, account_id: String, info: &ChargeInfo) -> Result<(), Self::Error> {
        let account = AccountId::try_from(account_id.as_str()).map_err(|_| anyhow!("Invalid address format"))?;
        if self.recharger.charge(account, info) {
            return Ok(())
        }

        bail!("Insufficient balance")
    }
}
