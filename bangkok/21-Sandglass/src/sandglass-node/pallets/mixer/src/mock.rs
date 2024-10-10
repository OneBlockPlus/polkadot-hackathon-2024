use crate as pallet_mixer;
use crate::Event;
use frame_support::{
	derive_impl, parameter_types,
	traits::{AsEnsureOriginWithArg, ConstU128, ConstU16, ConstU32, ConstU64, Nothing},
	PalletId,
};
use orml_traits::{currency::MutationHooks, parameter_type_with_key};
use pallet_currencies::BasicCurrencyAdapter;
use primitives::currency::{CurrencyId, TokenSymbol};
use sp_core::H256;
use sp_runtime::{
	traits::{AccountIdConversion, BlakeTwo256, IdentityLookup},
	BuildStorage,
};
use sp_std::marker;

pub type Balance = u128;
pub type AssetId = u32;
pub type AccountId = u64;
type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
	pub enum Test
	{
		System: frame_system,
		Timestamp: pallet_timestamp,
		Balances: pallet_balances,
		Assets: pallet_assets,
		Currencies: pallet_currencies,
		Tokens: orml_tokens,
		Swap: pallet_swap,
		Otp: pallet_otp,
		MixerModule: pallet_mixer,
	}
);

#[derive_impl(frame_system::config_preludes::TestDefaultConfig as frame_system::DefaultConfig)]
impl frame_system::Config for Test {
	type BaseCallFilter = frame_support::traits::Everything;
	type BlockWeights = ();
	type BlockLength = ();
	type DbWeight = ();
	type RuntimeOrigin = RuntimeOrigin;
	type RuntimeCall = RuntimeCall;
	type RuntimeTask = RuntimeTask;
	type Nonce = u64;
	type Hash = H256;
	type Hashing = BlakeTwo256;
	type AccountId = u64;
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

impl pallet_balances::Config for Test {
	type Balance = Balance;
	type DustRemoval = ();
	type RuntimeEvent = RuntimeEvent;
	type ExistentialDeposit = ConstU128<1>;
	type AccountStore = System;
	type WeightInfo = pallet_balances::weights::SubstrateWeight<Test>;
	type MaxLocks = ConstU32<50>;
	type MaxReserves = ();
	type ReserveIdentifier = [u8; 8];
	type FreezeIdentifier = ();
	type MaxFreezes = ConstU32<0>;
	type RuntimeHoldReason = ();
	type RuntimeFreezeReason = ();
}

impl pallet_timestamp::Config for Test {
	/// A timestamp: milliseconds since the unix epoch.
	type Moment = u64;
	type OnTimestampSet = ();
	type MinimumPeriod = ();
	type WeightInfo = ();
}

parameter_types! {
	pub DustAccount: AccountId = PalletId(*b"orml/dst").into_account_truncating();
}

pub struct CurrencyHooks<T>(marker::PhantomData<T>);
impl<T: orml_tokens::Config> MutationHooks<T::AccountId, T::CurrencyId, T::Balance>
	for CurrencyHooks<T>
where
	T::AccountId: From<AccountId>,
{
	type OnDust = orml_tokens::TransferDust<T, DustAccount>;
	type OnSlash = ();
	type PreDeposit = ();
	type PostDeposit = ();
	type PreTransfer = ();
	type PostTransfer = ();
	type OnNewTokenAccount = ();
	type OnKilledTokenAccount = ();
}

pub type ReserveIdentifier = [u8; 8];

parameter_type_with_key! {
	pub ExistentialDeposits: |_currency_id: CurrencyId| -> Balance {
		Default::default()
	};
}

impl orml_tokens::Config for Test {
	type RuntimeEvent = RuntimeEvent;
	type Balance = Balance;
	type Amount = i64;
	type CurrencyId = CurrencyId;
	type WeightInfo = ();
	type ExistentialDeposits = ExistentialDeposits;
	type CurrencyHooks = CurrencyHooks<Test>;
	type MaxLocks = ConstU32<100_000>;
	type MaxReserves = ConstU32<100_000>;
	type ReserveIdentifier = ReserveIdentifier;
	type DustRemovalWhitelist = Nothing;
}

parameter_types! {
  pub const AssetDeposit: Balance = 0;
  pub const AssetAccountDeposit: Balance = 0;
  pub const ApprovalDeposit: Balance = 0;
  pub const AssetsStringLimit: u32 = 50;
  pub const MetadataDepositBase: Balance = 0;
  pub const MetadataDepositPerByte: Balance = 0;
}

impl pallet_assets::Config for Test {
	type RuntimeEvent = RuntimeEvent;
	type Balance = Balance;
	type AssetId = AssetId;
	type Currency = Balances;
	type ForceOrigin = frame_system::EnsureRoot<AccountId>;
	type AssetDeposit = AssetDeposit;
	type AssetAccountDeposit = AssetAccountDeposit;
	type MetadataDepositBase = MetadataDepositBase;
	type MetadataDepositPerByte = MetadataDepositPerByte;
	type ApprovalDeposit = ApprovalDeposit;
	type StringLimit = AssetsStringLimit;
	type Freezer = ();
	type Extra = ();
	type CreateOrigin = AsEnsureOriginWithArg<frame_system::EnsureSigned<AccountId>>;
	type WeightInfo = pallet_assets::weights::SubstrateWeight<Test>;
	type RemoveItemsLimit = ConstU32<0>;
	type AssetIdParameter = AssetId;
	type CallbackHandle = ();
	#[cfg(feature = "runtime-benchmarks")]
	type BenchmarkHelper = ();
}

pub type AdaptedBasicCurrency = BasicCurrencyAdapter<Test, Balances, i64, u64>;
parameter_types! {
	pub const NativeCurrencyId: CurrencyId = CurrencyId::VToken(TokenSymbol::DOT);
}

impl pallet_currencies::Config for Test {
	type MultiCurrency = Tokens;
	type NativeCurrency = AdaptedBasicCurrency;
	type LocalAsset = Assets;
	type GetNativeCurrencyId = NativeCurrencyId;
	type WeightInfo = ();
}

impl pallet_swap::Config for Test {
	type RuntimeEvent = RuntimeEvent;
	type WeightInfo = ();
	type Currency = Currencies;
}

impl pallet_otp::Config for Test {
	type RuntimeEvent = RuntimeEvent;
	type WeightInfo = ();
	type MaxPublicInputsLength = ConstU32<3000>;
	type MaxProofLength = ConstU32<5000>;
	type MaxVerificationKeyLength = ConstU32<5000>;
	type TimeProvider = pallet_timestamp::Pallet<Test>;
}

parameter_types! {
	pub const MixerPalletId: PalletId = PalletId(*b"py/mixer");
	pub const MaxPublicInputsLength: u32 = 3000;
	pub const MaxVerificationKeyLength: u32 = 5000;
	pub const MaxProofLength: u32 = 5000;
	pub const MixerBalance: Balance = 1_000;
}

impl pallet_mixer::Config for Test {
	type RuntimeEvent = RuntimeEvent;
	type WeightInfo = ();
	type MaxPublicInputsLength = MaxPublicInputsLength;
	type MaxProofLength = MaxProofLength;
	type MaxVerificationKeyLength = MaxVerificationKeyLength;
	type PalletId = MixerPalletId;
	type Currency = Balances;
	type MixerBalance = MixerBalance;
	type SwapApi = Swap;
	type OtpApi = Otp;
}

pub struct ExtBuilder;

impl Default for ExtBuilder {
	fn default() -> Self {
		ExtBuilder
	}
}

impl ExtBuilder {
	pub fn build(self) -> sp_io::TestExternalities {
		let mut storage = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();

		// This will cause some initial issuance
		pallet_balances::GenesisConfig::<Test> {
			balances: vec![(1, 5_000), (2, 5_000), (3, 5_000)],
		}
		.assimilate_storage(&mut storage)
		.ok();

		let mut ext = sp_io::TestExternalities::new(storage);
		ext.execute_with(|| System::set_block_number(1));
		ext
	}
}

pub fn new_test_ext() -> sp_io::TestExternalities {
	ExtBuilder::default().build()
}

pub fn zk_events() -> Vec<Event<Test>> {
	System::events()
		.into_iter()
		.map(|r| r.event)
		.filter_map(|e| if let RuntimeEvent::MixerModule(inner) = e { Some(inner) } else { None })
		.collect()
}
