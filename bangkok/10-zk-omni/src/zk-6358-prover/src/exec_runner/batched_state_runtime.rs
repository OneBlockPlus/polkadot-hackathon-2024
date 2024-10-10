
use anyhow::{Result, anyhow};
use circuit_local_storage::object_store::batch_serde::BatchRange;
use exec_system::{runtime::RuntimeConfig, traits::EnvConfig};
use interact::exec_data::{remote_exec_db::RemoteExecDB, types::{to_u128, DBStoredExecutedTransaction}};
use log::info;
use zk_6358_prover::{exec::db_to_zk::ToSignedOmniverseTx, types::signed_tx_types::SignedOmniverseTx};

use super::cosp1_tn_executor::CoSP1TestnetExecutor;

/////////////////////////////////////////////////////
/// default runtime
pub struct BatchedStateRuntime {
    remote_db: RemoteExecDB,
    batch_runner: CoSP1TestnetExecutor
}

impl BatchedStateRuntime {
    pub async fn new() -> Self {
        let db_config = exec_system::database::DatabaseConfig::from_env();

        Self {
            remote_db: RemoteExecDB::new(&db_config.remote_url).await,
            batch_runner: CoSP1TestnetExecutor::new().await
        }
    }

    pub async fn load_current_state_from_local(&mut self, init_path: &str) -> Result<()> {
        self.batch_runner.load_current_state_from_local(init_path).await
    }

    pub async fn try_one_batch(&mut self) -> Result<()> {
        let (batch_range, one_batch_txs) = self.fetch_data_one_batch().await?;

        self.batch_runner.exec_state_prove_circuit(batch_range, &one_batch_txs).await
    }

    pub async fn fetch_data_one_batch(&self) -> Result<(BatchRange, Vec<SignedOmniverseTx>)> {
        let Some(fetched_db_tx_vec) = self.remote_db.get_executed_txs(self.batch_runner.get_fri_batch_config().next_tx_seq_id, self.batch_runner.batch_size()).await else {
            return Err(anyhow!("fetching txs from remote DB error"));
        };

        if fetched_db_tx_vec.len() != self.batch_runner.batch_size() {
            return Err(anyhow!("Not enough transactions"));
        }

        let mut somtx_vec = Vec::with_capacity(self.batch_runner.batch_size());
        for (i, ds_tx) in fetched_db_tx_vec.iter().enumerate() {
            if let Some(tx_seq_id) = &ds_tx.id {
                if (self.batch_runner.get_fri_batch_config().next_tx_seq_id + i as u128) != to_u128(tx_seq_id.clone()) {
                    return Err(anyhow!(format!("the sequence id of the transaction error!")));
                }
            }

            match ds_tx.to_signed_omniverse_tx() {
                Ok(somtx) => {
                    somtx_vec.push(somtx);
                },
                Err(err) => {
                    return Err(anyhow!(format!("Tx {:?} errors due to: '{}'", ds_tx.id, err)));
                },
            }
        }

        Ok((Self::get_batch_range(&fetched_db_tx_vec), somtx_vec))
    }

    fn get_batch_range(prepared_db_tx: &[DBStoredExecutedTransaction]) -> BatchRange {
        let last_idx = prepared_db_tx.len() - 1;

        let start_block_height = prepared_db_tx[0].block_height as u64;
        let start_tx_seq_id = to_u128(prepared_db_tx[0].id.clone().unwrap());
        let end_block_height = prepared_db_tx[last_idx].block_height as u64;
        let end_tx_seq_id = to_u128(prepared_db_tx[last_idx].id.clone().unwrap());

        BatchRange {
            start_block_height,
            start_tx_seq_id,
            end_block_height,
            end_tx_seq_id,
        }
    }
}

pub async fn testnet_run_batched_state() {
    use colored::Colorize;
    use tokio::time::{sleep, Duration};

    let runtime_config = RuntimeConfig::from_env();

    info!("{}", format!("start batched state {}", runtime_config.network).green().bold());

    let mut runtime_exec = BatchedStateRuntime::new().await;
    runtime_exec.load_current_state_from_local("./init-data").await.unwrap();

    loop {
        info!("{}", format!("processing at: {}", chrono::offset::Local::now()).yellow());
        match runtime_exec.try_one_batch().await {
            Ok(_) => { sleep(Duration::from_secs(30)).await; },
            Err(err) => { info!("{}", format!("{}", err).red().bold()); sleep(Duration::from_secs(300)).await; }
        }
    }  
}