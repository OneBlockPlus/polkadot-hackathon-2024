//! This binary runs the rollup full node.

use anyhow::Context;
use clap::Parser;

#[cfg(feature = "mock_da")]
use sov_mock_da::MockDaConfig;

#[cfg(feature = "mock_da")]
use sov_rollup_starter::mock_rollup::MockRollup;

#[cfg(feature = "cyferio_da")]
use sov_cyferio_hub::service::CyferioConfig;

#[cfg(feature = "cyferio_da")]
use sov_rollup_starter::cyferio_rollup::CyferioRollup;

use sov_kernels::basic::BasicKernelGenesisConfig;
use sov_kernels::basic::BasicKernelGenesisPaths;
use sov_modules_rollup_blueprint::FullNodeBlueprint;
use sov_modules_rollup_blueprint::Rollup;
use sov_rollup_interface::execution_mode::Native;
use sov_stf_runner::RollupProverConfig;
use sov_stf_runner::{from_toml_path, RollupConfig};

use std::env;
use std::str::FromStr;
use stf_starter::genesis_config::GenesisPaths;
use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::prelude::*;
use tracing_subscriber::{fmt, EnvFilter};

#[cfg(all(feature = "mock_da", feature = "celestia_da"))]
compile_error!("Both mock_da and celestia_da are enabled, but only one should be.");

// config and genesis for mock da
#[cfg(all(feature = "mock_da", not(feature = "celestia_da")))]
const DEFAULT_CONFIG_PATH: &str = "../../rollup_config.toml";
#[cfg(all(feature = "mock_da", not(feature = "celestia_da")))]
const DEFAULT_GENESIS_PATH: &str = "../../test-data/genesis/mock/";
#[cfg(all(feature = "mock_da", not(feature = "celestia_da")))]
const DEFAULT_KERNEL_GENESIS_PATH: &str = "../../test-data/genesis/mock/chain_state.json";

// Add config and genesis for Cyferio
#[cfg(all(feature = "cyferio_da", not(feature = "mock_da"), not(feature = "celestia_da")))]
const DEFAULT_CONFIG_PATH: &str = "../../cyferio_rollup_config.toml";
#[cfg(all(feature = "cyferio_da", not(feature = "mock_da"), not(feature = "celestia_da")))]
const DEFAULT_GENESIS_PATH: &str = "../../test-data/genesis/cyferio/";
#[cfg(all(feature = "cyferio_da", not(feature = "mock_da"), not(feature = "celestia_da")))]
const DEFAULT_KERNEL_GENESIS_PATH: &str = "../../test-data/genesis/cyferio/chain_state.json";

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// The path to the rollup config.
    #[arg(long, default_value = DEFAULT_CONFIG_PATH)]
    rollup_config_path: String,

    /// The path to the genesis config.
    #[arg(long, default_value = DEFAULT_GENESIS_PATH)]
    genesis_paths: String,
    /// The path to the kernel genesis config.
    #[arg(long, default_value = DEFAULT_KERNEL_GENESIS_PATH)]
    kernel_genesis_paths: String,

    /// The optional path to the log file.
    #[arg(long, default_value = None)]
    log_dir: Option<String>,

    /// The optional path to the log file.
    #[arg(long, default_value_t = 9845)]
    metrics: u64,
}

fn init_logging(log_dir: Option<String>) -> Option<WorkerGuard> {
    let stdout_layer = fmt::layer().with_writer(std::io::stdout);
    let filter_layer = EnvFilter::from_str(
        &env::var("RUST_LOG")
            .unwrap_or_else(|_| "debug,hyper=info,jmt=info,risc0_zkvm=info,reqwest=info,tower_http=info,jsonrpsee-client=info,jsonrpsee-server=info,sqlx=warn,tiny_http=warn,risc0_circuit_rv32im=info".to_string()))
            .unwrap();

    let subscriber = tracing_subscriber::registry()
        .with(stdout_layer)
        .with(filter_layer);

    if let Some(path) = log_dir {
        let file_appender = tracing_appender::rolling::daily(path, "rollup.log");
        let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);
        subscriber
            .with(fmt::layer().with_writer(non_blocking).with_ansi(false))
            .init();
        Some(guard)
    } else {
        subscriber.init();
        None
    }
}

#[tokio::main]
// Not returning result here, so error could be logged properly.
async fn main() {
    let args = Args::parse();

    let guard = init_logging(args.log_dir);
    let prev_hook = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |panic_info| {
        tracing_panic::panic_hook(panic_info);
        prev_hook(panic_info);
    }));

    let metrics_port = args.metrics;
    let address = format!("127.0.0.1:{}", metrics_port);
    prometheus_exporter::start(address.parse().unwrap())
        .expect("Could not start prometheus server");

    let rollup_config_path = args.rollup_config_path.as_str();

    let genesis_paths = args.genesis_paths.as_str();
    let kernel_genesis_paths = args.kernel_genesis_paths.as_str();

    let prover_config = parse_prover_config().expect("Malformed prover_config");
    tracing::info!(?prover_config, "Running demo rollup with prover config");

    let rollup = new_rollup(
        &GenesisPaths::from_dir(genesis_paths),
        &BasicKernelGenesisPaths {
            chain_state: kernel_genesis_paths.into(),
        },
        rollup_config_path,
        prover_config,
    )
    .await
    .expect("Couldn't start rollup");
    rollup.run().await.expect("Couldn't run rollup");
    drop(guard);
}

fn parse_prover_config() -> anyhow::Result<Option<RollupProverConfig>> {
    if let Some(value) = option_env!("SOV_PROVER_MODE") {
        let config = std::str::FromStr::from_str(value).map_err(|error| {
            tracing::error!(value, ?error, "Unknown `SOV_PROVER_MODE` value; aborting");
            error
        })?;
        Ok(Some(config))
    } else {
        Ok(None)
    }
}

#[cfg(all(feature = "mock_da", not(feature = "celestia_da")))]
async fn new_rollup(
    rt_genesis_paths: &GenesisPaths,
    kernel_genesis_paths: &BasicKernelGenesisPaths,
    rollup_config_path: &str,
    prover_config: Option<RollupProverConfig>,
) -> Result<Rollup<MockRollup<Native>, Native>, anyhow::Error> {
    tracing::info!("Starting mock rollup with config {}", rollup_config_path);

    let rollup_config: RollupConfig<sov_modules_api::Address<sha2::Sha256>, MockDaConfig> =
        from_toml_path(rollup_config_path).context("Failed to read rollup configuration")?;

    let mock_rollup = MockRollup::default();

    let kernel_genesis = BasicKernelGenesisConfig {
        chain_state: serde_json::from_str(
            &std::fs::read_to_string(&kernel_genesis_paths.chain_state)
                .context("Failed to read chain state")?,
        )?,
    };

    mock_rollup
        .create_new_rollup(
            rt_genesis_paths,
            kernel_genesis,
            rollup_config,
            prover_config,
        )
        .await
}

#[cfg(all(feature = "sui_da", not(feature = "mock_da")))]
async fn new_rollup(
    rt_genesis_paths: &GenesisPaths,
    kernel_genesis_paths: &BasicKernelGenesisPaths,
    rollup_config_path: &str,
    prover_config: Option<RollupProverConfig>,
) -> Result<Rollup<SuiRollup<Native>, Native>, anyhow::Error> {
    tracing::info!("Starting Sui rollup with config {}", rollup_config_path);

    println!("Current directory: {:?}", env::current_dir());
    println!("Current directory: {:?}", rollup_config_path);
    let rollup_config: RollupConfig<sov_modules_api::Address<sha2::Sha256>, SuiConfig> =
        from_toml_path(rollup_config_path).context("Failed to read rollup configuration")?;

    let kernel_genesis = BasicKernelGenesisConfig {
        chain_state: serde_json::from_str(
            &std::fs::read_to_string(&kernel_genesis_paths.chain_state)
                .context("Failed to read chain state")?,
        )?,
    };

    let sui_rollup = SuiRollup::default();
    sui_rollup
        .create_new_rollup(
            rt_genesis_paths,
            kernel_genesis,
            rollup_config,
            prover_config,
        )
        .await
}

#[cfg(all(feature = "cyferio_da", not(feature = "mock_da"), not(feature = "celestia_da")))]
async fn new_rollup(
    rt_genesis_paths: &GenesisPaths,
    kernel_genesis_paths: &BasicKernelGenesisPaths,
    rollup_config_path: &str,
    prover_config: Option<RollupProverConfig>,
) -> Result<Rollup<CyferioRollup<Native>, Native>, anyhow::Error> {
    tracing::info!("Starting Cyferio rollup with config {}", rollup_config_path);

    let rollup_config: RollupConfig<sov_modules_api::Address<sha2::Sha256>, CyferioConfig> =
        from_toml_path(rollup_config_path).context("Failed to read rollup configuration")?;

    let kernel_genesis = BasicKernelGenesisConfig {
        chain_state: serde_json::from_str(
            &std::fs::read_to_string(&kernel_genesis_paths.chain_state)
                .context("Failed to read chain state")?,
        )?,
    };

    let cyferio_rollup = CyferioRollup::default();
    cyferio_rollup
        .create_new_rollup(
            rt_genesis_paths,
            kernel_genesis,
            rollup_config,
            prover_config,
        )
        .await
}
