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

use core::marker::PhantomData;
use fp_evm::{
    ExitError, ExitSucceed, Precompile, PrecompileFailure, PrecompileHandle, PrecompileOutput,
    PrecompileResult,
};
use frame_system::RawOrigin;
use hp_system::EvmHybridVMExtension;
use pallet_evm::AddressMapping;

pub struct CallHybridVM<T> {
    _marker: PhantomData<T>,
}

impl<T> Precompile for CallHybridVM<T>
where
    T: pallet_evm::Config + EvmHybridVMExtension<T>,
{
    fn execute(handle: &mut impl PrecompileHandle) -> PrecompileResult {
        let context = handle.context();
        let target_gas = handle.gas_limit();
        let origin = RawOrigin::from(Some(T::AddressMapping::into_account_id(context.caller)));

        match T::call_hybrid_vm(origin.into(), handle.input().iter().cloned().collect(), target_gas)
        {
            Ok(ret) => {
                let gas_consume = ret.1;
                let gas_limit = target_gas.unwrap_or(0);
                let gas_record = if gas_consume > gas_limit { gas_limit } else { gas_consume };
                handle.record_cost(gas_record)?;
                Ok(PrecompileOutput { exit_status: ExitSucceed::Returned, output: ret.0 })
            },
            Err(e) => {
                let err_str: &'static str = e.into();

                Err(PrecompileFailure::Error { exit_status: ExitError::Other(err_str.into()) })
            },
        }
    }
}
