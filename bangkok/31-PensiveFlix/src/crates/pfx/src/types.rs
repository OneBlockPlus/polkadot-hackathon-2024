use crate::system::{PflixMasterKey, WorkerIdentityKey};
use parity_scale_codec::{Decode, Encode, Error as CodecError};
use std::{
    fmt::{self, Debug},
};
use thiserror::Error;
use tokio::sync::{mpsc, oneshot};

extern crate runtime as chain;

#[derive(Clone)]
pub struct PflixProperties {
    pub master_key: PflixMasterKey,
    pub identity_key: WorkerIdentityKey,
    pub cores: u32,
}

impl fmt::Debug for PflixProperties {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "PflixProperties {{ master_key: <omitted>, identity_key: <omitted>, cores: {} }}",
            self.cores
        )
    }
}

pub struct BlockDispatchContext<'a> {
    /// The block number.
    pub block_number: chain::BlockNumber,
    /// The timestamp of this block.
    pub now_ms: u64,
    /// The storage snapshot after this block executed.
    pub storage: &'a crate::ChainStorage,
    /// The message queue
    pub send_mq: &'a pfx_mq::MessageSendQueue,
    pub recv_mq: &'a mut pfx_mq::MessageDispatcher,
}

#[derive(Encode, Decode, Debug, Clone)]
pub struct TxRef {
    pub blocknum: chain::BlockNumber,
    pub index: u64,
}

#[derive(Debug, Error)]
#[allow(clippy::enum_variant_names)]
pub enum Error {
    #[error("Pflix system not ready")]
    SystemNotReady,

    #[error("Keyfairy not ready")]
    KeyfairyNotReady,

    #[error(transparent)]
    TonicTransport(#[from] tonic::transport::Error),

    #[error(transparent)]
    IoError(#[from] std::io::Error),

    #[error(transparent)]
    DecodeError(#[from] CodecError),

    #[error("{:?}", self)]
    PersistentRuntimeNotFound,

    #[error("external server already started")]
    ExternalServerAlreadyServing,

    #[error("external server already closed")]
    ExternalServerAlreadyClosed,

    #[error("unseal error on load_runtime_data()")]
    UnsealOnLoad,

    #[error("{0}")]
    Anyhow(anyhow::Error),
}

pub type ExpertCmdSender = mpsc::Sender<ExpertCmd>;
pub type ExpertCmdReceiver = mpsc::Receiver<ExpertCmd>;

pub enum ExpertCmd {
    ChainStorage(oneshot::Sender<Option<super::ChainStorageReadBox>>),
    EgressMessage,
}
