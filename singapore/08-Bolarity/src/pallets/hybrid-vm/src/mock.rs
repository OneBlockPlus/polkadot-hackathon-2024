// Copyright (C) HybridVM.
// This file is part of HybridVM.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use super::*;

use byte_slice_cast::AsByteSlice;
use fp_account::AccountId20;
use fp_evm::Precompile;
use frame_support::{
    derive_impl,
    dispatch::DispatchClass,
    pallet_prelude::*,
    parameter_types,
    traits::{ConstU128, ConstU32, ConstU64, FindAuthor, Get},
    weights::Weight,
    ConsensusEngineId,
};
use frame_system::pallet_prelude::*;
use hp_system::{AccountIdMapping, EvmHybridVMExtension, U256BalanceMapping};
use pallet_evm::{
    AddressMapping, BalanceOf, EnsureAccountId20, FeeCalculator, GasWeightMapping,
    IdentityAddressMapping, IsPrecompileResult, PrecompileHandle, PrecompileResult, PrecompileSet,
};
use pallet_evm_precompile_simple::{ECRecover, Identity, Ripemd160, Sha256};
use sp_core::{ConstBool, H256, U256};
use sp_runtime::{
    traits::{BlakeTwo256, Convert, IdentityLookup},
    BuildStorage, Perbill,
};

use crate as pallet_hybrid_vm;

type Block = frame_system::mocking::MockBlock<Test>;
pub type Balance = u128;

frame_support::construct_runtime!(
    pub enum Test {
        System: frame_system,
        Balances: pallet_balances,
        Timestamp: pallet_timestamp,
        Randomness: pallet_insecure_randomness_collective_flip,
        Evm: pallet_evm,
        Contracts: pallet_contracts,
        HybridVM: pallet_hybrid_vm,
    }
);

impl pallet_insecure_randomness_collective_flip::Config for Test {}

parameter_types! {
    pub(crate) static ExtrinsicBaseWeight: Weight = Weight::zero();
    pub(crate) static ExistentialDeposit: u64 = 0;
}

pub struct BlockWeights;
impl Get<frame_system::limits::BlockWeights> for BlockWeights {
    fn get() -> frame_system::limits::BlockWeights {
        frame_system::limits::BlockWeights::builder()
            .base_block(Weight::zero())
            .for_class(DispatchClass::all(), |weights| {
                weights.base_extrinsic = ExtrinsicBaseWeight::get().into();
            })
            .for_class(DispatchClass::non_mandatory(), |weights| {
                weights.max_total = Weight::from_parts(1024, u64::MAX).into();
            })
            .build_or_panic()
    }
}

pub type AccountId = AccountId20;

#[derive_impl(frame_system::config_preludes::ParaChainDefaultConfig as frame_system::DefaultConfig)]
impl frame_system::Config for Test {
    type BaseCallFilter = frame_support::traits::Everything;
    type BlockWeights = BlockWeights;
    type BlockLength = ();
    type DbWeight = ();
    type RuntimeOrigin = RuntimeOrigin;
    type Nonce = u64;
    type RuntimeCall = RuntimeCall;
    type Hash = H256;
    type Hashing = BlakeTwo256;
    type AccountId = AccountId;
    type Lookup = IdentityLookup<Self::AccountId>;
    type Block = Block;
    type RuntimeEvent = RuntimeEvent;
    type BlockHashCount = ConstU64<250>;
    type Version = ();
    type PalletInfo = PalletInfo;
    type AccountData = pallet_balances::AccountData<u128>;
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type SystemWeightInfo = ();
    type SS58Prefix = ();
    type OnSetCode = ();
    type MaxConsumers = ConstU32<16>;
}

#[derive_impl(pallet_balances::config_preludes::TestDefaultConfig)]
impl pallet_balances::Config for Test {
    type Balance = Balance;
    type ExistentialDeposit = ConstU128<1>;
    type ReserveIdentifier = [u8; 8];
    type AccountStore = System;
}

parameter_types! {
    pub const MinimumPeriod: u64 = 1;
}

impl pallet_timestamp::Config for Test {
    type Moment = u64;
    type OnTimestampSet = ();
    type MinimumPeriod = MinimumPeriod;
    type WeightInfo = ();
}

impl hp_system::EvmHybridVMExtension<Test> for Test {
    fn call_hybrid_vm(
        origin: OriginFor<Test>,
        data: Vec<u8>,
        target_gas: Option<u64>,
    ) -> Result<(Vec<u8>, u64), sp_runtime::DispatchError> {
        let target_weight = <Test as pallet_evm::Config>::GasWeightMapping::gas_to_weight(
            target_gas.unwrap_or(0),
            false,
        );
        let (result_output, result_weight) = HybridVM::call_wasm_vm(origin, data, target_weight)?;

        Ok((
            result_output,
            <Test as pallet_evm::Config>::GasWeightMapping::weight_to_gas(result_weight),
        ))
    }
}

fn hash(a: u64) -> H160 {
    H160::from_low_u64_be(a)
}

pub struct MockPrecompileSet<T>(PhantomData<T>);

impl<T> PrecompileSet for MockPrecompileSet<T>
where
    T: pallet_evm::Config + EvmHybridVMExtension<T>,
{
    fn execute(&self, handle: &mut impl PrecompileHandle) -> Option<PrecompileResult> {
        match handle.code_address() {
            // Ethereum precompiles :
            a if a == hash(1) => Some(ECRecover::execute(handle)),
            a if a == hash(2) => Some(Sha256::execute(handle)),
            a if a == hash(3) => Some(Ripemd160::execute(handle)),
            a if a == hash(4) => Some(Identity::execute(handle)),
            a if a == hash(100) => {
                Some(pallet_evm_precompile_call_hybrid_vm::CallHybridVM::<T>::execute(handle))
            },
            _ => None,
        }
    }

    fn is_precompile(&self, address: H160, _gas: u64) -> IsPrecompileResult {
        IsPrecompileResult::Answer {
            is_precompile: [hash(1), hash(2), hash(3), hash(4), hash(5)].contains(&address),
            extra_cost: 0,
        }
    }
}

pub struct CompactAddressMapping;

impl AddressMapping<AccountId> for CompactAddressMapping {
    fn into_account_id(address: H160) -> AccountId {
        let mut data = [0u8; 32];
        data[0..20].copy_from_slice(&address[..]);
        AccountId::from(data)
    }
}

pub struct FixedGasPrice;
impl FeeCalculator for FixedGasPrice {
    fn min_gas_price() -> (U256, Weight) {
        // Return some meaningful gas price and weight
        (1_000_000_000u128.into(), Weight::from_parts(7u64, 0))
    }
}

pub struct FindAuthorTruncated;
impl FindAuthor<H160> for FindAuthorTruncated {
    fn find_author<'a, I>(_digests: I) -> Option<H160>
    where
        I: 'a + IntoIterator<Item = (ConsensusEngineId, &'a [u8])>,
    {
        let a: [u8; 20] = [12, 34, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        Some(H160::from(a))
    }
}
const BLOCK_GAS_LIMIT: u64 = 150_000_000;
const MAX_POV_SIZE: u64 = 5 * 1024 * 1024;

parameter_types! {
    pub BlockGasLimit: U256 = U256::from(BLOCK_GAS_LIMIT);
    pub const GasLimitPovSizeRatio: u64 = BLOCK_GAS_LIMIT.saturating_div(MAX_POV_SIZE);
    pub WeightPerGas: Weight = Weight::from_parts(20_000, 0);
    pub MockPrecompiles: MockPrecompileSet<Test> = MockPrecompileSet(Default::default());
    pub SuicideQuickClearLimit: u32 = 0;
    pub const ChainId: u64 = 42;
}

impl pallet_evm::Config for Test {
    type FeeCalculator = FixedGasPrice;
    type GasWeightMapping = pallet_evm::FixedGasWeightMapping<Self>;
    type WeightPerGas = WeightPerGas;

    type BlockHashMapping = pallet_evm::SubstrateBlockHashMapping<Self>;
    type CallOrigin = EnsureAccountId20;

    type WithdrawOrigin = EnsureAccountId20;
    type AddressMapping = IdentityAddressMapping;
    type Currency = Balances;

    type RuntimeEvent = RuntimeEvent;
    type PrecompilesType = MockPrecompileSet<Self>;
    type PrecompilesValue = MockPrecompiles;
    type ChainId = ChainId;
    type BlockGasLimit = BlockGasLimit;
    type Runner = pallet_evm::runner::stack::Runner<Self>;
    type OnChargeTransaction = ();
    type OnCreate = ();
    type FindAuthor = FindAuthorTruncated;
    type GasLimitPovSizeRatio = GasLimitPovSizeRatio;
    type SuicideQuickClearLimit = SuicideQuickClearLimit;
    type Timestamp = Timestamp;
    type WeightInfo = ();
}

impl Convert<Weight, BalanceOf<Self>> for Test {
    fn convert(w: Weight) -> BalanceOf<Self> {
        w.ref_time().into()
    }
}

#[derive(Default)]
pub struct HybridVMChainExtension;

impl pallet_contracts::chain_extension::ChainExtension<Test> for HybridVMChainExtension {
    fn call<E>(&mut self, env: Environment<E, InitState>) -> Result<RetVal, DispatchError>
    where
        E: Ext<T = Test>,
        // <E::T as SysConfig>::AccountId: UncheckedFrom<<E::T as SysConfig>::Hash> + AsRef<[u8]>,
    {
        let func_id = env.func_id();
        match func_id {
            //fn call_evm_extension(vm_input: Vec<u8>) -> String;
            5 => HybridVM::call_evm::<E>(env),
            //fn h160_to_accountid(evm_address: H160) -> AccountId;
            6 => h160_to_accountid::<E>(env),
            _ => Err(DispatchError::from("Passed unknown func_id to chain extension")),
        }
    }
}

pub fn h160_to_accountid<E: Ext<T = Test>>(
    env: Environment<E, InitState>,
) -> Result<RetVal, DispatchError> {
    let mut envbuf = env.buf_in_buf_out();
    let input: H160 = envbuf.read_as()?;
    let account_id: AccountId20 =
        <Test as pallet_evm::Config>::AddressMapping::into_account_id(input);
    let account_id_slice = account_id.encode();
    let output = envbuf
        .write(&account_id_slice, false, None)
        .map_err(|_| DispatchError::from("ChainExtension failed to write result"));
    match output {
        Ok(_) => return Ok(RetVal::Converging(0)),
        Err(e) => return Err(e),
    }
}

pub enum AllowBalancesCall {}

impl frame_support::traits::Contains<RuntimeCall> for AllowBalancesCall {
    fn contains(call: &RuntimeCall) -> bool {
        matches!(call, RuntimeCall::Balances(pallet_balances::Call::transfer_allow_death { .. }))
    }
}

// Unit = the base number of indivisible units for balances
const UNIT: Balance = 1_000_000_000_000;
const MILLIUNIT: Balance = 1_000_000_000;

const fn deposit(items: u32, bytes: u32) -> Balance {
    (items as Balance * UNIT + (bytes as Balance) * (5 * MILLIUNIT / 100)) / 10
}

fn schedule<T: pallet_contracts::Config>() -> pallet_contracts::Schedule<T> {
    pallet_contracts::Schedule {
        limits: pallet_contracts::Limits {
            runtime_memory: 1024 * 1024 * 1024,
            ..Default::default()
        },
        ..Default::default()
    }
}

parameter_types! {
    pub static UploadAccount: Option<<Test as frame_system::Config>::AccountId> = None;
    pub static InstantiateAccount: Option<<Test as frame_system::Config>::AccountId> = None;
}

pub struct EnsureAccount<T, A>(sp_std::marker::PhantomData<(T, A)>);
impl<T: Config, A: sp_core::Get<Option<AccountId20>>>
    EnsureOrigin<<T as frame_system::Config>::RuntimeOrigin> for EnsureAccount<T, A>
where
    <T as frame_system::Config>::AccountId: From<AccountId20>,
{
    type Success = T::AccountId;

    fn try_origin(o: T::RuntimeOrigin) -> Result<Self::Success, T::RuntimeOrigin> {
        let who = <frame_system::EnsureSigned<_> as EnsureOrigin<_>>::try_origin(o.clone())?;
        if matches!(A::get(), Some(a) if who != a.clone().into()) {
            return Err(o);
        }

        Ok(who)
    }

    #[cfg(feature = "runtime-benchmarks")]
    fn try_successful_origin() -> Result<T::RuntimeOrigin, ()> {
        Err(())
    }
}

parameter_types! {
    pub const DepositPerItem: u64 = deposit(1, 0) as u64;
    pub const DepositPerByte: u64 = deposit(0, 1) as u64;
    pub Schedule: pallet_contracts::Schedule<Test> = schedule::<Test>();
    pub const DefaultDepositLimit: u64 = deposit(1024, 1024 * 1024) as u64;
    pub const CodeHashLockupDepositPercent: Perbill = Perbill::from_percent(0);
    pub const MaxDelegateDependencies: u32 = 32;
}

#[derive_impl(pallet_contracts::config_preludes::TestDefaultConfig)]
impl pallet_contracts::Config for Test {
    type Time = Timestamp;
    type Randomness = Randomness;
    type Currency = Balances;
    type RuntimeEvent = RuntimeEvent;
    type RuntimeCall = RuntimeCall;
    type CallFilter = AllowBalancesCall;
    type DepositPerItem = DepositPerItem;
    type DepositPerByte = DepositPerByte;
    type CallStack = [pallet_contracts::Frame<Self>; 23];
    type WeightInfo = pallet_contracts::weights::SubstrateWeight<Self>;
    type ChainExtension = HybridVMChainExtension;
    type Schedule = Schedule;
    type AddressGenerator = pallet_contracts::DefaultAddressGenerator;
    type MaxCodeLen = ConstU32<{ 128 * 1024 }>;
    type DefaultDepositLimit = DefaultDepositLimit;
    type MaxStorageKeyLen = ConstU32<128>;
    type MaxDebugBufferLen = ConstU32<{ 2 * 1024 * 1024 }>;
    type UnsafeUnstableInterface = ConstBool<false>;
    type CodeHashLockupDepositPercent = CodeHashLockupDepositPercent;
    type MaxDelegateDependencies = MaxDelegateDependencies;
    type RuntimeHoldReason = RuntimeHoldReason;
    type UploadOrigin = EnsureAccount<Self, UploadAccount>;
    type InstantiateOrigin = EnsureAccount<Self, InstantiateAccount>;
    type Environment = ();
    type Debug = ();
    type Migrations = ();
    type Xcm = ();
}

parameter_types! {
    pub const EnableCallEVM: bool = true;
    pub const EnableCallWasmVM: bool = true;
}

impl U256BalanceMapping for Test {
    type Balance = Balance;
    fn u256_to_balance(value: U256) -> Result<Self::Balance, &'static str> {
        Self::Balance::try_from(value)
    }
}

impl AccountIdMapping<Test> for Test {
    fn into_address(account_id: <Test as frame_system::Config>::AccountId) -> H160 {
        let mut address_arr = [0u8; 20];
        address_arr[0..20].copy_from_slice(account_id.as_byte_slice());

        H160::from_slice(&address_arr[0..20])
    }
}

impl pallet_hybrid_vm::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type Currency = Balances;
    type U256BalanceMapping = Self;
    type AccountIdMapping = Self;
    type EnableCallEVM = EnableCallEVM;
    type EnableCallWasmVM = EnableCallWasmVM;
}

pub(crate) const A: [u8; 32] = [
    1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7,
];
// const B: [u8; 32] = [
//     2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 8, 8,
// ];

// pub(crate) const ALICE: AccountId = AccountId::from(A);
// pub const BOB: AccountId = AccountId::new(B);

pub(crate) const A_SHADOW: [u8; 32] = [
    1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
pub(crate) const B_SHADOW: [u8; 32] = [
    2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
// Account shadow is the account which data is the source account data with the last 12 bytes
// setting zero
// pub const ALICE_SHADOW: AccountId = AccountId::from(A_SHADOW);
// pub const BOB_SHADOW: AccountId = AccountId::from(B_SHADOW);

pub struct ExtBuilder {
    existential_deposit: u64,
}

impl Default for ExtBuilder {
    fn default() -> Self {
        Self { existential_deposit: 1 }
    }
}

impl ExtBuilder {
    pub fn existential_deposit(mut self, existential_deposit: u64) -> Self {
        self.existential_deposit = existential_deposit;
        self
    }
    pub fn set_associated_consts(&self) {
        EXISTENTIAL_DEPOSIT.with(|v| *v.borrow_mut() = self.existential_deposit);
    }
    pub fn build(self) -> sp_io::TestExternalities {
        self.set_associated_consts();
        let mut t = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();
        pallet_balances::GenesisConfig::<Test> { balances: vec![] }
            .assimilate_storage(&mut t)
            .unwrap();
        pallet_evm::GenesisConfig::<Test> {
            accounts: std::collections::BTreeMap::new(),
            _marker: PhantomData,
        }
        .assimilate_storage(&mut t)
        .unwrap();
        let mut ext = sp_io::TestExternalities::new(t);
        ext.execute_with(|| System::set_block_number(1));
        ext
    }
}

pub(crate) fn last_event() -> RuntimeEvent {
    frame_system::Pallet::<Test>::events().pop().expect("Event expected").event
}

pub(crate) fn expect_event<E: Into<RuntimeEvent>>(e: E) {
    assert_eq!(last_event(), e.into());
}
