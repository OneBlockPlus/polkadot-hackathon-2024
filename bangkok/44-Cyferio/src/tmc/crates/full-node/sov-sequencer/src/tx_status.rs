use std::collections::hash_map::Entry;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use mini_moka::sync::Cache as MokaCache;
use sov_modules_api::DaSpec;
use sov_rollup_interface::da::DaBlobHash;
use sov_rollup_interface::TxHash;
use tokio::sync::broadcast;
use tracing::{debug, error, trace};

/// A rollup transaction status.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase", tag = "status")]
pub enum TxStatus<BlobHash> {
    /// The sequencer has no knowledge of this transaction's status.
    Unknown,
    /// The sequencer dropped the transaction from the mempool and it has to be
    /// re-submitted, potentially after fixing some issue.
    ///
    /// Note that [`TxStatus::Submitted`] **MAY** or **MAY NOT** be produced
    /// before [`TxStatus::Dropped`], depending on whether or not the issue that
    /// caused the transaction to be dropped is detected or arised immediately.
    Dropped {
        /// A short, human-readable description of the reason why the sequencer
        /// dropped the transaction.
        reason: String,
    },
    /// The transaction was successfully submitted to a sequencer and it's
    /// sitting in the mempool waiting to be included in a batch.
    Submitted,
    /// The transaction was published to the DA as part of a batch, but it may
    /// not be finalized or processed by the rollup node yet.
    Published {
        #[allow(missing_docs)]
        da_transaction_id: BlobHash,
    },
    /// The transaction was published to the DA and the rollup node has
    /// processed it.
    Processed {
        #[allow(missing_docs)]
        da_transaction_id: BlobHash,
    },
}

impl<B> TxStatus<B> {
    /// After a terminal status is reached, the WebSocket connection will be
    /// closed becaus no more events will be sent.
    pub fn is_terminal(&self) -> bool {
        matches!(self, TxStatus::Processed { .. } | TxStatus::Dropped { .. })
    }
}

/// A [`broadcast::Sender`] should be removed from this map when all receivers
/// have been dropped.
type TxStatusSenders<Da> = HashMap<TxHash, broadcast::Sender<TxStatus<DaBlobHash<Da>>>>;

/// Manages subscriptions to sequencer events and dispatches new events to
/// subscribers.
///
/// Cheaply-cloneable.
#[derive(Debug, Clone)]
pub struct TxStatusNotifier<Da: DaSpec> {
    // `MokaCache` is cheaply-cloneable, no need to wrap it in `Arc`.
    cache: MokaCache<TxHash, TxStatus<DaBlobHash<Da>>>,
    senders: Arc<RwLock<TxStatusSenders<Da>>>,
}

impl<Da: DaSpec> Default for TxStatusNotifier<Da> {
    fn default() -> Self {
        Self {
            cache: MokaCache::new(Self::CACHE_CAPACITY),
            senders: Default::default(),
        }
    }
}

impl<Da: DaSpec> TxStatusNotifier<Da> {
    // The cache capacity is kind of arbitrary, as long as it's big enough to
    // fit a handful of typical batches worth of transactions it won't make much
    // of a difference.
    const CACHE_CAPACITY: u64 = 300;
    // This only needs to be big enough to store all possible notifications for a
    // transaction. If not, some clients may not receive all notifications.
    const CHANNEL_CAPACITY: usize = 10;

    const LOCK_ERR: &'static str =
        "Failed to acquire lock for tx status notifier; this is a bug, please report it";

    /// Returns the latest known status of the transaction associated with a [`TxHash`].
    pub fn get_cached(&self, tx_hash: &TxHash) -> Option<TxStatus<DaBlobHash<Da>>> {
        self.cache.get(tx_hash)
    }

    /// Notifies all subscribers about the new status of a transaction.
    pub fn notify(&self, tx_hash: TxHash, status: TxStatus<DaBlobHash<Da>>) {
        let mut senders = self.senders.write().expect(Self::LOCK_ERR);

        debug!(%tx_hash, ?status, senders_count = senders.len(), "Notifying subscribers about tx status update");

        // Updating the cache is done very intentionally *after* acquiring a
        // lock, otherwise race conditions may result in a stale cache entry
        // when two notifications are sent in quick succession.
        //
        // Without a lock, the following may happen:
        //
        //            (A)            |            (B)
        //      Enters function      |      Enters function
        // ------------------------- | ---------------------------
        //       Updates cache       |             .
        //             .             |       Updates cache
        //             .             |       Acquires lock
        //             .             |        Notification
        //             .             |       Releases lock
        //       Acquires lock       |             .
        //       Notification        |             .
        //       Releases lock       |             .
        //
        // Final result: last sent notification is (A), but the cache contains (B).
        //
        // Acquiring the lock before updating the cache also helps with sending
        // notifications as quickly as possible after the cache is updated.
        self.cache.insert(tx_hash, status.clone());

        match senders.entry(tx_hash) {
            Entry::Vacant { .. } => {
                trace!(%tx_hash, "No subscribers for tx status updates; ignoring notification");
            }
            Entry::Occupied(entry) => {
                if let Err(error) = entry.get().send(status) {
                    // Failing to send a notification is symptomatic of a bigger issue, but
                    // we don't want to e.g. fail the whole batch submission because of it.
                    error!(%error, "Failed to send tx status update over channel; this is a bug, please report it");
                    // We shouldn't try to send notifications for this tx again.
                    entry.remove();
                }
            }
        }
    }

    /// Subscribes to the status updates of a transaction.
    pub fn subscribe(
        &self,
        tx_hash: TxHash,
    ) -> (
        SubscriptionDropper<Da>,
        broadcast::Receiver<TxStatus<DaBlobHash<Da>>>,
    ) {
        let dropper = SubscriptionDropper {
            tx_hash,
            notifier: self.clone(),
        };

        let mut senders = self.senders.write().expect(Self::LOCK_ERR);

        let receiver = if let Some(sender) = senders.get(&tx_hash) {
            sender.subscribe()
        } else {
            trace!(%tx_hash, "Creating new Tokio channel for tx status updates");
            let (sender, receiver) = broadcast::channel(Self::CHANNEL_CAPACITY);
            senders.insert(tx_hash, sender);
            receiver
        };

        (dropper, receiver)
    }
}

/// Hold on to this as long as you consume the [`broadcast::Receiver`] returned by
/// [`TxStatusNotifier::subscribe`]. This will ensure proper cleanup and avoid
/// memory leaks.
///
/// Must be dropped *after* [`broadcast::Receiver`] has been dropped.
///
/// # Alternative approaches
///
/// A small, custom GC loop might be a more proper approach. Possibly TODO?
pub struct SubscriptionDropper<Da: DaSpec> {
    tx_hash: TxHash,
    notifier: TxStatusNotifier<Da>,
}

impl<Da: DaSpec> Drop for SubscriptionDropper<Da> {
    fn drop(&mut self) {
        let mut senders = self
            .notifier
            .senders
            .write()
            .expect(TxStatusNotifier::<Da>::LOCK_ERR);

        let entry = senders.entry(self.tx_hash);

        // No need to do anything if the entry is absent.
        if let Entry::Occupied(entry) = entry {
            // We only ever remove senders when they have no receivers.
            if entry.get().receiver_count() == 0 {
                entry.remove();
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use std::time::Duration;

    use sov_mock_da::{MockDaSpec, MockHash};

    use super::*;

    async fn wait() {
        tokio::time::sleep(Duration::from_millis(100)).await;
    }

    #[tokio::test]
    async fn get_cached() {
        let notifier = TxStatusNotifier::<MockDaSpec>::default();

        // After sending two notifications for two different txs...
        notifier.notify(TxHash::new([1; 32]), TxStatus::Submitted);
        notifier.notify(
            TxHash::new([2; 32]),
            TxStatus::Published {
                da_transaction_id: MockHash([100; 32]),
            },
        );

        wait().await;

        // ...the cache will know the status of both txs (and, most
        // importantly, have the *correct* tx status!).
        assert_eq!(
            notifier.get_cached(&TxHash::new([1; 32])),
            Some(TxStatus::Submitted)
        );
        assert_eq!(
            notifier.get_cached(&TxHash::new([2; 32])),
            Some(TxStatus::Published {
                da_transaction_id: MockHash([100; 32])
            })
        );
    }

    #[tokio::test]
    async fn multiple_subscribers_to_same_tx_dont_leak_memory() {
        let notifier = TxStatusNotifier::<MockDaSpec>::default();

        {
            // Subscribing twice to the same tx will result in a single sender.
            let tx_hash = TxHash::new([1; 32]);
            let (dropper_1, recv_1) = notifier.subscribe(tx_hash);
            let (_dropper_2, _recv_2) = notifier.subscribe(tx_hash);

            // After subscribing, the notifier contains a single sender.
            assert_eq!(notifier.senders.read().unwrap().len(), 1);

            // After dropping only one of the subscriptions, the notifier still
            // contains a single sender.
            drop(recv_1);
            drop(dropper_1);
            assert_eq!(notifier.senders.read().unwrap().len(), 1);
        }

        wait().await;

        // Both subscriptions have been dropped, so the sender should be gone.
        assert_eq!(notifier.senders.read().unwrap().len(), 0);
    }

    #[tokio::test]
    async fn multiple_subscribers() {
        let notifier = TxStatusNotifier::<MockDaSpec>::default();

        {
            let (_dropper1a, mut sub1a) = notifier.subscribe(TxHash::new([1; 32]));
            let (_dropper1b, mut sub1b) = notifier.subscribe(TxHash::new([1; 32]));
            let (_dropper2, sub2) = notifier.subscribe(TxHash::new([2; 32]));

            assert_eq!(notifier.senders.read().unwrap().len(), 2);

            // No notifications yet.
            assert_eq!(sub1a.len(), 0);
            assert_eq!(sub1b.len(), 0);
            assert_eq!(sub2.len(), 0);

            notifier.notify(TxHash::new([1; 32]), TxStatus::Submitted);
            notifier.notify(
                TxHash::new([1; 32]),
                TxStatus::Published {
                    da_transaction_id: MockHash([101; 32]),
                },
            );
            wait().await;

            assert_eq!(sub1a.len(), 2);
            assert_eq!(sub1b.len(), 2);
            assert_eq!(sub2.len(), 0);

            sub1a.recv().await.unwrap();

            assert_eq!(sub1a.len(), 1);
            assert_eq!(sub1b.len(), 2);
            assert_eq!(sub2.len(), 0);

            sub1b.recv().await.unwrap();

            assert_eq!(sub1a.len(), 1);
            assert_eq!(sub1b.len(), 1);
            assert_eq!(sub2.len(), 0);

            assert_eq!(
                notifier.get_cached(&TxHash::new([1; 32])),
                Some(TxStatus::Published {
                    da_transaction_id: MockHash([101; 32])
                })
            );
            assert_eq!(notifier.get_cached(&TxHash::new([2; 32])), None);

            // Before cleanup, the senders should still be present.
            assert!(notifier.senders.read().unwrap().len() > 0);
        }

        wait().await;

        // After cleanup, all senders should be gone.
        assert_eq!(notifier.senders.read().unwrap().len(), 0);
    }
}
