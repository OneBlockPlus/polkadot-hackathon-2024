use crate::{KVServiceInfo, KvServiceConfiguration};
use clap::Args;
use sc_service::Configuration;
// use sc_service::error::{Result as ServiceResult, Error as ServiceError};

/// Parameters used to config runtime.
#[derive(Debug, Clone, Args)]
pub struct KvServiceParams {
    /// Register service when receivers receive some new balances from an account.
    #[arg(long)]
    pub kv_service_balance_receivers: Vec<String>,

    /// The minimal required pay for every transfer.
    #[arg(long, default_value_t = 1_000_000_000_000)]
    pub kv_service_min_required_token_per_transfer: u64,

    /// The gas price for kv service per kb.
    #[arg(long, default_value_t = 1_000_000)]
    pub kv_service_gas_price_per_kb: u64,

    /// Enable this kv service when set service address.
    #[arg(long)]
    pub kv_service_rpc_addr: Option<String>,

    /// Enable this kv service when set this private key.
    #[arg(long)]
    pub kv_service_private_key: Option<String>,
}

impl From<KvServiceParams> for KVServiceInfo {
    fn from(value: KvServiceParams) -> Self {
        Self {
            balance_receivers: value.kv_service_balance_receivers,
            min_required_token_per_transfer: value.kv_service_min_required_token_per_transfer,
            gas_price_per_kb: value.kv_service_gas_price_per_kb,
        }
    }
}

impl KvServiceParams {
    pub fn create_configuration(&self, cfg: &Configuration) -> Option<KvServiceConfiguration> {
        let mut db_path = cfg.base_path.path().to_path_buf();
        db_path.push("kv-service");
        let rpc_addr = cfg.rpc_addr.unwrap_or_else(|| ([127, 0, 0, 1], cfg.rpc_port).into());
        let rpc_addr = format!("ws://{rpc_addr}");

        let private_key = match self.kv_service_private_key.clone() {
            Some(k) => k,
            None => return None,
        };

        let kv_addr = match self.kv_service_rpc_addr.clone() {
            Some(kv) => kv,
            None => return None,
        };

        Some(
            KvServiceConfiguration {
                db_path,
                kv_addr,
                rpc_addr,
                private_key,
                info: KVServiceInfo::from(self.clone()),
            }
        )
    }
}
