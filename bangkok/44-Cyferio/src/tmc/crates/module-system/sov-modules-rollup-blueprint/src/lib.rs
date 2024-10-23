#![deny(missing_docs)]
#![doc = include_str!("../README.md")]

#[cfg(feature = "native")]
mod wallet;
#[cfg(feature = "native")]
pub use endpoints::*;
use pluggable_traits::PluggableSpec;
use sov_modules_api::capabilities::KernelSlotHooks;
use sov_modules_api::execution_mode::ExecutionMode;
use sov_modules_api::{BlobDataWithId, DaSpec, Spec};
#[cfg(feature = "native")]
mod endpoints;

pub mod pluggable_traits;
use sov_modules_stf_blueprint::Runtime;
#[cfg(feature = "native")]
pub use wallet::*;

/// Recommended default log level;
pub const DEFAULT_SOV_ROLLUP_LOGGING: &str = "debug,hyper=info,risc0_zkvm=warn,jmt=info,jsonrpsee-server=info,jsonrpsee-client=info,reqwest=info,sqlx=warn,tiny_http=warn,tower_http=info,tungstenite=info,risc0_circuit_rv32im=info,risc0_zkp::verify=info";

/// A trait defining the logical STF of the rollup.
pub trait RollupBlueprint<M: ExecutionMode>: Sized + Send + Sync {
    /// The types provided by the rollup
    type Spec: PluggableSpec + Spec;

    /// A specification for the types used by a DA layer.
    type DaSpec: DaSpec + Send + Sync + 'static;

    /// The runtime for the rollup.
    type Runtime: Runtime<Self::Spec, Self::DaSpec> + Send + Sync + 'static;

    /// The kernel for the rollup.
    type Kernel: KernelSlotHooks<Self::Spec, Self::DaSpec, BlobType = BlobDataWithId>
        + Send
        + Sync
        + 'static;
}

#[cfg(feature = "native")]
pub use blueprint::*;

#[cfg(feature = "native")]
mod blueprint {
    use std::marker::PhantomData;
    use std::net::SocketAddr;
    use std::sync::Arc;

    use anyhow::Context;
    use async_trait::async_trait;
    use sov_db::ledger_db::LedgerDb;
    use sov_db::schema::{DeltaReader, SchemaBatch};
    use sov_modules_api::capabilities::Authenticator;
    use sov_modules_api::execution_mode::ExecutionMode;
    use sov_modules_api::runtime::capabilities::Kernel;
    use sov_modules_api::{BatchSequencerOutcome, ProofSerializer, Spec, Zkvm};
    use sov_modules_stf_blueprint::{
        GenesisParams, Runtime as RuntimeTrait, RuntimeEndpoints, StfBlueprint, TxReceiptContents,
    };
    use sov_rollup_interface::services::da::DaService;
    use sov_rollup_interface::storage::HierarchicalStorageManager;
    use sov_rollup_interface::zk::{ZkvmGuest, ZkvmHost};
    use sov_sequencer::{FairBatchBuilder, Sequencer, SequencerDb, SequencerSpec};
    use sov_state::storage::NativeStorage;
    use sov_state::Storage;
    use sov_stf_runner::{
        InitVariant, ProofManager, ProverService, RollupConfig, RollupProverConfig,
        StateTransitionRunner,
    };
    use tokio::sync::oneshot;

    use crate::RollupBlueprint;

    /// This trait defines how to crate all the necessary dependencies required by a rollup.
    #[async_trait]
    pub trait FullNodeBlueprint<M: ExecutionMode>: RollupBlueprint<M>
    where
        <Self::InnerZkvmHost as ZkvmHost>::Guest:
            ZkvmGuest<Verifier = <<Self as RollupBlueprint<M>>::Spec as Spec>::InnerZkvm>,
        <Self::OuterZkvmHost as ZkvmHost>::Guest:
            ZkvmGuest<Verifier = <<Self as RollupBlueprint<M>>::Spec as Spec>::OuterZkvm>,
    {
        /// Data Availability service.
        type DaService: DaService<Spec = Self::DaSpec, Error = anyhow::Error> + Clone;
        /// Data Availability config.
        type DaConfig: Send + Sync + 'static;

        /// Host of the inner zkVM program.
        type InnerZkvmHost: ZkvmHost + Send;

        /// Host of the outer zkVM program.
        type OuterZkvmHost: ZkvmHost + Send;

        /// Manager for the native storage lifecycle.
        type StorageManager: HierarchicalStorageManager<
            Self::DaSpec,
            StfState = <Self::Spec as Spec>::Storage,
            StfChangeSet = <<Self::Spec as Spec>::Storage as Storage>::ChangeSet,
            LedgerState = DeltaReader,
            LedgerChangeSet = SchemaBatch,
        >;

        /// Prover service.
        type ProverService: ProverService<
            StateRoot = <<Self::Spec as Spec>::Storage as Storage>::Root,
            Witness = <<Self::Spec as Spec>::Storage as Storage>::Witness,
            DaService = Self::DaService,
        >;

        /// Serialize proof blob and adds metadata needed for verification.
        type ProofSerializer: ProofSerializer + 'static;

        /// Creates code commitments for the outer zkVM program.
        fn create_outer_code_commitment(
            &self,
        ) -> <<Self::ProverService as ProverService>::Verifier as Zkvm>::CodeCommitment;

        /// Creates RPC methods for the rollup.
        fn create_endpoints(
            &self,
            storage: tokio::sync::watch::Receiver<<Self::Spec as Spec>::Storage>,
            ledger_db: &LedgerDb,
            sequencer_db: &SequencerDb,
            da_service: &Self::DaService,
            rollup_config: &RollupConfig<<Self::Spec as Spec>::Address, Self::DaConfig>,
        ) -> Result<RuntimeEndpoints, anyhow::Error>;

        /// Creates GenesisConfig from genesis files.
        #[allow(clippy::type_complexity)]
        fn create_genesis_config(
            &self,
            rt_genesis_paths: &<Self::Runtime as RuntimeTrait<
                Self::Spec,
                Self::DaSpec,
            >>::GenesisPaths,
            kernel_genesis: <Self::Kernel as Kernel<Self::Spec, Self::DaSpec>>::GenesisConfig,
            _rollup_config: &RollupConfig<<Self::Spec as Spec>::Address, Self::DaConfig>,
        ) -> anyhow::Result<
            GenesisParams<
                <Self::Runtime as RuntimeTrait<Self::Spec, Self::DaSpec>>::GenesisConfig,
                <Self::Kernel as Kernel<Self::Spec, Self::DaSpec>>::GenesisConfig,
            >,
        > {
            let rt_genesis =
                <Self::Runtime as RuntimeTrait<Self::Spec, Self::DaSpec>>::genesis_config(
                    rt_genesis_paths,
                )?;

            Ok(GenesisParams {
                runtime: rt_genesis,
                kernel: kernel_genesis,
            })
        }

        /// Creates instance of [`DaService`].
        async fn create_da_service(
            &self,
            rollup_config: &RollupConfig<<Self::Spec as Spec>::Address, Self::DaConfig>,
        ) -> Self::DaService;

        /// Creates instance of [`ProverService`].
        async fn create_prover_service(
            &self,
            prover_config: RollupProverConfig,
            rollup_config: &RollupConfig<<Self::Spec as Spec>::Address, Self::DaConfig>,
            da_service: &Self::DaService,
        ) -> Self::ProverService;

        /// Creates instance of [`Self::StorageManager`].
        /// Panics if initialization fails.
        fn create_storage_manager(
            &self,
            rollup_config: &RollupConfig<<Self::Spec as Spec>::Address, Self::DaConfig>,
        ) -> Result<Self::StorageManager, anyhow::Error>;

        /// Creates instance of a LedgerDb.
        fn create_ledger_db(
            &self,
            ledger_state: <Self::StorageManager as HierarchicalStorageManager<Self::DaSpec>>::LedgerState,
        ) -> anyhow::Result<LedgerDb> {
            LedgerDb::with_reader(ledger_state)
        }

        /// Creates a new rollup.
        async fn create_new_rollup(
            &self,
            runtime_genesis_paths: &<Self::Runtime as RuntimeTrait<
                Self::Spec ,
                Self::DaSpec,
            >>::GenesisPaths,
            kernel_genesis_config: <Self::Kernel as Kernel<
                Self::Spec ,
                Self::DaSpec,
            >>::GenesisConfig,
            rollup_config: RollupConfig<<Self::Spec as Spec>::Address, Self::DaConfig>,
            prover_config: Option<RollupProverConfig>,
        ) -> Result<Rollup<Self, M>, anyhow::Error>
        where
            <Self::Spec as Spec>::Storage: NativeStorage,
        {
            let genesis_config = self.create_genesis_config(
                runtime_genesis_paths,
                kernel_genesis_config,
                &rollup_config,
            )?;

            let mut storage_manager = self.create_storage_manager(&rollup_config)?;
            let (prover_storage, ledger_state) = storage_manager.create_bootstrap_state()?;
            let ledger_db = self.create_ledger_db(ledger_state)?;

            let da_service = Arc::new(self.create_da_service(&rollup_config).await);
            let relative_da_genesis_block = da_service
                .get_block_at(rollup_config.runner.genesis_height)
                .await?;

            let prover_service = match prover_config {
                Some(c) => Some(
                    self.create_prover_service(c, &rollup_config, &da_service)
                        .await,
                ),
                None => None,
            };

            let sequencer_db = SequencerDb::new(&rollup_config.storage.path)?;

            let prev_root = ledger_db
                .get_head_slot()?
                .map(|(number, _)| prover_storage.get_root_hash(number.0))
                .transpose()?;

            let init_variant = match prev_root {
                Some(root_hash) => InitVariant::Initialized(root_hash),
                None => InitVariant::Genesis {
                    block: relative_da_genesis_block,
                    genesis_params: genesis_config,
                },
            };

            let rpc_storage = tokio::sync::watch::channel(prover_storage);
            // We pass "bootstrap" storage here,
            // as it will be replaced with the latest on after first processed block.
            let endpoints = self.create_endpoints(
                rpc_storage.1,
                &ledger_db,
                &sequencer_db,
                &da_service,
                &rollup_config,
            )?;

            let native_stf = StfBlueprint::new();

            let proof_manager = ProofManager::new(
                da_service.clone(),
                prover_service,
                rollup_config.proof_manager.aggregated_proof_block_jump,
                Box::new(Self::ProofSerializer::new()),
            );

            let runner = StateTransitionRunner::new(
                rollup_config.runner,
                da_service,
                ledger_db,
                native_stf,
                storage_manager,
                rpc_storage.0,
                init_variant,
                proof_manager,
            )
            .await?;

            Ok(Rollup { runner, endpoints })
        }
    }

    /// Dependencies needed to run the rollup.
    pub struct Rollup<S: FullNodeBlueprint<M>, M: ExecutionMode>
    where
        <S::InnerZkvmHost as ZkvmHost>::Guest:
            ZkvmGuest<Verifier = <<S as RollupBlueprint<M>>::Spec as Spec>::InnerZkvm>,
        <S::OuterZkvmHost as ZkvmHost>::Guest:
            ZkvmGuest<Verifier = <<S as RollupBlueprint<M>>::Spec as Spec>::OuterZkvm>,
    {
        /// The State Transition Runner.
        #[allow(clippy::type_complexity)]
        pub runner: StateTransitionRunner<
            StfBlueprint<S::Spec, S::DaSpec, S::Runtime, S::Kernel>,
            S::StorageManager,
            S::DaService,
            S::InnerZkvmHost,
            S::OuterZkvmHost,
            S::ProverService,
        >,

        /// Server endpoints for the rollup.
        pub endpoints: RuntimeEndpoints,
    }

    impl<S: FullNodeBlueprint<M>, M: ExecutionMode> Rollup<S, M>
    where
        <S::InnerZkvmHost as ZkvmHost>::Guest:
            ZkvmGuest<Verifier = <<S as RollupBlueprint<M>>::Spec as Spec>::InnerZkvm>,
        <S::OuterZkvmHost as ZkvmHost>::Guest:
            ZkvmGuest<Verifier = <<S as RollupBlueprint<M>>::Spec as Spec>::OuterZkvm>,
    {
        /// Runs the rollup.
        pub async fn run(self) -> anyhow::Result<()> {
            self.run_and_report_addr(None, None).await
        }

        /// Runs the rollup. Reports RPC port to the caller using the provided channel.
        pub async fn run_and_report_addr(
            self,
            rpc_addr_channel: Option<oneshot::Sender<SocketAddr>>,
            axum_addr_channel: Option<oneshot::Sender<SocketAddr>>,
        ) -> anyhow::Result<()> {
            let mut runner = self.runner;

            let rpc_addr = runner
                .start_rpc_server(self.endpoints.jsonrpsee_module)
                .await
                .context("Failed to start RPC server")?;
            if let Some(sender) = rpc_addr_channel {
                sender
                    .send(rpc_addr)
                    .map_err(|_| anyhow::anyhow!("Failed to send RPC address"))?;
            }

            let axum_addr = runner
                .start_axum_server(self.endpoints.axum_router)
                .await
                .context("Failed to start Axum Server")?;
            if let Some(sender) = axum_addr_channel {
                sender
                    .send(axum_addr)
                    .map_err(|_| anyhow::anyhow!("Failed to send Axum address"))?;
            }

            runner.run_in_process().await?;
            Ok(())
        }
    }

    /// A [`Sequencer`] that for a rollup built with [`RollupBlueprint`].
    pub type SequencerBlueprint<B, M, Auth> = Sequencer<RollupBlueprintSequencerSpec<B, M, Auth>>;

    /// The [`SequencerSpec`] of a [`SequencerBlueprint`].
    #[derive(derivative::Derivative)]
    #[derivative(Clone(bound = ""))]
    pub struct RollupBlueprintSequencerSpec<B, M, Auth>(PhantomData<(B, M, Auth)>);

    impl<B, M, Auth> SequencerSpec for RollupBlueprintSequencerSpec<B, M, Auth>
    where
        B: FullNodeBlueprint<M> + Send + Sync + 'static,
        M: ExecutionMode + Send + Sync + 'static,
        Auth: Authenticator<Spec = B::Spec, DispatchCall = B::Runtime> + Send + Sync + 'static,
        // Bounds required by `FullNodeBlueprint`:
        // --------------------------
        <B::InnerZkvmHost as ZkvmHost>::Guest:
            ZkvmGuest<Verifier = <<B as RollupBlueprint<M>>::Spec as Spec>::InnerZkvm>,
        <B::OuterZkvmHost as ZkvmHost>::Guest:
            ZkvmGuest<Verifier = <<B as RollupBlueprint<M>>::Spec as Spec>::OuterZkvm>,
    {
        type BatchBuilder = FairBatchBuilder<B::Spec, B::DaSpec, B::Runtime, B::Kernel, Auth>;
        type Da = B::DaService;
        type Auth = Auth;
        type BatchReceipt = BatchSequencerOutcome;
        type TxReceipt = TxReceiptContents;
    }
}
