//! This module implements the various "hooks" that are called by the STF during execution.
//! These hooks can be used to add custom logic at various points in the slot lifecycle:
//! - Before and after each transaction is executed.
//! - At the beginning and end of each batch ("blob")
//! - At the beginning and end of each slot (DA layer block)
use sov_modules_api::hooks::{ApplyBatchHooks, FinalizeHook, SlotHooks, TxHooks};
use sov_modules_api::{
    BatchSequencerReceipt, BatchWithId, Spec, StateCheckpoint, StateReaderAndWriter, WorkingSet,
};
use sov_rollup_interface::da::DaSpec;
use sov_state::namespaces::Accessory;

use super::runtime::Runtime;

impl<S: Spec, Da: DaSpec> TxHooks for Runtime<S, Da> {
    type Spec = S;
    type TxState = WorkingSet<S>;
}

impl<S: Spec, Da: DaSpec> ApplyBatchHooks<Da> for Runtime<S, Da> {
    type Spec = S;
    type BatchResult = BatchSequencerReceipt<Da>;

    fn begin_batch_hook(
        &self,
        _batch: &BatchWithId,
        _sender: &Da::Address,
        _state_checkpoint: &mut StateCheckpoint<S>,
    ) -> anyhow::Result<()> {
        Ok(())
    }

    fn end_batch_hook(&self, _result: &Self::BatchResult, _state: &mut StateCheckpoint<S>) {}
}

impl<S: Spec, Da: DaSpec> SlotHooks for Runtime<S, Da> {
    type Spec = S;
    fn begin_slot_hook(
        &self,
        _pre_state_root: <Self::Spec as Spec>::VisibleHash,
        _versioned_state_checkpoint: &mut sov_modules_api::VersionedStateReadWriter<
            StateCheckpoint<Self::Spec>,
        >,
    ) {
    }

    fn end_slot_hook(&self, _state_checkpoint: &mut StateCheckpoint<S>) {}
}

impl<S: Spec, Da: DaSpec> FinalizeHook for Runtime<S, Da> {
    type Spec = S;

    fn finalize_hook(
        &self,
        _root_hash: S::VisibleHash,
        _accessory_working_set: &mut impl StateReaderAndWriter<Accessory>,
    ) {
    }
}
