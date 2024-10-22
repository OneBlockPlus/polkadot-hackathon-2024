use crate::{
    axum_router, axum_serve, kv_router::KVRouter, EventListener, GasCharger, HttpRoute, TransferListener, TARGET,
};
use anyhow::{anyhow, bail};
use futures::FutureExt;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use sp_core::traits::SpawnNamed;
use std::{
    collections::{hash_map::Entry, HashMap},
    fmt::Debug,
    ops::Deref,
    path::PathBuf,
    str::FromStr,
    sync::Arc,
    time::Duration,
};
use substk_client_kv_store::{AccountId, KVStore, MultiAddress, StoreError};
use subxt::Config;
use tokio::sync::broadcast::error::RecvError;
use crate::jwt::AppState;

#[derive(Debug)]
pub struct KvServiceConfiguration {
    pub db_path: PathBuf,
    pub kv_addr: String,
    pub rpc_addr: String,
    pub private_key: String,
    pub info: KVServiceInfo,
}

impl KvServiceConfiguration {
    /// Run the axum version http service if kv address set.
    pub fn run_axum<T: Config>(self, spawner: Arc<dyn SpawnNamed>) {
        let kv_addr = self.kv_addr.clone();

        log::info!("{:?}", &self);
        spawner.clone().spawn_blocking(
            "kv-service-axum",
            None,
            async move {
                let private_key = self.private_key.clone();
                let router = self.run::<T>(spawner.clone()).await;
                let router = match router {
                    Ok(r) => r,
                    Err(err) => {
                        log::error!(target: TARGET, "Error occurred in kv-service-axum: {err}");
                        return;
                    }
                };
                let state = AppState::new_shared(
                    router,
                    &private_key,
                ).unwrap();
                let router = axum_router(state);
                log::info!(target: TARGET, "Start the axum http service for kv service at {}", kv_addr);
                let err = axum_serve(router, kv_addr).await;
                if let Err(err) = err {
                    log::error!(target: TARGET, "Error occurred in kv-service-axum: {err}");
                }
            }
            .boxed(),
        );
    }

    /// Must run after node rpc starts
    pub async fn run<T: Config>(self, spawner: Arc<dyn SpawnNamed>) -> anyhow::Result<impl HttpRoute> {
        let to_lists = self
            .info
            .balance_receivers
            .iter()
            .map(|account| subxt::utils::AccountId32::from_str(account))
            .collect::<Result<Vec<_>, _>>()
            .map_err(|err| anyhow!("The receive list invalid: {err}"))?;

        to_lists.iter().for_each(|account| {
            log::info!(target: TARGET, "Set receiver: {account}");
        });

        let listener = TransferListener::<T>::new(&self.rpc_addr, to_lists).await?;
        listener.clone().listen(spawner.clone());

        let mut path = self.db_path.to_path_buf();
        path.push("kv-store");
        let store = KVStore::new(path.as_path())?;
        let store = Arc::new(store);

        let recharger = ServiceRecharger::new(self.info.clone())?;
        recharger.clone().run_sync(spawner.clone(), store.clone());

        let kv = KVStoreService::new_shared(store, recharger.clone())?;
        let router = KVRouter::new(kv.store().clone(), recharger);

        let mut subscription = listener.subscribe();

        spawner.spawn_blocking("KVService", None, async move {
            loop {
                match subscription.recv().await {
                    Ok(transfers) => {
                        for transfer in transfers {
                            let account = MultiAddress::Address32(
                                transfer.from.0,
                            );
                            let amount = transfer.amount;
                            if let Err(err) = kv.register(account.clone(), amount) {
                                log::error!(target: TARGET, "Error occurred when register kv service for ({account}:{amount}): {err}");
                            }
                        }
                    }
                    Err(RecvError::Closed) => {
                        log::warn!(target: TARGET, "The transfers subscription channel closed");
                        break;
                    }
                    Err(RecvError::Lagged(x)) => {
                        log::warn!(target: TARGET, "The subscription maybe missing some: {x}");
                        break;
                    }
                }
            }
        }.boxed());

        Ok(router)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KVServiceInfo {
    pub balance_receivers: Vec<String>,
    pub min_required_token_per_transfer: u64,
    pub gas_price_per_kb: u64,
}

pub struct KVStoreService {
    // TODO: define a new store.
    store: Arc<KVStore>,
    recharger: ServiceRecharger,
}

impl KVStoreService {
    pub fn new_shared(store: Arc<KVStore>, recharger: ServiceRecharger) -> anyhow::Result<Arc<Self>> {
        Ok(Arc::new(Self::new(store, recharger)?))
    }

    pub fn new(store: Arc<KVStore>, recharger: ServiceRecharger) -> anyhow::Result<Self> {
        Ok(Self { store, recharger })
    }

    pub fn store(&self) -> &Arc<KVStore> {
        &self.store
    }

    /// Could recharge this account.
    pub fn register(&self, account: AccountId, amount: u128) -> anyhow::Result<()> {
        if let Err(err) = self.store.register(account.clone()) {
            // ignore this error.
            if !matches!(err, StoreError::AccountRegistered(_)) {
                return Err(err.into());
            }
        }

        let min_required_token_per_transfer = self.recharger.info.min_required_token_per_transfer as u128;
        if amount < min_required_token_per_transfer {
            bail!("Receive {amount}, but min_required_token_per_transfer is {min_required_token_per_transfer}")
        }

        self.deposit(account, amount)
    }

    /// Deposit to recharge this account.
    pub fn deposit(&self, account: AccountId, amount: u128) -> anyhow::Result<()> {
        log::info!(target: TARGET, "Account {} deposit `{}` tokens", account, amount);
        let _b = self.recharger.recharge(account, amount);
        // sync once when registered.
        self.recharger.sync(&self.store);

        Ok(())
    }
}

/// Memory recharger. Persistence operations are required at regular intervals.
#[derive(Clone)]
pub struct ServiceRecharger {
    info: KVServiceInfo,
    inner: Arc<RwLock<Inner>>,
    sync_period: Duration,
}

struct Inner {
    remaining_gas: HashMap<AccountId, GasInfo>,
}

#[derive(Debug, Eq, PartialEq, Clone, Serialize, Deserialize)]
pub struct GasInfo {
    value: u128,
    synced: bool,
}

impl ServiceRecharger {
    pub fn new(info: KVServiceInfo) -> anyhow::Result<Self> {
        Ok(Self {
            info,
            inner: Arc::new(RwLock::new(Inner {
                remaining_gas: Default::default(),
            })),
            sync_period: Duration::from_secs(60),
        })
    }

    pub fn service_info(&self) -> &KVServiceInfo {
        &self.info
    }

    /// Get the gas info for current account.
    pub fn gas_info(&self, account_id: &AccountId) -> Option<GasInfo> {
        let inner = self.inner.read();
        inner.remaining_gas.get(&account_id).cloned()
    }

    /// Do the charging sync in blocking way.
    pub fn run_sync(self, spawner: Arc<dyn SpawnNamed>, store: Arc<KVStore>) {
        spawner.spawn_blocking(
            "ServiceRecharger",
            None,
            async move {
                loop {
                    tokio::time::sleep(self.sync_period).await;
                    self.sync(store.deref());
                }
            }
            .boxed(),
        )
    }

    fn sync(&self, store: &KVStore) {
        let mut inner = self.inner.write();

        for (account, info) in inner.remaining_gas.iter_mut() {
            if info.synced {
                continue;
            }
            if info.value == 0 {
                if let Err(err) = store.put_typed_extra::<u128>(account.clone(), b"gas".to_vec(), None) {
                    log::error!(target: TARGET, "DB corrupted: {err}")
                }
            } else if let Err(err) = store.put_typed_extra::<u128>(account.clone(), b"gas".to_vec(), Some(info.value)) {
                log::error!(target: TARGET, "DB corrupted: {err}")
            }
            info.synced = true;
        }
    }
}

#[derive(Debug, Eq, PartialEq)]
pub struct ChargeInfo {
    pub input_bytes_size: usize,
}

impl GasCharger for ServiceRecharger {
    type ChargeInfo = ChargeInfo;

    fn charge(&self, account: AccountId, info: &Self::ChargeInfo) -> bool {
        let mut inner = self.inner.write();
        let Some(remaining) = inner.remaining_gas.get_mut(&account) else {
            return false;
        };
        if remaining.value == 0 {
            return false;
        }
        let fee = self.info.gas_price_per_kb * (info.input_bytes_size as u64 / 1024 + 1);
        remaining.value = remaining.value.saturating_sub(fee as u128);
        remaining.synced = false;

        true
    }

    fn recharge(&self, account: AccountId, amount: u128) -> bool {
        let gas = amount;
        let mut inner = self.inner.write();
        // let gas = (self.info.gas_per_token_unit as u128).saturating_mul(amount);
        match inner.remaining_gas.entry(account) {
            Entry::<'_, AccountId, GasInfo>::Occupied(mut entry) => {
                let remaining = entry.get_mut();
                remaining.value = remaining.value.saturating_add(gas);
                remaining.synced = false;
            }
            Entry::Vacant(entry) => {
                entry.insert(GasInfo {
                    value: gas,
                    synced: false,
                });
            }
        }

        true
    }
}
