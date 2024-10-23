//! Service and ServiceFactory implementation. Specialized wrapper over substrate service.

use std::{cell::RefCell, path::Path, sync::Arc, time::Duration};

use futures::{channel::mpsc, prelude::*};
// Substrate
use sc_client_api::{Backend, BlockBackend};
use sc_consensus::BasicQueue;
use sc_consensus_babe::{BabeLink, BabeWorkerHandle, SlotProportion};
use sc_executor::NativeExecutionDispatch;
use sc_network_sync::strategy::warp::{WarpSyncParams, WarpSyncProvider};
use sc_service::{error::Error as ServiceError, Configuration, PartialComponents, TaskManager};
use sc_telemetry::{Telemetry, TelemetryHandle, TelemetryWorker};
use sc_transaction_pool_api::OffchainTransactionPoolFactory;
use sp_api::ConstructRuntimeApi;
use sp_core::U256;
use sp_runtime::traits::Block as BlockT;
use substrate_prometheus_endpoint::Registry;
// Runtime
use bolarity_runtime::{opaque::Block, Hash, TransactionConverter};

use crate::{
    cli::Sealing,
    client::{BaseRuntimeApiCollection, FullBackend, FullClient, RuntimeApiCollection},
    eth::{
        new_frontier_partial, spawn_frontier_tasks, BackendType, EthCompatRuntimeApiCollection,
        FrontierBackend, FrontierBlockImport, FrontierPartialComponents, StorageOverride,
        StorageOverrideHandler,
    },
};
pub use crate::{
    client::{BolarityRuntimeExecutor, Client},
    eth::{db_config_dir, EthConfiguration},
};

type BasicImportQueue = sc_consensus::DefaultImportQueue<Block>;
type FullPool<Client> = sc_transaction_pool::FullPool<Block, Client>;
type FullSelectChain = sc_consensus::LongestChain<FullBackend, Block>;

type GrandpaBlockImport<Client> =
    sc_consensus_grandpa::GrandpaBlockImport<FullBackend, Block, Client, FullSelectChain>;
type GrandpaLinkHalf<Client> = sc_consensus_grandpa::LinkHalf<Block, Client, FullSelectChain>;
type BoxBlockImport = sc_consensus::BoxBlockImport<Block>;

/// The minimum period of blocks on which justifications will be
/// imported and generated.
const GRANDPA_JUSTIFICATION_PERIOD: u32 = 512;

pub fn new_partial<RuntimeApi, Executor, BIQ>(
    config: &Configuration,
    eth_config: &EthConfiguration,
    build_import_queue: BIQ,
) -> Result<
    PartialComponents<
        FullClient<RuntimeApi, Executor>,
        FullBackend,
        FullSelectChain,
        BasicImportQueue,
        FullPool<FullClient<RuntimeApi, Executor>>,
        (
            Option<Telemetry>,
            BoxBlockImport,
            BabeLink<Block>,
            BabeWorkerHandle<Block>,
            GrandpaLinkHalf<FullClient<RuntimeApi, Executor>>,
            FrontierBackend<FullClient<RuntimeApi, Executor>>,
            Arc<dyn StorageOverride<Block>>,
        ),
    >,
    ServiceError,
>
where
    RuntimeApi: ConstructRuntimeApi<Block, FullClient<RuntimeApi, Executor>>,
    RuntimeApi: Send + Sync + 'static,
    RuntimeApi::RuntimeApi: BaseRuntimeApiCollection + EthCompatRuntimeApiCollection,
    Executor: NativeExecutionDispatch + 'static,
    BIQ: FnOnce(
        Arc<FullClient<RuntimeApi, Executor>>,
        &Configuration,
        &EthConfiguration,
        &TaskManager,
        Option<TelemetryHandle>,
        GrandpaBlockImport<FullClient<RuntimeApi, Executor>>,
        FullSelectChain,
        OffchainTransactionPoolFactory<Block>,
    ) -> Result<
        ((BasicImportQueue, BabeWorkerHandle<Block>), BoxBlockImport, BabeLink<Block>),
        ServiceError,
    >,
{
    let telemetry = config
        .telemetry_endpoints
        .clone()
        .filter(|x| !x.is_empty())
        .map(|endpoints| -> Result<_, sc_telemetry::Error> {
            let worker = TelemetryWorker::new(16)?;
            let telemetry = worker.handle().new_telemetry(endpoints);
            Ok((worker, telemetry))
        })
        .transpose()?;

    let executor = sc_service::new_native_or_wasm_executor(config);

    let (client, backend, keystore_container, task_manager) =
        sc_service::new_full_parts::<Block, RuntimeApi, _>(
            config,
            telemetry.as_ref().map(|(_, telemetry)| telemetry.handle()),
            executor,
        )?;
    let client = Arc::new(client);

    let telemetry = telemetry.map(|(worker, telemetry)| {
        task_manager.spawn_handle().spawn("telemetry", None, worker.run());
        telemetry
    });

    let select_chain = sc_consensus::LongestChain::new(backend.clone());

    let transaction_pool = sc_transaction_pool::BasicPool::new_full(
        config.transaction_pool.clone(),
        config.role.is_authority().into(),
        config.prometheus_registry(),
        task_manager.spawn_essential_handle(),
        client.clone(),
    );

    let (grandpa_block_import, grandpa_link) = sc_consensus_grandpa::block_import(
        client.clone(),
        GRANDPA_JUSTIFICATION_PERIOD,
        &client,
        select_chain.clone(),
        telemetry.as_ref().map(|x| x.handle()),
    )?;

    let storage_override = Arc::new(StorageOverrideHandler::new(client.clone()));
    let frontier_backend = match eth_config.frontier_backend_type {
        BackendType::KeyValue => FrontierBackend::KeyValue(Arc::new(fc_db::kv::Backend::open(
            Arc::clone(&client),
            &config.database,
            &db_config_dir(config),
        )?)),
        BackendType::Sql => {
            let db_path = db_config_dir(config).join("sql");
            std::fs::create_dir_all(&db_path).expect("failed creating sql db directory");
            let backend = futures::executor::block_on(fc_db::sql::Backend::new(
                fc_db::sql::BackendConfig::Sqlite(fc_db::sql::SqliteBackendConfig {
                    path: Path::new("sqlite:///")
                        .join(db_path)
                        .join("frontier.db3")
                        .to_str()
                        .unwrap(),
                    create_if_missing: true,
                    thread_count: eth_config.frontier_sql_backend_thread_count,
                    cache_size: eth_config.frontier_sql_backend_cache_size,
                }),
                eth_config.frontier_sql_backend_pool_size,
                std::num::NonZeroU32::new(eth_config.frontier_sql_backend_num_ops_timeout),
                storage_override.clone(),
            ))
            .unwrap_or_else(|err| panic!("failed creating sql backend: {:?}", err));
            FrontierBackend::Sql(Arc::new(backend))
        },
    };

    let ((import_queue, worker_handle), block_import, babe_link) = build_import_queue(
        client.clone(),
        config,
        eth_config,
        &task_manager,
        telemetry.as_ref().map(|x| x.handle()),
        grandpa_block_import,
        select_chain.clone(),
        OffchainTransactionPoolFactory::new(transaction_pool.clone()),
    )?;

    Ok(PartialComponents {
        client,
        backend,
        keystore_container,
        task_manager,
        select_chain,
        import_queue,
        transaction_pool,
        other: (
            telemetry,
            block_import,
            babe_link,
            worker_handle,
            grandpa_link,
            frontier_backend,
            storage_override,
        ),
    })
}

/// Build the import queue for the template runtime (aura + grandpa).
pub fn build_babe_grandpa_import_queue<RuntimeApi, Executor>(
    client: Arc<FullClient<RuntimeApi, Executor>>,
    config: &Configuration,
    eth_config: &EthConfiguration,
    task_manager: &TaskManager,
    telemetry: Option<TelemetryHandle>,
    grandpa_block_import: GrandpaBlockImport<FullClient<RuntimeApi, Executor>>,
    select_chain: FullSelectChain,
    offchain_tx_pool_factory: OffchainTransactionPoolFactory<Block>,
) -> Result<
    ((BasicImportQueue, BabeWorkerHandle<Block>), BoxBlockImport, BabeLink<Block>),
    ServiceError,
>
where
    RuntimeApi: ConstructRuntimeApi<Block, FullClient<RuntimeApi, Executor>>,
    RuntimeApi: Send + Sync + 'static,
    RuntimeApi::RuntimeApi: RuntimeApiCollection,
    Executor: NativeExecutionDispatch + 'static,
{
    let _frontier_block_import =
        FrontierBlockImport::new(grandpa_block_import.clone(), client.clone());

    let (block_import, babe_link) = sc_consensus_babe::block_import(
        sc_consensus_babe::configuration(&*client)?,
        grandpa_block_import.clone(),
        client.clone(),
    )?;

    let slot_duration = babe_link.config().slot_duration();
    let justification_import = grandpa_block_import;
    let target_gas_price = eth_config.target_gas_price;
    let import_queue = sc_consensus_babe::import_queue(sc_consensus_babe::ImportQueueParams {
        link: babe_link.clone(),
        block_import: block_import.clone(),
        justification_import: Some(Box::new(justification_import)),
        client: client.clone(),
        select_chain,
        create_inherent_data_providers: move |_, ()| async move {
            let timestamp = sp_timestamp::InherentDataProvider::from_system_time();

            let slot =
                sp_consensus_babe::inherents::InherentDataProvider::from_timestamp_and_slot_duration(
                    *timestamp,
                    slot_duration,
                );
            let dynamic_fee = fp_dynamic_fee::InherentDataProvider(U256::from(target_gas_price));

            Ok((slot, timestamp, dynamic_fee))
        },
        spawner: &task_manager.spawn_essential_handle(),
        registry: config.prometheus_registry(),
        telemetry,
        offchain_tx_pool_factory,
    })?;

    Ok((import_queue, Box::new(block_import), babe_link))
}

/// Builds a new service for a full client.
pub async fn new_full<RuntimeApi, Executor, N>(
    mut config: Configuration,
    eth_config: EthConfiguration,
    sealing: Option<Sealing>,
) -> Result<TaskManager, ServiceError>
where
    RuntimeApi: ConstructRuntimeApi<Block, FullClient<RuntimeApi, Executor>>,
    RuntimeApi: Send + Sync + 'static,
    RuntimeApi::RuntimeApi: RuntimeApiCollection,
    Executor: NativeExecutionDispatch + 'static,
    N: sc_network::NetworkBackend<Block, <Block as BlockT>::Hash>,
{
    // let build_import_queue = if sealing.is_some() {
    //     build_manual_seal_import_queue::<RuntimeApi, Executor>
    // } else {
    //     build_babe_grandpa_import_queue::<RuntimeApi, Executor>
    // };
    let build_import_queue = build_babe_grandpa_import_queue::<RuntimeApi, Executor>;

    let PartialComponents {
        client,
        backend,
        mut task_manager,
        import_queue,
        keystore_container,
        select_chain,
        transaction_pool,
        other:
            (
                mut telemetry,
                block_import,
                babe_link,
                worker_handle,
                grandpa_link,
                frontier_backend,
                storage_override,
            ),
    } = new_partial(&config, &eth_config, build_import_queue)?;
    let target_gas_price = eth_config.target_gas_price;
    let slot_duration = babe_link.config().slot_duration();

    let FrontierPartialComponents { filter_pool, fee_history_cache, fee_history_cache_limit } =
        new_frontier_partial(&eth_config)?;

    let mut net_config =
        sc_network::config::FullNetworkConfiguration::<_, _, N>::new(&config.network);
    let peer_store_handle = net_config.peer_store_handle();
    let metrics = N::register_notification_metrics(
        config.prometheus_config.as_ref().map(|cfg| &cfg.registry),
    );

    let grandpa_protocol_name = sc_consensus_grandpa::protocol_standard_name(
        &client.block_hash(0)?.expect("Genesis block exists; qed"),
        &config.chain_spec,
    );

    let (grandpa_protocol_config, grandpa_notification_service) =
        sc_consensus_grandpa::grandpa_peers_set_config::<_, N>(
            grandpa_protocol_name.clone(),
            metrics.clone(),
            peer_store_handle,
        );

    let warp_sync_params = if sealing.is_some() {
        None
    } else {
        net_config.add_notification_protocol(grandpa_protocol_config);
        let warp_sync: Arc<dyn WarpSyncProvider<Block>> =
            Arc::new(sc_consensus_grandpa::warp_proof::NetworkProvider::new(
                backend.clone(),
                grandpa_link.shared_authority_set().clone(),
                Vec::default(),
            ));
        Some(WarpSyncParams::WithProvider(warp_sync))
    };

    let (network, system_rpc_tx, tx_handler_controller, network_starter, sync_service) =
        sc_service::build_network(sc_service::BuildNetworkParams {
            config: &config,
            net_config,
            client: client.clone(),
            transaction_pool: transaction_pool.clone(),
            spawn_handle: task_manager.spawn_handle(),
            import_queue,
            block_announce_validator_builder: None,
            warp_sync_params,
            block_relay: None,
            metrics,
        })?;

    if config.offchain_worker.enabled {
        task_manager.spawn_handle().spawn(
            "offchain-workers-runner",
            "offchain-worker",
            sc_offchain::OffchainWorkers::new(sc_offchain::OffchainWorkerOptions {
                runtime_api_provider: client.clone(),
                is_validator: config.role.is_authority(),
                keystore: Some(keystore_container.keystore()),
                offchain_db: backend.offchain_storage(),
                transaction_pool: Some(OffchainTransactionPoolFactory::new(
                    transaction_pool.clone(),
                )),
                network_provider: Arc::new(network.clone()),
                enable_http_requests: true,
                custom_extensions: |_| vec![],
            })
            .run(client.clone(), task_manager.spawn_handle())
            .boxed(),
        );
    }

    let role = config.role.clone();
    let force_authoring = config.force_authoring;
    let backoff_authoring_blocks =
        Some(sc_consensus_slots::BackoffAuthoringOnFinalizedHeadLagging::default());
    let name = config.network.node_name.clone();
    let frontier_backend = Arc::new(frontier_backend);
    let enable_grandpa = !config.disable_grandpa && sealing.is_none();
    let prometheus_registry = config.prometheus_registry().cloned();

    // Channel for the rpc handler to communicate with the authorship task.
    let (command_sink, commands_stream) = mpsc::channel(1000);

    // Sinks for pubsub notifications.
    // Everytime a new subscription is created, a new mpsc channel is added to the sink pool.
    // The MappingSyncWorker sends through the channel on block import and the subscription emits a notification to the subscriber on receiving a message through this channel.
    // This way we avoid race conditions when using native substrate block import notification stream.
    let pubsub_notification_sinks: fc_mapping_sync::EthereumBlockNotificationSinks<
        fc_mapping_sync::EthereumBlockNotification<Block>,
    > = Default::default();
    let pubsub_notification_sinks = Arc::new(pubsub_notification_sinks);

    // for ethereum-compatibility rpc.
    config.rpc_id_provider = Some(Box::new(fc_rpc::EthereumSubIdProvider));

    let pending_create_inherent_data_providers = move |_, ()| async move {
        let current = sp_timestamp::InherentDataProvider::from_system_time();
        let next_slot = current.timestamp().as_millis() + slot_duration.as_millis();
        let timestamp = sp_timestamp::InherentDataProvider::new(next_slot.into());
        let slot =
            sp_consensus_babe::inherents::InherentDataProvider::from_timestamp_and_slot_duration(
                *timestamp,
                slot_duration,
            );
        let dynamic_fee = fp_dynamic_fee::InherentDataProvider(U256::from(target_gas_price));
        Ok((slot, timestamp, dynamic_fee))
    };

    let eth_rpc_params = crate::rpc::EthDeps {
        client: client.clone(),
        pool: transaction_pool.clone(),
        graph: transaction_pool.pool().clone(),
        converter: Some(TransactionConverter),
        is_authority: config.role.is_authority(),
        enable_dev_signer: eth_config.enable_dev_signer,
        network: network.clone(),
        sync: sync_service.clone(),
        frontier_backend: match &*frontier_backend {
            fc_db::Backend::KeyValue(b) => b.clone(),
            fc_db::Backend::Sql(b) => b.clone(),
        },
        storage_override: storage_override.clone(),
        block_data_cache: Arc::new(fc_rpc::EthBlockDataCacheTask::new(
            task_manager.spawn_handle(),
            storage_override.clone(),
            eth_config.eth_log_block_cache,
            eth_config.eth_statuses_cache,
            prometheus_registry.clone(),
        )),
        filter_pool: filter_pool.clone(),
        max_past_logs: eth_config.max_past_logs,
        fee_history_cache: fee_history_cache.clone(),
        fee_history_cache_limit,
        execute_gas_limit_multiplier: eth_config.execute_gas_limit_multiplier,
        forced_parent_hashes: None,
        pending_create_inherent_data_providers,
    };

    let rpc_builder = {
        // all these double clones are actually needed here, because we need Fn, but not FnOnce
        let client = client.clone();
        let pool = transaction_pool.clone();
        let select_chain = select_chain.clone();
        let keystore = keystore_container.keystore().clone();
        let pubsub_notification_sinks = pubsub_notification_sinks.clone();
        let justification_stream = grandpa_link.justification_stream();
        let shared_authority_set = grandpa_link.shared_authority_set().clone();
        let finality_provider = sc_consensus_grandpa::FinalityProofProvider::new_for_service(
            backend.clone(),
            Some(shared_authority_set.clone()),
        );

        Box::new(move |deny_unsafe, subscription_executor: sc_rpc::SubscriptionTaskExecutor| {
            let shared_voter_state = sc_consensus_grandpa::SharedVoterState::empty();
            let deps = crate::rpc::FullDeps {
                client: client.clone(),
                pool: pool.clone(),
                select_chain: select_chain.clone(),
                deny_unsafe,
                command_sink: if sealing.is_some() { Some(command_sink.clone()) } else { None },
                eth: eth_rpc_params.clone(),
                babe: crate::rpc::BabeDeps {
                    keystore: keystore.clone(),
                    worker_handle: worker_handle.clone(),
                },
                grandpa: crate::rpc::GrandpaDeps {
                    shared_voter_state,
                    shared_authority_set: shared_authority_set.clone(),
                    justification_stream: justification_stream.clone(),
                    subscription_executor: subscription_executor.clone(),
                    finality_provider: finality_provider.clone(),
                },
            };

            crate::rpc::create_full(deps, subscription_executor, pubsub_notification_sinks.clone())
                .map_err(Into::into)
        })
    };

    let _rpc_handlers = sc_service::spawn_tasks(sc_service::SpawnTasksParams {
        config,
        client: client.clone(),
        backend: backend.clone(),
        task_manager: &mut task_manager,
        keystore: keystore_container.keystore(),
        transaction_pool: transaction_pool.clone(),
        rpc_builder,
        network: network.clone(),
        system_rpc_tx,
        tx_handler_controller,
        sync_service: sync_service.clone(),
        telemetry: telemetry.as_mut(),
    })?;

    spawn_frontier_tasks(
        &task_manager,
        client.clone(),
        backend,
        frontier_backend,
        filter_pool,
        storage_override,
        fee_history_cache,
        fee_history_cache_limit,
        sync_service.clone(),
        pubsub_notification_sinks,
    )
    .await;

    if role.is_authority() {
        // manual-seal authorship
        if let Some(sealing) = sealing {
            run_manual_seal_authorship(
                &eth_config,
                sealing,
                client,
                transaction_pool,
                select_chain,
                Box::new(block_import),
                &task_manager,
                prometheus_registry.as_ref(),
                telemetry.as_ref(),
                commands_stream,
            )?;

            network_starter.start_network();
            log::info!("Manual Seal Ready");
            return Ok(task_manager);
        }
        let proposer_factory = sc_basic_authorship::ProposerFactory::new(
            task_manager.spawn_handle(),
            client.clone(),
            transaction_pool.clone(),
            prometheus_registry.as_ref(),
            telemetry.as_ref().map(|x| x.handle()),
        );

        let slot_duration = babe_link.config().slot_duration();
        let babe_config = sc_consensus_babe::BabeParams {
            keystore: keystore_container.keystore(),
            client: client.clone(),
            select_chain,
            env: proposer_factory,
            block_import,
            sync_oracle: sync_service.clone(),
            justification_sync_link: sync_service.clone(),
            create_inherent_data_providers: move |parent, ()| {
                let client_clone = client.clone();
                async move {
                    let timestamp = sp_timestamp::InherentDataProvider::from_system_time();

                    let slot =
                        sp_consensus_babe::inherents::InherentDataProvider::from_timestamp_and_slot_duration(
                            *timestamp,
                            slot_duration,
                        );

                    let storage_proof =
                        sp_transaction_storage_proof::registration::new_data_provider(
                            &*client_clone,
                            &parent,
                        )?;

                    // TODO huh?
                    // let dynamic_fee = fp_dynamic_fee::InherentDataProvider(U256::from(target_gas_price));
                    // Ok((slot, timestamp, dynamic_fee))
                    Ok((slot, timestamp, storage_proof))
                }
            },
            force_authoring,
            backoff_authoring_blocks,
            babe_link,
            block_proposal_slot_portion: SlotProportion::new(0.5),
            max_block_proposal_slot_portion: None,
            telemetry: telemetry.as_ref().map(|x| x.handle()),
        };

        let babe = sc_consensus_babe::start_babe(babe_config)?;
        task_manager.spawn_essential_handle().spawn_blocking(
            "babe-proposer",
            Some("block-authoring"),
            babe,
        );
    }

    if enable_grandpa {
        // if the node isn't actively participating in consensus then it doesn't
        // need a keystore, regardless of which protocol we use below.
        let keystore = if role.is_authority() { Some(keystore_container.keystore()) } else { None };

        let grandpa_config = sc_consensus_grandpa::Config {
            // FIXME #1578 make this available through chainspec
            gossip_duration: Duration::from_millis(333),
            justification_generation_period: GRANDPA_JUSTIFICATION_PERIOD,
            name: Some(name),
            observer_enabled: false,
            keystore,
            local_role: role,
            telemetry: telemetry.as_ref().map(|x| x.handle()),
            protocol_name: grandpa_protocol_name,
        };

        // start the full GRANDPA voter
        // NOTE: non-authorities could run the GRANDPA observer protocol, but at
        // this point the full voter should provide better guarantees of block
        // and vote data availability than the observer. The observer has not
        // been tested extensively yet and having most nodes in a network run it
        // could lead to finality stalls.
        let grandpa_voter =
            sc_consensus_grandpa::run_grandpa_voter(sc_consensus_grandpa::GrandpaParams {
                config: grandpa_config,
                link: grandpa_link,
                network,
                sync: sync_service,
                notification_service: grandpa_notification_service,
                voting_rule: sc_consensus_grandpa::VotingRulesBuilder::default().build(),
                prometheus_registry,
                shared_voter_state: sc_consensus_grandpa::SharedVoterState::empty(),
                telemetry: telemetry.as_ref().map(|x| x.handle()),
                offchain_tx_pool_factory: OffchainTransactionPoolFactory::new(transaction_pool),
            })?;

        // the GRANDPA voter task is considered infallible, i.e.
        // if it fails we take down the service with it.
        task_manager
            .spawn_essential_handle()
            .spawn_blocking("grandpa-voter", None, grandpa_voter);
    }

    network_starter.start_network();
    Ok(task_manager)
}

fn run_manual_seal_authorship<RuntimeApi, Executor>(
    eth_config: &EthConfiguration,
    sealing: Sealing,
    client: Arc<FullClient<RuntimeApi, Executor>>,
    transaction_pool: Arc<FullPool<FullClient<RuntimeApi, Executor>>>,
    select_chain: FullSelectChain,
    block_import: BoxBlockImport,
    task_manager: &TaskManager,
    prometheus_registry: Option<&Registry>,
    telemetry: Option<&Telemetry>,
    commands_stream: mpsc::Receiver<sc_consensus_manual_seal::rpc::EngineCommand<Hash>>,
) -> Result<(), ServiceError>
where
    RuntimeApi: ConstructRuntimeApi<Block, FullClient<RuntimeApi, Executor>>,
    RuntimeApi: Send + Sync + 'static,
    RuntimeApi::RuntimeApi: RuntimeApiCollection,
    Executor: NativeExecutionDispatch + 'static,
{
    let proposer_factory = sc_basic_authorship::ProposerFactory::new(
        task_manager.spawn_handle(),
        client.clone(),
        transaction_pool.clone(),
        prometheus_registry,
        telemetry.as_ref().map(|x| x.handle()),
    );

    thread_local!(static TIMESTAMP: RefCell<u64> = const { RefCell::new(0) });

    /// Provide a mock duration starting at 0 in millisecond for timestamp inherent.
    /// Each call will increment timestamp by slot_duration making Aura think time has passed.
    struct MockTimestampInherentDataProvider;

    #[async_trait::async_trait]
    impl sp_inherents::InherentDataProvider for MockTimestampInherentDataProvider {
        async fn provide_inherent_data(
            &self,
            inherent_data: &mut sp_inherents::InherentData,
        ) -> Result<(), sp_inherents::Error> {
            TIMESTAMP.with(|x| {
                *x.borrow_mut() += bolarity_runtime::constants::time::SLOT_DURATION;
                inherent_data.put_data(sp_timestamp::INHERENT_IDENTIFIER, &*x.borrow())
            })
        }

        async fn try_handle_error(
            &self,
            _identifier: &sp_inherents::InherentIdentifier,
            _error: &[u8],
        ) -> Option<Result<(), sp_inherents::Error>> {
            // The pallet never reports error.
            None
        }
    }

    let target_gas_price = eth_config.target_gas_price;
    let create_inherent_data_providers = move |_, ()| async move {
        let timestamp = MockTimestampInherentDataProvider;
        let dynamic_fee = fp_dynamic_fee::InherentDataProvider(U256::from(target_gas_price));
        Ok((timestamp, dynamic_fee))
    };

    let manual_seal = match sealing {
        Sealing::Manual => future::Either::Left(sc_consensus_manual_seal::run_manual_seal(
            sc_consensus_manual_seal::ManualSealParams {
                block_import,
                env: proposer_factory,
                client,
                pool: transaction_pool,
                commands_stream,
                select_chain,
                consensus_data_provider: None,
                create_inherent_data_providers,
            },
        )),
        Sealing::Instant => future::Either::Right(sc_consensus_manual_seal::run_instant_seal(
            sc_consensus_manual_seal::InstantSealParams {
                block_import,
                env: proposer_factory,
                client,
                pool: transaction_pool,
                select_chain,
                consensus_data_provider: None,
                create_inherent_data_providers,
            },
        )),
    };

    // we spawn the future on a background thread managed by service.
    task_manager
        .spawn_essential_handle()
        .spawn_blocking("manual-seal", None, manual_seal);
    Ok(())
}

pub async fn build_full(
    config: Configuration,
    eth_config: EthConfiguration,
    sealing: Option<Sealing>,
) -> Result<TaskManager, ServiceError> {
    new_full::<bolarity_runtime::RuntimeApi, BolarityRuntimeExecutor, sc_network::NetworkWorker<_, _>>(
        config, eth_config, sealing,
    )
    .await
}

pub fn new_chain_ops(
    config: &mut Configuration,
    eth_config: &EthConfiguration,
) -> Result<
    (Arc<Client>, Arc<FullBackend>, BasicQueue<Block>, TaskManager, FrontierBackend<Client>),
    ServiceError,
> {
    config.keystore = sc_service::config::KeystoreConfig::InMemory;
    let PartialComponents { client, backend, import_queue, task_manager, other, .. } =
        new_partial::<bolarity_runtime::RuntimeApi, BolarityRuntimeExecutor, _>(
            config,
            eth_config,
            build_babe_grandpa_import_queue,
        )?;
    Ok((client, backend, import_queue, task_manager, other.5))
}
