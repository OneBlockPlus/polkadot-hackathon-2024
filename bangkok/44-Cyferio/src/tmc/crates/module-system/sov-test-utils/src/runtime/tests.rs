use sov_bank::ReserveGasErrorReason;
use sov_mock_da::MockAddress;
use sov_modules_api::capabilities::FatalError;
use sov_modules_api::macros::config_value;
use sov_modules_api::prelude::UnwrapInfallible;
use sov_modules_api::{BatchReceipt, BatchSequencerReceipt, DaSpec};
use sov_modules_stf_blueprint::SkippedReason;
use sov_sequencer_registry::SequencerRegistry;
use sov_value_setter::{ValueSetter, ValueSetterConfig};

use crate::interface::AsUser;
use crate::runtime::optimistic::HighLevelOptimisticGenesisConfig;
use crate::runtime::TestRunner;
use crate::{
    generate_optimistic_runtime, MockDaSpec, SlotTestCase, TestSequencer, TestUser, TxTestCase,
    TEST_DEFAULT_USER_STAKE,
};

type S = crate::TestSpec;

generate_optimistic_runtime!(TestRuntime <= value_setter: ValueSetter<S>);

/// Sets up a test runner with the [`ValueSetter`] with a single additional admin account.
fn setup() -> (TestUser<S>, TestRunner<TestRuntime<S, MockDaSpec>, S>) {
    let genesis_config = HighLevelOptimisticGenesisConfig::generate_with_additional_accounts(1);

    let admin = genesis_config.additional_accounts.first().unwrap().clone();

    let value_setter_config = ValueSetterConfig {
        admin: admin.address(),
    };

    // Run genesis registering the attester and sequencer we've generated.
    let genesis = GenesisConfig::from_minimal_config(genesis_config.into(), value_setter_config);

    let runner =
        TestRunner::new_with_genesis(genesis.into_genesis_params(), TestRuntime::default());

    (admin, runner)
}

#[test]
fn test_query_runtime() {
    let (admin, mut runner) = setup();

    let admin_genesis_address = runner.query_state(|state| {
        assert_eq!(
            ValueSetter::<S>::default()
                .value
                .get(state)
                .unwrap_infallible(),
            None,
            "The value should not be set"
        );

        ValueSetter::<S>::default()
            .admin
            .get(state)
            .unwrap_infallible()
            .expect("The admin should be set")
    });

    assert_eq!(
        admin.address(),
        admin_genesis_address,
        "The admins don't match"
    );

    runner.execute_slots(vec![SlotTestCase::from_rewarded_batch(vec![TxTestCase::<
        TestRuntime<S, MockDaSpec>,
        _,
        _,
    >::applied(
        admin.create_plain_message::<ValueSetter<S>>(sov_value_setter::CallMessage::SetValue(1)),
    )])]);

    let state_value = runner.query_state(|state| {
        ValueSetter::<S>::default()
            .value
            .get(state)
            .unwrap_infallible()
    });

    assert_eq!(state_value, Some(1), "The value should be set to 1");
}

/// Tests that the batch is rewarded if the default sequencer is used
#[test]
fn test_default_sequencer() {
    let (admin, mut runner) = setup();

    runner.execute_slots(vec![
        // If no sequencer is specified, the default one should be used and the batch should be rewarded
        SlotTestCase::from_rewarded_batch(vec![
            TxTestCase::<TestRuntime<S, MockDaSpec>, _, _>::applied(
                admin.create_plain_message::<ValueSetter<S>>(
                    sov_value_setter::CallMessage::SetValue(1),
                ),
            ),
        ]),
    ]);

    // Check that the last receipt is from the default sequencer
    let last_receipt: &BatchReceipt<BatchSequencerReceipt<MockDaSpec>, _> =
        runner.slot_receipts.last().unwrap().last_batch_receipt();

    assert_eq!(
        last_receipt.inner.da_address,
        runner.default_sequencer_da_address
    );
}

/// Tests that the batch is dropped if the specified sequencer is not registered
#[test]
fn test_specify_non_default_sequencer_errors_if_not_registered() {
    let (admin, mut runner) = setup();

    runner.execute_slots(vec![
        // If a sequencer is specified, it should be used. This should fail because this sequencer is not registered
        SlotTestCase::from_dropped_batch(vec![
            TxTestCase::<TestRuntime<S, MockDaSpec>, _, _>::dropped(
                admin.create_plain_message::<ValueSetter<S>>(
                    sov_value_setter::CallMessage::SetValue(10),
                ),
            ),
        ])
        .with_sequencer(<MockDaSpec as DaSpec>::Address::from([42; 32])),
    ]);

    // Check that there is no receipt available
    assert_eq!(
        runner.slot_receipts.last().unwrap().batch_receipts.len(),
        0,
        "The last slot receipt should be empty because the batch was dropped"
    );
}

/// Tests that we can register and use another sequencer
#[test]
fn test_register_sequencer() {
    let (additional_user, mut runner) = setup();

    let sequencer_address = MockAddress::from([42; 32]);

    let sequencer = TestSequencer::<S, MockDaSpec> {
        user_info: additional_user,
        da_address: sequencer_address,
        bond: TEST_DEFAULT_USER_STAKE,
    };

    // We first bond the sequencer
    runner.execute_slots(vec![SlotTestCase::from_rewarded_batch(vec![TxTestCase::<
        TestRuntime<S, MockDaSpec>,
        _,
        _,
    >::applied(
        sequencer.create_plain_message::<SequencerRegistry<S, MockDaSpec>>(
            sov_sequencer_registry::CallMessage::Register {
                da_address: sequencer.da_address.as_ref().to_vec(),
                amount: sequencer.bond,
            },
        ),
    )])]);

    // Then we use the non-default sequencer to set a value
    runner.execute_slots(vec![SlotTestCase::from_rewarded_batch(vec![TxTestCase::<
        TestRuntime<S, MockDaSpec>,
        _,
        _,
    >::applied(
        sequencer
            .create_plain_message::<ValueSetter<S>>(sov_value_setter::CallMessage::SetValue(10)),
    )])
    .with_sequencer(sequencer.da_address)]);

    // Check that the last receipt is from the non-default sequencer
    let last_receipt: &BatchReceipt<BatchSequencerReceipt<MockDaSpec>, _> =
        runner.slot_receipts.last().unwrap().last_batch_receipt();

    assert_eq!(
        last_receipt.inner.da_address, sequencer_address,
        "The last receipt should be from the non-default sequencer"
    );
}

/// Checks that the chain id of a transaction can be overridden.
#[test]
fn test_custom_transaction_details_chain_id() {
    let (admin, mut runner) = setup();

    let real_chain_id = config_value!("CHAIN_ID");
    let fake_chain_id = real_chain_id + 1;

    runner.execute_slots::<ValueSetter<S>>(vec![SlotTestCase::from_slashed_batch(
        vec![TxTestCase::<TestRuntime<S, MockDaSpec>, _, _>::dropped(
            admin
                .create_plain_message::<ValueSetter<S>>(sov_value_setter::CallMessage::SetValue(1))
                .with_chain_id(fake_chain_id),
        )],
        FatalError::InvalidChainId {
            expected: real_chain_id,
            got: fake_chain_id,
        },
    )]);
}

/// Checks that the chain id of a transaction can be overridden.
#[test]
fn test_custom_transaction_details_max_fee() {
    let (admin, mut runner) = setup();

    runner.execute_slots::<ValueSetter<S>>(vec![SlotTestCase::from_rewarded_batch(vec![
        TxTestCase::<TestRuntime<S, MockDaSpec>, _, _>::skipped(
            admin
                .create_plain_message::<ValueSetter<S>>(sov_value_setter::CallMessage::SetValue(10))
                .with_max_fee(
                     0,
                ),
            SkippedReason::CannotReserveGas(
                // TODO(@theochap): make it possible to inject closures to test the error message
                ReserveGasErrorReason::<S>::InsufficientGasForPreExecutionChecks("The gas to charge is greater than the funds available in the meter. Gas to charge GasUnit[2261, 2261], gas price GasPrice[10, 10], remaining funds 0, total gas consumed GasUnit[0, 0]".to_string())
                    .to_string(),
            ),
        ),
    ])]);
}
