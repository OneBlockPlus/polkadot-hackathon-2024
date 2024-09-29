//! Mocks for the currencies module.

#![cfg(test)]

use super::*;
use frame_support::{
	assert_ok, parameter_types,
	traits::{AsEnsureOriginWithArg, ConstBool, ConstU32, ConstU64, FindAuthor, Nothing},
	weights::constants::RocksDbWeight,
	ConsensusEngineId, PalletId,
};
use ggx_primitives::{currency::CurrencyId, evm::EvmAddress};
use orml_traits::{currency::MutationHooks, parameter_type_with_key};
use pallet_ethereum::PostLogContent;
use pallet_ethereum_checked::EnsureXcmEthereumTx;
use pallet_evm::{AddressMapping, FeeCalculator, GasWeightMapping};
use sp_core::{blake2_256, ConstU128, H160, H256, U256};
use sp_runtime::{
	testing::Header,
	traits::{AccountIdConversion, BlakeTwo256, IdentityLookup},
	AccountId32,
};
use std::str::FromStr;

use crate as currencies;

pub type ReserveIdentifier = [u8; 8];

pub type AccountId = AccountId32;

type UncheckedExtrinsic = frame_system::mocking::MockUncheckedExtrinsic<Test>;

parameter_types! {
	pub BlockWeights: frame_system::limits::BlockWeights =
			frame_system::limits::BlockWeights::simple_max(
				Weight::from_parts(2_000_000_000_000, u64::MAX),
			);
}

impl frame_system::Config for Test {
	type BaseCallFilter = frame_support::traits::Everything;
	type BlockWeights = BlockWeights;
	type BlockLength = ();
	type DbWeight = RocksDbWeight;
	type RuntimeOrigin = RuntimeOrigin;
	type Index = u64;
	type BlockNumber = u64;
	type RuntimeCall = RuntimeCall;
	type Hash = H256;
	type Version = ();
	type Hashing = sp_runtime::traits::BlakeTwo256;
	type AccountId = AccountId;
	type Lookup = IdentityLookup<Self::AccountId>;
	type Header = Header;
	type RuntimeEvent = RuntimeEvent;
	type BlockHashCount = ConstU64<250>;
	type PalletInfo = PalletInfo;
	type AccountData = pallet_balances::AccountData<Balance>;
	type OnNewAccount = ();
	type OnKilledAccount = ();
	type SystemWeightInfo = ();
	type SS58Prefix = ();
	type OnSetCode = ();
	type MaxConsumers = frame_support::traits::ConstU32<16>;
}

type Balance = u128;

impl pallet_timestamp::Config for Test {
	type Moment = u64;
	type OnTimestampSet = ();
	type MinimumPeriod = ConstU64<2>;
	type WeightInfo = ();
}

impl pallet_randomness_collective_flip::Config for Test {}

impl pallet_balances::Config for Test {
	type Balance = Balance;
	type DustRemoval = ();
	type RuntimeEvent = RuntimeEvent;
	type ExistentialDeposit = ConstU128<2>;
	type AccountStore = System;
	type WeightInfo = pallet_balances::weights::SubstrateWeight<Test>;
	type MaxLocks = ConstU32<50>;
	type MaxReserves = ConstU32<2>;
	type ReserveIdentifier = [u8; 8];
	type HoldIdentifier = ();
	type FreezeIdentifier = ();
	type MaxHolds = ConstU32<0>;
	type MaxFreezes = ConstU32<0>;
}

// These parameters dont matter much as this will only be called by root with the forced arguments
// No deposit is substracted with those methods
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
	type AssetId = LocalAssetId;
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
	type AssetIdParameter = LocalAssetId;
	type CallbackHandle = ();
	#[cfg(feature = "runtime-benchmarks")]
	type BenchmarkHelper = ();
}

parameter_type_with_key! {
	pub ExistentialDeposits: |_currency_id: CurrencyId| -> Balance {
		Default::default()
	};
}

parameter_types! {
	pub DustAccount: AccountId = PalletId(*b"orml/dst").into_account_truncating();
}

pub struct CurrencyHooks<T>(marker::PhantomData<T>);
impl<T: orml_tokens::Config> MutationHooks<T::AccountId, T::CurrencyId, T::Balance>
	for CurrencyHooks<T>
where
	T::AccountId: From<AccountId32>,
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
	pub const DepositPerItem: Balance = 1_000;
	pub const DepositPerByte: Balance = 1_000;
	pub const DefaultDepositLimit: Balance = 1_000;
	pub Schedule: pallet_contracts::Schedule<Test> = Default::default();
}

impl pallet_contracts::Config for Test {
	type Time = Timestamp;
	type Randomness = RandomnessCollectiveFlip;
	type Currency = Balances;
	type RuntimeEvent = RuntimeEvent;
	type RuntimeCall = RuntimeCall;
	type CallFilter = Nothing;
	type DepositPerItem = DepositPerItem;
	type DepositPerByte = DepositPerByte;
	type DefaultDepositLimit = DefaultDepositLimit;
	type CallStack = [pallet_contracts::Frame<Self>; 5];
	type WeightPrice = ();
	type WeightInfo = pallet_contracts::weights::SubstrateWeight<Self>;
	type ChainExtension = ();
	type Schedule = Schedule;
	type AddressGenerator = pallet_contracts::DefaultAddressGenerator;
	type MaxCodeLen = ConstU32<{ 123 * 1024 }>;
	type MaxStorageKeyLen = ConstU32<128>;
	type UnsafeUnstableInterface = ConstBool<true>;
	type MaxDebugBufferLen = ConstU32<{ 2 * 1024 * 1024 }>;
}

pub struct MockFeeCalculator;
impl FeeCalculator for MockFeeCalculator {
	fn min_gas_price() -> (U256, Weight) {
		(U256::one(), Weight::zero())
	}
}

pub struct MockFindAuthor;
impl FindAuthor<H160> for MockFindAuthor {
	fn find_author<'a, I>(_digests: I) -> Option<H160>
	where
		I: 'a + IntoIterator<Item = (ConsensusEngineId, &'a [u8])>,
	{
		Some(H160::from_low_u64_be(1))
	}
}

pub struct MockAddressMapping;
impl AddressMapping<AccountId32> for MockAddressMapping {
	fn into_account_id(address: H160) -> AccountId32 {
		if address == alice_evm_addr() {
			return ALICE;
		}
		if address == bob_evm_addr() {
			return BOB;
		}
		if address == charlie_evm_addr() {
			return CHARLIE;
		}

		return pallet_evm::HashedAddressMapping::<BlakeTwo256>::into_account_id(address);
	}
}

pub struct MockAccountMapping;
impl AccountMapping<AccountId32> for MockAccountMapping {
	fn into_h160(account_id: AccountId) -> H160 {
		if account_id == ALICE {
			return alice_evm_addr();
		}
		if account_id == BOB {
			return bob_evm_addr();
		}
		if account_id == CHARLIE {
			return charlie_evm_addr();
		}

		let data = (b"evm:", account_id);
		return H160::from_slice(&data.using_encoded(blake2_256)[0..20]);
	}
}

pub struct MockGasWeightMapping;
impl GasWeightMapping for MockGasWeightMapping {
	fn gas_to_weight(gas: u64, _without_base_weight: bool) -> Weight {
		Weight::from_parts(gas, 0)
	}
	fn weight_to_gas(weight: Weight) -> u64 {
		weight.ref_time()
	}
}

parameter_types! {
	pub WeightPerGas: Weight = Weight::from_parts(1, 0);
	pub const BlockGasLimit: U256 = U256::MAX;
}

impl pallet_evm::Config for Test {
	type FeeCalculator = MockFeeCalculator;
	type GasWeightMapping = pallet_evm::FixedGasWeightMapping<Self>;
	type WeightPerGas = WeightPerGas;
	type BlockHashMapping = pallet_ethereum::EthereumBlockHashMapping<Test>;
	type CallOrigin = pallet_evm::EnsureAddressRoot<AccountId>;
	type WithdrawOrigin = pallet_evm::EnsureAddressTruncated;
	type AddressMapping = MockAddressMapping;
	type Currency = Balances;
	type RuntimeEvent = RuntimeEvent;
	type Runner = pallet_evm::runner::stack::Runner<Self>;
	type PrecompilesType = ();
	type PrecompilesValue = ();
	type ChainId = ConstU64<1024>;
	type OnChargeTransaction = ();
	type BlockGasLimit = BlockGasLimit;
	type OnCreate = ();
	type FindAuthor = MockFindAuthor;
	type Timestamp = Timestamp;
	type WeightInfo = pallet_evm::weights::SubstrateWeight<Test>;
	type GasLimitPovSizeRatio = ConstU64<4>;
}

parameter_types! {
	pub const PostBlockAndTxnHashes: PostLogContent = PostLogContent::BlockAndTxnHashes;
}

impl pallet_ethereum::Config for Test {
	type RuntimeEvent = RuntimeEvent;
	type StateRoot = pallet_ethereum::IntermediateStateRoot<Self>;
	type PostLogContent = PostBlockAndTxnHashes;
	type ExtraDataLength = ConstU32<30>;
}

parameter_types! {
	pub TxWeightLimit: Weight = Weight::from_parts(u64::max_value(), 0);
}

impl pallet_ethereum_checked::Config for Test {
	type ReservedXcmpWeight = TxWeightLimit;
	type XvmTxWeightLimit = TxWeightLimit;
	type InvalidEvmTransactionError = pallet_ethereum::InvalidTransactionWrapper;
	type ValidatedTransaction = pallet_ethereum::ValidatedTransaction<Self>;
	type AccountMapping = MockAccountMapping;
	type XcmTransactOrigin = EnsureXcmEthereumTx<AccountId32>;
	type WeightInfo = ();
}

impl pallet_xvm::Config for Test {
	type GasWeightMapping = MockGasWeightMapping;
	type AccountMapping = MockAddressMapping;
	type EthereumTransact = EthereumChecked;
	type WeightInfo = ();
}

parameter_types! {
	pub const ERC20PalletId: PalletId = PalletId(*b"py/erc20");
}

impl pallet_erc20::Config for Test {
	type Currency = Balances;
	type PalletId = ERC20PalletId;
	type XvmCallApi = Xvm;
}

parameter_types! {
	pub const ERC1155PalletId: PalletId = PalletId(*b"py/e1155");
}

impl pallet_erc1155::Config for Test {
	type Currency = Balances;
	type PalletId = ERC1155PalletId;
	type XvmCallApi = Xvm;
}

impl astar_primitives::ethereum_checked::AccountMapping<AccountId> for MockAddressMapping {
	fn into_h160(account_id: AccountId) -> H160 {
		if account_id == ALICE {
			return alice_evm_addr();
		}
		if account_id == BOB {
			return bob_evm_addr();
		}
		if account_id == CHARLIE {
			return charlie_evm_addr();
		}

		let data = (b"evm:", account_id);
		return H160::from_slice(&data.using_encoded(sp_io::hashing::blake2_256)[0..20]);
	}
}

pub const NATIVE_CURRENCY_ID: CurrencyId = ggx_primitives::currency::CurrencyId::ForeignAsset(1);
pub const X_TOKEN_ID: CurrencyId = ggx_primitives::currency::CurrencyId::ForeignAsset(2);

parameter_types! {
	pub const GetNativeCurrencyId: CurrencyId = NATIVE_CURRENCY_ID;
}

impl Config for Test {
	type MultiCurrency = Tokens;
	type NativeCurrency = AdaptedBasicCurrency;
	type LocalAsset = Assets;
	type GetNativeCurrencyId = GetNativeCurrencyId;
	type WeightInfo = ();
	type AddressMapping = MockAddressMapping;
	type EVMBridge = pallet_erc20::EVMBridge<Test>;
	type EVMERC1155Bridge = pallet_erc1155::EVMBridge<Test>;
}
pub type NativeCurrency = NativeCurrencyOf<Test>;
pub type AdaptedBasicCurrency = BasicCurrencyAdapter<Test, Balances, i64, u64>;

type Block = frame_system::mocking::MockBlock<Test>;

frame_support::construct_runtime!(
	pub enum Test where
		Block = Block,
		NodeBlock = Block,
		UncheckedExtrinsic = UncheckedExtrinsic,
	{
		System: frame_system,
		Timestamp: pallet_timestamp,
		Currencies: currencies,
		Tokens: orml_tokens,
		Balances: pallet_balances,
		Assets: pallet_assets,
		RandomnessCollectiveFlip: pallet_randomness_collective_flip,
		Contracts: pallet_contracts,
		Evm: pallet_evm,
		Ethereum: pallet_ethereum,
		EthereumChecked: pallet_ethereum_checked,
		ERC20: pallet_erc20,
		ERC1155: pallet_erc1155,
		Xvm: pallet_xvm,
	}
);

pub const ALICE: AccountId = AccountId32::new([1u8; 32]);
pub const BOB: AccountId = AccountId32::new([2u8; 32]);
pub const CHARLIE: AccountId = AccountId32::new([3u8; 32]);
pub const EVA: AccountId = AccountId32::new([5u8; 32]);
pub const ID_1: LockIdentifier = *b"1       ";

pub fn alice_evm_addr() -> EvmAddress {
	EvmAddress::from_str("1000000000000000000000000000000000000001").unwrap()
}

pub fn bob_evm_addr() -> EvmAddress {
	EvmAddress::from_str("1000000000000000000000000000000000000002").unwrap()
}

pub fn charlie_evm_addr() -> EvmAddress {
	EvmAddress::from_str("1000000000000000000000000000000000000003").unwrap()
}

pub fn erc20_address() -> EvmAddress {
	EvmAddress::from_str("0x85728369a08dfe6660c7ff2c4f8f011fc1300973").unwrap()
}

pub fn deploy_contracts() {
	System::set_block_number(1);

	//from https://github.com/AcalaNetwork/Acala/blob/master/ts-tests/build/Erc20DemoContract2.json
	let json: serde_json::Value =
		serde_json::from_str(include_str!("../../../node/tests/data/Erc20DemoContract2.json"))
			.unwrap();

	let code = hex::decode(json.get("bytecode").unwrap().as_str().unwrap()).unwrap();

	assert_ok!(Evm::create2(
		RuntimeOrigin::root(),
		alice_evm_addr(),
		code,
		H256::zero(),
		U256::zero(),
		1_000_000_000,
		U256::one(),
		None,
		Some(U256::zero()),
		vec![],
	));

	System::assert_last_event(RuntimeEvent::Evm(pallet_evm::Event::Created {
		address: erc20_address(),
	}));
}

pub fn erc1155_address() -> EvmAddress {
	EvmAddress::from_str("0xb191721ea12518291ada844ae322f7bfb1b030fb").unwrap()
}

pub fn deploy_erc1155_contracts() {
	System::set_block_number(1);

	//Erc1155DemoContract.json build from ethereum-waffle
	let json: serde_json::Value =
		serde_json::from_str(include_str!("../../../node/tests/data/Erc1155DemoContract.json"))
			.unwrap();

	let code = hex::decode(json.get("bytecode").unwrap().as_str().unwrap()).unwrap();

	assert_ok!(Evm::create2(
		RuntimeOrigin::root(),
		alice_evm_addr(),
		code,
		H256::zero(),
		U256::zero(),
		1_000_000_000,
		U256::one(),
		None,
		None,
		vec![],
	));

	System::assert_last_event(RuntimeEvent::Evm(pallet_evm::Event::Created {
		address: erc1155_address(),
	}));
}

#[derive(Default)]
pub struct ExtBuilder {
	balances: Vec<(AccountId, CurrencyId, Balance)>,
}

impl ExtBuilder {
	pub fn balances(mut self, balances: Vec<(AccountId, CurrencyId, Balance)>) -> Self {
		self.balances = balances;
		self
	}

	pub fn one_hundred_for_alice_n_bob(self) -> Self {
		self.balances(vec![
			(ALICE, NATIVE_CURRENCY_ID, 100),
			(BOB, NATIVE_CURRENCY_ID, 100),
			(ALICE, X_TOKEN_ID, 100),
			(BOB, X_TOKEN_ID, 100),
		])
	}

	pub fn build(self) -> sp_io::TestExternalities {
		let mut t = frame_system::GenesisConfig::default().build_storage::<Test>().unwrap();

		pallet_balances::GenesisConfig::<Test> {
			balances: self
				.balances
				.clone()
				.into_iter()
				.filter(|(_, currency_id, _)| *currency_id == NATIVE_CURRENCY_ID)
				.map(|(account_id, _, initial_balance)| (account_id, initial_balance))
				.collect::<Vec<_>>(),
		}
		.assimilate_storage(&mut t)
		.unwrap();

		pallet_assets::GenesisConfig::<Test> {
			assets: vec![
				// id, owner, is_sufficient, min_balance
				(999, AccountId32::from([0u8; 32]), true, 1),
			],
			metadata: vec![
				// id, name, symbol, decimals
				(999, "Bitcoin".into(), "BTC".into(), 8),
			],
			accounts: vec![
				// id, account_id, balance
				(999, ALICE, 1_000_000_000),
				(999, BOB, 1_000_000_000),
			],
		}
		.assimilate_storage(&mut t)
		.ok();

		orml_tokens::GenesisConfig::<Test> {
			balances: self
				.balances
				.into_iter()
				.filter(|(_, currency_id, _)| *currency_id != NATIVE_CURRENCY_ID)
				.collect::<Vec<_>>(),
		}
		.assimilate_storage(&mut t)
		.unwrap();

		t.into()
	}
}
