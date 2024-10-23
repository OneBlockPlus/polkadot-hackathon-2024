use crate as pallet_coffees;
use frame_support::traits::Hooks;
use frame_support::{
    derive_impl, parameter_types,
    traits::{ConstU128, ConstU16, ConstU32, ConstU64},
    weights::Weight,
};
use sp_core::{sr25519::Signature, H256};
use sp_runtime::BuildStorage;
use sp_runtime::{
    testing::TestXt,
    traits::{BlakeTwo256, Extrinsic as ExtrinsicT, IdentifyAccount, IdentityLookup, Verify},
};
// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
    pub enum Test
    {
        System: frame_system,
        // 加入 Balances 需要加上相對應Config
        Balances: pallet_balances,
        PalletCoffees: pallet_coffees,
        Random: pallet_insecure_randomness_collective_flip,
    }
);
type Block = frame_system::mocking::MockBlock<Test>;
type Balance = u128;
#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
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
    type AccountId = sp_core::sr25519::Public;
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
    // type Block = Block;
    // type AccountData = pallet_balances::AccountData<Balance>;
    // type AccountId = sp_core::sr25519::Public;
}
#[derive_impl(pallet_balances::config_preludes::TestDefaultConfig)]
impl pallet_balances::Config for Test {
    type Balance = Balance;
    type ExistentialDeposit = ConstU128<500>;
    type AccountStore = System;
}

pub type Extrinsic = TestXt<RuntimeCall, ()>;
type AccountId = <<Signature as Verify>::Signer as IdentifyAccount>::AccountId;

impl frame_system::offchain::SigningTypes for Test {
    type Public = <Signature as Verify>::Signer;
    type Signature = Signature;
}

impl<LocalCall> frame_system::offchain::SendTransactionTypes<LocalCall> for Test
where
    RuntimeCall: From<LocalCall>,
{
    type OverarchingCall = RuntimeCall;
    type Extrinsic = Extrinsic;
}

impl<LocalCall> frame_system::offchain::CreateSignedTransaction<LocalCall> for Test
where
    RuntimeCall: From<LocalCall>,
{
    fn create_transaction<C: frame_system::offchain::AppCrypto<Self::Public, Self::Signature>>(
        call: RuntimeCall,
        _public: <Signature as Verify>::Signer,
        _account: AccountId,
        nonce: u64,
    ) -> Option<(RuntimeCall, <Extrinsic as ExtrinsicT>::SignaturePayload)> {
        Some((call, (nonce, ())))
    }
}

parameter_types! {
    pub const UnsignedPriority: u64 = 1 << 20;
}

impl pallet_coffees::Config for Test {
    type AuthorityId = crate::crypto::TestAuthId;
    type RuntimeEvent = RuntimeEvent;
    type WeightInfo = ();
    type Randomness = Random;
    type Currency = Balances;
    type StakeAmount = ConstU128<200>;
    type MinBidAmount = ConstU128<500>;
    type MinBidIncrement = ConstU128<500>;
    type MinBidBlockSpan = ConstU64<10>;
    type MaxCoffeesBidPerBlock = ConstU32<10>;
    type GracePeriod = ConstU64<5>;
    type UnsignedInterval = ConstU64<128>;
    type UnsignedPriority = UnsignedPriority;
    type MaxPrices = ConstU32<64>;
}

impl pallet_insecure_randomness_collective_flip::Config for Test {}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
    sp_tracing::try_init_simple();
    let mut storage = frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap();
    pallet_balances::GenesisConfig::<Test> {
        balances: vec![
            (
                sp_core::sr25519::Public::from_raw([1u8; 32]),
                10_000_000_000,
            ),
            (
                sp_core::sr25519::Public::from_raw([2u8; 32]),
                10_000_000_000,
            ),
            (
                sp_core::sr25519::Public::from_raw([3u8; 32]),
                10_000_000_000,
            ),
        ],
    }
    .assimilate_storage(&mut storage)
    .unwrap();

    let mut ext = sp_io::TestExternalities::new(storage);
    ext.execute_with(|| System::set_block_number(1));
    ext
}

pub fn run_to_block(n: u64) {
    while System::block_number() < n {
        log::info!("current block: {:?}", System::block_number());
        PalletCoffees::on_finalize(System::block_number());
        System::on_finalize(System::block_number());
        System::set_block_number(System::block_number() + 1);
        System::on_initialize(System::block_number());
        System::offchain_worker(System::block_number());
        PalletCoffees::on_initialize(System::block_number());
        PalletCoffees::on_idle(System::block_number(), Weight::default());
    }
}