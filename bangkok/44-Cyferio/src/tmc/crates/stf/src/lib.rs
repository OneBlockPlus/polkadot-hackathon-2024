//! The rollup State Transition Function.

pub mod authentication;
#[cfg(feature = "native")]
pub mod genesis_config;
pub mod hooks;
pub mod runtime;

pub use runtime::*;
use sov_modules_stf_blueprint::StfBlueprint;
use sov_rollup_interface::da::DaVerifier;
use sov_stf_runner::verifier::StateTransitionVerifier;

pub extern crate sov_modules_api;

/// Alias for StateTransitionVerifier.
pub type StfVerifier<DA, ZkSpec, RT, K, InnerVm, OuterVm> = StateTransitionVerifier<
    StfBlueprint<ZkSpec, <DA as DaVerifier>::Spec, RT, K>,
    DA,
    InnerVm,
    OuterVm,
>;

pub use sov_mock_da::MockDaSpec;
