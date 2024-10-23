use sov_db::ledger_db::LedgerDb;
use sov_ledger_apis::LedgerRoutes;
use sov_modules_api::capabilities::Authenticator;
use sov_modules_api::execution_mode::ExecutionMode;
use sov_modules_api::{BatchSequencerOutcome, RuntimeEventProcessor, Spec};
use sov_modules_stf_blueprint::{Runtime as RuntimeTrait, RuntimeEndpoints, TxReceiptContents};
use sov_rollup_interface::da::DaSpec;
use sov_rollup_interface::zk::{ZkvmGuest, ZkvmHost};
use sov_sequencer::{FairBatchBuilder, FairBatchBuilderConfig, SequencerDb, TxStatusNotifier};
use tokio::sync::watch;
use tower_http::cors::CorsLayer;

use crate::{FullNodeBlueprint, SequencerBlueprint};

/// Register rollup's default RPC methods and Axum router.
pub fn register_endpoints<B, M, Auth>(
    storage: watch::Receiver<<B::Spec as Spec>::Storage>,
    ledger_db: &LedgerDb,
    sequencer_db: &SequencerDb,
    da_service: &B::DaService,
    sequencer: <B::DaSpec as DaSpec>::Address,
) -> anyhow::Result<RuntimeEndpoints>
where
    B: FullNodeBlueprint<M> + 'static,
    M: ExecutionMode + 'static,
    B::Runtime: RuntimeEventProcessor,
    Auth: Authenticator<Spec = B::Spec, DispatchCall = B::Runtime>,
    <B::InnerZkvmHost as ZkvmHost>::Guest: ZkvmGuest<Verifier = <B::Spec as Spec>::InnerZkvm>,
    <B::OuterZkvmHost as ZkvmHost>::Guest: ZkvmGuest<Verifier = <B::Spec as Spec>::OuterZkvm>,
{
    let mut endpoints = B::Runtime::endpoints(storage.clone());

    // Ledger endpoint.
    {
        let ledger_axum_router = LedgerRoutes::<
            LedgerDb,
            BatchSequencerOutcome,
            TxReceiptContents,
            <B::Runtime as RuntimeEventProcessor>::RuntimeEvent,
        >::axum_router(ledger_db.clone(), "/ledger");
        endpoints.axum_router = endpoints
            .axum_router
            .nest("/ledger", ledger_axum_router.with_state(ledger_db.clone()));
    }

    // Sequencer endpoints.
    {
        let config = FairBatchBuilderConfig {
            mempool_max_txs_count: u32::MAX as usize,
            max_batch_size_bytes: 1024 * 100,
            sequencer_address: sequencer.clone(),
        };

        let notifier = TxStatusNotifier::default();
        let batch_builder =
            FairBatchBuilder::<B::Spec, B::DaSpec, B::Runtime, B::Kernel, Auth>::new(
                B::Runtime::default(),
                B::Kernel::default(),
                notifier.clone(),
                storage,
                sequencer_db.clone(),
                config,
            )?;

        let sequencer = SequencerBlueprint::<B, M, Auth>::new(
            batch_builder,
            da_service.clone(),
            notifier,
            ledger_db.clone(),
        );

        endpoints.axum_router = endpoints.axum_router.nest(
            "/sequencer",
            sequencer
                .axum_router("/sequencer")
                .layer(
                    CorsLayer::new() // Allowing CORS is necessary for Metamask Snap
                        .allow_origin(tower_http::cors::Any) // Allow all origins
                        .allow_methods(tower_http::cors::Any) // Allow all methods
                        .allow_headers(tower_http::cors::Any), // Allow all headers
                )
                .with_state(sequencer),
        );
    }

    Ok(endpoints)
}
