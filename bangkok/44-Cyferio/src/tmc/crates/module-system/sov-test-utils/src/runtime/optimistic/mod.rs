use std::marker::PhantomData;

pub use genesis::HighLevelOptimisticGenesisConfig;
use sov_modules_api::{DaSpec, Spec};

use crate::runtime::{
    AttesterIncentivesConfig, BankConfig, SequencerConfig, ValueSetter, ValueSetterConfig,
};
use crate::{
    TEST_DEFAULT_USER_STAKE, TEST_LIGHT_CLIENT_FINALIZED_HEIGHT, TEST_MAX_ATTESTED_HEIGHT,
    TEST_ROLLUP_FINALITY_PERIOD,
};

/// Contains genesis configuration utils for the optimistic runtime.
pub mod genesis;
#[cfg(test)]
mod tests;

/// Generates a optimistic runtime containing the [`Bank`](sov_bank::Bank), [`AttesterIncentives`](sov_attester_incentives::AttesterIncentives),
/// and [`SequencerRegistry`](sov_sequencer_registry::SequencerRegistry) modules in addition to any provided as arguments.
#[macro_export]
macro_rules! generate_optimistic_runtime {
    ($id:ident <= $($module_name:ident : $module_ty:path),*) => {
        $crate::generate_runtime! {
            name: $id,
            modules: [$($module_name : $module_ty),*],
            base_fee_recipient: attester_incentives: $crate::runtime::AttesterIncentives<S, Da>,
            minimal_genesis_config_type: $crate::runtime::optimistic::genesis::MinimalOptimisticGenesisConfig<S, Da>
        }
    };
}

generate_optimistic_runtime!(TestRuntime <= value_setter: ValueSetter<S>);

/// Admin: single address that will be used as admin and minter.
/// Sequencer is another address that will be used as sequencer.
#[allow(clippy::too_many_arguments)]
pub fn create_genesis_config<S: Spec, Da: DaSpec>(
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
