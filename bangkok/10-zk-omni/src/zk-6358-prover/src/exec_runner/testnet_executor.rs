
use std::fs;

use circuit_local_storage::object_store::batch_serde::BatchRange;
use circuit_local_storage::object_store::proof_object_store::KZGProofBatchStorage;
use crypto::check_log2_strict;
use exec_system::runtime::RuntimeConfig;
use exec_system::traits::EnvConfig;
use fri_kzg_verifier::exec::fri_2_kzg_solidity::{generate_kzg_proof, generate_kzg_verifier};
use fri_kzg_verifier::exec::kzg_setup::load_kzg_params;
use halo2_proofs::poly::kzg::commitment::ParamsKZG;
use halo2_proofs::halo2curves::bn256::Bn256;

use interact::exec_data::remote_exec_db::RemoteExecDB;

use anyhow::{anyhow, Result};
use colored::Colorize;
use interact::exec_data::types::{to_u128, DBStoredExecutedTransaction};
use itertools::Itertools;
use log::info;

use plonky2::fri::FriConfig;
use plonky2::plonk::circuit_data::CircuitConfig;
use plonky2::plonk::config::{GenericConfig, PoseidonGoldilocksConfig};
use plonky2::field::types::PrimeField64;
use plonky2_ecdsa::gadgets::recursive_proof::recursive_proof_2;

use tokio::time::{sleep, Duration};
use zk_6358_prover::circuit::state_prover::ZK6358StateProverEnv;
use zk_6358_prover::circuit::parallel_runtime::ParallelRuntimeCircuitEnv;
use zk_6358_prover::types::signed_tx_types::SignedOmniverseTx;

use zk_6358_prover::exec::db_to_zk::ToSignedOmniverseTx;
use zk_6358_prover::exec::runtime_types::{InitAsset, InitUTXO};

use crate::exec_runner::cosp1_tn_executor::{TN_FRI_PROOF_PATH, TN_KZG_PROOF_PATH};
use crate::exec_runner::sync_executor::SyncExecutor;

use super::sc_local_verifier::SCLocalVerifier;

// #[derive(Debug, Clone)]
// pub struct BatchRecorder {
//     pub next_batch_id: u64,
//     pub next_tx_id: u128,
// }

const TESTNET_CHUNK_SIZE: usize = 4;
const DEGREE_TESTNET: u32 = 20;

const D: usize = 2;
type C = PoseidonGoldilocksConfig;
type F = <C as GenericConfig<D>>::F;
type H = <C as GenericConfig<D>>::Hasher;

pub struct TestnetExecutor
{
    kzg_params: ParamsKZG<Bn256>,

    remote_db: RemoteExecDB,
    runtime_zk_prover: ZK6358StateProverEnv<H, F, D>,

    // objective storage
    kzg_proof_batch_store: KZGProofBatchStorage,

    // local verifier
    local_verifier: SCLocalVerifier
}

impl TestnetExecutor
{
    pub async fn new() -> Self {
        let db_config = exec_system::database::DatabaseConfig::from_env();
        let o_s_url_config = exec_system::database::ObjectStoreUrlConfig::from_env();

        info!("{:?}", db_config.smt_kv);
        info!("{:?}", o_s_url_config);

        Self { 
            // batch_recorder: BatchRecorder { next_batch_id: 0, next_tx_id: 1 }, 
            remote_db: RemoteExecDB::new(&db_config.remote_url).await,
            runtime_zk_prover: ZK6358StateProverEnv::<H, F, D>::new(&db_config.smt_kv).await,
            kzg_proof_batch_store: KZGProofBatchStorage::new(&o_s_url_config, TN_KZG_PROOF_PATH.to_string()).await,
            kzg_params: load_kzg_params(DEGREE_TESTNET, true),
            local_verifier: SCLocalVerifier::new(&vec![4, 8, 16, 32])
        }
    }

    fn is_beginning(&self) -> bool {
        1 == self.kzg_proof_batch_store.batch_config.next_tx_seq_id
    }

    // load executed batch id from objective storage
    pub async fn load_current_state_from_local(&mut self, init_path: &str) -> Result<()> {
        if self.is_beginning() {
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
        }

        Ok(())
    }

    pub async fn test_circuit_exec(&mut self, batch_range: BatchRange, batched_somtx_vec: &Vec<SignedOmniverseTx>) {
        let _parallel_state_cd_vec = self.runtime_zk_prover.build_chunked_state_transfer_data::<C>(batched_somtx_vec, TESTNET_CHUNK_SIZE).await;
        self.kzg_proof_batch_store.put_batched_kzg_proof(batch_range, (vec![1,2,3,4], vec!["1234".to_string(), "1234".to_string(), "1234".to_string(), "1234".to_string()])).await.unwrap();
        self.runtime_zk_prover.flush_state_after_final_verification().await;
    }

    // execution functions
    pub async fn circuit_exec(&mut self, batch_range: BatchRange, batched_somtx_vec: &Vec<SignedOmniverseTx>) -> Result<()>
    {
        let mut rzp_branch = self.runtime_zk_prover.fork();

        let middle_proof = rzp_branch
            .parallel_runtime_prove::<C>(batched_somtx_vec)
            .await?;

        let standard_config = CircuitConfig::standard_recursion_config();
        let high_rate_config = CircuitConfig {
            fri_config: FriConfig {
                rate_bits: 7,
                proof_of_work_bits: 16,
                num_query_rounds: 12,
                ..standard_config.fri_config.clone()
            },
            ..standard_config
        };

        let final_proof =
            recursive_proof_2::<F, C, C, D>(&vec![middle_proof], &high_rate_config, None)?;

        // generate kzg(final) proof
        info!("{}", format!("start aggregating fri proof to kzg").cyan());
        // let (proof, instances) = generate_kzg_proof(final_proof.clone(), &self.kzg_params, None)?;
        // let (proof, _instances) = generate_kzg_verifier(final_proof.clone(), DEGREE_TESTNET, &self.kzg_params, Some("4".to_owned()))?;
        let batch_tx_num = batched_somtx_vec.len();
        let (proof, instances) = if self.local_verifier.check_vk(&batch_tx_num) {
            generate_kzg_proof(final_proof.clone(), &self.kzg_params, None)?
        } else {
            let (proof, instances) = generate_kzg_verifier(final_proof.clone(), DEGREE_TESTNET, &self.kzg_params, Some(batch_tx_num.to_string()))?;
            self.local_verifier.add_vk_address(&batch_tx_num);
            (proof, instances)
        };

        // verify proof from local smart comtract
        self.local_verifier.verify_proof_locally_or_panic(&proof, &instances);

        // Persistent storage
        self.kzg_proof_batch_store.put_batched_kzg_proof(batch_range, (proof, final_proof.0.public_inputs.iter().map(|ins| { ins.to_canonical_u64().to_string() }).collect_vec())).await?;

        // remember to flush to db, or the local state will not be updated
        self.runtime_zk_prover.merge(rzp_branch);
        self.runtime_zk_prover.flush_state_after_final_verification().await;

        Ok(())
    }
    
    pub async fn try_execute_one_batch(&mut self, expected_batch_size: usize) -> Result<()> 
    {
        if !check_log2_strict(expected_batch_size as u128) {
            return Err(anyhow!(format!("the `expected_batch_size` is not a power of 2.").red().bold()));
        }

        if let Some(db_tx_vec) = self.remote_db.get_executed_txs(self.kzg_proof_batch_store.batch_config.next_tx_seq_id, expected_batch_size).await {
            match self.prepare_txs(&db_tx_vec, expected_batch_size).await {
                Ok((batch_range, batched_somtx_vec)) => {
                    info!("{}", format!("batch range: {:?}, and prepared {} signed transactions. from tx seq {}", batch_range, batched_somtx_vec.len(), self.kzg_proof_batch_store.batch_config.next_tx_seq_id).bright_blue().bold());
                    self.circuit_exec(batch_range, &batched_somtx_vec).await?;
                    // self.test_circuit_exec(batch_range, &batched_somtx_vec).await;
                    info!("{}", format!("batch {} fri proof succeed", self.kzg_proof_batch_store.batch_config.next_batch_id - 1).green());
                    Ok(())
                },
                Err(err) => {
                    Err(err)
                },
            }
        } else {
            Err(anyhow!(format!("database error.").red().bold()))
        }
    }

    async fn prepare_txs(&self, db_stored_txs: &Vec<DBStoredExecutedTransaction>, expected_batch_size: usize) -> Result<(BatchRange, Vec<SignedOmniverseTx>)> {
        let mut prepare_len = expected_batch_size;
        while prepare_len >= TESTNET_CHUNK_SIZE  {
            if db_stored_txs.len() >= prepare_len {
                break;
            }

            prepare_len /= 2;
        }

        if prepare_len < TESTNET_CHUNK_SIZE {
            return Err(anyhow!(format!("not enough new transactions. required {}, got {}", expected_batch_size, db_stored_txs.len()).bright_cyan().bold()));
        }

        let mut somtx_vec = Vec::with_capacity(prepare_len);
        for (i, ds_tx) in db_stored_txs[..prepare_len].iter().enumerate() {
            if let Some(tx_seq_id) = &ds_tx.id {
                if (self.kzg_proof_batch_store.batch_config.next_tx_seq_id + i as u128) != to_u128(tx_seq_id.clone()) {
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

        Ok((Self::get_batch_range(&db_stored_txs[..prepare_len]), somtx_vec))
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

////////////////////////////////////////////////////////////////
/// run testnet
pub async fn run_testnet() {
    // rayon::ThreadPoolBuilder::new().num_threads(8).build_global().unwrap();

    exec_system::initiallize::sys_env_init("./.config/sys.config");

    let runtime_config = RuntimeConfig::from_env();

    info!("{}", format!("start {}", runtime_config.network).green().bold());

    let mut runtime_exec = TestnetExecutor::new().await;
    runtime_exec.load_current_state_from_local("./test-data").await.unwrap();

    loop {
        info!("processing at: {}", chrono::offset::Local::now());
        match runtime_exec.try_execute_one_batch(32).await {
            Ok(_) => { sleep(Duration::from_secs(60)).await; },
            Err(err) => { info!("{}", format!("{}", err).red().bold()); sleep(Duration::from_secs(600)).await; }
        }
    }    
}

////////////////////////////////////////////////////////////////
/// run sync
pub async fn run_sync_testnet() {
    // rayon::ThreadPoolBuilder::new().num_threads(8).build_global().unwrap();

    exec_system::initiallize::sys_env_init("./.config/sys.config");

    let runtime_config = RuntimeConfig::from_env();

    info!("{}", format!("start {}", runtime_config.network).green().bold());

    let mut runtime_exec = SyncExecutor::<H, F, D>::new(TN_FRI_PROOF_PATH.to_string()).await;
    runtime_exec.load_current_state_from_local("./init-data").await.unwrap();

    info!("start syncing at: {}", chrono::offset::Local::now());
    match runtime_exec.synchronize_node::<C>().await {
        Ok(_) => {  },
        Err(err) => { info!("{}", format!("{}", err).red().bold()); }
    }  
}
