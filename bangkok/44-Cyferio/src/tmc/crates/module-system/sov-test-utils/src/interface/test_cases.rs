use sov_mock_da::MockDaSpec;
use sov_modules_api::capabilities::FatalError;
use sov_modules_api::{DaSpec, Module, ModuleError, Spec, StateCheckpoint, TxEffect};
use sov_modules_stf_blueprint::{Runtime, SkippedReason, TxReceiptContents};

use super::messages::TransactionType;
use super::{BatchExpectedReceipt, BatchSequencerOutcome};
use crate::runtime::wrapper::EndSlotClosure;
use crate::runtime::{MockBlobData, WorkingSetClosure};

/// Defines a test case at the slot level. This can be used to describe a rollup's test. It contains a list of [`BatchTestCase`]s and a post slot hook closure to
/// be run after the slot has been executed.
///
/// ## Note
/// This struct implements [`From<Vec<TxTestCase<RT, M, S>>>`] to create a [`SlotTestCase`] from a list of [`TxTestCase`]s.
/// This is useful when you want to create a [`SlotTestCase`] with a single batch filled with transactions and without a post slot hook closure.
pub struct SlotTestCase<RT: Runtime<S, MockDaSpec>, M: Module, S: Spec> {
    /// The list of [`BatchTestCase`]s to be executed in the slot.
    pub(crate) batch_test_cases: Vec<BatchTestCase<RT, M, S>>,
    /// The end slot hook closure to be executed after the slot has been executed.
    pub(crate) end_slot_hook: EndSlotClosure<StateCheckpoint<S>>,
}

impl<RT: Runtime<S, MockDaSpec>, M: Module, S: Spec> SlotTestCase<RT, M, S> {
    /// Creates an empty [`SlotTestCase`].
    pub fn empty() -> Self {
        Self {
            batch_test_cases: vec![],
            end_slot_hook: Box::new(|_| {}),
        }
    }

    /// Creates a vector of [`SlotTestCase`]s with empty slots.
    pub fn empty_slots(num_slots: usize) -> Vec<Self> {
        (0..num_slots).map(|_| Self::empty()).collect()
    }

    /// Creates a [`SlotTestCase`] from a list of [`TxTestCase`]s for a batch having the outcome [`BatchSequencerOutcome::Rewarded`].
    /// This doesn't set any end_slot-slot hook. To set a end_slot-slot hook, use [`SlotTestCase::with_end_slot_hook`].
    pub fn from_rewarded_batch(tx_test_cases: Vec<TxTestCase<RT, M, S>>) -> Self {
        Self::from_batch_with_outcome(tx_test_cases, BatchSequencerOutcome::Rewarded)
    }

    /// Creates a [`SlotTestCase`] from a list of [`TxTestCase`]s for a batch having the outcome [`BatchSequencerOutcome::Slashed`].
    /// This doesn't set any end_slot-slot hook. To set a end_slot-slot hook, use [`SlotTestCase::with_end_slot_hook`].
    pub fn from_slashed_batch(
        tx_test_cases: Vec<TxTestCase<RT, M, S>>,
        reason: FatalError,
    ) -> Self {
        Self::from_batch_with_outcome(tx_test_cases, BatchSequencerOutcome::Slashed(reason))
    }

    /// Creates a [`SlotTestCase`] from a list of [`TxTestCase`]s for a batch having the outcome [`BatchSequencerOutcome::Ignored`].
    /// This doesn't set any end_slot-slot hook. To set a end_slot-slot hook, use [`SlotTestCase::with_end_slot_hook`].
    pub fn from_ignored_batch(tx_test_cases: Vec<TxTestCase<RT, M, S>>, reason: String) -> Self {
        Self::from_batch_with_outcome(tx_test_cases, BatchSequencerOutcome::Ignored(reason))
    }

    /// Creates a [`SlotTestCase`] from a list of [`TxTestCase`]s for a batch having the outcome [`BatchSequencerOutcome::NotRewardable`].
    /// This doesn't set any end_slot-slot hook. To set a end_slot-slot hook, use [`SlotTestCase::with_end_slot_hook`].
    pub fn from_not_rewardable_batch(tx_test_cases: Vec<TxTestCase<RT, M, S>>) -> Self {
        Self::from_batch_with_outcome(tx_test_cases, BatchSequencerOutcome::NotRewardable)
    }

    /// Creates a [`SlotTestCase`] from a list of [`TxTestCase`]s for a batch having the outcome [`BatchSequencerOutcome::Dropped`].
    /// This doesn't set any end_slot-slot hook. To set a end_slot-slot hook, use [`SlotTestCase::with_end_slot_hook`].
    /// All the transactions in the batch will be dropped so their outcome should all be [`TxTestCase::Dropped`].
    pub fn from_dropped_batch(tx_test_cases: Vec<TxTestCase<RT, M, S>>) -> Self {
        assert!(tx_test_cases
            .iter()
            .all(|tx_test_case| matches!(tx_test_case, TxTestCase::Dropped(_))), "Test format error: if the batch is dropped, all transactions in the batch must have the dropped outcome as well");

        Self::from_batch_with_outcome(tx_test_cases, BatchSequencerOutcome::Dropped)
    }

    /// Creates a [`SlotTestCase`] from a list of [`TxTestCase`]s for a batch having the outcome `batch_outcome`.
    ///
    /// ## Usage notes
    /// This doesn't set any end_slot-slot hook. To set a end_slot-slot hook, use [`SlotTestCase::with_end_slot_hook`].
    /// This also uses a default sequencer. To set a non-default sequencer, use [`SlotTestCase::with_sequencer`].
    pub fn from_batch_with_outcome(
        tx_test_cases: Vec<TxTestCase<RT, M, S>>,
        batch_outcome: BatchSequencerOutcome,
    ) -> Self {
        Self {
            batch_test_cases: vec![BatchTestCase {
                tx_test_cases,
                outcome: batch_outcome,
                sequencer: None,
            }],
            end_slot_hook: Box::new(|_| {}),
        }
    }

    /// Specifies, in-place, a non default sequencer for each batch in the slot.
    pub fn with_sequencer(mut self, sequencer: <MockDaSpec as DaSpec>::Address) -> Self {
        self.batch_test_cases = self
            .batch_test_cases
            .into_iter()
            .map(|batch| batch.with_sequencer(sequencer))
            .collect();
        self
    }

    /// Converts a list of [`BatchTestCase`] into a [`SlotTestCase`] without any end_slot-hook.
    /// This doesn't set any end_slot-slot hook. To set a end_slot-slot hook, use [`SlotTestCase::with_end_slot_hook`].
    pub fn from_batches(batches: Vec<BatchTestCase<RT, M, S>>) -> Self {
        SlotTestCase {
            batch_test_cases: batches,
            end_slot_hook: Box::new(|_| {}),
        }
    }

    /// Adds a end_slot hook to the [`SlotTestCase`].
    pub fn with_end_slot_hook(self, end_slot_hook: EndSlotClosure<StateCheckpoint<S>>) -> Self {
        SlotTestCase {
            batch_test_cases: self.batch_test_cases,
            end_slot_hook,
        }
    }
}

/// Defines a test case at the batch level. This can be used to describe a rollup's test. It contains a list of [`TxTestCase`]s.
pub struct BatchTestCase<RT: Runtime<S, MockDaSpec>, M: Module, S: Spec> {
    pub(crate) tx_test_cases: Vec<TxTestCase<RT, M, S>>,
    pub(crate) outcome: BatchSequencerOutcome,
    pub(crate) sequencer: Option<<MockDaSpec as DaSpec>::Address>,
}

impl<RT: Runtime<S, MockDaSpec>, M: Module, S: Spec> BatchTestCase<RT, M, S> {
    /// Creates a new rewarded [`BatchTestCase`].
    pub fn rewarded(tx_test_cases: Vec<TxTestCase<RT, M, S>>) -> Self {
        Self::with_outcome(tx_test_cases, BatchSequencerOutcome::Rewarded)
    }

    /// Creates a new slashed [`BatchTestCase`].
    pub fn slashed(tx_test_cases: Vec<TxTestCase<RT, M, S>>, reason: FatalError) -> Self {
        Self::with_outcome(tx_test_cases, BatchSequencerOutcome::Slashed(reason))
    }

    /// Creates a new ignored [`BatchTestCase`].
    pub fn ignored(tx_test_cases: Vec<TxTestCase<RT, M, S>>, ignored_reason: String) -> Self {
        Self::with_outcome(
            tx_test_cases,
            BatchSequencerOutcome::Ignored(ignored_reason),
        )
    }

    /// Creates a new not rewardable [`BatchTestCase`].
    pub fn not_rewardable(tx_test_cases: Vec<TxTestCase<RT, M, S>>) -> Self {
        Self::with_outcome(tx_test_cases, BatchSequencerOutcome::NotRewardable)
    }

    /// Creates a new [`BatchTestCase`] with a custom outcome.
    /// The sequencer is set to the default sequencer, to specify a different sequencer use [`BatchTestCase::with_sequencer`].
    pub fn with_outcome(
        tx_test_cases: Vec<TxTestCase<RT, M, S>>,
        outcome: BatchSequencerOutcome,
    ) -> Self {
        Self {
            tx_test_cases,
            outcome,
            sequencer: None,
        }
    }

    /// Specifies, in-place, a non default sequencer for the batch.
    pub fn with_sequencer(mut self, sequencer: <MockDaSpec as DaSpec>::Address) -> Self {
        self.sequencer = Some(sequencer);
        self
    }

    /// Splits a [`BatchTestCase`] into a list of [`TransactionType`], closures to be executed in the post_dispatch_hook, and an expected [`BatchExpectedReceipt`].
    pub(crate) fn split(
        self,
    ) -> (
        MockBlobData<M, S>,
        Vec<WorkingSetClosure<RT>>,
        Option<BatchExpectedReceipt>,
    ) {
        let (messages_and_post_dispatch_closures, maybe_expected_tx_receipts): (Vec<_>, Vec<_>) =
            self.tx_test_cases
                .into_iter()
                .map(|tx_test_case| match tx_test_case {
                    TxTestCase::Applied {
                        message,
                        post_dispatch_hook,
                    } => (
                        (message, Some(post_dispatch_hook)),
                        Some(TxEffect::Successful(())),
                    ),
                    TxTestCase::Reverted { message, reason } => {
                        ((message, None), Some(TxEffect::Reverted(reason)))
                    }
                    TxTestCase::Skipped {
                        message,
                        skipped_reason,
                    } => ((message, None), Some(TxEffect::Skipped(skipped_reason))),
                    TxTestCase::Dropped(message) => ((message, None), None),
                })
                .unzip();

        let batch_receipt = if BatchSequencerOutcome::Dropped == self.outcome {
            None
        } else {
            Some(BatchExpectedReceipt {
                tx_receipts: maybe_expected_tx_receipts.into_iter().flatten().collect(),
                batch_outcome: self.outcome,
            })
        };

        let (messages, post_dispatch_closures): (Vec<_>, Vec<_>) =
            messages_and_post_dispatch_closures.into_iter().unzip();

        (
            MockBlobData {
                messages,
                sequencer: self.sequencer,
            },
            post_dispatch_closures.into_iter().flatten().collect(),
            batch_receipt,
        )
    }
}

/// Defines a test case at the transaction level.
pub enum TxTestCase<RT: Runtime<S, MockDaSpec>, M: Module, S: Spec> {
    /// The transaction should be applied successfully and the `post_dispatch_hook` should be executed.
    Applied {
        /// The message to be sent to the runtime.
        message: TransactionType<M, S>,
        /// A post_dispatch_hook closure to be executed if the transaction is applied successfully.
        post_dispatch_hook: WorkingSetClosure<RT>,
    },
    /// The transaction should be reverted.
    Reverted {
        /// The message to be sent to the runtime.
        message: TransactionType<M, S>,
        /// The reason why the transaction should be reverted.
        reason: ModuleError,
    },
    /// The transaction should be skipped. Ie, the transaction's ID has been computed and a receipt was emitted but
    /// the transaction was never executed.
    Skipped {
        /// The message to be sent to the runtime.
        message: TransactionType<M, S>,
        /// The reason why the transaction should be skipped.
        skipped_reason: SkippedReason,
    },
    /// The transaction should be dropped from the batch. Ie, the transaction should not generate a receipt.
    Dropped(TransactionType<M, S>),
}

impl<RT: Runtime<S, MockDaSpec>, M: Module, S: Spec> TxTestCase<RT, M, S> {
    /// Creates a new [`TxTestCase::Applied`]. This set the `post_dispatch_hook` to a no-op closure. To specify a post_dispatch_hook, use [`TxTestCase::applied_with_hook`].
    pub fn applied(message: TransactionType<M, S>) -> Self {
        Self::Applied {
            message,
            post_dispatch_hook: Box::new(|_| {}),
        }
    }

    /// Creates a new [`TxTestCase::Applied`] with a post_dispatch_hook.
    pub fn applied_with_hook(
        message: TransactionType<M, S>,
        post_dispatch_hook: WorkingSetClosure<RT>,
    ) -> Self {
        Self::Applied {
            message,
            post_dispatch_hook,
        }
    }

    /// Creates a new [`TxTestCase::Reverted`].
    /// Since the transaction is supposed to revert, there is no need to provide a post_dispatch_hook.
    pub fn reverted(message: TransactionType<M, S>, reason: ModuleError) -> Self {
        Self::Reverted { message, reason }
    }

    /// Creates a new [`TxTestCase::Skipped`] which is skipped.
    pub fn skipped(message: TransactionType<M, S>, skipped_reason: SkippedReason) -> Self {
        Self::Skipped {
            message,
            skipped_reason,
        }
    }

    /// Creates a new [`TxTestCase`] which is dropped.
    pub fn dropped(message: TransactionType<M, S>) -> Self {
        Self::Dropped(message)
    }

    /// Creates a new [`TxTestCase`] from an expected outcome. Doesn't include a post_dispatch_hook in the successful case.
    /// If the effect is [`None`], the transaction is dropped.
    pub fn from_expected_outcome(
        message: TransactionType<M, S>,
        effect: Option<TxEffect<TxReceiptContents>>,
    ) -> Self {
        match effect {
            Some(TxEffect::Successful(_)) => Self::Applied {
                message,
                post_dispatch_hook: Box::new(|_| {}),
            },
            Some(TxEffect::Reverted(reason)) => Self::Reverted { message, reason },
            Some(TxEffect::Skipped(skipped_reason)) => Self::Skipped {
                message,
                skipped_reason,
            },
            None => Self::Dropped(message),
        }
    }
}
