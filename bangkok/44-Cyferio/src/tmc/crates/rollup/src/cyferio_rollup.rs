#![deny(missing_docs)]
//! CyferioRollup provides a rollup implementation using Cyferio as the DA layer

use anyhow::Error;
use async_trait::async_trait;
use sov_cyferio_hub::service::CyferioConfig;
use sov_cyferio_hub::service::DaProvider;
use sov_cyferio_hub::spec::CyferioDaLayerSpec;
use sov_db::ledger_db::LedgerDb;
use sov_db::storage_manager::NativeStorageManager;
use sov_kernels::basic::BasicKernel;
use sov_mock_zkvm::{MockCodeCommitment, MockZkVerifier, MockZkvm};
use sov_modules_api::default_spec::DefaultSpec;
use sov_modules_api::higher_kinded_types::Generic;
use sov_modules_api::{CryptoSpec, SovApiProofSerializer, Spec, Zkvm};
use sov_modules_rollup_blueprint::pluggable_traits::PluggableSpec;
use sov_modules_rollup_blueprint::{FullNodeBlueprint, RollupBlueprint};
use sov_modules_stf_blueprint::{RuntimeEndpoints, StfBlueprint};
use sov_risc0_adapter::host::Risc0Host;
use sov_risc0_adapter::Risc0Verifier;
use sov_rollup_interface::execution_mode::{ExecutionMode, Native, Zk};
use sov_rollup_interface::services::da::DaServiceWithRetries;
use sov_rollup_interface::zk::aggregated_proof::CodeCommitment;
use sov_sequencer::SequencerDb;
use sov_state::Storage;
use sov_state::{DefaultStorageSpec, ProverStorage, ZkStorage};
use sov_stf_runner::RollupConfig;
use sov_stf_runner::RollupProverConfig;
use sov_stf_runner::{ParallelProverService, ProverService};
use stf_starter::authentication::ModAuth;
use stf_starter::Runtime;
use tokio::sync::watch::Receiver;

/// Rollup with [`CyferioService`].
#[derive(Default)]
pub struct CyferioRollup<M> {
    phantom: std::marker::PhantomData<M>,
}

/// This is the place, where all the rollup components come together, and
/// they can be easily swapped with alternative implementations as needed.
#[async_trait]
impl<M: ExecutionMode> RollupBlueprint<M> for CyferioRollup<M>
where
    DefaultSpec<Risc0Verifier, MockZkVerifier, M>: PluggableSpec,
{
    type Spec = DefaultSpec<Risc0Verifier, MockZkVerifier, M>;
    type DaSpec = CyferioDaLayerSpec;
    type Runtime = Runtime<Self::Spec, Self::DaSpec>;
    type Kernel = BasicKernel<Self::Spec, Self::DaSpec>;
}

#[async_trait]
impl FullNodeBlueprint<Native> for CyferioRollup<Native> {
    type DaService = DaServiceWithRetries<DaProvider>;
    type DaConfig = CyferioConfig;
    /// Inner Zkvm representing the rollup circuit
    type InnerZkvmHost = Risc0Host<'static>;
    /// Outer Zkvm representing the circuit verifier for recursion
    type OuterZkvmHost = MockZkvm;
    /// Manager for the native storage lifecycle.
    type StorageManager = NativeStorageManager<
        CyferioDaLayerSpec,
        ProverStorage<DefaultStorageSpec<<<Self::Spec as Spec>::CryptoSpec as CryptoSpec>::Hasher>>,
    >;
    /// Prover service.
    type ProverService = ParallelProverService<
        <Self::Spec as Spec>::Address,
        <<Self::Spec as Spec>::Storage as Storage>::Root,
        <<Self::Spec as Spec>::Storage as Storage>::Witness,
        Self::DaService,
        Self::InnerZkvmHost,
        Self::OuterZkvmHost,
        StfBlueprint<
            <Self::Spec as Generic>::With<Zk>,
            Self::DaSpec,
            <CyferioRollup<Zk> as RollupBlueprint<Zk>>::Runtime,
            <CyferioRollup<Zk> as RollupBlueprint<Zk>>::Kernel,
        >,
    >;

    type ProofSerializer = SovApiProofSerializer<Self::Spec>;

    fn create_outer_code_commitment(
        &self,
    ) -> <<Self::ProverService as ProverService>::Verifier as Zkvm>::CodeCommitment {
        MockCodeCommitment::default()
    }

    fn create_endpoints(
        &self,
        storage: Receiver<<Self::Spec as Spec>::Storage>,
        ledger_db: &LedgerDb,
        sequencer_db: &SequencerDb,
        da_service: &Self::DaService,
        rollup_config: &RollupConfig<<Self::Spec as Spec>::Address, Self::DaConfig>,
    ) -> Result<RuntimeEndpoints, Error> {
        sov_modules_rollup_blueprint::register_endpoints::<Self, _, ModAuth<Self::Spec, Self::DaSpec>>(
            storage.clone(),
            ledger_db,
            sequencer_db,
            da_service,
            rollup_config.da.sender_address,
        )
    }

    async fn create_da_service(
        &self,
        rollup_config: &RollupConfig<<Self::Spec as Spec>::Address, Self::DaConfig>,
    ) -> Self::DaService {
        let da_provider = DaProvider::from_config(rollup_config.da.clone())
            .await
            .expect("Failed to create DaProvider");
        DaServiceWithRetries::new_fast(da_provider)
    }

    async fn create_prover_service(
        &self,
        prover_config: RollupProverConfig,
        rollup_config: &RollupConfig<<Self::Spec as Spec>::Address, Self::DaConfig>,
        _da_service: &Self::DaService,
    ) -> Self::ProverService {
        let inner_vm = Risc0Host::new(risc0_starter::MOCK_DA_ELF);
        let outer_vm = MockZkvm::new_non_blocking();
        let zk_stf = StfBlueprint::new();
        let zk_storage = ZkStorage::new();
        let da_verifier = Default::default();

        ParallelProverService::new_with_default_workers(
            inner_vm,
            outer_vm,
            zk_stf,
            da_verifier,
            prover_config,
            zk_storage,
            CodeCommitment::default(),
            rollup_config.proof_manager.prover_address,
        )
    }

    fn create_storage_manager(
        &self,
        rollup_config: &RollupConfig<<Self::Spec as Spec>::Address, Self::DaConfig>,
    ) -> Result<Self::StorageManager, Error> {
        NativeStorageManager::new(&rollup_config.storage.path)
    }
}

impl sov_modules_rollup_blueprint::WalletBlueprint<Native> for CyferioRollup<Native> {}
