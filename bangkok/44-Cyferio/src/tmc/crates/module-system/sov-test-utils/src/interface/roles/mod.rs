use sov_modules_api::{CryptoSpec, Module, PrivateKey, Spec};

mod attester_incentives;
mod prover;
mod sequencer;
pub use attester_incentives::*;
pub use prover::{TestProver, TestProverConfig};
pub use sequencer::{TestSequencer, TestSequencerConfig};

use super::TransactionType;
use crate::default_test_tx_details;

/// A representation of a simple user that is not staked at genesis.
#[derive(Debug, Clone)]
pub struct TestUser<S: Spec> {
    /// The private key of the user.
    pub private_key: <S::CryptoSpec as CryptoSpec>::PrivateKey,
    /// The bank balance of the user for the default gas token.
    pub available_balance: u64,
}

impl<S: Spec> TestUser<S> {
    /// Creates a new user with the given private key and balance.
    pub fn new(private_key: <S::CryptoSpec as CryptoSpec>::PrivateKey, balance: u64) -> Self {
        Self {
            private_key,
            available_balance: balance,
        }
    }

    /// Generates a new user with the given balance.
    pub fn generate(balance: u64) -> Self {
        Self {
            private_key: <<S as Spec>::CryptoSpec as CryptoSpec>::PrivateKey::generate(),
            available_balance: balance,
        }
    }

    /// Returns the address of the user.
    pub fn address(&self) -> <S as Spec>::Address {
        <S as Spec>::Address::from(&self.private_key.pub_key())
    }

    /// Returns the private key of the user.
    pub fn private_key(&self) -> &<S::CryptoSpec as CryptoSpec>::PrivateKey {
        &self.private_key
    }

    /// Returns the balance of the user.
    pub fn balance(&self) -> u64 {
        self.available_balance
    }
}

impl<S: Spec> AsUser<S> for TestUser<S> {
    fn as_user(&self) -> &TestUser<S> {
        self
    }

    fn as_user_mut(&mut self) -> &mut TestUser<S> {
        self
    }
}

/// A trait that can be used to convert a special into a [`TestUser`] struct.
pub trait AsUser<S: Spec> {
    /// Returns a reference to an underlying [`TestUser`].
    fn as_user(&self) -> &TestUser<S>;

    /// Returns a mutable reference to an underlying [`TestUser`].
    fn as_user_mut(&mut self) -> &mut TestUser<S>;

    /// Creates a plain message from the user.
    fn create_plain_message<M: Module<Spec = S>>(
        &self,
        message: M::CallMessage,
    ) -> TransactionType<M, S> {
        TransactionType::Plain {
            message,
            key: self.as_user().private_key().clone(),
            details: default_test_tx_details::<S>(),
        }
    }
}
