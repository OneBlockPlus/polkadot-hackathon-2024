#![cfg(feature = "runtime-benchmarks")]

use super::*;
use frame_benchmarking::{account, benchmarks, impl_benchmark_test_suite, whitelisted_caller};
use frame_system::RawOrigin;

benchmarks! {
    update_price {
        let caller: T::AccountId = whitelisted_caller();
        let asset_id: T::AssetId = 1u32.into();
        Oracle::<T>::add_price_source(RawOrigin::Root.into(), asset_id, caller.clone())?;
    }: _(RawOrigin::Signed(caller), asset_id, 100u32.into())

    add_price_source {
        let asset_id: T::AssetId = 1u32.into();
        let provider: T::AccountId = account("provider", 0, 0);
    }: _(RawOrigin::Root, asset_id, provider)

    remove_price_source {
        let asset_id: T::AssetId = 1u32.into();
        let provider: T::AccountId = account("provider", 0, 0);
        Oracle::<T>::add_price_source(RawOrigin::Root.into(), asset_id, provider.clone())?;
    }: _(RawOrigin::Root, asset_id, provider)

    set_staleness_threshold {
        let asset_id: T::AssetId = 1u32.into();
    }: _(RawOrigin::Root, asset_id, 100u32.into())

    set_minimum_sources {
        let asset_id: T::AssetId = 1u32.into();
    }: _(RawOrigin::Root, asset_id, 3u32)
}

impl_benchmark_test_suite!(Oracle, crate::mock::new_test_ext(), crate::mock::Test);