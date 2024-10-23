use sov_attester_incentives::AttesterIncentives;
use sov_kernels::basic::BasicKernelGenesisConfig;
use sov_mock_da::MockDaSpec;
use sov_mock_zkvm::MockCodeCommitment;
use sov_modules_api::prelude::UnwrapInfallible;
use sov_modules_api::{Address, PrivateKey, UnmeteredStateWrapper, WorkingSet};
use sov_modules_stf_blueprint::GenesisParams;

use super::*;
use crate::runtime::optimistic::genesis::HighLevelOptimisticGenesisConfig;
use crate::runtime::{ChainStateConfig, SlotTestCase, TestRunner, WorkingSetClosure};
use crate::{
    default_test_tx_details, generate_optimistic_runtime, TestPrivateKey, TestSpec,
    TransactionType, TxTestCase, TEST_DEFAULT_USER_BALANCE, TEST_DEFAULT_USER_STAKE,
};

const SEQUENCER_ADDR: [u8; 32] = [42u8; 32];
generate_optimistic_runtime!(TestRuntime <= value_setter: ValueSetter<S>);

#[test]
// Tests the test setup by running the value setter module and checking if the value was set correctly
fn test_value_setter_tx_success() {
    let value_to_set = 18;
    let assertion = Box::new(
        move |state: &mut UnmeteredStateWrapper<WorkingSet<TestSpec>>| {
            let value_setter = ValueSetter::<TestSpec>::default();
            let value = value_setter
                .value
                .get(state)
                .unwrap_infallible()
                .expect("We should be able to get a value from the state");
            assert_eq!(value, value_to_set);
        },
    );

    run_value_setter_txs_with_assertions(vec![(value_to_set, assertion)]);
}

#[test]
#[should_panic]
// Tests the test setup by running the value setter with an assertion that should fail and then trying to
// run another transaction afterward. This would cause subsequent tests to block forever if the test runtime
// failed to handle panics.
fn test_value_setter_tx_bad_assertion() {
    let value_to_set = 18;
    let bad_assertion = Box::new(
        move |state: &mut UnmeteredStateWrapper<WorkingSet<TestSpec>>| {
            let value_setter = ValueSetter::<TestSpec>::default();
            let value = value_setter
                .value
                .get(state)
                .unwrap_infallible()
                .expect("We should be able to get a value from the state");
            assert_eq!(value, value_to_set + 1); // This will fail!
        },
    );

    run_value_setter_txs_with_assertions(vec![
        (value_to_set, bad_assertion),
        (1, Box::new(|_| {})),
    ]);
}

// Sets a value and then runs the provided assertion
fn run_value_setter_txs_with_assertions(
    values_and_assertions: Vec<(u32, WorkingSetClosure<TestRuntime<TestSpec, MockDaSpec>>)>,
) {
    let sequencer_rollup_addr = Address::from(SEQUENCER_ADDR);
    let admin_pkey = TestPrivateKey::generate();
    let admin_addr = (&admin_pkey.pub_key()).into();
    let genesis_config = create_test_rt_genesis_config(
        admin_addr,
        &[],
        sequencer_rollup_addr,
        SEQUENCER_ADDR.into(),
        TEST_DEFAULT_USER_STAKE,
        "SovereignToken".to_string(),
        TEST_DEFAULT_USER_BALANCE,
    );
    let kernel_genesis = BasicKernelGenesisConfig {
        chain_state: ChainStateConfig {
            current_time: Default::default(),
            inner_code_commitment: MockCodeCommitment::default(),
            outer_code_commitment: MockCodeCommitment::default(),
            genesis_da_height: 0,
        },
    };
    let params = GenesisParams {
        runtime: genesis_config,
        kernel: kernel_genesis,
    };
    let tx_test_cases = values_and_assertions
        .into_iter()
        .map(|(value, assertion)| {
            let msg = sov_value_setter::CallMessage::SetValue(value);
            TxTestCase::<_, ValueSetter<TestSpec>, _>::applied_with_hook(
                TransactionType::Plain {
                    message: msg,
                    key: admin_pkey.clone(),
                    details: default_test_tx_details(),
                },
                assertion,
            )
        })
        .collect::<Vec<_>>();

    TestRunner::run_test(
        params,
        vec![SlotTestCase::from_rewarded_batch(tx_test_cases)],
        TestRuntime::<TestSpec, MockDaSpec>::default(),
    );
}

// TODO: generate this function in macro. We'll change the return type to a fixed `BasicGenesisConfig`
// and then implement a helper function to combine this basic config with config for other modules to
// create the full genesis config.
//
// This function should also take fewer arguments and generate data more aggressively.
// <https://github.com/Sovereign-Labs/sovereign-sdk-wip/issues/682>
#[allow(clippy::too_many_arguments)]
fn create_test_rt_genesis_config<S: Spec, Da: DaSpec>(
    admin: S::Address,
    additional_accounts: &[(S::Address, u64)],
    seq_rollup_address: S::Address,
    seq_da_address: Da::Address,
    seq_stake_amount: u64,
    token_name: String,
    init_balance: u64,
) -> GenesisConfig<S, Da> {
    assert!(
        init_balance >= seq_stake_amount,
        "sequencer cannot stake more than its initial balance"
    );
    GenesisConfig {
        value_setter: ValueSetterConfig {
            admin: admin.clone(),
        },
        sequencer_registry: SequencerConfig {
            seq_rollup_address: seq_rollup_address.clone(),
            seq_da_address,
            minimum_bond: seq_stake_amount,
            is_preferred_sequencer: true,
        },
        attester_incentives: AttesterIncentivesConfig {
            minimum_attester_bond: TEST_DEFAULT_USER_STAKE,
            minimum_challenger_bond: TEST_DEFAULT_USER_STAKE,
            initial_attesters: vec![(admin.clone(), TEST_DEFAULT_USER_STAKE)],
            rollup_finality_period: TEST_ROLLUP_FINALITY_PERIOD,
            maximum_attested_height: TEST_MAX_ATTESTED_HEIGHT,
            light_client_finalized_height: TEST_LIGHT_CLIENT_FINALIZED_HEIGHT,
            phantom_data: PhantomData,
        },

        bank: BankConfig {
            gas_token_config: sov_bank::GasTokenConfig {
                token_name: token_name.clone(),
                address_and_balances: {
                    let mut additional_accounts_vec = additional_accounts.to_vec();
                    additional_accounts_vec.append(&mut vec![
                        (seq_rollup_address, init_balance),
                        (admin.clone(), init_balance),
                    ]);
                    additional_accounts_vec
                },
                authorized_minters: vec![admin.clone()],
            },
            tokens: vec![],
        },
    }
}
#[test]
fn test_slot_number() {
    generate_optimistic_runtime!(TestRuntime <=);

    let genesis_config = HighLevelOptimisticGenesisConfig::generate();
    let genesis_config = GenesisConfig::from_minimal_config(genesis_config.clone().into());

    let runtime = TestRuntime::default();

    let mut runner = TestRunner::new_with_genesis(genesis_config.into_genesis_params(), runtime);
    assert_eq!(runner.curr_slot_number(), 1);

    runner.execute_slots::<AttesterIncentives<TestSpec, MockDaSpec>>(vec![
        SlotTestCase::empty(),
        SlotTestCase::empty(),
    ]);

    assert_eq!(runner.curr_slot_number(), 3);

    runner.execute_slots::<AttesterIncentives<TestSpec, MockDaSpec>>(vec![
        SlotTestCase::empty(),
        SlotTestCase::empty(),
    ]);

    assert_eq!(runner.curr_slot_number(), 5);
}
