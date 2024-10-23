use super::test_helpers::{read_private_keys, start_rollup};
use anyhow::Context;
use futures::StreamExt;
use sov_bank::BankRpcClient;
use sov_kernels::basic::BasicKernelGenesisPaths;
use sov_mock_da::{BlockProducingConfig, MockAddress, MockDaConfig, MockDaSpec};
use sov_modules_api::execution_mode::Native;
use sov_modules_api::macros::config_value;
use sov_modules_api::transaction::{PriorityFeeBips, Transaction, UnsignedTransaction};
use sov_modules_api::Spec;
use sov_stf_runner::RollupProverConfig;
use sov_test_utils::ApiClient;
use std::env;
use std::net::SocketAddr;
use std::str::FromStr;
use stf_starter::genesis_config::GenesisPaths;
use stf_starter::RuntimeCall;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::{fmt, EnvFilter};

const TOKEN_SALT: u64 = 0;
const TOKEN_NAME: &str = "sov-token";
const MAX_TX_FEE: u64 = 100_000_000;

type TestSpec = sov_modules_api::default_spec::DefaultSpec<
    sov_mock_zkvm::MockZkVerifier,
    sov_mock_zkvm::MockZkVerifier,
    Native,
>;

#[tokio::test(flavor = "multi_thread")]
async fn bank_tx_tests() -> Result<(), anyhow::Error> {
    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(
            EnvFilter::from_str(
                &env::var("RUST_LOG")
                    .unwrap_or_else(|_| "debug,hyper=info,jmt=info,risc0_zkvm=info,reqwest=info,tower_http=info,jsonrpsee-client=info,jsonrpsee-server=info,sqlx=warn".to_string()),
            )
            .unwrap(),
        )
        .init();
    let (rpc_port_tx, rpc_port_rx) = tokio::sync::oneshot::channel();
    let (rest_port_tx, rest_port_rx) = tokio::sync::oneshot::channel();

    let rollup_task = tokio::spawn(async {
        start_rollup(
            rpc_port_tx,
            rest_port_tx,
            GenesisPaths::from_dir("../../test-data/genesis/mock/"),
            BasicKernelGenesisPaths {
                chain_state: "../../test-data/genesis/mock/chain_state.json".into(),
            },
            RollupProverConfig::Skip,
            MockDaConfig {
                connection_string: "sqlite::memory:".to_string(),
                sender_address: MockAddress::new([0; 32]),
                finalization_blocks: 3,
                block_producing: BlockProducingConfig::OnSubmit,
                block_time_ms: 100_000,
            },
        )
        .await;
    });
    let rpc_port = rpc_port_rx.await.unwrap();
    let rest_port = rest_port_rx.await.unwrap();

    // If the rollup throws an error, return it and stop trying to send the transaction
    tokio::select! {
        err = rollup_task => err?,
        res = send_test_create_token_tx(rpc_port, rest_port) => res?,
    }
    Ok(())
}

async fn send_test_create_token_tx(
    rpc_address: SocketAddr,
    rest_address: SocketAddr,
) -> Result<(), anyhow::Error> {
    let key_and_address = read_private_keys::<TestSpec>("tx_signer_private_key.json");
    let key = key_and_address.private_key;
    let user_address: <TestSpec as Spec>::Address = key_and_address.address;

    let token_id = sov_bank::get_token_id::<TestSpec>(TOKEN_NAME, &user_address, TOKEN_SALT);
    let initial_balance = 1000;

    let msg =
        RuntimeCall::<TestSpec, MockDaSpec>::bank(sov_bank::CallMessage::<TestSpec>::CreateToken {
            salt: TOKEN_SALT,
            token_name: TOKEN_NAME.to_string(),
            initial_balance,
            mint_to_address: user_address,
            authorized_minters: vec![],
        });
    let chain_id = config_value!("CHAIN_ID");
    let nonce = 0;
    let max_priority_fee = PriorityFeeBips::ZERO;
    let gas_limit = None;
    let tx = Transaction::<TestSpec>::new_signed_tx(
        &key,
        UnsignedTransaction::new(
            borsh::to_vec(&msg).unwrap(),
            chain_id,
            max_priority_fee,
            MAX_TX_FEE,
            nonce,
            gas_limit,
        ),
    );

    let rpc_port = rpc_address.port();
    let rest_port = rest_address.port();
    let client = ApiClient::new(rpc_port, rest_port).await?;

    let mut slot_subscription = client
        .ledger
        .subscribe_slots()
        .await
        .context("Failed to subscribe to slots!")?;

    client
        .sequencer
        .publish_batch_with_serialized_txs(&[tx])
        .await?;
    // Wait until the rollup has processed the next slot
    let _slot_number = slot_subscription
        .next()
        .await
        .transpose()?
        .map(|slot| slot.number)
        .unwrap_or_default();

    let balance_response =
        BankRpcClient::<TestSpec>::balance_of(&client.rpc, None, user_address, token_id).await?;
    assert_eq!(
        initial_balance,
        balance_response.amount.unwrap_or_default(),
        "deployer initial balance is not correct"
    );
    Ok(())
}
