use sov_modules_api::capabilities::FatalError;
use sov_modules_api::TxEffect;
use sov_modules_stf_blueprint::TxReceiptContents;

/// Represents the different outcomes that can occur for a sequencer after batch processing.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub enum BatchSequencerOutcome {
    /// Sequencer receives reward amount in defined token and can withdraw its deposit. The amount is net of any penalties.
    Rewarded,
    /// Sequencer loses its deposit and receives no reward.
    Slashed(
        /// Reason why sequencer was slashed.
        FatalError,
    ),
    /// Batch was ignored, sequencer deposit left untouched.
    Ignored(
        /// Reason why the batch was ignored.
        String,
    ),
    /// The sequencer is not rewardable for the submitted batch.
    /// This occurs when an unregistered sequencer submits a batch directly to the DA.
    /// The batch might be applied but there is nobody to reward.
    NotRewardable,
    /// The batch was dropped and should not be included in the slot receipt. This can happen if the sequencer is not registered.
    Dropped,
}

impl PartialEq<sov_modules_api::BatchSequencerOutcome> for BatchSequencerOutcome {
    fn eq(&self, other: &sov_modules_api::BatchSequencerOutcome) -> bool {
        match (self, other) {
            (
                BatchSequencerOutcome::Rewarded,
                sov_modules_api::BatchSequencerOutcome::Rewarded(_),
            )
            | (
                BatchSequencerOutcome::NotRewardable,
                sov_modules_api::BatchSequencerOutcome::NotRewardable,
            ) => true,
            (
                BatchSequencerOutcome::Slashed(a),
                sov_modules_api::BatchSequencerOutcome::Slashed(b),
            ) => a == b,
            (
                BatchSequencerOutcome::Ignored(a),
                sov_modules_api::BatchSequencerOutcome::Ignored(b),
            ) => a == b,
            _ => false,
        }
    }
}

/// The expected outcome of a batch.
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct BatchExpectedReceipt {
    /// The list of [`TxEffect`] for each transaction executed in the batch
    pub(crate) tx_receipts: Vec<TxEffect<TxReceiptContents>>,
    /// The expected outcome of the batch
    pub(crate) batch_outcome: BatchSequencerOutcome,
}

/// Defines the expected receipts of a slot. This is simply a list of [`BatchExpectedReceipt`]s.
pub type SlotExpectedReceipt = Vec<BatchExpectedReceipt>;
