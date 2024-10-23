//! Project level utilities that are used for testing the different crates of Sovereign SDK.
//!
//! WARNING: This crate is **NOT** intended to be used in production code. This is a testing utility crate.

#![deny(missing_docs)]

use std::rc::Rc;

pub use api_client::ApiClient;
use serde::{Deserialize, Serialize};
use sov_bank::{Bank, BankConfig, GasTokenConfig, GAS_TOKEN_ID};
pub use sov_db::schema::SchemaBatch;
use sov_mock_da::verifier::MockDaSpec;
use sov_mock_da::{MockAddress, MockBlob};
pub use sov_mock_zkvm::MockZkVerifier;
use sov_modules_api::capabilities::Authenticator;
use sov_modules_api::macros::config_value;
use sov_modules_api::prelude::UnwrapInfallible;
use sov_modules_api::test_utils::generate_address;
use sov_modules_api::transaction::{PriorityFeeBips, Transaction, TxDetails, UnsignedTransaction};
pub use sov_modules_api::EncodeCall;
use sov_modules_api::{
    Batch, CryptoSpec, DaSpec, GasArray, GasUnit, Module, RawTx, Spec, StateCheckpoint,
};
use sov_modules_stf_blueprint::{BatchReceipt, StfBlueprint};
use sov_rollup_interface::stf::TxReceiptContents;

use crate::runtime::BasicKernel;

mod api_client;

/// Utilities for testing the authentication logic.
pub mod auth;

mod evm;

/// Utilities for generating test data.
pub mod generators;

/// Utilities for writing integration tests against ledger APIs (both Rust API and REST APIs).
#[cfg(feature = "stf-starter")]
pub mod ledger_db;

/// Utilities for logging tests.
pub mod logging;

/// Utilities for testing the runtime.
pub mod runtime;

/// Utilities for testing the sequencer.
pub mod sequencer;
/// Utilities for testing that require [`ProverStorage`].
pub mod storage;

/// Utilities that specify an interface for testing.
pub mod interface;

pub use evm::simple_smart_contract::SimpleStorageContract;
pub use interface::*;
use sov_modules_api::PrivateKey;
use sov_rollup_interface::execution_mode::{Native, Zk};
pub use sov_state::ProverStorage;

use crate::storage::new_finalized_storage;

/// The default test spec. Uses a [`MockZkVerifier`] for both inner and outer vm verification.
/// Uses [`sov_mock_zkvm::MockZkvmCryptoSpec`] for cryptographic primitives.
pub type TestSpec =
    sov_modules_api::default_spec::DefaultSpec<MockZkVerifier, MockZkVerifier, Native>;
/// The default test spec for ZK. Uses a [`MockZkVerifier`] for both inner and outer vm verification.
pub type ZkTestSpec =
    sov_modules_api::default_spec::DefaultSpec<MockZkVerifier, MockZkVerifier, Zk>;
/// The default address type. This is the [`sov_modules_api::RollupAddress`] type defined by the [`TestSpec`].
pub type TestAddress = <TestSpec as Spec>::Address;
/// The default test crypto spec type. This is the [`CryptoSpec`] type defined by the [`TestSpec`].
pub type TestCryptoSpec = <TestSpec as Spec>::CryptoSpec;
/// The default private key type. This is the [`sov_rollup_interface::crypto::PrivateKey`] type defined by the [`TestSpec`].
pub type TestPrivateKey = <TestCryptoSpec as CryptoSpec>::PrivateKey;
/// The default public key type. This is the [`sov_rollup_interface::crypto::PublicKey`] type defined by the [`TestCryptoSpec`].
pub type TestPublicKey = <TestCryptoSpec as CryptoSpec>::PublicKey;
/// The default signature type. This is the [`sov_rollup_interface::crypto::Signature`] type defined by the [`TestCryptoSpec`].
pub type TestSignature = <TestCryptoSpec as CryptoSpec>::Signature;
/// The default hasher type. This is the hasher type ([`sov_rollup_interface::digest::Digest`]) defined by the [`TestCryptoSpec`].
pub type TestHasher = <TestCryptoSpec as CryptoSpec>::Hasher;
/// The default storage spec type. Uses a [`TestHasher`] for hashing.
pub type TestStorageSpec = sov_state::DefaultStorageSpec<TestHasher>;
/// The default STF blueprint type. Uses [`MockDaSpec`] for DA and [`BasicKernel`] for kernel.
pub type TestStfBlueprint<RT, S> = StfBlueprint<S, MockDaSpec, RT, BasicKernel<S, MockDaSpec>>;
/// The default [`sov_db::storage_manager::NativeStorageManager`], that can be used with [`ProverStorage`] and [`TestStorageSpec`].
pub type TestStorageManager =
    sov_db::storage_manager::NativeStorageManager<MockDaSpec, ProverStorage<TestStorageSpec>>;
// --- Blessed test parameters ---

// Blessed gas parameters

/// The default max fee to set for a transaction. This should be enough to be able to execute most standard transactions for the test rollup.
pub const TEST_DEFAULT_MAX_FEE: u64 = 100_000_000;
/// The default gas limit to set for a transaction. This is an optional parameter.
/// This value should be high enough to be able to execute most standard transactions for the test rollup.
pub const TEST_DEFAULT_GAS_LIMIT: [u64; 2] = [1_000_000, 1_000_000];
/// The default amount of tokens that should be staked by a user (prover, sequencer, etc.). This value is roughly equal to the
/// max fee for a transaction because sequencers need to pre-emptively pay for all transactions' pre-execution checks using their stake.
pub const TEST_DEFAULT_USER_STAKE: u64 = 100_000_000;
/// The default amount of tokens that should be in the user's bank account. This amount should always be higher than [`TEST_DEFAULT_MAX_FEE`] and
/// [`TEST_DEFAULT_USER_STAKE`]. This value is set so that the user can send a dozen transactions without having to refill its bank account.
pub const TEST_DEFAULT_USER_BALANCE: u64 = 1_000_000_000;
/// The default max priority fee to set for a transaction. We are setting this value to zero to avoid having to do
/// priority fee accounting in the tests. If a test needs to test sequencer rewards, it should set the transaction priority fee
/// to a non-zero value.
pub const TEST_DEFAULT_MAX_PRIORITY_FEE: PriorityFeeBips = PriorityFeeBips::from_percentage(0);

// --- End Blessed gas parameters (used for testing) ---

// Blessed rollup constants
// Constants used in the genesis configuration of the test runtime

// --- Attester incentives constants ---
/// The default max attested height at the genesis of the rollup. This is the height that contains the highest attestation
/// for the rollup. This value is set to zero in tests because the rollup always starts at zeroth height.
pub const TEST_MAX_ATTESTED_HEIGHT: u64 = 0;
/// The default finalized height of the light client. This value should always be below the [`TEST_MAX_ATTESTED_HEIGHT`].
/// This value is set to zero in tests because the rollup always starts at zeroth height. This value should be manually
/// updated for now because light clients are not yet implemented.
pub const TEST_LIGHT_CLIENT_FINALIZED_HEIGHT: u64 = 0;
/// The default rollup finality period. Used by the [`sov_attester_incentives::AttesterIncentives`] module to determine the
/// range of heights that are eligible for attestations.
pub const TEST_ROLLUP_FINALITY_PERIOD: u64 = 5;
/// The default name to use for the gas token.
pub const TEST_GAS_TOKEN_NAME: &str = "TestGasToken";

/// Generates a default [`TxDetails`] for testing.
pub(crate) fn default_test_tx_details<S: Spec>() -> TxDetails<S> {
    TxDetails {
        max_priority_fee_bips: TEST_DEFAULT_MAX_PRIORITY_FEE,
        max_fee: TEST_DEFAULT_MAX_FEE,
        gas_limit: None,
        chain_id: config_value!("CHAIN_ID"),
    }
}

/// An implementation of [`TxReceiptContents`] for testing. TestTxReceiptContents uses
/// a `u32` as the receipt contents.
#[derive(Debug, PartialEq, Eq, Clone, Serialize, Deserialize)]
pub struct TestTxReceiptContents;

impl TxReceiptContents for TestTxReceiptContents {
    type Skipped = u32;
    type Reverted = u32;
    type Successful = u32;
}

/// Test helper: Generates an empty transaction with the given gas parameters.
///
/// ## Deprecated
/// This function is deprecated and will be removed in the future to use the testing framework. Please refrain from using it in new tests.
pub fn generate_empty_tx_deprecated(
    max_priority_fee_bips: PriorityFeeBips,
    max_fee: u64,
    gas_limit: Option<GasUnit<2>>,
) -> Transaction<TestSpec> {
    Transaction::new_signed_tx(
        &TestPrivateKey::generate(),
        UnsignedTransaction::new(vec![], 0, max_priority_fee_bips, max_fee, 0, gas_limit),
    )
}

/// Simple setup, initializes a bank with a sender having an initial balance.
/// This is a useful helper for tests that need to initialize a bank.
///
/// ## Deprecated
/// This function is deprecated and will be removed in the future to use the testing framework. Please refrain from using it in new tests.
pub fn simple_bank_setup_deprecated(
    initial_balance: u64,
) -> (
    <TestSpec as Spec>::Address,
    Bank<TestSpec>,
    StateCheckpoint<TestSpec>,
) {
    let bank = Bank::<TestSpec>::default();
    let tmpdir = tempfile::tempdir().unwrap();
    let state_checkpoint = StateCheckpoint::new(new_finalized_storage(tmpdir.path()));

    let sender_address = generate_address::<TestSpec>("just_sender");

    let token_name = "Token1".to_owned();
    let token_id = GAS_TOKEN_ID;

    let bank_config = BankConfig::<TestSpec> {
        gas_token_config: GasTokenConfig {
            token_name,
            address_and_balances: vec![(sender_address, initial_balance)],
            authorized_minters: vec![],
        },
        tokens: vec![],
    };
    let mut genesis_state_accessor =
        state_checkpoint.to_genesis_state_accessor::<Bank<TestSpec>>(&bank_config);
    bank.genesis(&bank_config, &mut genesis_state_accessor)
        .unwrap();

    let mut checkpoint = genesis_state_accessor.checkpoint();

    assert_eq!(
        bank.get_balance_of(&sender_address, token_id, &mut checkpoint)
            .unwrap_infallible(),
        Some(initial_balance),
        "Invalid initial balance"
    );

    (sender_address, bank, checkpoint)
}

/// Builds a [`MockBlob`] from a [`Batch`] and a given address.
///
/// ## Deprecated
/// This function is deprecated and will be removed in the future to use the testing framework. Please refrain from using it in new tests.
pub fn new_test_blob_from_batch_deprecated(
    batch: Batch,
    address: &[u8],
    hash: [u8; 32],
) -> <MockDaSpec as DaSpec>::BlobTransaction {
    let address = MockAddress::try_from(address).unwrap();
    let data = borsh::to_vec(&batch).unwrap();
    MockBlob::new(data, address, hash)
}

/// Builds a new test blob for direct sequencer registration.
pub fn new_test_blob_for_direct_registration(
    tx: RawTx,
    address: &[u8],
    hash: [u8; 32],
) -> <MockDaSpec as DaSpec>::BlobTransaction {
    let batch = tx;
    let address = MockAddress::try_from(address).unwrap();
    let data = borsh::to_vec(&batch).unwrap();
    MockBlob::new(data, address, hash)
}

/// Checks if the given [`BatchReceipt`] contains any events.
///
/// ## Deprecated
/// This function is deprecated and will be removed in the future to use the testing framework. Please refrain from using it in new tests.
pub fn has_tx_events_deprecated<Da: DaSpec>(apply_blob_outcome: &BatchReceipt<Da>) -> bool {
    let events = apply_blob_outcome
        .tx_receipts
        .iter()
        .flat_map(|receipts| receipts.events.iter());

    events.peekable().peek().is_some()
}

/// A generic message object used to create transactions.
pub struct Message<S: Spec, Mod: Module> {
    /// The sender's private key.
    pub sender_key: Rc<<S::CryptoSpec as CryptoSpec>::PrivateKey>,
    /// The message content.
    pub content: Mod::CallMessage,
    /// Data related to fees and gas handling.
    pub details: TxDetails<S>,
    /// The message nonce.
    pub nonce: u64,
}

impl<S: Spec, Mod: Module> Message<S, Mod> {
    fn new(
        sender_key: Rc<<S::CryptoSpec as CryptoSpec>::PrivateKey>,
        content: Mod::CallMessage,
        chain_id: u64,
        max_priority_fee_bips: PriorityFeeBips,
        max_fee: u64,
        gas_limit: Option<S::Gas>,
        nonce: u64,
    ) -> Self {
        Self {
            sender_key,
            content,
            details: TxDetails {
                chain_id,
                max_priority_fee_bips,
                max_fee,
                gas_limit,
            },
            nonce,
        }
    }

    /// Converts a [`Message`] into a [`Transaction`] using the [`TxDetails`] provided by the [`Message`].
    pub fn to_tx<Encoder: EncodeCall<Mod>>(self) -> sov_modules_api::transaction::Transaction<S> {
        let message = Encoder::encode_call(self.content);
        Transaction::<S>::new_signed_tx(
            &self.sender_key,
            UnsignedTransaction::new(
                message,
                self.details.chain_id,
                self.details.max_priority_fee_bips,
                self.details.max_fee,
                self.nonce,
                self.details.gas_limit,
            ),
        )
    }
}

/// Trait used to generate messages from the DA layer to automate module testing
pub trait MessageGenerator {
    /// The default chain ID to use for the messages.
    const DEFAULT_CHAIN_ID: u64 = config_value!("CHAIN_ID");

    /// Module where the messages originate from.
    type Module: Module;

    /// Module spec
    type Spec: Spec;

    /// Generates a list of messages originating from the module using the provided transaction details.
    fn create_messages(
        &self,
        chain_id: u64,
        max_priority_fee_bips: PriorityFeeBips,
        max_fee: u64,
        estimated_gas_usage: Option<<Self::Spec as Spec>::Gas>,
    ) -> Vec<Message<Self::Spec, Self::Module>>;

    /// Generates a list of messages originating from the module using default transaction details.
    /// Note: sets the gas usage to the default gas limit.
    fn create_default_messages(&self) -> Vec<Message<Self::Spec, Self::Module>> {
        self.create_messages(
            Self::DEFAULT_CHAIN_ID,
            TEST_DEFAULT_MAX_PRIORITY_FEE,
            TEST_DEFAULT_MAX_FEE,
            Some(<Self::Spec as Spec>::Gas::from_slice(
                &TEST_DEFAULT_GAS_LIMIT,
            )),
        )
    }

    /// Generates a list of messages originating from the module using default transaction details and no gas usage.
    fn create_default_messages_without_gas_usage(&self) -> Vec<Message<Self::Spec, Self::Module>> {
        self.create_messages(
            Self::DEFAULT_CHAIN_ID,
            TEST_DEFAULT_MAX_PRIORITY_FEE,
            TEST_DEFAULT_MAX_FEE,
            None,
        )
    }

    /// Creates a vector of raw transactions from the module.
    fn create_default_raw_txs<Encoder: EncodeCall<Self::Module>, Auth: Authenticator>(
        &self,
    ) -> Vec<RawTx> {
        self.create_raw_txs::<Encoder, Auth>(
            Self::DEFAULT_CHAIN_ID,
            TEST_DEFAULT_MAX_PRIORITY_FEE,
            TEST_DEFAULT_MAX_FEE,
            Some(<Self::Spec as Spec>::Gas::from_slice(
                &TEST_DEFAULT_GAS_LIMIT,
            )),
        )
    }

    /// Generates a list of raw transactions originating from the module using default transaction details and no gas usage.
    fn create_default_raw_txs_without_gas_usage<
        Encoder: EncodeCall<Self::Module>,
        Auth: Authenticator,
    >(
        &self,
    ) -> Vec<RawTx> {
        self.create_raw_txs::<Encoder, Auth>(
            Self::DEFAULT_CHAIN_ID,
            TEST_DEFAULT_MAX_PRIORITY_FEE,
            TEST_DEFAULT_MAX_FEE,
            None,
        )
    }

    /// Creates a vector of raw transactions from the module.
    fn create_raw_txs<Encoder: EncodeCall<Self::Module>, Auth: Authenticator>(
        &self,
        chain_id: u64,
        max_priority_fee_bips: PriorityFeeBips,
        max_fee: u64,
        estimated_gas_usage: Option<<Self::Spec as Spec>::Gas>,
    ) -> Vec<RawTx> {
        let messages_iter = self
            .create_messages(
                chain_id,
                max_priority_fee_bips,
                max_fee,
                estimated_gas_usage,
            )
            .into_iter();
        let mut serialized_messages = Vec::default();
        for message in messages_iter {
            let tx = message.to_tx::<Encoder>();
            serialized_messages.push(Auth::encode(borsh::to_vec(&tx).unwrap()).unwrap());
        }
        serialized_messages
    }

    /// Generates a list of blobs originating from the module using default transaction details.
    /// This function calls [`MessageGenerator::create_default_raw_txs`] and then wraps the resulting vec of [`RawTx`]s into a [`Batch`].
    fn create_blobs<Encoder: EncodeCall<Self::Module>, Auth: Authenticator>(&self) -> Vec<u8> {
        let txs: Vec<RawTx> = self
            .create_default_raw_txs::<Encoder, Auth>()
            .into_iter()
            .collect();

        let batch = Batch::new(txs);

        borsh::to_vec(&batch).unwrap()
    }
}
