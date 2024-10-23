use frame_support::weights::{Weight, constants::RocksDbWeight};
use sp_std::marker::PhantomData;
use frame_support::traits::Get;

/// Weight functions needed for pallet_reserve.
pub trait WeightInfo {
    fn deposit_collateral() -> Weight;
    fn withdraw_collateral() -> Weight;
    fn liquidate() -> Weight;
}

/// Weights for pallet_reserve using the Substrate node and recommended hardware.
pub struct SubstrateWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> WeightInfo for SubstrateWeight<T> {
    fn deposit_collateral() -> Weight {
        Weight::from_parts(10_000_000, 0)
            .saturating_add(T::DbWeight::get().reads(2))
            .saturating_add(T::DbWeight::get().writes(2))
    }

    fn withdraw_collateral() -> Weight {
        Weight::from_parts(15_000_000, 0)
            .saturating_add(T::DbWeight::get().reads(3))
            .saturating_add(T::DbWeight::get().writes(2))
    }

    fn liquidate() -> Weight {
        Weight::from_parts(25_000_000, 0)
            .saturating_add(T::DbWeight::get().reads(5))
            .saturating_add(T::DbWeight::get().writes(3))
    }
}

// For backwards compatibility and tests
impl WeightInfo for () {
    fn deposit_collateral() -> Weight {
        Weight::from_parts(10_000_000, 0)
            .saturating_add(RocksDbWeight::get().reads(2))
            .saturating_add(RocksDbWeight::get().writes(2))
    }

    fn withdraw_collateral() -> Weight {
        Weight::from_parts(15_000_000, 0)
            .saturating_add(RocksDbWeight::get().reads(3))
            .saturating_add(RocksDbWeight::get().writes(2))
    }

    fn liquidate() -> Weight {
        Weight::from_parts(25_000_000, 0)
            .saturating_add(RocksDbWeight::get().reads(5))
            .saturating_add(RocksDbWeight::get().writes(3))
    }
}