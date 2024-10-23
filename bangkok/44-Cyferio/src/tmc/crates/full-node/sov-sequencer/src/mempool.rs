use std::cmp::Ordering;
use std::collections::{BTreeMap, HashMap};
use std::ops::Bound;
use std::sync::Arc;

use anyhow::Context;
use sov_modules_api::DaSpec;
use sov_rollup_interface::common::HexString;
use sov_rollup_interface::TxHash;
use tracing::debug;

use crate::db::{MempoolTx, SequencerDb};
use crate::tx_status::TxStatusNotifier;
use crate::TxStatus;

/// Transactions within the mempool are identified by a monotonically increasing
/// [UUIDv7](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_7_(timestamp_and_random)),
/// which is then converted to a [`u128`].
pub type TxIdWithinMempool = u128;

/// The mempool **MUST ALWAYS** persist changes before modifying the in-memory
/// state, otherwise a DB error would leave the two out of sync. (Unlike DB
/// operations which can fail, we know that in-memory mempool state changes are
/// infallible.)
#[derive(derivative::Derivative)]
#[derivative(Debug)]
pub struct FairMempool<Da: DaSpec> {
    max_txs_count: usize,
    #[derivative(Debug = "ignore")] // Way too noisy.
    notifier: TxStatusNotifier<Da>,
    sequencer_db: SequencerDb,
    // Transaction data
    // ----------------
    txs_ordered_by_most_fair_fit: BTreeMap<MempoolCursor, Arc<MempoolTx>>,
    txs_ordered_by_incremental_id: BTreeMap<TxIdWithinMempool, Arc<MempoolTx>>,
    txs_by_hash: HashMap<TxHash, Arc<MempoolTx>>,
}

impl<Da: DaSpec> FairMempool<Da> {
    pub fn new(
        sequencer_db: SequencerDb,
        notifier: TxStatusNotifier<Da>,
        max_txs_count: usize,
    ) -> anyhow::Result<Self> {
        if max_txs_count == 0 {
            return Err(anyhow::anyhow!(
                "Max mempool size must be greater than zero"
            ));
        }

        let mut mempool = Self {
            max_txs_count,
            notifier,
            sequencer_db,
            txs_ordered_by_incremental_id: BTreeMap::new(),
            txs_ordered_by_most_fair_fit: BTreeMap::new(),
            txs_by_hash: HashMap::new(),
        };

        let txs = mempool.sequencer_db.read_all()?;
        for (_, tx) in txs.into_iter() {
            mempool
                .add(Arc::new(tx))
                .context("Error while restoring mempool from DB")?;
        }

        Ok(mempool)
    }

    pub fn len(&self) -> usize {
        self.txs_by_hash.len()
    }

    pub fn contains(&self, hash: &TxHash) -> bool {
        self.txs_by_hash.contains_key(hash)
    }

    /// Fetches the next transaction to include in the batch, if a suitable one
    /// exists.
    pub fn next(&self, cursor: &mut MempoolCursor) -> Option<Arc<MempoolTx>> {
        let mut iter = self
            .txs_ordered_by_most_fair_fit
            // The lower bound is always ignored, so we don't fetch the last
            // transaction again but we go to the next one.
            .range((Bound::Excluded(*cursor), Bound::Unbounded));
        let (next_cursor, tx) = iter.next()?;

        // Important: we update the cursor so the caller can make another call
        // and get the next transaction.
        *cursor = *next_cursor;

        Some(tx.clone())
    }

    fn remove_tx_from_memory(&mut self, hash: &TxHash) {
        const ERR: &str = "Removing tx from mempool but it is not in the mempool; this is a bug, please report it";

        let tx = self.txs_by_hash.remove(hash).expect(ERR);
        let cursor = MempoolCursor {
            tx_size_in_bytes: tx.tx_bytes.len(),
            incremental_id: tx.incremental_id,
        };

        self.txs_ordered_by_incremental_id
            .remove(&tx.incremental_id)
            .expect(ERR);
        self.txs_ordered_by_most_fair_fit
            .remove(&cursor)
            .expect(ERR);
    }

    fn make_space_for_tx(&mut self) -> anyhow::Result<()> {
        while self.len() >= self.max_txs_count {
            let tx_hash = self
                // We always evict the oldest transaction first.
                .txs_ordered_by_incremental_id
                .first_key_value()
                .expect("Mempool is empty but it doesn't have size zero; this is a bug, please report it")
                .1
                .hash;

            debug!(
                mempool_max_txs_count = self.max_txs_count,
                mempool_current_txs_count = self.len(),
                tx_hash = %HexString::new(tx_hash),
                "Evicting transaction from the mempool to make space for a new one"
            );

            // We always persist changes to the DB first.
            self.sequencer_db.remove(&[tx_hash])?;
            self.remove_tx_from_memory(&tx_hash);

            // Notify listeners about the eviction.
            self.notifier.notify(
                tx_hash,
                TxStatus::Dropped {
                    reason: "Mempool is full".to_string(),
                },
            );
        }

        Ok(())
    }

    pub fn remove_atomically(&mut self, hashes: &[TxHash]) -> anyhow::Result<()> {
        // We always persist changes to the DB first.
        self.sequencer_db.remove(hashes)?;
        for hash in hashes {
            self.remove_tx_from_memory(hash);
        }

        Ok(())
    }

    pub fn add_new_tx(&mut self, hash: TxHash, raw: Vec<u8>) -> anyhow::Result<Arc<MempoolTx>> {
        if let Some(tx) = self.txs_by_hash.get(&hash) {
            // We already have this transaction in the mempool; simply return a
            // reference to it (don't re-add it!).
            return Ok(tx.clone());
        }

        let tx = Arc::new(MempoolTx::new(hash, raw));
        self.add(tx.clone())?;

        Ok(tx)
    }

    pub fn add(&mut self, tx: Arc<MempoolTx>) -> anyhow::Result<()> {
        // If this fails, we're potentially left with a SequencerDb with more
        // transactions that it should have. Not a problem because eviction is
        // on a best-effort basis, but good to keep it in mind.
        self.make_space_for_tx()?;

        // We always persist changes to the DB first.
        self.sequencer_db.insert(&tx)?;

        let cursor = MempoolCursor {
            tx_size_in_bytes: tx.tx_bytes.len(),
            incremental_id: tx.incremental_id,
        };

        self.txs_ordered_by_incremental_id
            .insert(tx.incremental_id, tx.clone());
        self.txs_ordered_by_most_fair_fit.insert(cursor, tx.clone());
        self.txs_by_hash.insert(tx.hash, tx.clone());

        Ok(())
    }
}

/// An opaque cursor for [`FairMempool`] iteration.
#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash)]
#[cfg_attr(test, derive(proptest_derive::Arbitrary))]
pub struct MempoolCursor {
    tx_size_in_bytes: usize,
    incremental_id: TxIdWithinMempool,
}

impl MempoolCursor {
    pub fn new(tx_size_in_bytes: usize) -> Self {
        Self {
            tx_size_in_bytes,
            incremental_id: 0,
        }
    }
}

impl PartialOrd for MempoolCursor {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for MempoolCursor {
    fn cmp(&self, other: &Self) -> Ordering {
        // Transactions in the mempool are ordered:
        // 1. from largest to smallest, and
        // 2. by least recent to most recent after that.
        let size_ordering = self.tx_size_in_bytes.cmp(&other.tx_size_in_bytes).reverse();
        let temporal_ordering = self.incremental_id.cmp(&other.incremental_id);

        size_ordering.then(temporal_ordering)
    }
}

#[cfg(test)]
mod tests {
    use proptest::proptest;

    use super::*;

    proptest! {
        #[test]
        fn mempool_cursor_ordering_is_correct(mc1: MempoolCursor, mc2: MempoolCursor, mc3: MempoolCursor) {
            reltester::ord(&mc1, &mc2, &mc3).unwrap();
        }
    }
}
