#![cfg(feature = "runtime-benchmarks")]

use super::*;
use frame_benchmarking::{account, benchmarks, whitelisted_caller};
use frame_system::RawOrigin;
use sp_runtime::traits::StaticLookup;

const SEED: u32 = 0;

benchmarks! {
    deposit_collateral {
        let caller: T::AccountId = whitelisted_caller();
        let pool_id = T::PoolId::from(1u32);
        let asset_id = T::AssetId::from(1u32);
        let amount = T::Balance::from(100u32);
        CollateralParameters::<T>::insert(pool_id, asset_id, CollateralParams {
            max_ceiling: T::Balance::from(1000u32),
            liquidation_threshold: T::Balance::from(80u32),
            liquidation_penalty: T::Balance::from(5u32),
        });
        T::Currency::make_free_balance_be(&caller, amount * 2u32.into());
    }: _(RawOrigin::Signed(caller.clone()), pool_id, asset_id, amount)
    verify {
        assert_eq!(UserCollateral::<T>::get((pool_id, asset_id, caller)), amount);
    }

    withdraw_collateral {
        let caller: T::AccountId = whitelisted_caller();
        let pool_id = T::PoolId::from(1u32);
        let asset_id = T::AssetId::from(1u32);
        let amount = T::Balance::from(50u32);
        CollateralParameters::<T>::insert(pool_id, asset_id, CollateralParams {
            max_ceiling: T::Balance::from(1000u32),
            liquidation_threshold: T::Balance::from(80u32),
            liquidation_penalty: T::Balance::from(5u32),
        });
        T::Currency::make_free_balance_be(&caller, amount * 2u32.into());
        Pallet::<T>::deposit_collateral(RawOrigin::Signed(caller.clone()).into(), pool_id, asset_id, amount * 2u32.into())?;
    }: _(RawOrigin::Signed(caller.clone()), pool_id, asset_id, amount)
    verify {
        assert_eq!(UserCollateral::<T>::get((pool_id, asset_id, caller)), amount);
    }

    liquidate {
        let liquidator: T::AccountId = account("liquidator", 0, SEED);
        let user: T::AccountId = account("user", 0, SEED);
        let pool_id = T::PoolId::from(1u32);
        let asset_id = T::AssetId::from(1u32);
        let amount = T::Balance::from(100u32);
        CollateralParameters::<T>::insert(pool_id, asset_id, CollateralParams {
            max_ceiling: T::Balance::from(1000u32),
            liquidation_threshold: T::Balance::from(80u32),
            liquidation_penalty: T::Balance::from(5u32),
        });
        T::Currency::make_free_balance_be(&user, amount * 2u32.into());
        Pallet::<T>::deposit_collateral(RawOrigin::Signed(user.clone()).into(), pool_id, asset_id, amount)?;
    }: _(RawOrigin::Signed(liquidator.clone()), T::Lookup::unlookup(liquidator.clone()), T::Lookup::unlookup(user.clone()), pool_id, asset_id, amount)
    verify {
        assert_eq!(UserCollateral::<T>::get((pool_id, asset_id, liquidator)), amount);
        assert_eq!(UserCollateral::<T>::get((pool_id, asset_id, user)), T::Balance::zero());
    }

    add_collateral_asset {
        let pool_id = T::PoolId::from(1u32);
        let asset_id = T::AssetId::from(1u32);
        let params = CollateralParams {
            max_ceiling: T::Balance::from(1000u32),
            liquidation_threshold: T::Balance::from(80u32),
            liquidation_penalty: T::Balance::from(5u32),
        };
    }: _(RawOrigin::Root, pool_id, asset_id, params)
    verify {
        assert!(CollateralParameters::<T>::contains_key(pool_id, asset_id));
    }

    update_collateral_params {
        let pool_id = T::PoolId::from(1u32);
        let asset_id = T::AssetId::from(1u32);
        let params = CollateralParams {
            max_ceiling: T::Balance::from(1000u32),
            liquidation_threshold: T::Balance::from(80u32),
            liquidation_penalty: T::Balance::from(5u32),
        };
        CollateralParameters::<T>::insert(pool_id, asset_id, params.clone());
        let new_params = CollateralParams {
            max_ceiling: T::Balance::from(2000u32),
            liquidation_threshold: T::Balance::from(75u32),
            liquidation_penalty: T::Balance::from(10u32),
        };
    }: _(RawOrigin::Root, pool_id, asset_id, new_params)
    verify {
        assert_eq!(CollateralParameters::<T>::get(pool_id, asset_id), Some(new_params));
    }
}

impl_benchmark_test_suite!(
    Pallet,
    crate::mock::new_test_ext(),
    crate::mock::Test,
);