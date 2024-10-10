use super::{
    pal::Platform,
    system::WorkerIdentityKey,
    types::{ExpertCmd, ExpertCmdReceiver, ExpertCmdSender},
    PflixProperties, PflixSafeBox, ChainStorage,
};
use pfx_types::WorkerPublicKey;
use sp_core::Pair;
use std::{
    borrow::Borrow,
    sync::Arc,
};
use tokio::sync::oneshot;
use tonic::Status;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("{0}")]
    MpscSend(String),
    #[error("{0}")]
    OneshotRecv(String),    
}

impl From<Error> for Status {
    fn from(value: Error) -> Self {
        Status::internal(value.to_string())
    }
}

pub type ExpertCmdResult<T> = Result<T, Error>;

pub async fn run<P: Platform>(pflix: PflixSafeBox<P>, mut expert_cmd_rx: ExpertCmdReceiver) -> ExpertCmdResult<()> {
    loop {
        match expert_cmd_rx.recv().await {
            Some(cmd) => match cmd {
                ExpertCmd::ChainStorage(resp_sender) => {
                    let guard = pflix.lock(false, false).expect("pflix lock failed");
                    let chain_storage = guard.runtime_state.as_ref().map(|s| s.chain_storage());
                    let _ = resp_sender.send(chain_storage);
                },
                ExpertCmd::EgressMessage => {
                    //TODO: We not need this yet
                },
            },
            None => break,
        }
    }
    Ok(())
}

#[derive(Clone)]
pub struct PflixExpertStub {
    pflix_props: Arc<PflixProperties>,
    cmd_sender: ExpertCmdSender,
}

impl PflixExpertStub {
    pub fn new(pflix_props: PflixProperties, cmd_sender: ExpertCmdSender) -> Self {
        Self {
            pflix_props: Arc::new(pflix_props),
            cmd_sender,        
        }
    }

    pub fn identity_key(&self) -> &WorkerIdentityKey {
        &self.pflix_props.identity_key
    }

    pub fn identify_public_key(&self) -> WorkerPublicKey {
        self.pflix_props.identity_key.public()
    }

    pub fn pflix_props(&self) -> &PflixProperties {
        &self.pflix_props
    }

    pub async fn using_chain_storage<'a, F, R>(&self, call: F) -> ExpertCmdResult<R>
    where
        F: FnOnce(Option<&ChainStorage>) -> R,
    {
        let (tx, rx) = oneshot::channel();
        self.cmd_sender
            .send(ExpertCmd::ChainStorage(tx))
            .await
            .map_err(|e| Error::MpscSend(e.to_string()))?;
        let opt = rx.await.map_err(|e| Error::OneshotRecv(e.to_string()))?;
        Ok(match opt {
            Some(chain_storage) => {
                let chain_storage = chain_storage.read();
                call(Some(chain_storage.borrow()))
            },
            None => call(None),
        })
    }
}
