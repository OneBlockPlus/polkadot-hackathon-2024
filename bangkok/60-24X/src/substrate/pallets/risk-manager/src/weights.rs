use frame_support::weights::{Weight, constants::RocksDbWeight};
use sp_std::marker::PhantomData;
use frame_support::traits::Get;

/// Weight functions needed for pallet_risk_management.
pub trait WeightInfo {
    fn update_pool_parameters() -> Weight;
    fn create_pool() -> Weight;
    fn update_collateral_parameters() -> Weight;
    fn update_global_risk_parameters() -> Weight;
}

/// Weights for pallet_risk_management using the Substrate node and recommended hardware.
pub struct SubstrateWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> WeightInfo for SubstrateWeight<T> {
    fn update_pool_parameters() -> Weight {
        Weight::from_parts(10_000_000, 0)
            .saturating_add(T::DbWeight::get().reads(1))
            .saturating_add(T::DbWeight::get().writes(1))
    }

    fn create_pool() -> Weight {
        Weight::from_parts(10_000_000, 0)
            .saturating_add(T::DbWeight::get().reads(1))
            .saturating_add(T::DbWeight::get().writes(1))
    }

    fn update_collateral_parameters() -> Weight {
        Weight::from_parts(10_000_000, 0)
            .saturating_add(T::DbWeight::get().reads(1))
            .saturating_add(T::DbWeight::get().writes(1))
    }

    fn update_global_risk_parameters() -> Weight {
        Weight::from_parts(10_000_000, 0)
            .saturating_add(T::DbWeight::get().reads(1))
            .saturating_add(T::DbWeight::get().writes(1))
    }
}

// For backwards compatibility and tests
impl WeightInfo for () {
    fn update_pool_parameters() -> Weight {
        Weight::from_parts(10_000_000, 0)
            .saturating_add(RocksDbWeight::get().reads(1))
            .saturating_add(RocksDbWeight::get().writes(1))
    }

    fn create_pool() -> Weight {
        Weight::from_parts(10_000_000, 0)
            .saturating_add(RocksDbWeight::get().reads(1))
            .saturating_add(RocksDbWeight::get().writes(1))
    }

    fn update_collateral_parameters() -> Weight {
        Weight::from_parts(10_000_000, 0)
            .saturating_add(RocksDbWeight::get().reads(1))
            .saturating_add(RocksDbWeight::get().writes(1))
    }

    fn update_global_risk_parameters() -> Weight {
        Weight::from_parts(10_000_000, 0)
            .saturating_add(RocksDbWeight::get().reads(1))
            .saturating_add(RocksDbWeight::get().writes(1))
    }
}
