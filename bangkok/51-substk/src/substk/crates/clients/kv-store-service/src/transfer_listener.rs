use crate::{EventListener, TARGET};
use anyhow::bail;
use async_trait::async_trait;
pub use events::*;
use std::sync::Arc;
use subxt::{
    events::{Events, StaticEvent},
    utils::AccountId32,
    Config, OnlineClient,
};
use tokio::sync::{broadcast, broadcast::Receiver};

pub(crate) mod events {
    use super::*;
    use scale_decode::DecodeAsType;

    // TODO: refactor
    #[derive(DecodeAsType, Debug, Clone, Eq, PartialEq)]
    pub struct Transfer {
        pub from: AccountId32,
        pub to: AccountId32,
        pub amount: u128,
    }

    impl StaticEvent for Transfer {
        const PALLET: &'static str = "Balances";
        const EVENT: &'static str = "Transfer";
    }
}

pub struct TransferListener<T: Config> {
    client: Arc<OnlineClient<T>>,
    to_lists: Vec<AccountId32>,
    sender: broadcast::Sender<Vec<Transfer>>,
}

impl<T: Config> Clone for TransferListener<T> {
    fn clone(&self) -> Self {
        Self {
            client: self.client.clone(),
            to_lists: self.to_lists.clone(),
            sender: self.sender.clone(),
        }
    }
}

#[async_trait]
impl<T: Config> EventListener for TransferListener<T> {
    type Event = Vec<Transfer>;

    fn name() -> &'static str {
        "TransferListener"
    }

    fn subscribe(&self) -> Receiver<Self::Event> {
        self.sender.subscribe()
    }

    async fn listening(self) -> anyhow::Result<()> {
        // TODO: maybe use best
        let mut blocks = self.client.blocks().subscribe_finalized().await?;

        while let Some(block) = blocks.next().await {
            match block {
                Err(err) => {
                    log::error!(target: TARGET, "Error occurred when subscribe finalized blocks: {}", err);
                    bail!("Error occurred when subscribe finalized blocks: {}", err);
                }
                Ok(block) => match block.events().await {
                    Err(err) => {
                        bail!("Error occurred when subscribe finalized blocks: {}", err);
                    }
                    Ok(events) => {
                        log::info!("{:?}", block.header());
                        let transfers = Self::collect_transfer(&self.to_lists, &events);
                        let _ = self.sender.send(transfers);
                    }
                },
            }
        }

        Ok(())
    }
}

impl<T: Config> TransferListener<T> {
    pub fn from_client(client: OnlineClient<T>, to_lists: Vec<AccountId32>) -> Self {
        let (sender, _) = broadcast::channel(100_000);

        Self {
            client: Arc::new(client),
            to_lists,
            sender,
        }
    }

    pub async fn new(rpc_addr: &str, to_lists: Vec<AccountId32>) -> anyhow::Result<Self> {
        let client = OnlineClient::<T>::from_url(rpc_addr).await?;

        Ok(Self::from_client(client, to_lists))
    }

    fn collect_transfer(to_lists: &[AccountId32], events: &Events<T>) -> Vec<Transfer> {
        // TODO: maybe in dyn
        // for event in events.iter() {
        //     let event = event?;
        //
        //     let pallet = event.pallet_name();
        //     let variant = event.variant_name();
        //     let field_values = event.field_values()?;
        // }

        // log::info!(target: TARGET, "{:?}", events);
        let events = events.find::<Transfer>();

        events
            .flatten()
            .filter(|event| to_lists.contains(&event.to))
            .map(|event| {
                log::info!(target: TARGET, "Catch a transfer event related to kv service: {:?}", event);
                event
            })
            .collect::<Vec<_>>()
    }
}
