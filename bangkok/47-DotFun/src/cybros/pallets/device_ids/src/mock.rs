// This file is part of Substrate.

// Copyright (C) Parity Technologies (UK) Ltd.
// SPDX-License-Identifier: Apache-2.0

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// 	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//! Test environment for the pallet.

use super::*;
use crate as pallet_device_ids;

use frame_support::{
	construct_runtime, derive_impl, parameter_types,
	pallet_prelude::Weight,
	traits::{AsEnsureOriginWithArg, Everything, ConstBool, ConstU16, ConstU32, ConstU64}
};
use sp_keystore::{testing::MemoryKeystore, KeystoreExt};
use sp_runtime::{
	traits::{Convert, IdentifyAccount, IdentityLookup, Verify},
	BuildStorage, MultiSignature, Perbill,
};
use pallet_contracts::{DefaultAddressGenerator, Frame, Schedule};

type Block = frame_system::mocking::MockBlock<Test>;

construct_runtime!(
	pub enum Test
	{
		System: frame_system,
		Balances: pallet_balances,
		Timestamp: pallet_timestamp,
		Randomness: pallet_insecure_randomness_collective_flip,
		Contracts: pallet_contracts,
		DeviceIds: pallet_device_ids,
	}
);

pub type Balance = u64;

pub type Signature = MultiSignature;
pub type AccountPublic = <Signature as Verify>::Signer;
pub type AccountId = <AccountPublic as IdentifyAccount>::AccountId;

pub(crate) const MILLI_CENTS: Balance = 1;
pub(crate) const CENTS: Balance = 1_000 * MILLI_CENTS;
pub(crate) const DOLLARS: Balance = 100 * CENTS;

#[derive_impl(frame_system::config_preludes::TestDefaultConfig as frame_system::DefaultConfig)]
impl frame_system::Config for Test {
	type AccountId = AccountId;
	type Lookup = IdentityLookup<Self::AccountId>;
	type Block = Block;
	type PalletInfo = PalletInfo;
	type AccountData = pallet_balances::AccountData<Balance>;
	type SS58Prefix = ConstU16<42>;
	type MaxConsumers = ConstU32<16>;
}

impl pallet_balances::Config for Test {
	type Balance = Balance;
	type DustRemoval = ();
	type RuntimeEvent = RuntimeEvent;
	type ExistentialDeposit = ConstU64<1>;
	type AccountStore = System;
	type WeightInfo = ();
	type MaxLocks = ();
	type MaxReserves = ConstU32<50>;
	type ReserveIdentifier = [u8; 8];
	type FreezeIdentifier = ();
	type MaxFreezes = ();
	type RuntimeHoldReason = RuntimeHoldReason;
	type RuntimeFreezeReason = RuntimeFreezeReason;
	type MaxHolds = ConstU32<2>;
}

impl pallet_timestamp::Config for Test {
	type Moment = u64;
	type OnTimestampSet = ();
	type MinimumPeriod = ConstU64<5>;
	type WeightInfo = ();
}

impl pallet_insecure_randomness_collective_flip::Config for Test {}

pub type ContractsBalanceOf<T> = <<T as pallet_contracts::Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

parameter_types! {
	pub MySchedule: Schedule<Test> = {
		let schedule = <Schedule<Test>>::default();
		schedule
	};
	pub static DepositPerByte: ContractsBalanceOf<Test> = 1;
	pub const DepositPerItem: ContractsBalanceOf<Test> = 2;
	pub static MaxDelegateDependencies: u32 = 32;

	pub static CodeHashLockupDepositPercent: Perbill = Perbill::from_percent(0);
	// We need this one set high enough for running benchmarks.
	pub static DefaultDepositLimit: ContractsBalanceOf<Test> = 1 * DOLLARS;
}

impl Convert<Weight, ContractsBalanceOf<Test>> for Test {
	fn convert(w: Weight) -> ContractsBalanceOf<Test> {
		w.ref_time().into()
	}
}

impl pallet_contracts::Config for Test {
	type Time = Timestamp;
	type Randomness = Randomness;
	type Currency = Balances;
	type RuntimeEvent = RuntimeEvent;
	type RuntimeCall = RuntimeCall;
	type CallFilter = Everything;
	type CallStack = [Frame<Test>; 5];
	type WeightPrice = Test;
	type WeightInfo = ();
	type ChainExtension = ();
	type Schedule = MySchedule;
	type DepositPerByte = DepositPerByte;
	type DepositPerItem = DepositPerItem;
	type DefaultDepositLimit = DefaultDepositLimit;
	type AddressGenerator = DefaultAddressGenerator;
	type MaxCodeLen = ConstU32<{ 123 * 1024 }>;
	type MaxStorageKeyLen = ConstU32<128>;
	type UnsafeUnstableInterface = ConstBool<false>;
	type MaxDebugBufferLen = ConstU32<{ 2 * 1024 * 1024 }>;
	type RuntimeHoldReason = RuntimeHoldReason;
	type Migrations = ();
	type CodeHashLockupDepositPercent = CodeHashLockupDepositPercent;
	type MaxDelegateDependencies = MaxDelegateDependencies;
	type Debug = ();
	type Environment = ();
	type Xcm = ();
}

impl pallet_device_ids::Config for Test {
	type RuntimeEvent = RuntimeEvent;
	type ProductId = u32;
	type DeviceId = u32;
	type Currency = Balances;
	type CreateOrigin = AsEnsureOriginWithArg<frame_system::EnsureSigned<Self::AccountId>>;
	type ForceOrigin = frame_system::EnsureRoot<Self::AccountId>;
	type Locker = ();
	type ProductEntryDeposit = ConstU64<2>;
	type DeviceEntryDeposit = ConstU64<1>;
	type MetadataDepositBase = ConstU64<1>;
	type AttributeDepositBase = ConstU64<1>;
	type DepositPerByte = ConstU64<1>;
	type StringLimit = ConstU32<50>;
	type KeyLimit = ConstU32<50>;
	type ValueLimit = ConstU32<50>;
	type DeviceAttributesApprovalsLimit = ConstU32<2>;
	type MaxAttributesPerCall = ConstU32<2>;
	/// Off-chain = signature On-chain - therefore no conversion needed.
	/// It needs to be From<MultiSignature> for benchmarking.
	type OffchainSignature = Signature;
	/// Using `AccountPublic` here makes it trivial to convert to `AccountId` via `into_account()`.
	type OffchainPublic = AccountPublic;
	type WeightInfo = ();
	#[cfg(feature = "runtime-benchmarks")]
	type Helper = ();
}

pub(crate) fn new_test_ext() -> sp_io::TestExternalities {
	let t = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();

	let mut ext = sp_io::TestExternalities::new(t);
	ext.register_extension(KeystoreExt::new(MemoryKeystore::new()));
	ext.execute_with(|| System::set_block_number(1));
	ext
}
