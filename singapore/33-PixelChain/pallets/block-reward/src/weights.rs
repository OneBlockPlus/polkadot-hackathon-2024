// This file is part of Diora.

// Copyright (C) 2019-2022 Diora-Network.
// SPDX-License-Identifier: GPL-3.0-or-later WITH Classpath-exception-2.0

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::{Weight, constants::RocksDbWeight}};
use sp_std::marker::PhantomData;

/// Weight functions needed for pallet_block_reward.
pub trait WeightInfo {
	fn set_configuration() -> Weight;
}

/// Weights for pallet_block_reward using the Substrate node and recommended hardware.
pub struct SubstrateWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> WeightInfo for SubstrateWeight<T> {
	// Storage: BlockReward RewardDistributionConfigStorage (r:0 w:1)
	// Proof: BlockReward RewardDistributionConfigStorage (max_values: Some(1), max_size: Some(24), added: 519, mode: MaxEncodedLen)
	fn set_configuration() -> Weight {
		// Minimum execution time: 9_085 nanoseconds.
		Weight::from_ref_time(9_328_000)
			.saturating_add(Weight::from_proof_size(0))
			.saturating_add(T::DbWeight::get().writes(1_u64))
	}
}

// For backwards compatibility and tests
impl WeightInfo for () {
	// Storage: BlockReward RewardDistributionConfigStorage (r:0 w:1)
	// Proof: BlockReward RewardDistributionConfigStorage (max_values: Some(1), max_size: Some(24), added: 519, mode: MaxEncodedLen)
	fn set_configuration() -> Weight {
		// Minimum execution time: 9_085 nanoseconds.
		Weight::from_ref_time(9_328_000)
			.saturating_add(Weight::from_proof_size(0))
			.saturating_add(RocksDbWeight::get().writes(1_u64))
	}
}