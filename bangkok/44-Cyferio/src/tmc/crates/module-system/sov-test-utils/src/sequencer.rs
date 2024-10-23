use std::net::SocketAddr;

use sov_db::ledger_db::LedgerDb;
use sov_db::schema::SchemaBatch;
use sov_db::storage_manager::NativeStorageManager;
use sov_kernels::basic::{BasicKernel, BasicKernelGenesisConfig};
use sov_mock_da::{MockBlockHeader, MockDaService, MockDaSpec};
use sov_mock_zkvm::MockCodeCommitment;
use sov_modules_api::{Address, PrivateKey};
use sov_modules_stf_blueprint::{BatchReceipt, GenesisParams, TxReceiptContents};
use sov_rollup_interface::services::batch_builder::BatchBuilder;
use sov_rollup_interface::stf::StateTransitionFunction;
use sov_rollup_interface::storage::HierarchicalStorageManager;
use sov_sequencer::{
    FairBatchBuilder, FairBatchBuilderConfig, GenericSequencerSpec, Sequencer, SequencerDb,
    TxStatusNotifier,
};
use sov_sequencer_json_client::Client;
use sov_state::{DefaultStorageSpec, ProverStorage};
use tempfile::TempDir;
use tokio::sync::watch;

use crate::auth::TestAuth;
use crate::runtime::optimistic::{create_genesis_config, TestRuntime};
use crate::runtime::ChainStateConfig;
use crate::{TestHasher, TestPrivateKey, TestSpec, TestStfBlueprint, TestStorageManager};

const SEQUENCER_ADDR: [u8; 32] = [42u8; 32];

type TestSequencerSpec<B> = GenericSequencerSpec<
    B,
    MockDaService,
    TestAuth<TestSpec, MockDaSpec>,
    BatchReceipt<MockDaSpec>,
    TxReceiptContents,
>;

/// The default test sequencer type. A [`Sequencer`] with a [`MockDaService`] for DA interactions and a [`TestAuth`] for authentication.
pub type TestSequencer<B> = Sequencer<TestSequencerSpec<B>>;

/// The default test fair batch builder type.
/// An alias for a [`FairBatchBuilder`] with a [`TestSpec`],
/// a [`MockDaService`] for DA interactions,
/// a [`TestRuntime`], a [`BasicKernel`] and a [`TestAuth`] for authentication.
pub type TestFairBatchBuilder = FairBatchBuilder<
    TestSpec,
    MockDaSpec,
    TestRuntime<TestSpec, MockDaSpec>,
    BasicKernel<TestSpec, MockDaSpec>,
    TestAuth<TestSpec, MockDaSpec>,
>;

/// A `struct` that contains a [`Sequencer`] and a copy of its running Axum
/// server, for use in tests. See [`TestSequencerSetup::new`] and
/// [`TestSequencerSetup::with_real_batch_builder`].
pub struct TestSequencerSetup<B: BatchBuilder> {
    _dir: TempDir,
    /// The [`MockDaService`] used by the [`Sequencer`].
    pub da_service: MockDaService,
    /// The [`Sequencer`] used in the test.
    pub sequencer: TestSequencer<B>,
    /// The admin private key used to create an external user account for transaction handling.
    pub admin_private_key: TestPrivateKey,
    /// The Axum server handle used to start the Axum server.
    pub axum_server_handle: axum_server::Handle,
    /// The Axum server address.
    pub axum_addr: SocketAddr,
}

impl<B: BatchBuilder> Drop for TestSequencerSetup<B> {
    fn drop(&mut self) {
        self.axum_server_handle.shutdown();
    }
}

impl<B: BatchBuilder> TestSequencerSetup<B> {
    /// Instantiates a new [`Sequencer`] with a [`TestRuntime`] and an empty
    /// [`MockDaService`].
    ///
    /// The RPC and Axum servers for the newly generated [`Sequencer`] are created
    /// on the fly, and their handles are stored inside a [`TestSequencerSetup`].
    /// This results in the automatic shutdown of the servers when the
    /// [`TestSequencerSetup`] is dropped.
    pub async fn new(
        dir: TempDir,
        da_service: MockDaService,
        batch_builder: B,
        tx_status_notifier: TxStatusNotifier<MockDaSpec>,
    ) -> anyhow::Result<Self> {
        // Use "same" bytes for sequencer address and rollup address.
        let sequencer_rollup_addr = Address::from(SEQUENCER_ADDR);
        let admin_pkey = TestPrivateKey::generate();
        let runtime = TestRuntime::<TestSpec, MockDaSpec>::default();

        let mut storage_manager = NativeStorageManager::<
            MockDaSpec,
            ProverStorage<DefaultStorageSpec<TestHasher>>,
        >::new(dir.path())?;
        let genesis_block_header = MockBlockHeader::from_height(0);
        let (stf_state, ledger_state) = storage_manager.create_state_for(&genesis_block_header)?;
        let ledger_db = LedgerDb::with_reader(ledger_state)?;

        let genesis_config = create_genesis_config(
            (&admin_pkey.pub_key()).into(),
            &[],
            sequencer_rollup_addr,
            SEQUENCER_ADDR.into(),
            100_000_000,
            "SovereignToken".to_string(),
            1_000_000_000,
        );

        let kernel_genesis = BasicKernelGenesisConfig {
            chain_state: ChainStateConfig {
                current_time: Default::default(),
                inner_code_commitment: MockCodeCommitment::default(),
                outer_code_commitment: MockCodeCommitment::default(),
                genesis_da_height: 0,
            },
        };
        let params = GenesisParams {
            runtime: genesis_config,
            kernel: kernel_genesis,
        };

        let blueprint = TestStfBlueprint::with_runtime(runtime.clone());
        let (_root_hash, change_set) = blueprint.init_chain(stf_state, params);

        storage_manager.save_change_set(&genesis_block_header, change_set, SchemaBatch::new())?;

        let sequencer = Sequencer::new(
            batch_builder,
            da_service.clone(),
            tx_status_notifier,
            ledger_db,
        );

        let (axum_addr, sequencer_axum_server) = {
            let addr = SocketAddr::from(([127, 0, 0, 1], 0));
            let router = sequencer
                .axum_router("/sequencer")
                .with_state::<()>(sequencer.clone());

            let handle = axum_server::Handle::new();
            let handle1 = handle.clone();
            tokio::spawn(async move {
                axum_server::Server::bind(addr)
                    .handle(handle1)
                    .serve(router.into_make_service())
                    .await
                    .unwrap();
            });

            (handle.listening().await.unwrap(), handle)
        };

        Ok(Self {
            _dir: dir,
            da_service,
            sequencer,
            admin_private_key: admin_pkey,
            axum_server_handle: sequencer_axum_server,
            axum_addr,
        })
    }

    /// Returns a [`Client`] REST handler for the sequencer.
    pub fn client(&self) -> Client {
        Client::new(&format!("http://{}", self.axum_addr))
    }
}

impl TestSequencerSetup<TestFairBatchBuilder> {
    /// Like [`TestSequencerSetup::with_real_batch_builder`], but allows to
    /// specify the maximum number of transactions in the mempool before
    /// eviction.
    pub async fn with_real_batch_builder_and_mempool_max_txs_count(
        mempool_max_txs_count: usize,
    ) -> anyhow::Result<Self> {
        let dir = tempfile::tempdir()?;

        // Use "same" bytes for sequencer address and rollup address.
        let sequencer_rollup_addr = Address::from(SEQUENCER_ADDR);
        let admin_pkey = TestPrivateKey::generate();
        let runtime = TestRuntime::<TestSpec, MockDaSpec>::default();

        let mut storage_manager: TestStorageManager = NativeStorageManager::new(dir.path())?;
        let genesis_block_header = MockBlockHeader::from_height(0);
        let (stf_state, _ledger_state) = storage_manager.create_state_for(&genesis_block_header)?;

        let genesis_config = create_genesis_config(
            (&admin_pkey.pub_key()).into(),
            &[],
            sequencer_rollup_addr,
            SEQUENCER_ADDR.into(),
            100_000_000,
            "SovereignToken".to_string(),
            1_000_000_000,
        );

        let kernel_genesis = BasicKernelGenesisConfig {
            chain_state: ChainStateConfig {
                current_time: Default::default(),
                inner_code_commitment: MockCodeCommitment::default(),
                outer_code_commitment: MockCodeCommitment::default(),
                genesis_da_height: 0,
            },
        };
        let params = GenesisParams {
            runtime: genesis_config,
            kernel: kernel_genesis,
        };

        let blueprint = TestStfBlueprint::with_runtime(runtime.clone());
        let (_root_hash, change_set) = blueprint.init_chain(stf_state, params);

        storage_manager.save_change_set(&genesis_block_header, change_set, SchemaBatch::new())?;

        let first_block = MockBlockHeader::from_height(1);

        let sequencer_db = SequencerDb::new(dir.path())?;

        let (stf_state, ledger_storage) = storage_manager.create_state_for(&first_block)?;
        let ledger_db = LedgerDb::with_reader(ledger_storage)?;

        let batch_builder_config = FairBatchBuilderConfig {
            mempool_max_txs_count,
            max_batch_size_bytes: usize::MAX,
            sequencer_address: SEQUENCER_ADDR.into(),
        };

        let notifier = TxStatusNotifier::default();
        let batch_builder = FairBatchBuilder::new(
            runtime,
            BasicKernel::default(),
            notifier.clone(),
            watch::Sender::new(stf_state).subscribe(),
            sequencer_db,
            batch_builder_config,
        )?;

        let da_service = MockDaService::new(SEQUENCER_ADDR.into());
        let sequencer = Sequencer::new(batch_builder, da_service.clone(), notifier, ledger_db);

        let (axum_addr, sequencer_axum_server) = {
            let addr = SocketAddr::from(([127, 0, 0, 1], 0));
            let router = sequencer
                .axum_router("/sequencer")
                .with_state::<()>(sequencer.clone());

            let handle = axum_server::Handle::new();
            let handle1 = handle.clone();
            tokio::spawn(async move {
                axum_server::Server::bind(addr)
                    .handle(handle1)
                    .serve(router.into_make_service())
                    .await
                    .unwrap();
            });

            (handle.listening().await.unwrap(), handle)
        };

        Ok(Self {
            _dir: dir,
            da_service,
            sequencer,
            admin_private_key: admin_pkey,
            axum_server_handle: sequencer_axum_server,
            axum_addr,
        })
    }

    /// Creates a new [`TestSequencerSetup`]. Instantiates a new [`TestRuntime`], [`NativeStorageManager`], executes genesis
    /// and then builds a new [`FairBatchBuilder`] to instantiate a [`Sequencer`]. Instantiates an Axum server in a separate thread.
    pub async fn with_real_batch_builder() -> anyhow::Result<Self> {
        Self::with_real_batch_builder_and_mempool_max_txs_count(usize::MAX).await
    }
}
