// This file is part of Cybros.

// Copyright (C) Jun Jiang.
// SPDX-License-Identifier: AGPL-3.0-only

// Cybros is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Cybros is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with Cybros.  If not, see <http://www.gnu.org/licenses/>.

use crate::*;
use frame_support::traits::{ConstBool, ConstU128, ConstU32};
use frame_system::EnsureSigned;

impl pallet_offchain_computing_infra::Config for Runtime {
	type RuntimeEvent = RuntimeEvent;
	type RuntimeHoldReason = RuntimeHoldReason;
	type Currency = pallet_balances::Pallet<Runtime>;
	type UnixTime = pallet_timestamp::Pallet<Runtime>;
	type Randomness = pallet_insecure_randomness_collective_flip::Pallet<Runtime>;
	type ImplId = u32;
	type RegisterImplOrigin = EnsureSigned<Self::AccountId>;
	type RegisterWorkerDeposit = ConstU128<{ 100 * DOLLARS }>;
	type RegisterImplDeposit = ConstU128<{ 100 * DOLLARS }>;
	type ImplMetadataDepositBase = ConstU128<{ DOLLARS }>;
	type ImplMetadataDepositPerByte = ConstU128<{ CENTS }>;
	type ImplMetadataLimit = ConstU32<2048>; // 2KiB
	type MaxImplBuilds = ConstU32<8>;
	type HandleUnresponsivePerBlockLimit = ConstU32<100>;
	type CollectingHeartbeatsDurationInBlocks = ConstU32<300>; // 30min * 60 / 6
	type DisallowOptOutAttestation = ConstBool<false>;
	type WeightInfo = pallet_offchain_computing_infra::weights::SubstrateWeight<Runtime>;
	type OffchainWorkerLifecycleHooks = pallet_offchain_computing_pool::Pallet<Runtime>;
}
