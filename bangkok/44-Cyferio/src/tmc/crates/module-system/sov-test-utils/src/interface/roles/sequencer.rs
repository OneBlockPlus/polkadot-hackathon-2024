use sov_mock_da::MockDaSpec;
use sov_modules_api::{DaSpec, Spec};

use super::{AsUser, TestUser};

/// A representation of a sequencer at genesis.
#[derive(Debug, Clone)]
pub struct TestSequencer<S: Spec, Da: DaSpec> {
    /// The common user information.
    pub user_info: TestUser<S>,
    /// The DA address of the sequencer.
    pub da_address: Da::Address,
    /// The amount of tokens to bond at genesis. These tokens will be minted by the bank.
    pub bond: u64,
}

impl<S: Spec, Da: DaSpec> AsUser<S> for TestSequencer<S, Da> {
    fn as_user(&self) -> &TestUser<S> {
        &self.user_info
    }

    fn as_user_mut(&mut self) -> &mut super::TestUser<S> {
        &mut self.user_info
    }
}

/// The configuration necessary to generate a [`TestSequencer`].
pub struct TestSequencerConfig<Da: DaSpec> {
    /// The additional balance of the sequencer on his bank account.
    pub additional_balance: u64,
    /// The amount of tokens bonded by the sequencer.
    pub bond: u64,
    /// The DA address of the sequencer.
    pub da_address: Da::Address,
}

impl<S: Spec> TestSequencer<S, MockDaSpec> {
    /// Generates a new [`TestSequencer`] with the given configuration.
    pub fn generate(config: TestSequencerConfig<MockDaSpec>) -> Self {
        Self {
            user_info: TestUser::generate(config.additional_balance),
            da_address: config.da_address,
            bond: config.bond,
        }
    }
}
