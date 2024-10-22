use jsonrpsee::ws_client::{WsClient, WsClientBuilder};

/// API clients for a running Soverign rollup node.
///
/// Whenever you need to interact with the node over the network within tests,
/// you can use this.
///
///
/// # Example
///
/// ```
/// use sov_test_utils::ApiClient;
///
/// async fn api_client() -> anyhow::Result<ApiClient> {
///     ApiClient::new(12345, 12346).await
/// }
/// ```
#[derive(Debug)]
pub struct ApiClient {
    /// A [`sov_sequencer_json_client::Client`] for communication with the sequencer.
    pub sequencer: sov_sequencer_json_client::Client,
    /// A [`sov_ledger_json_client::Client`] for communication with the ledger.
    pub ledger: sov_ledger_json_client::Client,
    /// A [`WsClient`] client for communications with RPC.
    pub rpc: WsClient,
}

impl ApiClient {
    /// Creates a new [`ApiClient`] from the given RPC and REST ports.
    pub async fn new(rpc_port: u16, rest_port: u16) -> anyhow::Result<Self> {
        let sequencer = sov_sequencer_json_client::Client::new(&format!(
            "http://127.0.0.1:{rest_port}/sequencer"
        ));
        let ledger =
            sov_ledger_json_client::Client::new(&format!("http://127.0.0.1:{rest_port}/ledger"));

        let rpc = WsClientBuilder::default()
            .build(&format!("ws://127.0.0.1:{rpc_port}"))
            .await?;

        Ok(Self {
            sequencer,
            ledger,
            rpc,
        })
    }
}
