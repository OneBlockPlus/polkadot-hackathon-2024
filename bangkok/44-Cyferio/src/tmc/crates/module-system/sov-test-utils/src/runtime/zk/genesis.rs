use sov_bank::Bank;
use sov_mock_da::{MockAddress, MockDaSpec};
use sov_modules_api::{DaSpec, Genesis, Spec};
use sov_prover_incentives::ProverIncentives;
use sov_sequencer_registry::SequencerRegistry;

use crate::interface::AsUser;
use crate::runtime::{BankConfig, ProverIncentivesConfig, SequencerConfig};
use crate::{
    TestProver, TestProverConfig, TestSequencer, TestSequencerConfig, TestSpec, TestUser,
    TEST_DEFAULT_USER_BALANCE, TEST_DEFAULT_USER_STAKE, TEST_GAS_TOKEN_NAME,
};

/// Minimal genesis configuration for the zk runtime.
pub struct MinimalZkGenesisConfig<S: Spec, Da: DaSpec> {
    /// The sequencer registry config.
    pub sequencer_registry: <SequencerRegistry<S, Da> as Genesis>::Config,
    /// The prover incentives config.
    pub prover_incentives: <ProverIncentives<S, Da> as Genesis>::Config,
    /// The bank config.
    pub bank: <Bank<S> as Genesis>::Config,
}

/// A convenient high-level representation of a ZK genesis config.
#[derive(Debug, Clone)]
pub struct HighLevelZkGenesisConfig<S: Spec, Da: DaSpec> {
    /// The initial prover.
    pub initial_prover: TestProver<S>,
    /// The initial sequencer.
    pub initial_sequencer: TestSequencer<S, Da>,
    /// Additional accounts to be added to the genesis state.
    pub additional_accounts: Vec<TestUser<S>>,
    /// The name of the gas token
    pub gas_token_name: String,
}

impl<S: Spec, Da: DaSpec> HighLevelZkGenesisConfig<S, Da> {
    /// Creates a new high-level genesis config with the given initial prover and sequencer using
    /// the default gas token name.
    pub fn with_defaults(
        initial_prover: TestProver<S>,
        initial_sequencer: TestSequencer<S, Da>,
        additional_accounts: Vec<TestUser<S>>,
    ) -> Self {
        Self {
            initial_prover,
            initial_sequencer,
            additional_accounts,
            gas_token_name: TEST_GAS_TOKEN_NAME.to_string(),
        }
    }
}

impl HighLevelZkGenesisConfig<TestSpec, MockDaSpec> {
    /// Generates a new high-level genesis config with random addresses, constant amounts (1_000_000_000 tokens)
    /// and no additional accounts.
    pub fn generate() -> Self {
        Self::generate_with_additional_accounts(0)
    }

    /// Generates a new high-level genesis config with random addresses and constant amounts (1_000_000_000 tokens)
    /// and `num_accounts` additional accounts.
    pub fn generate_with_additional_accounts(num_accounts: usize) -> Self {
        let prover = TestProver::generate(TestProverConfig {
            additional_balance: TEST_DEFAULT_USER_BALANCE,
            bond: TEST_DEFAULT_USER_STAKE,
        });
        let sequencer = TestSequencer::generate(TestSequencerConfig {
            additional_balance: TEST_DEFAULT_USER_BALANCE,
            bond: TEST_DEFAULT_USER_STAKE,
            da_address: MockAddress::from([172; 32]),
        });
        let mut additional_accounts = Vec::with_capacity(num_accounts);

        for _ in 0..num_accounts {
            additional_accounts.push(TestUser::<TestSpec>::generate(TEST_DEFAULT_USER_BALANCE));
        }

        Self::with_defaults(prover, sequencer, additional_accounts)
    }
}

impl<S: Spec, Da: DaSpec> From<HighLevelZkGenesisConfig<S, Da>> for MinimalZkGenesisConfig<S, Da> {
    fn from(high_level: HighLevelZkGenesisConfig<S, Da>) -> Self {
        Self::from_args(
            high_level.initial_prover,
            high_level.initial_sequencer,
            high_level.additional_accounts.as_slice(),
            high_level.gas_token_name,
        )
    }
}

impl<S: Spec, Da: DaSpec> MinimalZkGenesisConfig<S, Da> {
    /// Creates a new [`MinimalZkGenesisConfig`] from the given arguments.
    pub fn from_args(
        initial_prover: TestProver<S>,
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
            prover_incentives: ProverIncentivesConfig {
                minimum_bond: TEST_DEFAULT_USER_STAKE,
                proving_penalty: TEST_DEFAULT_USER_STAKE / 2,
                initial_provers: vec![(
                    initial_prover.as_user().address().clone(),
                    initial_prover.bond,
                )],
            },
            bank: BankConfig {
                gas_token_config: sov_bank::GasTokenConfig {
                    token_name: gas_token_name,
                    address_and_balances: {
                        let mut additional_accounts_vec: Vec<_> = additional_accounts
                            .iter()
                            .map(|user| (user.address(), user.balance()))
                            .collect();
                        additional_accounts_vec.append(&mut vec![
                            (
                                initial_sequencer.as_user().address(),
                                initial_sequencer.bond
                                    + initial_sequencer.as_user().available_balance,
                            ),
                            (
                                initial_prover.as_user().address(),
                                initial_prover.bond + initial_prover.as_user().available_balance,
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
