use crate as pallet_nft_market;
use frame_support::{
    derive_impl,
    traits::ConstU32,
};
use sp_runtime::{
    traits::{BlakeTwo256, IdentityLookup},
    BuildStorage,
};

type Block = frame_system::mocking::MockBlock<Test>;
type Balance = u128;

// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
    pub enum Test {
        System: frame_system,
        Balances: pallet_balances,
        NftModule: pallet_nft,
        NftMarketModule: pallet_nft_market,
    }
);

#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type BaseCallFilter = frame_support::traits::Everything;
    type BlockWeights = ();
    type BlockLength = ();
    type DbWeight = ();
    type RuntimeOrigin = RuntimeOrigin;
    type RuntimeCall = RuntimeCall;
    type Hashing = BlakeTwo256;
    type AccountId = u64;
    type Lookup = IdentityLookup<Self::AccountId>;
    type Block = Block;
    type RuntimeEvent = RuntimeEvent;
    type Version = ();
    type PalletInfo = PalletInfo;
    type SystemWeightInfo = ();
    type OnSetCode = ();
    type AccountData = pallet_balances::AccountData<Balance>;
}

frame_support::parameter_types! {
	pub const ExistentialDeposit: Balance = 1;
}

impl pallet_balances::Config for Test {
    type MaxLocks = ConstU32<50>;
    type MaxReserves = ();
    type ReserveIdentifier = [u8; 8];
    type Balance = Balance;
    type DustRemoval = ();
    type RuntimeEvent = RuntimeEvent;
    type ExistentialDeposit = ExistentialDeposit;
    type AccountStore = frame_system::Pallet<Test>;
    type WeightInfo = ();
    type FreezeIdentifier = ();
    type MaxFreezes = ();
    type RuntimeHoldReason = ();
    type RuntimeFreezeReason = ();
}

impl pallet_nft::Config for Test {
    type RuntimeEvent = RuntimeEvent;
}

impl pallet_nft_market::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type Currency = Balances;
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
    let mut t = frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap();
   	pallet_balances::GenesisConfig::<Test> {
        balances: vec![
            (0, 1000000),
            (1, 1000000),
            (2, 1000000),
        ],
    }
    .assimilate_storage(&mut t)
    .unwrap();
    t.into()
}
