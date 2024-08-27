// Modified by 2024 HybridVM

// This file is part of Frontier.

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

//! Test utilities

// Modified by Alex Wang 2024

use ethereum::{TransactionAction, TransactionSignature};
use rlp::RlpStream;
// Substrate
use frame_support::{
    derive_impl, parameter_types,
    traits::{ConstU128, ConstU32, FindAuthor},
    weights::Weight,
    ConsensusEngineId, PalletId,
};

use sp_core::{hashing::keccak_256, ConstBool, H160, H256, U256};

use sp_runtime::{
    traits::{BlakeTwo256, Convert, Dispatchable, IdentityLookup},
    BuildStorage, DispatchError, Perbill,
};
// Frontier
use fp_account::AccountId20;
use pallet_evm::{
    AddressMapping, BalanceOf, EnsureAccountId20, FeeCalculator, IdentityAddressMapping,
};

// Contracts
use pallet_contracts::chain_extension::{Environment, Ext, InitState, RetVal};

// HybridVM
use byte_slice_cast::AsByteSlice;
use hp_system::{AccountIdMapping, U256BalanceMapping};

use super::*;
use crate::IntermediateStateRoot;

pub type SignedExtra = (frame_system::CheckSpecVersion<Test>,);

type Balance = u128;

type AccountId = AccountId20;

frame_support::construct_runtime! {
    pub enum Test {
        System: frame_system::{Pallet, Call, Config<T>, Storage, Event<T>},
        Balances: pallet_balances::{Pallet, Call, Storage, Config<T>, Event<T>},
        Timestamp: pallet_timestamp::{Pallet, Call, Storage},
        EVM: pallet_evm::{Pallet, Call, Storage, Config<T>, Event<T>},
        Ethereum: crate::{Pallet, Call, Storage, Event, Origin},
        Randomness: pallet_insecure_randomness_collective_flip::{Pallet, Storage},
        Contracts: pallet_contracts::{Pallet, Call, Storage, Event<T>, HoldReason},
        HybridVM: pallet_hybrid_vm::{Pallet, Call, Storage, Event<T>},
    }
}

impl pallet_insecure_randomness_collective_flip::Config for Test {}

parameter_types! {
    pub const BlockHashCount: u64 = 250;
}

#[derive_impl(frame_system::config_preludes::TestDefaultConfig as frame_system::DefaultConfig)]
impl frame_system::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type BaseCallFilter = frame_support::traits::Everything;
    type BlockWeights = ();
    type BlockLength = ();
    type RuntimeOrigin = RuntimeOrigin;
    type RuntimeCall = RuntimeCall;
    type RuntimeTask = RuntimeTask;
    type Nonce = u64;
    type Hash = H256;
    type Hashing = BlakeTwo256;
    type AccountId = AccountId;
    type Lookup = IdentityLookup<Self::AccountId>;
    type Block = frame_system::mocking::MockBlock<Self>;
    type BlockHashCount = BlockHashCount;
    type DbWeight = ();
    type Version = ();
    type PalletInfo = PalletInfo;
    type AccountData = pallet_balances::AccountData<Balance>;
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
    pub const MinimumPeriod: u64 = 6000 / 2;
}

impl pallet_timestamp::Config for Test {
    type Moment = u64;
    type OnTimestampSet = ();
    type MinimumPeriod = MinimumPeriod;
    type WeightInfo = ();
}

pub struct FixedGasPrice;
impl FeeCalculator for FixedGasPrice {
    fn min_gas_price() -> (U256, Weight) {
        (1.into(), Weight::zero())
    }
}

pub struct FindAuthorTruncated;
impl FindAuthor<H160> for FindAuthorTruncated {
    fn find_author<'a, I>(_digests: I) -> Option<H160>
    where
        I: 'a + IntoIterator<Item = (ConsensusEngineId, &'a [u8])>,
    {
        Some(address_build(0).address)
    }
}

const BLOCK_GAS_LIMIT: u64 = 150_000_000;
const MAX_POV_SIZE: u64 = 5 * 1024 * 1024;

parameter_types! {
    pub const TransactionByteFee: u64 = 1;
    pub const ChainId: u64 = 42;
    pub const EVMModuleId: PalletId = PalletId(*b"py/evmpa");
    pub BlockGasLimit: U256 = U256::from(BLOCK_GAS_LIMIT);
    pub const GasLimitPovSizeRatio: u64 = BLOCK_GAS_LIMIT.saturating_div(MAX_POV_SIZE);
    pub const WeightPerGas: Weight = Weight::from_parts(20_000, 0);
}

pub struct HashedAddressMapping;
impl AddressMapping<AccountId> for HashedAddressMapping {
    fn into_account_id(address: H160) -> AccountId {
        let mut data = [0u8; 32];
        data[0..20].copy_from_slice(&address[..]);
        AccountId::from(Into::<[u8; 32]>::into(data))
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

parameter_types! {
    pub SuicideQuickClearLimit: u32 = 0;
}

impl pallet_evm::Config for Test {
    type FeeCalculator = FixedGasPrice;
    type GasWeightMapping = pallet_evm::FixedGasWeightMapping<Self>;
    type WeightPerGas = WeightPerGas;
    type BlockHashMapping = crate::EthereumBlockHashMapping<Self>;
    type CallOrigin = EnsureAccountId20;
    type WithdrawOrigin = EnsureAccountId20;
    type AddressMapping = IdentityAddressMapping;
    type Currency = Balances;
    type RuntimeEvent = RuntimeEvent;
    type PrecompilesType = ();
    type PrecompilesValue = ();
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
        // <E::T as frame_system::Config>::AccountId:
        //     UncheckedFrom<<E::T as frame_system::Config>::Hash> + AsRef<[u8]>,
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
        Balance::try_from(value)
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

parameter_types! {
    pub const PostBlockAndTxnHashes: PostLogContent = PostLogContent::BlockAndTxnHashes;
}

impl Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type StateRoot = IntermediateStateRoot<Self>;
    type PostLogContent = PostBlockAndTxnHashes;
    type ExtraDataLength = ConstU32<30>;
}

impl fp_self_contained::SelfContainedCall for RuntimeCall {
    type SignedInfo = H160;

    fn is_self_contained(&self) -> bool {
        match self {
            RuntimeCall::Ethereum(call) => call.is_self_contained(),
            _ => false,
        }
    }

    fn check_self_contained(&self) -> Option<Result<Self::SignedInfo, TransactionValidityError>> {
        match self {
            RuntimeCall::Ethereum(call) => call.check_self_contained(),
            _ => None,
        }
    }

    fn validate_self_contained(
        &self,
        info: &Self::SignedInfo,
        dispatch_info: &DispatchInfoOf<RuntimeCall>,
        len: usize,
    ) -> Option<TransactionValidity> {
        match self {
            RuntimeCall::Ethereum(call) => call.validate_self_contained(info, dispatch_info, len),
            _ => None,
        }
    }

    fn pre_dispatch_self_contained(
        &self,
        info: &Self::SignedInfo,
        dispatch_info: &DispatchInfoOf<RuntimeCall>,
        len: usize,
    ) -> Option<Result<(), TransactionValidityError>> {
        match self {
            RuntimeCall::Ethereum(call) => {
                call.pre_dispatch_self_contained(info, dispatch_info, len)
            },
            _ => None,
        }
    }

    fn apply_self_contained(
        self,
        info: Self::SignedInfo,
    ) -> Option<sp_runtime::DispatchResultWithInfo<sp_runtime::traits::PostDispatchInfoOf<Self>>>
    {
        match self {
            call @ RuntimeCall::Ethereum(crate::Call::transact { .. }) => {
                Some(call.dispatch(RuntimeOrigin::from(RawOrigin::EthereumTransaction(info))))
            },
            _ => None,
        }
    }
}

pub struct AccountInfo {
    pub address: H160,
    pub account_id: AccountId,
    pub private_key: H256,
}

fn address_build(seed: u8) -> AccountInfo {
    let private_key = H256::from_slice(&[(seed + 1); 32]); //H256::from_low_u64_be((i + 1) as u64);
    let secret_key = libsecp256k1::SecretKey::parse_slice(&private_key[..]).unwrap();
    let public_key = &libsecp256k1::PublicKey::from_secret_key(&secret_key).serialize()[1..65];
    let address = H160::from(H256::from(keccak_256(public_key)));

    let mut data = [0u8; 20];
    data[0..20].copy_from_slice(&address[..]);

    AccountInfo { private_key, account_id: AccountId::from(Into::<[u8; 20]>::into(data)), address }
}

// This function basically just builds a genesis storage key/value store according to
// our desired mockup.
pub fn new_test_ext(accounts_len: usize) -> (Vec<AccountInfo>, sp_io::TestExternalities) {
    // sc_cli::init_logger("");
    let mut ext = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();

    let pairs = (0..accounts_len).map(|i| address_build(i as u8)).collect::<Vec<_>>();

    let balances: Vec<_> =
        (0..accounts_len).map(|i| (pairs[i].account_id.clone(), 10_000_000)).collect();

    pallet_balances::GenesisConfig::<Test> { balances }
        .assimilate_storage(&mut ext)
        .unwrap();

    (pairs, ext.into())
}

// This function basically just builds a genesis storage key/value store according to
// our desired mockup.
pub fn new_test_ext_with_initial_balance(
    accounts_len: usize,
    initial_balance: Balance,
) -> (Vec<AccountInfo>, sp_io::TestExternalities) {
    // sc_cli::init_logger("");
    let mut ext = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();

    let pairs = (0..accounts_len).map(|i| address_build(i as u8)).collect::<Vec<_>>();

    let balances: Vec<_> = (0..accounts_len)
        .map(|i| (pairs[i].account_id.clone(), initial_balance))
        .collect();

    pallet_balances::GenesisConfig::<Test> { balances }
        .assimilate_storage(&mut ext)
        .unwrap();

    (pairs, ext.into())
}

pub fn contract_address(sender: H160, nonce: u64) -> H160 {
    let mut rlp = RlpStream::new_list(2);
    rlp.append(&sender);
    rlp.append(&nonce);

    H160::from_slice(&keccak_256(&rlp.out())[12..])
}

pub fn storage_address(sender: H160, slot: H256) -> H256 {
    H256::from(keccak_256([&H256::from(sender)[..], &slot[..]].concat().as_slice()))
}

pub struct LegacyUnsignedTransaction {
    pub nonce: U256,
    pub gas_price: U256,
    pub gas_limit: U256,
    pub action: TransactionAction,
    pub value: U256,
    pub input: Vec<u8>,
}

impl LegacyUnsignedTransaction {
    fn signing_rlp_append(&self, s: &mut RlpStream) {
        s.begin_list(9);
        s.append(&self.nonce);
        s.append(&self.gas_price);
        s.append(&self.gas_limit);
        s.append(&self.action);
        s.append(&self.value);
        s.append(&self.input);
        s.append(&ChainId::get());
        s.append(&0u8);
        s.append(&0u8);
    }

    fn signing_hash(&self) -> H256 {
        let mut stream = RlpStream::new();
        self.signing_rlp_append(&mut stream);
        H256::from(keccak_256(&stream.out()))
    }

    pub fn sign(&self, key: &H256) -> Transaction {
        self.sign_with_chain_id(key, ChainId::get())
    }

    pub fn sign_with_chain_id(&self, key: &H256, chain_id: u64) -> Transaction {
        let hash = self.signing_hash();
        let msg = libsecp256k1::Message::parse(hash.as_fixed_bytes());
        let s = libsecp256k1::sign(&msg, &libsecp256k1::SecretKey::parse_slice(&key[..]).unwrap());
        let sig = s.0.serialize();

        let sig = TransactionSignature::new(
            s.1.serialize() as u64 % 2 + chain_id * 2 + 35,
            H256::from_slice(&sig[0..32]),
            H256::from_slice(&sig[32..64]),
        )
        .unwrap();

        Transaction::Legacy(ethereum::LegacyTransaction {
            nonce: self.nonce,
            gas_price: self.gas_price,
            gas_limit: self.gas_limit,
            action: self.action,
            value: self.value,
            input: self.input.clone(),
            signature: sig,
        })
    }
}

pub struct EIP2930UnsignedTransaction {
    pub nonce: U256,
    pub gas_price: U256,
    pub gas_limit: U256,
    pub action: TransactionAction,
    pub value: U256,
    pub input: Vec<u8>,
}

impl EIP2930UnsignedTransaction {
    pub fn sign(&self, secret: &H256, chain_id: Option<u64>) -> Transaction {
        let secret = {
            let mut sk: [u8; 32] = [0u8; 32];
            sk.copy_from_slice(&secret[0..]);
            libsecp256k1::SecretKey::parse(&sk).unwrap()
        };
        let chain_id = chain_id.unwrap_or(ChainId::get());
        let msg = ethereum::EIP2930TransactionMessage {
            chain_id,
            nonce: self.nonce,
            gas_price: self.gas_price,
            gas_limit: self.gas_limit,
            action: self.action,
            value: self.value,
            input: self.input.clone(),
            access_list: vec![],
        };
        let signing_message = libsecp256k1::Message::parse_slice(&msg.hash()[..]).unwrap();

        let (signature, recid) = libsecp256k1::sign(&signing_message, &secret);
        let rs = signature.serialize();
        let r = H256::from_slice(&rs[0..32]);
        let s = H256::from_slice(&rs[32..64]);
        Transaction::EIP2930(ethereum::EIP2930Transaction {
            chain_id: msg.chain_id,
            nonce: msg.nonce,
            gas_price: msg.gas_price,
            gas_limit: msg.gas_limit,
            action: msg.action,
            value: msg.value,
            input: msg.input.clone(),
            access_list: msg.access_list,
            odd_y_parity: recid.serialize() != 0,
            r,
            s,
        })
    }
}

pub struct EIP1559UnsignedTransaction {
    pub nonce: U256,
    pub max_priority_fee_per_gas: U256,
    pub max_fee_per_gas: U256,
    pub gas_limit: U256,
    pub action: TransactionAction,
    pub value: U256,
    pub input: Vec<u8>,
}

impl EIP1559UnsignedTransaction {
    pub fn sign(&self, secret: &H256, chain_id: Option<u64>) -> Transaction {
        let secret = {
            let mut sk: [u8; 32] = [0u8; 32];
            sk.copy_from_slice(&secret[0..]);
            libsecp256k1::SecretKey::parse(&sk).unwrap()
        };
        let chain_id = chain_id.unwrap_or(ChainId::get());
        let msg = ethereum::EIP1559TransactionMessage {
            chain_id,
            nonce: self.nonce,
            max_priority_fee_per_gas: self.max_priority_fee_per_gas,
            max_fee_per_gas: self.max_fee_per_gas,
            gas_limit: self.gas_limit,
            action: self.action,
            value: self.value,
            input: self.input.clone(),
            access_list: vec![],
        };
        let signing_message = libsecp256k1::Message::parse_slice(&msg.hash()[..]).unwrap();

        let (signature, recid) = libsecp256k1::sign(&signing_message, &secret);
        let rs = signature.serialize();
        let r = H256::from_slice(&rs[0..32]);
        let s = H256::from_slice(&rs[32..64]);
        Transaction::EIP1559(ethereum::EIP1559Transaction {
            chain_id: msg.chain_id,
            nonce: msg.nonce,
            max_priority_fee_per_gas: msg.max_priority_fee_per_gas,
            max_fee_per_gas: msg.max_fee_per_gas,
            gas_limit: msg.gas_limit,
            action: msg.action,
            value: msg.value,
            input: msg.input.clone(),
            access_list: msg.access_list,
            odd_y_parity: recid.serialize() != 0,
            r,
            s,
        })
    }
}
