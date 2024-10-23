use crate as credit_score;
use frame_support::{
    derive_impl, parameter_types,
    traits::{ConstU128, ConstU16, ConstU32, ConstU64},
    weights::Weight,
};
use sp_runtime::BuildStorage;

type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
	pub enum Test
	{
		System: frame_system,
		Random: pallet_insecure_randomness_collective_flip,
		CreditScore: credit_score,
	}
);

#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
	type Block = Block;
}

impl pallet_insecure_randomness_collective_flip::Config for Test {}

impl credit_score::Config for Test {
	type RuntimeEvent = RuntimeEvent;
	type WeightInfo = ();
	type GracePeriod = ConstU64<5>;
	type MaximumOwned = ConstU32<64>;
	// type Randomness = Random;
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
	frame_system::GenesisConfig::<Test>::default().build_storage().unwrap().into()
}
