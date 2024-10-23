// Copyright (C) Moondance Labs Ltd.
// This file is part of Tanssi.

// Tanssi is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Tanssi is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Tanssi.  If not, see <http://www.gnu.org/licenses/>


//! Autogenerated weights for pallet_collator_assignment
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 32.0.0
//! DATE: 2024-06-13, STEPS: `50`, REPEAT: `20`, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! WORST CASE MAP SIZE: `1000000`
//! HOSTNAME: `benchmark-1`, CPU: `Intel(R) Xeon(R) Platinum 8375C CPU @ 2.90GHz`
//! EXECUTION: , WASM-EXECUTION: Compiled, CHAIN: Some("dev"), DB CACHE: 1024

// Executed Command:
// ./target/release/tanssi-node
// benchmark
// pallet
// --execution=wasm
// --wasm-execution=compiled
// --pallet
// pallet_collator_assignment
// --extrinsic
// *
// --chain=dev
// --steps
// 50
// --repeat
// 20
// --template=benchmarking/frame-weight-runtime-template.hbs
// --json-file
// raw.json
// --output
// tmp/dancebox_weights/pallet_collator_assignment.rs

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::{Weight, constants::RocksDbWeight}};
use sp_std::marker::PhantomData;

/// Weights for pallet_collator_assignment using the Substrate node and recommended hardware.
pub struct SubstrateWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> pallet_collator_assignment::WeightInfo for SubstrateWeight<T> {
	/// Storage: `CollatorAssignment::Randomness` (r:1 w:1)
	/// Proof: `CollatorAssignment::Randomness` (`max_values`: Some(1), `max_size`: None, mode: `Measured`)
	/// Storage: `Registrar::PendingParaIds` (r:1 w:0)
	/// Proof: `Registrar::PendingParaIds` (`max_values`: Some(1), `max_size`: None, mode: `Measured`)
	/// Storage: `Registrar::RegisteredParaIds` (r:1 w:0)
	/// Proof: `Registrar::RegisteredParaIds` (`max_values`: Some(1), `max_size`: None, mode: `Measured`)
	/// Storage: `Registrar::ParathreadParams` (r:20 w:0)
	/// Proof: `Registrar::ParathreadParams` (`max_values`: None, `max_size`: None, mode: `Measured`)
	/// Storage: `CollatorAssignment::PendingCollatorContainerChain` (r:1 w:1)
	/// Proof: `CollatorAssignment::PendingCollatorContainerChain` (`max_values`: Some(1), `max_size`: None, mode: `Measured`)
	/// Storage: `ServicesPayment::BlockProductionCredits` (r:20 w:0)
	/// Proof: `ServicesPayment::BlockProductionCredits` (`max_values`: None, `max_size`: Some(24), added: 2499, mode: `MaxEncodedLen`)
	/// Storage: `ServicesPayment::CollatorAssignmentCredits` (r:20 w:20)
	/// Proof: `ServicesPayment::CollatorAssignmentCredits` (`max_values`: None, `max_size`: Some(24), added: 2499, mode: `MaxEncodedLen`)
	/// Storage: `ServicesPayment::MaxTip` (r:20 w:0)
	/// Proof: `ServicesPayment::MaxTip` (`max_values`: None, `max_size`: Some(36), added: 2511, mode: `MaxEncodedLen`)
	/// Storage: `Configuration::PendingConfigs` (r:1 w:0)
	/// Proof: `Configuration::PendingConfigs` (`max_values`: Some(1), `max_size`: None, mode: `Measured`)
	/// Storage: `Configuration::ActiveConfig` (r:1 w:0)
	/// Proof: `Configuration::ActiveConfig` (`max_values`: Some(1), `max_size`: None, mode: `Measured`)
	/// Storage: `Invulnerables::Invulnerables` (r:1 w:0)
	/// Proof: `Invulnerables::Invulnerables` (`max_values`: Some(1), `max_size`: Some(3202), added: 3697, mode: `MaxEncodedLen`)
	/// Storage: `System::BlockWeight` (r:1 w:1)
	/// Proof: `System::BlockWeight` (`max_values`: Some(1), `max_size`: Some(48), added: 543, mode: `MaxEncodedLen`)
	/// Storage: `CollatorAssignment::CollatorContainerChain` (r:0 w:1)
	/// Proof: `CollatorAssignment::CollatorContainerChain` (`max_values`: Some(1), `max_size`: None, mode: `Measured`)
	/// The range of component `x` is `[1, 200]`.
	/// The range of component `y` is `[1, 20]`.
	fn new_session(x: u32, y: u32, ) -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `782 + y * (59 ±0)`
		//  Estimated: `4687 + y * (2535 ±0)`
		// Minimum execution time: 114_292_000 picoseconds.
		Weight::from_parts(49_240_186, 4687)
			// Standard Error: 8_881
			.saturating_add(Weight::from_parts(256_976, 0).saturating_mul(x.into()))
			// Standard Error: 90_432
			.saturating_add(Weight::from_parts(16_716_870, 0).saturating_mul(y.into()))
			.saturating_add(T::DbWeight::get().reads(8_u64))
			.saturating_add(T::DbWeight::get().reads((4_u64).saturating_mul(y.into())))
			.saturating_add(T::DbWeight::get().writes(4_u64))
			.saturating_add(T::DbWeight::get().writes((1_u64).saturating_mul(y.into())))
			.saturating_add(Weight::from_parts(0, 2535).saturating_mul(y.into()))
	}
}