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
use frame_support::{traits::ConstU32, parameter_types};
use frame_system::EnsureRoot;
use pallet_identity::legacy::IdentityInfo;

parameter_types! {
	// difference of 26 bytes on-chain for the registration and 9 bytes on-chain for the identity
	// information, already accounted for by the byte deposit
	pub const BasicDeposit: Balance = deposit(1, 17);
	pub const ByteDeposit: Balance = deposit(0, 1);
	pub const SubAccountDeposit: Balance = 2 * DOLLARS;   // 53 bytes on-chain
	pub const MaxSubAccounts: u32 = 100;
	pub const MaxAdditionalFields: u32 = 100;
	pub const MaxRegistrars: u32 = 20;
}

impl pallet_identity::Config for Runtime {
	type RuntimeEvent = RuntimeEvent;
	type Currency = Balances;
	type BasicDeposit = BasicDeposit;
	type ByteDeposit = ByteDeposit;
	type SubAccountDeposit = SubAccountDeposit;
	type MaxSubAccounts = MaxSubAccounts;
	type IdentityInformation = IdentityInfo<MaxAdditionalFields>;
	type MaxRegistrars = MaxRegistrars;
	type Slashed = Treasury;
	type ForceOrigin = EnsureRoot<AccountId>;
	type RegistrarOrigin = EnsureRoot<AccountId>;
	type OffchainSignature = Signature;
	type SigningPublicKey = <Signature as traits::Verify>::Signer;
	type UsernameAuthorityOrigin = EnsureRoot<Self::AccountId>;
	type PendingUsernameExpiration = ConstU32<{ 7 * DAYS }>;
	type MaxSuffixLength = ConstU32<7>;
	type MaxUsernameLength = ConstU32<32>;
	type WeightInfo = pallet_identity::weights::SubstrateWeight<Runtime>;
}
