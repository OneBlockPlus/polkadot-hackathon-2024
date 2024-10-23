#![cfg(feature = "runtime-benchmarks")]

use super::*;
use frame_benchmarking::{account, benchmarks, whitelisted_caller};
use frame_system::RawOrigin;

const SEED: u32 = 0;

benchmarks! {
    update_pool_parameters {
        let caller: T::AccountId = whitelisted_caller();
        let pool_id = T::PoolId::from(1u32);
        let new_params = PoolParams {
            debt_ceiling: 1_000_000u32.into(),
            min_debt_amount: 100u32.into(),
            is_minting_allowed: true,
            is_burning_allowed: true,
        };
        PoolParameters::<T>::insert(pool_id, new_params.clone());
    }: _(RawOrigin::Root, pool_id, new_params)
    verify {
        assert_eq!(PoolParameters::<T>::get(pool_id), Some(new_params));
    }

    update_collateral_parameters {
        let caller: T::AccountId = whitelisted_caller();
        let pool_id = T::PoolId::from(1u32);
        let asset_id = T::AssetId::from(1u32);
        let new_params = CollateralParams {
            is_enabled: true,
            max_ceiling: 1_000_000u32.into(),
            base_ltv: 80u32.into(),
            liquidation_threshold: 85u32.into(),
            liquidation_penalty: 5u32.into(),
            liquidation_fee: 1u32.into(),
        };
        CollateralParameters::<T>::insert(pool_id, asset_id, new_params.clone());
    }: _(RawOrigin::Root, pool_id, asset_id, new_params)
    verify {
        assert_eq!(CollateralParameters::<T>::get(pool_id, asset_id), Some(new_params));
    }

    update_global_risk_parameters {
        let caller: T::AccountId = whitelisted_caller();
        let new_params = GlobalRiskParams {
            global_debt_ceiling: 10_000_000u32.into(),
            min_health_factor: 110u32.into(),
        };
    }: _(RawOrigin::Root, new_params)
    verify {
        assert_eq!(GlobalRiskState::<T>::get(), new_params);
    }
}

impl_benchmark_test_suite!(
    Pallet,
    crate::mock::new_test_ext(),
    crate::mock::Test,
);