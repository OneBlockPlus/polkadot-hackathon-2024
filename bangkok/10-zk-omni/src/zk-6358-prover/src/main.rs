use clap::{arg, Parser, builder::PossibleValuesParser};
// use log::info;

use anyhow::Result;
use colored::Colorize;
use zk_6358_runner::exec_runner::{batched_state_runtime::testnet_run_batched_state, db_executor::run_db_exec, object_store_executor::run_proof_o_s_exec, testnet_executor::{run_sync_testnet, run_testnet}};
// use zk_6358_runner::exec_runner::testnet_executor::run_testnet;

#[derive(Parser, Debug)]
pub struct Cli {
    #[arg(short, long, 
        default_value_t = String::from("testnet"),
        value_parser = PossibleValuesParser::new(["testnet", 
            "synctestnet", 
            "mainnet", 
            "smt", 
            "proof-db", 
            "mock-test", 
            "mock-test-kzg",
            "batch-state"])
    )]
    pub target: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    exec_system::initiallize::sys_env_init("./.config/sys.config");
    exec_system::initiallize::sys_log_init(Some(vec!["zk_6358_runner".to_string(), 
        "zk_6358_prover".to_string(), 
        "cached_smt_db".to_string(),
        "plonky2::util::timing".to_string(), 
        "crypto".to_string(), 
        "interact".to_string(),
        "fri_kzg_verifier".to_string(),
        "stark_verifier".to_string()
    ]));

    let cli_args = Cli::parse();

    match cli_args.target.as_str() {
        "testnet" => {
            run_testnet().await;
            // info!("running testnet")
        },
        "synctestnet" => {
            run_sync_testnet().await;
        },
        "mainnet" => {
            todo!()
        },
        "smt" => {
            run_db_exec().await;
        },
        "proof-db" => {
            run_proof_o_s_exec().await;
        },
        "mock-test" => {
            if cfg!(feature = "mocktest") {
                #[cfg(feature = "mocktest")]
                {
                    use zk_6358_runner::exec_runner::cosp1_tn_executor::state_only_mocking;
                    state_only_mocking().await;
                }
            } else {
                panic!("{}", format!("`mocktest` is not enabled").red().bold())
            }
        },
        "mock-test-kzg" => {
            if cfg!(feature = "mocktest") {
                #[cfg(feature = "mocktest")]
                {
                    use zk_6358_runner::exec_runner::cosp1_tn_executor::state_only_mocking_kzg;
                    state_only_mocking_kzg().await;
                }
            } else {
                panic!("{}", format!("`mocktest` is not enabled").red().bold())
            }
        },
        "batch-state" => {
            testnet_run_batched_state().await;
        },
        _ => unreachable!("{}", format!("invalid target. expected: `testnet`, `mainnet`, `smt`, or `proof-db`").red().bold())
    }

    Ok(())
}
