#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]
#![allow(missing_docs)]

use frame_support::{traits::Get, weights::{Weight, constants::RocksDbWeight}};
use core::marker::PhantomData;

/// Weight functions - pallet_coffees.
pub trait WeightInfo {
	fn create() -> Weight;
	fn breed() -> Weight;
	fn transfer() -> Weight;
	fn sale() -> Weight;
	fn bid() -> Weight;
}

/// Weights for pallet_coffees using the Substrate node and recommended hardware.
pub struct SubstrateWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> WeightInfo for SubstrateWeight<T> {
		fn create() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `150`
		//  Estimated: `4079`
		// Minimum execution time: 60_000_000 picoseconds.
		Weight::from_parts(61_000_000, 4079)
			.saturating_add(T::DbWeight::get().reads(2_u64))
			.saturating_add(T::DbWeight::get().writes(3_u64))
	}
		fn breed() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `407`
		//  Estimated: `6044`
		// Minimum execution time: 82_000_000 picoseconds.
		Weight::from_parts(82_000_000, 6044)
			.saturating_add(T::DbWeight::get().reads(6_u64))
			.saturating_add(T::DbWeight::get().writes(3_u64))
	}
		fn transfer() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `347`
		//  Estimated: `3593`
		// Minimum execution time: 82_000_000 picoseconds.
		Weight::from_parts(87_000_000, 3593)
			.saturating_add(T::DbWeight::get().reads(3_u64))
			.saturating_add(T::DbWeight::get().writes(2_u64))
	}
		fn sale() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `244`
		//  Estimated: `3534`
		// Minimum execution time: 40_000_000 picoseconds.
		Weight::from_parts(41_000_000, 3534)
			.saturating_add(T::DbWeight::get().reads(3_u64))
			.saturating_add(T::DbWeight::get().writes(2_u64))
	}
	fn bid() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `427`
		//  Estimated: `3593`
		// Minimum execution time: 63_000_000 picoseconds.
		Weight::from_parts(66_000_000, 3593)
			.saturating_add(T::DbWeight::get().reads(3_u64))
			.saturating_add(T::DbWeight::get().writes(2_u64))
	}
}

// For backwards compatibility and tests.
impl WeightInfo for () {
		fn create() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `150`
		//  Estimated: `4079`
		// Minimum execution time: 60_000_000 picoseconds.
		Weight::from_parts(61_000_000, 4079)
			.saturating_add(RocksDbWeight::get().reads(2_u64))
			.saturating_add(RocksDbWeight::get().writes(3_u64))
	}
		fn breed() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `407`
		//  Estimated: `6044`
		// Minimum execution time: 82_000_000 picoseconds.
		Weight::from_parts(82_000_000, 6044)
			.saturating_add(RocksDbWeight::get().reads(6_u64))
			.saturating_add(RocksDbWeight::get().writes(3_u64))
	}
		fn transfer() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `347`
		//  Estimated: `3593`
		// Minimum execution time: 82_000_000 picoseconds.
		Weight::from_parts(87_000_000, 3593)
			.saturating_add(RocksDbWeight::get().reads(3_u64))
			.saturating_add(RocksDbWeight::get().writes(2_u64))
	}
		fn sale() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `244`
		//  Estimated: `3534`
		// Minimum execution time: 40_000_000 picoseconds.
		Weight::from_parts(41_000_000, 3534)
			.saturating_add(RocksDbWeight::get().reads(3_u64))
			.saturating_add(RocksDbWeight::get().writes(2_u64))
	}
		fn bid() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `427`
		//  Estimated: `3593`
		// Minimum execution time: 63_000_000 picoseconds.
		Weight::from_parts(66_000_000, 3593)
			.saturating_add(RocksDbWeight::get().reads(3_u64))
			.saturating_add(RocksDbWeight::get().writes(2_u64))
	}
}