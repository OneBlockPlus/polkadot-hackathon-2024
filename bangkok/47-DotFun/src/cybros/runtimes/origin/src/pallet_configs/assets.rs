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
use frame_support::{
    parameter_types,
    traits::{AsEnsureOriginWithArg, ConstU32, ConstU128},
    instances::Instance1,
};
use frame_system::{EnsureRoot, EnsureSigned};

parameter_types! {
	pub const AssetDeposit: Balance = 100 * DOLLARS;
	pub const AssetApprovalDeposit: Balance = 1 * DOLLARS;
	pub const AssetStringLimit: u32 = 50;
	pub const AssetMetadataDepositBase: Balance = 10 * DOLLARS;
	pub const AssetMetadataDepositPerByte: Balance = 1 * DOLLARS;
}

impl pallet_assets::Config<Instance1> for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type Balance = u128;
    type RemoveItemsLimit = ConstU32<1000>;
    type AssetId = u32;
    type AssetIdParameter = scale_codec::Compact<u32>;
    type Currency = Balances;
    type CreateOrigin = AsEnsureOriginWithArg<EnsureSigned<AccountId>>;
    type ForceOrigin = EnsureRoot<AccountId>;
    type AssetDeposit = AssetDeposit;
    type AssetAccountDeposit = ConstU128<DOLLARS>;
    type MetadataDepositBase = AssetMetadataDepositBase;
    type MetadataDepositPerByte = AssetMetadataDepositPerByte;
    type ApprovalDeposit = AssetApprovalDeposit;
    type StringLimit = AssetStringLimit;
    type Freezer = ();
    type Extra = ();
    type CallbackHandle = ();
    type WeightInfo = pallet_assets::weights::SubstrateWeight<Runtime>;
    #[cfg(feature = "runtime-benchmarks")]
    type BenchmarkHelper = ();
}
