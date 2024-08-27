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

#![cfg_attr(not(feature = "std"), no_std)]

#[cfg(test)]
mod mock;
#[cfg(test)]
mod tests;

mod interoperate;

use self::interoperate::InterCall;
use frame_support::{
    traits::{tokens::fungible::Inspect, ConstU32, Currency, Get},
    weights::Weight,
    RuntimeDebugNoBound,
};
use ink_env::call::{ExecutionInput, Selector};
use pallet_contracts::{
    chain_extension::{Environment, Ext, InitState, RetVal},
    CollectEvents, DebugInfo, Determinism,
};
use scale_info::prelude::{string::String, vec};
use sha3::{Digest, Keccak256};
use sp_core::H160;
use sp_runtime::{
    traits::{BlakeTwo256, Hash},
    BoundedVec, DispatchError,
};
use sp_std::vec::Vec;
//use sp_std::fmt::Debug;
use hp_system::{AccountIdMapping, U256BalanceMapping};

pub use self::pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use super::*;
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;

    const WEIGHT_LIMIT: Weight = Weight::from_parts(1_000_000_000_000, u64::MAX);

    type Result<T> = sp_std::result::Result<T, DispatchError>;

    //evm_fun_abi, wasm_message_name, wasm_message_selector
    pub type EvmABI = (String, String, Option<[u8; 4]>);

    //wasm_message_selector, evm_fun_abi
    pub type FunABI = ([u8; 4], BoundedVec<u8, ConstU32<1_000>>);

    #[derive(Encode, Decode, MaxEncodedLen, TypeInfo, Clone, RuntimeDebugNoBound, PartialEq)]
    #[scale_info(skip_type_params(T))]
    pub enum UnifiedAddress<T: Config> {
        WasmVM(T::AccountId),
    }

    #[pallet::config]
    pub trait Config: frame_system::Config + pallet_contracts::Config + pallet_evm::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        // Currency type for balance storage.
        type Currency: Currency<Self::AccountId> + Inspect<Self::AccountId>;

        type U256BalanceMapping: U256BalanceMapping<Balance = <<Self as pallet_contracts::Config>::Currency as Inspect<Self::AccountId>>::Balance>;

        type AccountIdMapping: AccountIdMapping<Self>;

        #[pallet::constant]
        type EnableCallEVM: Get<bool>;

        #[pallet::constant]
        type EnableCallWasmVM: Get<bool>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    // HybridVM contracts, keys: address
    #[pallet::storage]
    #[pallet::getter(fn hvm_contracts)]
    pub type HvmContracts<T: Config> =
        StorageMap<_, Twox64Concat, H160, UnifiedAddress<T>, OptionQuery>;

    // HybridVM EVM ABI,  keys: address+selector
    #[pallet::storage]
    #[pallet::getter(fn evm_fun_abi)]
    pub type EvmABInfo<T: Config> =
        StorageDoubleMap<_, Twox64Concat, H160, Twox64Concat, u32, FunABI, OptionQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        EVMExecuted(H160),
        WasmVMExecuted(T::AccountId),
        HybridVMCalled(T::AccountId),
        RegistContract(H160, UnifiedAddress<T>, T::AccountId),
    }

    #[pallet::error]
    #[derive(PartialEq)]
    pub enum Error<T> {
        EVMExecuteFailed,
        WasmVMExecuteFailed,
        UnifiedAddressError,
        NoWasmContractOrCallError,
        EvmABIDecodeError,
        EvmABIError,
        WasmContractRevert,
        DisableCallWasmVM,
        DisableCallEvm,
        AccountIdDecodeError,
        WasmEncodeError,
        WasmDecodeError,
        EvmEncodeError,
        EvmDecodeError,
        ChainExtensionWriteError,
    }

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::call_index(0)]
        #[pallet::weight(Weight::from_parts(10_000, 0) + T::DbWeight::get().writes(3))]
        pub fn regist_contract(
            origin: OriginFor<T>,
            unified_address: UnifiedAddress<T>,
        ) -> DispatchResultWithPostInfo {
            let who = ensure_signed(origin)?;

            match unified_address.clone() {
                UnifiedAddress::<T>::WasmVM(account) => {
                    let mut a: [u8; 4] = Default::default();
                    a.copy_from_slice(&BlakeTwo256::hash(b"hybridvm_evm_abi")[0..4]);
                    let abi_of_call = ExecutionInput::new(Selector::new(a));

                    let result = pallet_contracts::Pallet::<T>::bare_call(
                        who.clone(),
                        account.clone(),
                        0u8.into(),
                        WEIGHT_LIMIT,
                        None,
                        abi_of_call.encode(),
                        DebugInfo::Skip,
                        CollectEvents::Skip,
                        Determinism::Enforced,
                    )
                    .result?;

                    if result.did_revert() {
                        return Err(Error::<T>::WasmContractRevert.into());
                    }

                    let evm_abi = <Result<Vec<EvmABI>> as Decode>::decode(&mut &result.data[..])
                        .map_err(|_| DispatchError::from(Error::<T>::EvmABIDecodeError))?
                        .map_err(|_| DispatchError::from(Error::<T>::EvmABIDecodeError))?;

                    let mut abi_info: Vec<(u32, FunABI)> = vec![];
                    for abi in evm_abi {
                        let index = abi
                            .0
                            .find(')')
                            .ok_or::<DispatchError>(Error::<T>::EvmABIError.into())?;
                        let mut a: [u8; 4] = Default::default();
                        a.copy_from_slice(&Keccak256::digest(abi.0[0..index + 1].as_bytes())[0..4]);
                        let selector = u32::from_be_bytes(a);

                        let wasm_selector = match abi.2 {
                            Some(t) => t,
                            None => {
                                let mut a: [u8; 4] = Default::default();
                                a.copy_from_slice(&BlakeTwo256::hash(abi.1.as_bytes())[0..4]);
                                a
                            },
                        };
                        let evm_fun_abi =
                            BoundedVec::<u8, ConstU32<1_000>>::truncate_from(abi.0.into_bytes());
                        abi_info.push((selector, (wasm_selector, evm_fun_abi)));
                    }

                    let address = T::AccountIdMapping::into_address(account);

                    HvmContracts::<T>::insert(address, unified_address.clone());
                    _ = EvmABInfo::<T>::clear_prefix(address, 10000, None);

                    for abi in abi_info {
                        EvmABInfo::<T>::insert(address, abi.0, abi.1);
                    }

                    Self::deposit_event(Event::RegistContract(address, unified_address, who));
                    Ok(().into())
                },
            }
        }
    }

    impl<T: Config> Pallet<T> {
        pub fn call_wasm_vm(
            origin: OriginFor<T>,
            data: Vec<u8>,
            target_gas: Weight,
        ) -> Result<(Vec<u8>, Weight)> {
            InterCall::<T>::call_wasm_vm(origin, data, target_gas)
        }

        pub fn call_evm<E: Ext<T = T>>(env: Environment<E, InitState>) -> Result<RetVal> {
            InterCall::<T>::call_evm(env)
        }
    }
}
