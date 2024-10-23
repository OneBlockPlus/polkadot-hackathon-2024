#![deny(missing_docs)]
#![doc = include_str!("../README.md")]

mod batch_builder;
mod db;
mod mempool;
mod sequencer;
mod tx_status;

pub use batch_builder::{FairBatchBuilder, FairBatchBuilderConfig};
pub use db::{MempoolTx, SequencerDb};
pub use sequencer::{GenericSequencerSpec, Sequencer, SequencerSpec};
use serde::{Deserialize, Serialize};
use sov_rollup_interface::common::HexHash;
use sov_rollup_interface::TxHash;
pub use tx_status::TxStatusNotifier;

pub use crate::tx_status::TxStatus;

/// The response type to REST API calls that successfully publish a batch.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmittedBatchInfo {
    /// The DA height for which the batch was submitted.
    pub da_height: u64,
    /// The number of transactions that were successfully included in the batch.
    pub num_txs: usize,
}

/// The response type to the RPC method `sequencer_acceptTx`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AcceptTxResponse {
    /// Raw transaction contents as originally passed by the client, as a
    /// hex-encoded string.
    #[serde(with = "sov_rollup_interface::common::hex_string_serde")]
    pub tx: Vec<u8>,
    /// The transaction hash of the transaction that was accepted.
    pub tx_hash: HexHash,
}
