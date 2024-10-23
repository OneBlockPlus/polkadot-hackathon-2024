use crate as pallet_veles;
use frame_support::traits::Time;
use frame_support::{
    derive_impl, parameter_types,
    traits::{ConstU16, ConstU64, Hooks},
};
use frame_system::{self, offchain::SendTransactionTypes};
use sp_runtime::{
    testing::TestXt,
    traits::{BlakeTwo256, IdentityLookup},
    AccountId32, BuildStorage,
};

pub use crate::*;
#[allow(unused_imports)]
pub use common::*;
use frame_support::PalletId;
pub use sp_core::H256;
pub use sp_std::collections::btree_set::BTreeSet;

// Types
type Block = frame_system::mocking::MockBlock<Test>;
type Moment = u64;
pub type AccountId = AccountId32;
pub type Balance = u128;

// Helper functions
pub fn pallet_id() -> AccountId {
    let pallet_id = PalletId(*b"velesplt");

    pallet_id.into_account_truncating()
}

pub fn alice() -> AccountId {
    AccountId::from([1u8; 32])
}

pub fn bob() -> AccountId {
    AccountId::from([2u8; 32])
}

pub fn charlie() -> AccountId {
    AccountId::from([3u8; 32])
}

pub fn dave() -> AccountId {
    AccountId::from([4u8; 32])
}

pub fn fred() -> AccountId {
    AccountId::from([5u8; 32])
}

pub fn george() -> AccountId {
    AccountId::from([6u8; 32])
}

pub fn hank() -> AccountId {
    AccountId::from([7u8; 32])
}

pub fn ian() -> AccountId {
    AccountId::from([8u8; 32])
}

pub fn generate_hash(user: AccountId) -> H256 {
    let nonce = frame_system::Pallet::<Test>::account_nonce(&user);
    let now = <mock::Test as pallet::Config>::Time::now();

    let encoded: [u8; 32] = (&user, nonce, now).using_encoded(blake2_256);

    let hash = H256::from(encoded);

    hash
}

// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
    pub enum Test
    {
        System: frame_system,
        Veles: pallet_veles,
        Timestamp: pallet_timestamp::{Pallet, Call, Storage, Inherent},
        Balances: pallet_balances,
    }
);

pub type MockExtrinsic = TestXt<RuntimeCall, ()>;

impl<LocalCall> SendTransactionTypes<LocalCall> for Test
where
    RuntimeCall: From<LocalCall>,
{
    type Extrinsic = MockExtrinsic;
    type OverarchingCall = RuntimeCall;
}

#[derive_impl(frame_system::config_preludes::TestDefaultConfig as frame_system::DefaultConfig)]
impl frame_system::Config for Test {
    type BaseCallFilter = frame_support::traits::Everything;
    type BlockWeights = ();
    type BlockLength = ();
    type DbWeight = ();
    type RuntimeOrigin = RuntimeOrigin;
    type RuntimeCall = RuntimeCall;
    type Nonce = u64;
    type Hash = H256;
    type Hashing = BlakeTwo256;
    type AccountId = AccountId;
    type Lookup = IdentityLookup<Self::AccountId>;
    type Block = Block;
    type RuntimeEvent = RuntimeEvent;
    type BlockHashCount = ConstU64<250>;
    type Version = ();
    type PalletInfo = PalletInfo;
    type AccountData = pallet_balances::AccountData<Balance>;
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type SystemWeightInfo = ();
    type SS58Prefix = ConstU16<42>;
    type OnSetCode = ();
    type MaxConsumers = frame_support::traits::ConstU32<16>;
}

parameter_types! {
    pub const ExistentialDeposit: u128 = 1;
}

impl pallet_balances::Config for Test {
    type Balance = Balance;
    type DustRemoval = ();
    type RuntimeEvent = RuntimeEvent;
    type ExistentialDeposit = ExistentialDeposit;
    type AccountStore = System;
    type WeightInfo = ();
    type MaxLocks = ();
    type MaxReserves = ();
    type ReserveIdentifier = ();
    type MaxFreezes = ();
    type RuntimeHoldReason = ();
    type FreezeIdentifier = ();
    type RuntimeFreezeReason = ();
}

parameter_types! {
    pub const IPFSLength: u32 = 64;
    pub const BlockFinalizationTime: u32 = 6;
    pub const MinimumPeriod: u64 = 5;
}

impl pallet_timestamp::Config for Test {
    type Moment = Moment;
    type OnTimestampSet = ();
    type MinimumPeriod = MinimumPeriod;
    type WeightInfo = ();
}

/// Configure the Veles pallet
impl pallet_veles::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type IPFSLength = IPFSLength;
    type Time = Timestamp;
    type UnsignedPriority = ConstU64<100>;
    type UnsignedLongevity = ConstU64<100>;
    type BlockFinalizationTime = BlockFinalizationTime;
    type Currency = Balances;
    type WeightInfo = ();
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
    let mut storage = frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap();

    let endowed_accounts: Vec<(AccountId, Balance)> =
        vec![(alice(), 1), (bob(), 100), (charlie(), 5000)];

    pallet_balances::GenesisConfig::<Test> {
        balances: endowed_accounts
            .iter()
            .map(|(acc, balance)| (acc.clone(), *balance))
            .collect(),
    }
    .assimilate_storage(&mut storage)
    .unwrap();

    storage.into()
}

pub fn run_to_block(n: u64) {
    while System::block_number() < n {
        System::on_finalize(System::block_number());
        System::set_block_number(System::block_number() + 1);
        System::on_initialize(System::block_number());
        Veles::on_initialize(System::block_number());
    }
}
