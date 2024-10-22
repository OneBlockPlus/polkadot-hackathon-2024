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
use frame_support::{parameter_types, traits::ConstU32};
use frame_system::{EnsureRoot, EnsureRootWithSuccess};

parameter_types! {
	pub const EnterDuration: BlockNumber = 4 * HOURS;
	pub const EnterDepositAmount: Balance = 2_000_000 * DOLLARS;
	pub const ExtendDuration: BlockNumber = 2 * HOURS;
	pub const ExtendDepositAmount: Balance = 1_000_000 * DOLLARS;
	pub const ReleaseDelay: u32 = 2 * DAYS;
}

impl pallet_safe_mode::Config for Runtime {
	type RuntimeEvent = RuntimeEvent;
	type Currency = pallet_balances::Pallet<Runtime>;
	type RuntimeHoldReason = RuntimeHoldReason;
	type WhitelistedCalls = SafeModeWhitelistedCalls;
	type EnterDuration = EnterDuration;
	type ExtendDuration = ExtendDuration;
	type EnterDepositAmount = EnterDepositAmount;
	type ExtendDepositAmount = ExtendDepositAmount;
	type ForceEnterOrigin = EnsureRootWithSuccess<AccountId, ConstU32<9>>;
	type ForceExtendOrigin = EnsureRootWithSuccess<AccountId, ConstU32<11>>;
	type ForceExitOrigin = EnsureRoot<AccountId>;
	type ForceDepositOrigin = EnsureRoot<AccountId>;
	type Notify = ();
	type ReleaseDelay = ReleaseDelay;
	type WeightInfo = pallet_safe_mode::weights::SubstrateWeight<Runtime>;
}
