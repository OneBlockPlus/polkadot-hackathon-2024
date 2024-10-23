use crate as pallet_cdao_membership;
use frame_support::traits::Hooks;
use frame_support::{
    derive_impl,
    traits::{ConstU16, ConstU64},
    weights::Weight,
};
use sp_core::H256;
use sp_runtime::{
    traits::{BlakeTwo256, IdentityLookup},
    BuildStorage,
};
type Block = frame_system::mocking::MockBlock<Test>;

type ConstU32<const N: u32> = sp_runtime::traits::ConstU32<N>; // 最大条目数字使用

// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
    pub enum Test
    {
        System: frame_system,
        CDaomembership: pallet_cdao_membership,
       // Random: pallet_insecure_randomness_collective_flip,
    }
);

#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type BaseCallFilter = frame_support::traits::Everything;
    type BlockWeights = ();
    type BlockLength = ();
    type DbWeight = ();
    type RuntimeOrigin = self::RuntimeOrigin;
    type RuntimeCall = self::RuntimeCall;
    type Nonce = u64;
    type Hash = H256;
    type Hashing = BlakeTwo256;
    type AccountId = u64;
    type Lookup = IdentityLookup<Self::AccountId>;
    type Block = Block;
    type RuntimeEvent = self::RuntimeEvent;
    type BlockHashCount = ConstU64<250>;
    type Version = ();
    type PalletInfo = self::PalletInfo;
    type AccountData = ();
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type SystemWeightInfo = ();
    type SS58Prefix = ConstU16<42>;
    type OnSetCode = ();
    type MaxConsumers = frame_support::traits::ConstU32<16>;
}

impl pallet_cdao_membership::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type WeightInfo = (); 
   // 最大名称长度为 128
    type MaxNameLength = ConstU32<128>; 
    // 最大成员数量为 8096
    type MaxMemberships = ConstU32<8096>; 
}

impl pallet_insecure_randomness_collective_flip::Config for Test {}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
    sp_tracing::try_init_simple();
    frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap()
        .into()
}

pub fn run_to_block(n: u64) {
    while System::block_number() < n {

        /*

        log::info!("current block: {:?}", System::block_number());
        Kitties::on_finalize(System::block_number());
        System::on_finalize(System::block_number());
        System::set_block_number(System::block_number() + 1);
        System::on_initialize(System::block_number());
        Kitties::on_initialize(System::block_number());
        Kitties::on_idle(System::block_number(), Weight::default());


          */
    }
}
