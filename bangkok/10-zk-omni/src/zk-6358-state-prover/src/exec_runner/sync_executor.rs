use std::fs;

use circuit_local_storage::object_store::proof_object_store::FRIProofBatchStorage;
use exec_system::traits::EnvConfig;
use interact::exec_data::{remote_exec_db::RemoteExecDB, types::{to_u128, DBStoredExecutedTransaction}};
use itertools::Itertools;
use log::info;
use anyhow::{anyhow, Result};
use colored::Colorize;
use zk_6358_prover::{circuit::{parallel_runtime::ParallelRuntimeCircuitEnv, state_prover::ZK6358StateProverEnv}, exec::{db_to_zk::ToSignedOmniverseTx, runtime_types::{InitAsset, InitUTXO}}, types::signed_tx_types::SignedOmniverseTx};

use plonky2::{field::extension::Extendable, hash::hash_types::RichField, plonk::config::{GenericConfig, Hasher}};

const NUM_SYNC_ONCE: usize = 256;

//////////////////////////////////////////////////////////////////////////////////////////
/// tool functions
pub fn prepare_txs(next_seq_id: u128, db_stored_txs: &Vec<DBStoredExecutedTransaction>, expected_batch_size: usize, min_prepare_size: usize) -> Result<Vec<SignedOmniverseTx>> {
    let mut prepare_len = expected_batch_size;
    while prepare_len >= min_prepare_size  {
        if db_stored_txs.len() >= prepare_len {
            break;
        }

        prepare_len /= 2;
    }

    if prepare_len < min_prepare_size {
        return Err(anyhow!(format!("not enough new transactions. required {}, got {}", expected_batch_size, db_stored_txs.len()).bright_cyan().bold()));
    }

    let mut somtx_vec = Vec::with_capacity(prepare_len);
    for (i, ds_tx) in db_stored_txs[..prepare_len].iter().enumerate() {
        if let Some(tx_seq_id) = &ds_tx.id {
            if (next_seq_id + i as u128) != to_u128(tx_seq_id.clone()) {
                return Err(anyhow!(format!("the sequence id of the transaction error!").red().bold()));
            }
        }

        match ds_tx.to_signed_omniverse_tx() {
            Ok(somtx) => {
                somtx_vec.push(somtx);
            },
            Err(err) => {
                return Err(anyhow!(format!("Tx {:?} errors due to: '{}'", ds_tx.id, err).red().bold()));
            },
        }
    }

    Ok(somtx_vec)
}

//////////////////////////////////////////////////////////////////////////////////////////
/// sync executor
pub struct SyncExecutor<H: Hasher<F> + Send + Sync, F: RichField + Extendable<D>, const D: usize> {
    remote_db: RemoteExecDB,
    runtime_zk_prover: ZK6358StateProverEnv<H, F, D>,
    // objective storage
    fri_proof_batch_store: FRIProofBatchStorage,
}

impl<H: Hasher<F> + Send + Sync, F: RichField + Extendable<D>, const D: usize> SyncExecutor<H, F, D> {

    pub async fn new(fri_batch_path: String) -> Self {
        let db_config = exec_system::database::DatabaseConfig::from_env();
        let o_s_url_config = exec_system::database::ObjectStoreUrlConfig::from_env();

        info!("{:?}", db_config.smt_kv);
        info!("{:?}", o_s_url_config);

        Self { 
            // batch_recorder: BatchRecorder { next_batch_id: 0, next_tx_id: 1 }, 
            remote_db: RemoteExecDB::new(&db_config.remote_url).await,
            runtime_zk_prover: ZK6358StateProverEnv::<H, F, D>::new(&db_config.smt_kv).await,
            fri_proof_batch_store: FRIProofBatchStorage::new(&o_s_url_config, fri_batch_path).await,
        }
    }

    pub async fn load_current_state_from_local(&mut self, init_path: &str) -> Result<()> {
        if let Ok(init_utxo_bytes) = fs::read(format!("{}/init_utxo.json", init_path)) {
            let init_utxo_vec: Vec<InitUTXO> = serde_json::from_slice(&init_utxo_bytes).unwrap();
            let init_utxo_vec = init_utxo_vec.iter().map(|init_utxo| {
                init_utxo.to_zk6358_utxo().unwrap()
            }).collect_vec();
            self.runtime_zk_prover.init_utxo_inputs(&init_utxo_vec).await;

            info!("init utxos");
        }

        if let Ok(init_asset_bytes) = fs::read(format!("{}/init_asset.json", init_path)) {
            let init_asset: InitAsset = serde_json::from_slice(&init_asset_bytes).unwrap();
            let init_asset = init_asset.to_zk6358_asset().unwrap();
            self.runtime_zk_prover.init_asset(&init_asset).await;

            info!("init assets");
        }

        Ok(())
    }

    async fn sync_one_batch<C: GenericConfig<D, F = F>>(&mut self, batched_somtx_vec: &Vec<SignedOmniverseTx>) {
        let _parallel_state_cd_vec = self.runtime_zk_prover.build_chunked_state_transfer_data::<C>(batched_somtx_vec, batched_somtx_vec.len()).await;
        self.runtime_zk_prover.flush_state_after_final_verification().await;
    }

    pub async fn synchronize_node<C: GenericConfig<D, F = F>>(&mut self) -> Result<()> {
        // update local `smt-kv` from tx seq `1` to `end_tx_seq - 1`
        let end_tx_seq = self.fri_proof_batch_store.batch_config.next_tx_seq_id;
        info!(" {} transactions to be synchronized", end_tx_seq - 1);

        // `tx seq` is started from `1` 
        let mut next_tx_seq = 1u128;

        while next_tx_seq < end_tx_seq {
            let tx_nun_sync_once = std::cmp::min((end_tx_seq - next_tx_seq) as usize, NUM_SYNC_ONCE);

            if let Some(db_tx_vec) = self.remote_db.get_executed_txs(next_tx_seq, tx_nun_sync_once).await {
                match prepare_txs(next_tx_seq, &db_tx_vec, tx_nun_sync_once, 4) {
                    Ok(batched_somtx_vec) => {
                        info!("{}", format!("prepared {} signed transactions. from tx seq {}", batched_somtx_vec.len(), next_tx_seq).bright_blue().bold());
                        self.sync_one_batch::<C>(&batched_somtx_vec).await;
                        next_tx_seq += batched_somtx_vec.len() as u128;
                        info!("{}", format!("synchronized to {} tx seq", next_tx_seq - 1).green());
                    },
                    Err(err) => {
                        return Err(err);
                    },
                }
            } else {
                return Err(anyhow!(format!("database error.").red().bold()));
            }
        }

        Ok(())
    }
}
