use std::marker::PhantomData;

use sov_attester_incentives::{AttesterIncentives, AttesterIncentivesConfig};
use sov_bank::{Bank, BankConfig};
use sov_mock_da::{MockAddress, MockDaSpec};
use sov_modules_api::{DaSpec, Genesis, Spec};
use sov_sequencer_registry::{SequencerConfig, SequencerRegistry};

use crate::interface::AsUser;
use crate::{
    TestAttester, TestAttesterConfig, TestChallenger, TestSequencer, TestSequencerConfig, TestSpec,
    TestUser, TEST_DEFAULT_USER_BALANCE, TEST_DEFAULT_USER_STAKE, TEST_GAS_TOKEN_NAME,
    TEST_LIGHT_CLIENT_FINALIZED_HEIGHT, TEST_MAX_ATTESTED_HEIGHT, TEST_ROLLUP_FINALITY_PERIOD,
};

/// A genesis config for a minimal optimsitic runtime
pub struct MinimalOptimisticGenesisConfig<S: Spec, Da: DaSpec> {
    /// The sequencer registry config.
    pub sequencer_registry: <SequencerRegistry<S, Da> as Genesis>::Config,
    /// The attester incentives config.
    pub attester_incentives: <AttesterIncentives<S, Da> as Genesis>::Config,
    /// The bank config.
    pub bank: <Bank<S> as Genesis>::Config,
}

/// A convenient high-level representation of an optimistic genesis config. This config
/// is expressed in terms of abstract entities like Attesters and Sequencers, rather than
/// the low level details of accounts with balances held by several different modules.
///
/// This type can be converted into a low-level [`MinimalOptimisticGenesisConfig`] using
/// the [`From`] trait.
#[derive(Debug, Clone)]
pub struct HighLevelOptimisticGenesisConfig<S: Spec, Da: DaSpec> {
    /// The initial attester.
    pub initial_attester: TestAttester<S>,
    /// The initial challenger.
    pub initial_challenger: TestChallenger<S>,
    /// The initial sequencer.
    pub initial_sequencer: TestSequencer<S, Da>,
    /// Additional accounts to be added to the genesis state.
    pub additional_accounts: Vec<TestUser<S>>,
    /// The name of the gas token.
    pub gas_token_name: String,
}

impl<S: Spec, Da: DaSpec> HighLevelOptimisticGenesisConfig<S, Da> {
    /// Creates a new high-level genesis config with the given initial attester and sequencer using
    /// the default gas token name.
    pub fn with_defaults(
        initial_attester: TestAttester<S>,
        initial_challenger: TestChallenger<S>,
        initial_sequencer: TestSequencer<S, Da>,
        additional_accounts: Vec<TestUser<S>>,
    ) -> Self {
        Self {
            initial_attester,
            initial_challenger,
            initial_sequencer,
            additional_accounts,
            gas_token_name: TEST_GAS_TOKEN_NAME.to_string(),
        }
    }
}

impl HighLevelOptimisticGenesisConfig<TestSpec, MockDaSpec> {
    /// Generates a new high-level genesis config with random addresses, constant amounts (1_000_000_000 tokens)
    /// and no additional accounts.
    pub fn generate() -> Self {
        Self::generate_with_additional_accounts(0)
    }

    /// Generates a new high-level genesis config with random addresses and constant amounts (1_000_000_000 tokens)
    /// and `num_accounts` additional accounts.
    pub fn generate_with_additional_accounts(num_accounts: usize) -> Self {
        let attester = TestAttester::generate(TestAttesterConfig {
            bond: TEST_DEFAULT_USER_STAKE,
            free_balance: TEST_DEFAULT_USER_BALANCE, // Give the attester extra tokens to pay for gas
        });
        let challenger =
            TestChallenger::generate(TEST_DEFAULT_USER_STAKE + TEST_DEFAULT_USER_BALANCE);

        let sequencer = TestSequencer::generate(TestSequencerConfig {
            bond: TEST_DEFAULT_USER_STAKE,
            additional_balance: TEST_DEFAULT_USER_BALANCE,
            da_address: MockAddress::from([172; 32]),
        });

        let mut additional_accounts = Vec::with_capacity(num_accounts);

        for _ in 0..num_accounts {
            additional_accounts.push(TestUser::<TestSpec>::generate(TEST_DEFAULT_USER_BALANCE));
        }

        Self::with_defaults(attester, challenger, sequencer, additional_accounts)
    }
}

impl<S: Spec, Da: DaSpec> From<HighLevelOptimisticGenesisConfig<S, Da>>
    for MinimalOptimisticGenesisConfig<S, Da>
{
    fn from(high_level: HighLevelOptimisticGenesisConfig<S, Da>) -> Self {
        Self::from_args(
            high_level.initial_attester,
            high_level.initial_challenger,
            high_level.initial_sequencer,
            high_level.additional_accounts.as_slice(),
            high_level.gas_token_name,
        )
    }
}

impl<S: Spec, Da: DaSpec> MinimalOptimisticGenesisConfig<S, Da> {
    /// Creates a new [`MinimalOptimisticGenesisConfig`] from the given arguments.
    pub fn from_args(
        initial_attester: TestAttester<S>,
        initial_challenger: TestChallenger<S>,
        initial_sequencer: TestSequencer<S, Da>,
        additional_accounts: &[TestUser<S>],
        gas_token_name: String,
    ) -> Self {
        Self {
            sequencer_registry: SequencerConfig {
                seq_rollup_address: initial_sequencer.as_user().address().clone(),
                seq_da_address: initial_sequencer.da_address.clone(),
                minimum_bond: initial_sequencer.bond,
                is_preferred_sequencer: true,
            },
            attester_incentives: AttesterIncentivesConfig {
                minimum_attester_bond: TEST_DEFAULT_USER_STAKE,
                minimum_challenger_bond: TEST_DEFAULT_USER_STAKE,
                initial_attesters: vec![(
                    initial_attester.as_user().address().clone(),
                    initial_attester.bond,
                )],
                rollup_finality_period: TEST_ROLLUP_FINALITY_PERIOD,
                maximum_attested_height: TEST_MAX_ATTESTED_HEIGHT,
                light_client_finalized_height: TEST_LIGHT_CLIENT_FINALIZED_HEIGHT,
                phantom_data: PhantomData,
            },

            bank: BankConfig {
                gas_token_config: sov_bank::GasTokenConfig {
                    token_name: gas_token_name,
                    address_and_balances: {
                        let mut additional_accounts_vec: Vec<_> = additional_accounts
                            .iter()
                            .map(|user| (user.address(), user.balance()))
                            .collect();
                        // We need to add the bond to the initial balance because genesis deduces the bond from the bank balance.
                        additional_accounts_vec.append(&mut vec![
                            (
                                initial_sequencer.as_user().address(),
                                initial_sequencer.bond
                                    + initial_sequencer.as_user().available_balance,
                            ),
                            (
                                initial_attester.as_user().address(),
                                initial_attester.bond
                                    + initial_attester.as_user().available_balance,
                            ),
                            (
                                initial_challenger.as_user().address(),
                                initial_challenger.as_user().available_balance,
                            ),
                        ]);

                        additional_accounts_vec
                    },
                    authorized_minters: vec![],
                },
                tokens: vec![],
            },
        }
    }
}
