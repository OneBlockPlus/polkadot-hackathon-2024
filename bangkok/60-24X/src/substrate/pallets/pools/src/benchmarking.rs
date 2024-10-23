#![cfg(feature = "runtime-benchmarks")]

use super::*;
use frame_benchmarking::v2::*;
use frame_system::RawOrigin;

#[benchmarks]
mod benchmarks {
    use super::*;

    #[benchmark]
    fn create_pool() {
        let caller: T::AccountId = whitelisted_caller();
        let pool_id = T::PoolId::default();
        let synthetic_asset = T::AssetId::default();
        let initial_parameters = PoolParams {
            debt_ceiling: 1_000_000u32.into(),
            min_mint_amount: 100u32.into(),
        };

        #[extrinsic_call]
        create_pool(RawOrigin::Signed(caller), pool_id, synthetic_asset, initial_parameters);

        assert!(PoolParameters::<T>::contains_key(pool_id));
    }

    #[benchmark]
    fn mint() {
        let caller: T::AccountId = whitelisted_caller();
        let pool_id = T::PoolId::default();
        let synthetic_asset = T::AssetId::default();
        let initial_parameters = PoolParams {
            debt_ceiling: 1_000_000u32.into(),
            min_mint_amount: 100u32.into(),
        };

        create_pool(RawOrigin::Signed(caller.clone()).into(), pool_id, synthetic_asset, initial_parameters).unwrap();

        T::RiskManagement::set_can_mint(true);
        T::Reserve::set_can_lock_collateral(true);
        T::Fungibles::create(synthetic_asset, caller.clone(), true, 1u32.into()).unwrap();

        let amount = 1000u32.into();

        #[extrinsic_call]
        mint(RawOrigin::Signed(caller), pool_id, amount);

        assert!(UserDebt::<T>::contains_key(pool_id, caller));
    }

    #[benchmark]
    fn burn() {
        let caller: T::AccountId = whitelisted_caller();
        let pool_id = T::PoolId::default();
        let synthetic_asset = T::AssetId::default();
        let initial_parameters = PoolParams {
            debt_ceiling: 1_000_000u32.into(),
            min_mint_amount: 100u32.into(),
        };

        create_pool(RawOrigin::Signed(caller.clone()).into(), pool_id, synthetic_asset, initial_parameters).unwrap();

        T::RiskManagement::set_can_mint(true);
        T::Reserve::set_can_lock_collateral(true);
        T::Fungibles::create(synthetic_asset, caller.clone(), true, 1u32.into()).unwrap();

        let amount = 1000u32.into();
        mint(RawOrigin::Signed(caller.clone()).into(), pool_id, amount).unwrap();

        #[extrinsic_call]
        burn(RawOrigin::Signed(caller), pool_id, amount);

        assert_eq!(UserDebt::<T>::get(pool_id, caller), 0u32.into());
    }

    impl_benchmark_test_suite!(Pallet, crate::mock::new_test_ext(), crate::mock::Test);
}