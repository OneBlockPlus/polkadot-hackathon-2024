use crate as pallet_fhe_math;
use frame_support::derive_impl;
use frame_support::pallet_prelude::ConstU32;
use sp_runtime::BuildStorage;

type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
    pub enum Test
    {
        System: frame_system,
        FheMath: pallet_fhe_math,
        RandomnessCollectiveFlip: pallet_insecure_randomness_collective_flip,
    }
);

#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type Block = Block;
}

impl pallet_insecure_randomness_collective_flip::Config for Test {}

impl pallet_fhe_math::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type WeightInfo = ();
    type MaxCiphertextSize = ConstU32<1000000>;
    type MaxCiphertextsPerUser = ConstU32<10>;
    type FheKeySize = ConstU32<17000>;
    type Randomness = RandomnessCollectiveFlip;
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
    frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap()
        .into()
}
