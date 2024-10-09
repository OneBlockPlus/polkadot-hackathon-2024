use std::fs;

use circuit_local_storage::object_store::{batch_serde::{BatchConfig, BatchRange}, proof_object_store::{FRIProofBatchStorage, KZGProofBatchStorage}};
use crypto::check_log2_strict;
use exec_system::{runtime::RuntimeConfig, traits::EnvConfig};
use fri_kzg_verifier::exec::{fri_2_kzg_solidity::{generate_kzg_proof, generate_kzg_verifier}, kzg_setup::load_kzg_params};
use halo2_proofs::{halo2curves::bn256::Bn256, poly::kzg::commitment::ParamsKZG};
use itertools::Itertools;
use log::info;
use plonky2::{
    fri::FriConfig, 
    plonk::{circuit_data::CircuitConfig, config::{GenericConfig, PoseidonGoldilocksConfig}},
    field::types::PrimeField64
};
use plonky2_ecdsa::gadgets::recursive_proof::{recursive_proof_2, ProofTuple};
use zk_6358_prover::{circuit::{state_prover::ZK6358StateProverEnv, zk6358_recursive_proof::zk_6358_chunked_state_recursive_proof}, exec::runtime_types::{InitAsset, InitUTXO}, types::signed_tx_types::SignedOmniverseTx};

use anyhow::Result;
use colored::Colorize;

use crate::{exec_runner::sc_local_verifier::SCLocalVerifier, strategy::circuit_runtime::OnlyStateProverCircuitRT};

const D: usize = 2;
type C = PoseidonGoldilocksConfig;
type F = <C as GenericConfig<D>>::F;
type H = <C as GenericConfig<D>>::Hasher;

pub(crate) const TN_FRI_PROOF_PATH: &str = "0929-fri-cosp1";
pub(crate) const TN_KZG_PROOF_PATH: &str = "0929-kzg-cosp1";

const DEGREE_TESTNET: u32 = 20;

/////////////////////////////////////////////////////////////
/// raw executor
pub struct CoSP1TestnetExecutor
{
    kzg_params: ParamsKZG<Bn256>,

    runtime_zk_prover: ZK6358StateProverEnv<H, F, D>,

    // objective storage
    fri_proof_exec_store: FRIProofBatchStorage,

    // objective storage
    kzg_proof_batch_store: KZGProofBatchStorage,

    // local verifier
    local_verifier: SCLocalVerifier,

    pub runtime_config: RuntimeConfig
}

impl CoSP1TestnetExecutor {
    const L2_CHUNK_SIZE: usize = 64;

    pub async fn new() -> Self {
        let db_config = exec_system::database::DatabaseConfig::from_env();
        let o_s_url_config = exec_system::database::ObjectStoreUrlConfig::from_env();
        let runtime_config = exec_system::runtime::RuntimeConfig::from_env();

        info!("{:?}", db_config.smt_kv);
        info!("{:?}", o_s_url_config);

        assert!(check_log2_strict(runtime_config.batch_size as u128), "Invalid `somtx_container` size. Not 2^*");
        assert_eq!(runtime_config.batch_size % Self::L2_CHUNK_SIZE, 0, "Invalid `somtx_container` size");

        Self { 
            kzg_params: load_kzg_params(DEGREE_TESTNET, true),
            runtime_zk_prover: ZK6358StateProverEnv::<H, F, D>::new(&db_config.smt_kv).await,
            fri_proof_exec_store: FRIProofBatchStorage::new(&o_s_url_config, TN_FRI_PROOF_PATH.to_string()).await,
            kzg_proof_batch_store: KZGProofBatchStorage::new(&o_s_url_config, TN_KZG_PROOF_PATH.to_string()).await,
            local_verifier: SCLocalVerifier::new(&vec![]),
            runtime_config
        }
    }

    pub fn batch_size(&self) -> usize {
        self.runtime_config.batch_size
    }

    pub fn get_fri_batch_config(&self) -> &BatchConfig {
        &self.fri_proof_exec_store.batch_config
    }

    pub fn get_kzg_batch_config(&self) -> &BatchConfig {
        &self.kzg_proof_batch_store.batch_config
    }

    async fn execute_one_batch(&mut self, batched_somtx_vec: &[SignedOmniverseTx]) -> Result<ProofTuple<F, C, D>> {
        // let mut rzp_branch = self.runtime_zk_prover.fork();

        let batched_proof = self.runtime_zk_prover.state_only_crt_prove::<C>(batched_somtx_vec).await?;

        // remember to flush to db, or the local state will not be updated
        // self.runtime_zk_prover.merge(rzp_branch);
        // self.runtime_zk_prover.flush_state_after_final_verification().await;

        Ok(batched_proof)
    }

    pub async fn exec_state_prove_circuit(&mut self, batch_range: BatchRange, somtx_container: &[SignedOmniverseTx]) -> Result<()> {
        assert_eq!(somtx_container.len(), self.runtime_config.batch_size, "Invalid tx count. Expected {}. Got {}", self.runtime_config.batch_size, somtx_container.len());
        assert_eq!(batch_range.start_tx_seq_id, self.fri_proof_exec_store.batch_config.next_tx_seq_id, "Invalid `tx_seq_id`");
        assert_eq!(batch_range.end_tx_seq_id - batch_range.start_tx_seq_id + 1, somtx_container.len() as u128, "Invalid number of the transactions");

        info!("{}", format!("processing batch: {}", self.fri_proof_exec_store.batch_config.next_batch_id).blue().bold());

        let mut batched_proofs = Vec::new();
        for (i, batched_somtx_vec) in somtx_container.chunks(Self::L2_CHUNK_SIZE).enumerate() {
            info!("{}", format!("processing L2 chunk: {}", i).cyan().bold());

            batched_proofs.push(self.execute_one_batch(batched_somtx_vec).await?);
        }

        // let middle_proof = rzp_branch.state_only_crt_prove::<C>(batched_somtx_vec).await?;

        let config = CircuitConfig::standard_recursion_config();

        // to be parallized
        let middle_proof =
            zk_6358_chunked_state_recursive_proof(&batched_proofs, &config.clone(), None)
                .unwrap();

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

        // // remember to flush to db, or the local state will not be updated
        // self.runtime_zk_prover.merge(rzp_branch);
        self.runtime_zk_prover.flush_state_after_final_verification().await;

        self.fri_proof_exec_store.put_batched_fri_proof(batch_range, final_proof).await
    }

    pub async fn exec_full_to_kzg_proof(&mut self, batch_range: BatchRange, somtx_container: &[SignedOmniverseTx]) -> Result<()> {
        assert!(check_log2_strict(somtx_container.len() as u128), "Invalid `somtx_container` size. Not 2^*");
        assert_eq!(batch_range.start_tx_seq_id, self.kzg_proof_batch_store.batch_config.next_tx_seq_id, "Invalid `tx_seq_id`");
        assert_eq!(batch_range.end_tx_seq_id - batch_range.start_tx_seq_id + 1, somtx_container.len() as u128, "Invalid number of the transactions");

        info!("processing batch: {}", self.kzg_proof_batch_store.batch_config.next_batch_id);

        let mut batched_proofs = Vec::new();
        for (i, batched_somtx_vec) in somtx_container.chunks(Self::L2_CHUNK_SIZE).enumerate() {
            info!("processing l2 chunk: {}", i);

            batched_proofs.push(self.execute_one_batch(batched_somtx_vec).await?);
        }

        let config = CircuitConfig::standard_recursion_config();

        // to be parallized
        let middle_proof =
            zk_6358_chunked_state_recursive_proof(&batched_proofs, &config.clone(), None)
                .unwrap();

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

        // tamporarily store the fri proof 
        // self.fri_proof_exec_store.put_batched_fri_proof(batch_range.clone(), final_proof.clone()).await?;

        // generate kzg(final) proof
        info!("{}", format!("start aggregating fri proof to kzg").cyan());
        let batch_tx_num = somtx_container.len();
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

        // // remember to flush to db, or the local state will not be updated
        // self.runtime_zk_prover.merge(rzp_branch);
        self.runtime_zk_prover.flush_state_after_final_verification().await;

        Ok(())
    }

    fn is_beginning(&self) -> bool {
        (1 == self.get_kzg_batch_config().next_tx_seq_id) && (1 == self.get_fri_batch_config().next_tx_seq_id)
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
}

/////////////////////////////////////////////////////////////
/// test
#[cfg(feature = "mocktest")]
mod mock_test {
    use zk_6358::utils6358::transaction::GasFeeTransaction;
    use super::*;

    impl CoSP1TestnetExecutor {
        pub async fn p_test_init_gas_inputs(&mut self, gas_tx_vec: &Vec<GasFeeTransaction>) {
            for gas_tx in gas_tx_vec.iter() {
                self.runtime_zk_prover.init_utxo_inputs(&gas_tx.generate_inputs_utxo()).await;
            }
        }
    }
}

/// fri
#[cfg(feature = "mocktest")]
pub async fn state_only_mocking() {
    use crate::mock::mock_utils::mock_on::p_test_generate_a_batch;
    use plonky2_ecdsa::curve::{curve_types::{AffinePoint, CurveScalar, Curve}, ecdsa::{ECDSAPublicKey, ECDSASecretKey}, secp256k1::Secp256K1};
    use plonky2::{field::{secp256k1_scalar::Secp256K1Scalar, types::Sample}, util::timing::TimingTree};
    use log::Level;

    type EC = Secp256K1;

    info!("start mock testing for utxo state");

    let sk = ECDSASecretKey::<EC>(Secp256K1Scalar::rand());
    let pk = ECDSAPublicKey::<EC>((CurveScalar(sk.0) * EC::GENERATOR_PROJECTIVE).to_affine());
    let AffinePoint { x, y, .. } = pk.0;
    let mut x_le_bytes = Vec::new();
    x.0.iter().for_each(|i| {
        x_le_bytes.append(&mut i.to_le_bytes().to_vec());
    });
    x_le_bytes.reverse();

    let mut y_le_bytes = Vec::new();
    y.0.iter().for_each(|i| {
        y_le_bytes.append(&mut i.to_le_bytes().to_vec());
    });

    let runtime_config = exec_system::runtime::RuntimeConfig::from_env();

    let total_timing = TimingTree::new("total processing time.", Level::Info);
    let tx_n = runtime_config.tx_n as u128;

    let mut batched_somtx_vec = Vec::new();
    (0..tx_n / 4).for_each(|_| {
        batched_somtx_vec.append(&mut p_test_generate_a_batch(
            sk,
            x_le_bytes.clone().try_into().unwrap(),
            y_le_bytes.clone().try_into().unwrap(),
        ));
    });

    let test_gas_tx_vec = batched_somtx_vec
        .iter()
        .map(|somtx| somtx.borrow_gas_transaction().clone())
        .collect_vec();

    let mut cosp1_executor = CoSP1TestnetExecutor::new().await;
    let timing = TimingTree::new("initializing state circuit", Level::Info);
    cosp1_executor.p_test_init_gas_inputs(&test_gas_tx_vec).await;
    timing.print();

    for batched_txs in batched_somtx_vec.chunks(runtime_config.batch_size) {
        let batch_range = BatchRange {
            start_block_height: 0,
            start_tx_seq_id: cosp1_executor.get_fri_batch_config().next_tx_seq_id,
            end_block_height: 64,
            end_tx_seq_id: cosp1_executor.get_fri_batch_config().next_tx_seq_id + runtime_config.batch_size as u128 - 1
        };
        cosp1_executor.exec_state_prove_circuit(batch_range, batched_txs).await.expect("mock state proving error");
    }

    total_timing.print();
}

/// kzg
#[cfg(feature = "mocktest")]
pub async fn state_only_mocking_kzg() {
    use crate::mock::mock_utils::mock_on::p_test_generate_a_batch;
    use plonky2_ecdsa::curve::{curve_types::{AffinePoint, CurveScalar, Curve}, ecdsa::{ECDSAPublicKey, ECDSASecretKey}, secp256k1::Secp256K1};
    use plonky2::{field::{secp256k1_scalar::Secp256K1Scalar, types::Sample}, util::timing::TimingTree};
    use log::Level;

    type EC = Secp256K1;

    info!("start mock testing for utxo state");

    let sk = ECDSASecretKey::<EC>(Secp256K1Scalar::rand());
    let pk = ECDSAPublicKey::<EC>((CurveScalar(sk.0) * EC::GENERATOR_PROJECTIVE).to_affine());
    let AffinePoint { x, y, .. } = pk.0;
    let mut x_le_bytes = Vec::new();
    x.0.iter().for_each(|i| {
        x_le_bytes.append(&mut i.to_le_bytes().to_vec());
    });
    x_le_bytes.reverse();

    let mut y_le_bytes = Vec::new();
    y.0.iter().for_each(|i| {
        y_le_bytes.append(&mut i.to_le_bytes().to_vec());
    });

    let runtime_config = exec_system::runtime::RuntimeConfig::from_env();

    let total_timing = TimingTree::new("total processing time.", Level::Info);
    let tx_n = runtime_config.tx_n as u128;

    let mut batched_somtx_vec = Vec::new();
    (0..tx_n / 4).for_each(|_| {
        batched_somtx_vec.append(&mut p_test_generate_a_batch(
            sk,
            x_le_bytes.clone().try_into().unwrap(),
            y_le_bytes.clone().try_into().unwrap(),
        ));
    });

    let test_gas_tx_vec = batched_somtx_vec
        .iter()
        .map(|somtx| somtx.borrow_gas_transaction().clone())
        .collect_vec();

    let mut cosp1_executor = CoSP1TestnetExecutor::new().await;
    let timing = TimingTree::new("initializing state circuit", Level::Info);
    cosp1_executor.p_test_init_gas_inputs(&test_gas_tx_vec).await;
    timing.print();

    let batch_range = BatchRange {
        start_block_height: 0,
        start_tx_seq_id: cosp1_executor.get_kzg_batch_config().next_tx_seq_id,
        end_block_height: 64,
        end_tx_seq_id: cosp1_executor.get_kzg_batch_config().next_tx_seq_id + tx_n - 1
    };
    cosp1_executor.exec_full_to_kzg_proof(batch_range, &batched_somtx_vec).await.expect("mock state proving error");
    total_timing.print();
}