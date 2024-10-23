//! Provides traits which are useful for wrapping a (possibly incomplete) runtime implementation to create a test runtime
//! with configurable hooks.

use sov_bank::{Bank, Payable};
use sov_modules_api::hooks::TxHooks;
use sov_modules_api::transaction::AuthenticatedTransactionData;
use sov_modules_api::{
    BatchSequencerReceipt, BatchWithId, Context, DaSpec, DispatchCall, Genesis,
    RuntimeEventProcessor, Spec, StateCheckpoint, WorkingSet,
};
use sov_sequencer_registry::SequencerRegistry;

use super::wrapper::EndSlotClosure;
use super::WorkingSetClosure;

/// A struct which contains at least the bank and sequencer registry modules.
pub trait MinimalRuntime<S: Spec, Da: DaSpec>: Default {
    /// Returns a reference to the sequencer registry module.
    fn sequencer_registry(&self) -> &SequencerRegistry<S, Da>;
    /// Returns a reference to the bank module.
    fn bank(&self) -> &Bank<S>;
    /// Returns a reference to the recipient of the base fees.
    /// This is typically either `AttesterIncentives` optimistic or `ProverIncentives` for provable mode respectively.
    fn base_fee_recipient(&self) -> impl Payable<S>;
}

/// A trait which allows access to the contents of the genesis configuration
/// for a [`MinimalRuntime`] which implements [`Genesis`].
pub trait MinimalGenesis<S: Spec>: Genesis<Spec = S> {
    /// The DA layer spec.
    type Da: DaSpec;
    /// Returns a reference to the sequencer registry config.
    fn sequencer_registry_config(
        config: &Self::Config,
    ) -> &<SequencerRegistry<S, Self::Da> as Genesis>::Config;
    /// Returns a reference to the bank config.
    fn bank_config(config: &Self::Config) -> &<Bank<S> as Genesis>::Config;
}

/// A marker trait which bundles a [`MinimalRuntime`] with additional traits that we require
/// before wrapping a runtime into one that can run hooks.
pub trait StandardRuntime<S: Spec, Da: DaSpec>:
    Clone
    + MinimalRuntime<S, Da>
    + DispatchCall<Spec = S>
    + Genesis<Spec = S>
    + RuntimeEventProcessor
    + MinimalGenesis<S>
    + TxHooks<Spec = S, TxState = WorkingSet<S>>
{
}

impl<S: Spec, Da: DaSpec, T> StandardRuntime<S, Da> for T where
    T: Clone
        + MinimalRuntime<S, Da>
        + DispatchCall<Spec = S>
        + Genesis<Spec = S>
        + RuntimeEventProcessor
        + MinimalGenesis<S>
        + TxHooks<Spec = S, TxState = WorkingSet<S>>
{
}

/// The PostTxHookRegistry trait allows a `Runtime` to inject closures into its post transaction hook.
///
/// Implementers must also implement [`TestRuntimeHookOverrides`] to invoke the closures in their post tx hook.
pub trait PostTxHookRegistry<S: Spec, Da: DaSpec>: TestRuntimeHookOverrides<S, Da> {
    /// Adds a list of closures to be executed in the `post_dispatch_tx_hook` to the runtime.
    fn add_post_dispatch_tx_hook_actions(&self, closures: Vec<WorkingSetClosure<Self>>);
    /// Retrieves the next closure to be executed in the `post_dispatch_tx_hook` from the runtime.
    fn try_pop_next_tx_action(&self) -> Option<Option<WorkingSetClosure<Self>>>;
}

/// The PostTxHookRegistry trait allows a `Runtime` to inject closures into its post transaction hook.
///
/// Implementers must also implement [`TestRuntimeHookOverrides`] to invoke the closures in their post tx hook.
pub trait EndSlotHookRegistry<S: Spec, Da: DaSpec>: TestRuntimeHookOverrides<S, Da> {
    /// Adds a list of closures to be executed in the `end_slot_hook` to the runtime.
    fn override_end_slot_hook_actions(&self, closures: EndSlotClosure<StateCheckpoint<S>>);
    /// For backward compatibility, we allow tests not to configure end slot hooks at all.
    /// In this case, the outer option will be None and the hook will have no effect.
    /// if the outer Option is some, then the runtime will expect exactly one inner Option per call.
    fn take_next_slot_action(&self) -> Option<EndSlotClosure<StateCheckpoint<S>>>;
}

/// Allows the implementer to override the hooks in a wrapped runtime.
pub trait TestRuntimeHookOverrides<S: Spec, Da: DaSpec>:
    TxHooks<Spec = S> + MinimalRuntime<S, Da>
{
    /// The contents of this method are used to override the `pre_dispatch_tx_hook` of the runtime.
    fn pre_dispatch_tx_hook_override(
        &self,
        _tx: &AuthenticatedTransactionData<S>,
        _state: &mut <Self as TxHooks>::TxState,
    ) -> anyhow::Result<()> {
        Ok(())
    }
    /// The contents of this method are used to override the `post_dispatch_tx_hook` of the runtime.
    fn post_dispatch_tx_hook_override(
        &self,
        _tx: &AuthenticatedTransactionData<S>,
        _ctx: &Context<S>,
        _state: &mut <Self as TxHooks>::TxState,
    ) -> anyhow::Result<()> {
        Ok(())
    }
    /// The contents of this method are used to override the `begin_batch_hook` of the runtime.
    fn begin_batch_hook_override(
        &self,
        _batch: &BatchWithId,
        _sender: &Da::Address,
        _state_checkpoint: &mut StateCheckpoint<S>,
    ) -> anyhow::Result<()> {
        Ok(())
    }
    /// The contents of this method are used to override the `end_batch_hook` of the runtime.
    fn end_batch_hook_override(
        &self,
        _result: &BatchSequencerReceipt<Da>,
        _state_checkpoint: &mut StateCheckpoint<S>,
    ) {
    }
    /// The contents of this method are used to override the `begin_slot_hook` of the runtime.
    fn begin_slot_hook_override(
        &self,
        _pre_state_root: S::VisibleHash,
        _state: &mut sov_modules_api::VersionedStateReadWriter<StateCheckpoint<S>>,
    ) {
    }
    /// The contents of this method are used to override the `end_slot_hook` of the runtime.
    fn end_slot_hook_override(&self, _state: &mut StateCheckpoint<S>) {}
    /// The contents of this method are used to override the `finalize_hook` of the runtime.
    fn finalize_hook_override(
        &self,
        _root_hash: S::VisibleHash,
        _state: &mut impl sov_modules_api::prelude::StateReaderAndWriter<
            sov_state::namespaces::Accessory,
        >,
    ) {
    }
}
