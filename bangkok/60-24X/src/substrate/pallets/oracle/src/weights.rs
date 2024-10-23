use frame_support::weights::Weight;
use sp_std::marker::PhantomData;
use frame_support::traits::Get;

/// Weight functions needed for pallet_oracle.
pub trait WeightInfo {
    fn update_price() -> Weight;
    fn add_price_source() -> Weight;
    fn remove_price_source() -> Weight;
    fn set_staleness_threshold() -> Weight;
    fn set_minimum_sources() -> Weight;
}

/// Weights for pallet_oracle using the Substrate node and recommended hardware.
pub struct SubstrateWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> WeightInfo for SubstrateWeight<T> {
    fn update_price() -> Weight {
        Weight::from_parts(10_000_000, 0)
            .saturating_add(T::DbWeight::get().reads(1))
            .saturating_add(T::DbWeight::get().writes(1))
    }

    fn add_price_source() -> Weight {
        Weight::from_parts(15_000_000, 0)
            .saturating_add(T::DbWeight::get().reads(1))
            .saturating_add(T::DbWeight::get().writes(1))
    }

    fn remove_price_source() -> Weight {
        Weight::from_parts(15_000_000, 0)
            .saturating_add(T::DbWeight::get().reads(1))
            .saturating_add(T::DbWeight::get().writes(1))
    }

    fn set_staleness_threshold() -> Weight {
        Weight::from_parts(5_000_000, 0)
            .saturating_add(T::DbWeight::get().writes(1))
    }

    fn set_minimum_sources() -> Weight {
        Weight::from_parts(5_000_000, 0)
            .saturating_add(T::DbWeight::get().writes(1))
    }
}