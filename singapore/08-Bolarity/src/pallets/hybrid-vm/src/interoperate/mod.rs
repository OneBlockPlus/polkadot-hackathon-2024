// Modified By HybridVM
//
// Copyright (C) 2021 Cycan Technologies
//
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
//
// Only support EVM  contracts which its parameter data max value below 128bit for the time being
// Modified by Alex Wang

#![cfg_attr(not(feature = "std"), no_std)]

pub extern crate alloc;

use alloc::string::{String, ToString};

use core::fmt;
use parity_scale_codec::{Decode, Encode};
use sp_std::{prelude::*, str, vec, vec::Vec};

use pallet_contracts::{
    chain_extension::{Environment, Ext, InitState, RetVal},
    CollectEvents, DebugInfo, Determinism,
};
use sp_runtime::{
    app_crypto::sp_core::{H160, U256},
    DispatchError,
};

use serde::{Deserialize, Serialize};

use fp_evm::{ExecutionInfoV2, FeeCalculator};
use pallet_evm::{GasWeightMapping, Runner};

use super::*;
use frame_support::pallet_prelude::*;
use frame_system::pallet_prelude::*;

type Result<T> = sp_std::result::Result<T, DispatchError>;
type ResultBox<T> = sp_std::result::Result<T, CustomError>;

pub struct InterCall<T: Config> {
    _marker: PhantomData<T>,
}

#[derive(Deserialize, Encode, Decode, Debug)]
#[allow(non_snake_case)]
struct CallVM {
    VM: String,
    Account: String,
    Fun: String,
    InputType: Vec<String>,
    InputValue: Vec<String>,
    OutputType: Vec<Vec<String>>,
}

#[derive(Deserialize, Encode, Decode, Serialize, Debug)]
#[allow(non_snake_case)]
struct CallReturn {
    Result: u32,
    Message: String,
    ReturnValue: Vec<String>,
}

impl<T: Config> InterCall<T> {
    pub fn call_wasm_vm(
        origin: OriginFor<T>,
        data: Vec<u8>,
        target_gas: Weight,
    ) -> Result<(Vec<u8>, Weight)> {
        if !T::EnableCallWasmVM::get() {
            return Err(DispatchError::from(Error::<T>::DisableCallWasmVM));
        }

        let input: Vec<u8>;
        let target: Vec<u8>;

        match vm_codec::wasm_encode(&data[32..].iter().cloned().collect()) {
            Ok(r) => (input, target) = r,
            Err(_) => return Err(DispatchError::from(Error::<T>::WasmEncodeError)),
        }

        let gas_limit: Weight = target_gas;

        let origin = ensure_signed(origin)?;
        let target = <T as frame_system::Config>::AccountId::decode(&mut target.as_slice())
            .map_err(|_| DispatchError::from(Error::<T>::AccountIdDecodeError))?;

        let info = pallet_contracts::Pallet::<T>::bare_call(
            origin,
            target,
            0u8.into(),
            gas_limit,
            None,
            input,
            DebugInfo::Skip,
            CollectEvents::Skip,
            Determinism::Enforced,
        );
        let output: ResultBox<Vec<u8>>;
        match info.result {
            Ok(return_value) => {
                if !return_value.did_revert() {
                    // because return_value.data = MessageResult<T, E>, so, the first byte is zhe
                    // Ok() Code, be removed
                    output = vm_codec::wasm_decode(
                        &data[32..].iter().cloned().collect(),
                        &return_value.data[1..].iter().cloned().collect(),
                        true,
                        "",
                    );
                } else {
                    return Err(DispatchError::from(Error::<T>::WasmContractRevert));
                }
            },
            Err(e) => return Err(e),
        }

        match output {
            Ok(r) => return Ok((r, info.gas_consumed)),
            Err(_) => return Err(DispatchError::from(Error::<T>::WasmDecodeError)),
        }
    }
}

impl<C: Config> InterCall<C> {
    pub fn call_evm<E: Ext<T = C>>(mut env: Environment<E, InitState>) -> Result<RetVal> {
        if !C::EnableCallEVM::get() {
            return Err(DispatchError::from(Error::<C>::DisableCallEvm));
        }

        let gas_meter = env.ext().gas_meter();
        let gas_limit =
            <C as pallet_evm::Config>::GasWeightMapping::weight_to_gas(gas_meter.gas_left());
        let caller = env.ext().caller();
        let source = C::AccountIdMapping::into_address(caller.account_id()?.clone());

        let mut envbuf = env.buf_in_buf_out();
        let input0: Vec<u8> = envbuf.read_as_unbounded(envbuf.in_len())?;

        let input: Vec<u8>;
        let target: H160;
        match vm_codec::evm_encode(&input0) {
            Ok(r) => (input, target) = r,
            Err(_) => {
                return Err(DispatchError::from(Error::<C>::EvmEncodeError));
            },
        }

        let gas_price = <C as pallet_evm::Config>::FeeCalculator::min_gas_price();
        let info = <C as pallet_evm::Config>::Runner::call(
            source,
            target,
            input,
            U256::default(),
            gas_limit,
            Some(gas_price.0),
            None,
            Some(pallet_evm::Pallet::<C>::account_basic(&source).0.nonce),
            Vec::new(),
            true,
            true,
            None,
            None,
            C::config(),
        );

        let output: ResultBox<Vec<u8>>;
        match info {
            Ok(r) => {
                match r {
                    ExecutionInfoV2 { exit_reason: success, value: v1, .. } => {
                        if success.is_succeed() {
                            output = vm_codec::evm_decode(&input0, &v1, true, "");
                        } else {
                            return Err(DispatchError::from(Error::<C>::EVMExecuteFailed));
                        }
                    },
                };
            },
            Err(e) => {
                return Err(DispatchError::from(e.error.into()));
            },
        }

        match output {
            Ok(r) => {
                let output = envbuf
                    .write(&r, false, None)
                    .map_err(|_| DispatchError::from(Error::<C>::ChainExtensionWriteError));
                match output {
                    Ok(_) => return Ok(RetVal::Converging(0)),
                    Err(e) => return Err(e),
                }
            },
            Err(_) => return Err(DispatchError::from(Error::<C>::EvmDecodeError)),
        }
    }
}

macro_rules! t {
    ($a:expr) => {
        match $a {
            Ok(v) => v,
            Err(e) => return Err(CustomError::new(&e.to_string())),
        }
    };
}

#[derive(Debug)]
pub struct CustomError {
    detail: String,
}

impl CustomError {
    fn new(msg: &str) -> CustomError {
        CustomError { detail: msg.to_string() }
    }
}

impl fmt::Display for CustomError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.detail)
    }
}

//impl Error for CustomError {}

pub mod vm_codec {
    use super::*;

    use core::mem::size_of;
    use parity_scale_codec::{Compact, Encode};
    use sha3::{Digest, Keccak256};
    use sp_runtime::traits::BlakeTwo256;
    use sp_std::{convert::TryInto, str::FromStr};

    type Result<T> = sp_std::result::Result<T, CustomError>;

    macro_rules! bytes_encode {
        ($bytesdata:ident, $offset:ident, $value_data:ident, $data_ex:ident) => {
            let hexlen = $bytesdata.len() as u128;
            let hexlendata = hexlen.to_be_bytes();

            let hexdata = $offset.to_be_bytes();
            $value_data.extend_from_slice(&[0u8; 16]);
            $value_data.extend_from_slice(&hexdata);

            $data_ex.extend_from_slice(&[0u8; 16]);
            $data_ex.extend_from_slice(&hexlendata);
            $data_ex.extend_from_slice((&$bytesdata));
            let mod32 = hexlen % 32;
            let zeros = [0u8; 32];
            if mod32 > 0 {
                $data_ex.extend_from_slice(&zeros[0..mod32 as usize]);
            }
            $offset = $offset + hexlen + mod32 + 32;
        };
    }

    macro_rules! array_encode_head {
        ($value:ident, $offset:ident, $value_data:ident, $data_ex:ident, $datalen:ident) => {
            let hexdata = $offset.to_be_bytes();
            $value_data.extend_from_slice(&[0u8; 16]);
            $value_data.extend_from_slice(&hexdata);

            $datalen = t!($value.parse::<u128>());
            let hexdatalen = $datalen.to_be_bytes();
            $data_ex.extend_from_slice(&[0u8; 16]);
            $data_ex.extend_from_slice(&hexdatalen);
        };
    }

    pub fn evm_encode(input: &Vec<u8>) -> Result<(Vec<u8>, H160)> {
        let hex_string = hex::encode(&input);
        log::info!("input Hexadecimal string: {}", hex_string);
        let call_vm: CallVM = t!(serde_json::from_slice(input.as_slice()));
        let account = call_vm.Account;
        let target = t!(H160::from_str(&account));

        let selector = &Keccak256::digest(call_vm.Fun.as_bytes())[0..4];
        let mut offset: u128 = (call_vm.InputType.len() * 32).try_into().unwrap_or_default();
        let mut data: Vec<u8> = Vec::new();
        let mut data_ex: Vec<u8> = Vec::new();
        let mut i: usize = 0;

        // 256 bit for per fix parameter,  dyn parameter occupy 256bit offset value, and value add
        // after all fix paramter dyn parameter in offset one 256bit length value, and after real
        // value uint int using big endian, and patch 0 in high bit.  else for address byte patch
        // 0 in low bit. array's inputValue: len, v1,v2, ..., vlen.
        for p in call_vm.InputType {
            let value = call_vm.InputValue.get(i).ok_or(CustomError::new("Data number error"))?;
            let mut value_data: Vec<u8> = Vec::new();
            match p.as_ref() {
                "address" => {
                    let addrdata = t!(hex::decode(&value[2..])); //drop off the first two bytes "0x"
                    value_data.extend_from_slice(&[0u8; 12]);
                    value_data.extend_from_slice(&addrdata[0..20]);
                },
                "uint" => {
                    let uintdata = t!(value.parse::<u128>());
                    let hexdata = uintdata.to_be_bytes();
                    value_data.extend_from_slice(&[0u8; 16]);
                    value_data.extend_from_slice(&hexdata);
                },
                "int" => {
                    let intdata = t!(value.parse::<i128>());
                    let hexdata = intdata.to_be_bytes();
                    if intdata < 0 {
                        value_data.extend_from_slice(&[255u8; 16]);
                    } else {
                        value_data.extend_from_slice(&[0u8; 16]);
                    }
                    value_data.extend_from_slice(&hexdata);
                },
                "bytes?" => {
                    let hexdata = t!(hex::decode(value));
                    value_data.extend_from_slice(&hexdata);
                    value_data.append(&mut vec![0u8; 32 - hexdata.len()]);
                },
                "bool" => {
                    value_data = match value.as_ref() {
                        "false" => vec![0u8; 32],
                        _ => {
                            let mut v = vec![0u8; 32];
                            v[31] = 1u8;
                            v
                        },
                    }
                },
                "string" => {
                    let bytesdata = value.as_bytes();
                    bytes_encode!(bytesdata, offset, value_data, data_ex);
                },
                "bytes" => {
                    let bytesdata = t!(hex::decode(value));
                    bytes_encode!(bytesdata, offset, value_data, data_ex);
                },
                "address[]" => {
                    let datalen: u128;
                    array_encode_head!(value, offset, value_data, data_ex, datalen);
                    let mut j: u128 = 0;
                    while j < datalen {
                        i = i + 1;
                        let value = call_vm
                            .InputValue
                            .get(i)
                            .ok_or(CustomError::new("Data number is error."))?;
                        let addrdata = t!(hex::decode(&value[2..])); //get off the first two bytes "0x"
                        data_ex.extend_from_slice(&[0u8; 12]);
                        data_ex.extend_from_slice(&addrdata[0..20]);
                        j += 1
                    }
                    offset = offset + datalen * 32 + 32;
                },
                "uint[]" => {
                    let datalen: u128;
                    array_encode_head!(value, offset, value_data, data_ex, datalen);
                    let mut j: u128 = 0;
                    while j < datalen {
                        i = i + 1;
                        let value = call_vm
                            .InputValue
                            .get(i)
                            .ok_or(CustomError::new("Data number is error."))?;
                        let uintdata = t!(value.parse::<u128>());
                        let hexdata = uintdata.to_be_bytes();
                        data_ex.extend_from_slice(&[0u8; 16]);
                        data_ex.extend_from_slice(&hexdata);
                        j += 1
                    }
                    offset = offset + datalen * 32 + 32;
                },
                "int[]" => {
                    let datalen: u128;
                    array_encode_head!(value, offset, value_data, data_ex, datalen);
                    let mut j: u128 = 0;
                    while j < datalen {
                        i = i + 1;
                        let value = call_vm
                            .InputValue
                            .get(i)
                            .ok_or(CustomError::new("Data number is error."))?;
                        let intdata = t!(value.parse::<i128>());
                        let hexdata = intdata.to_be_bytes();
                        if intdata < 0 {
                            data_ex.extend_from_slice(&[255u8; 16]);
                        } else {
                            data_ex.extend_from_slice(&[0u8; 16]);
                        }
                        data_ex.extend_from_slice(&hexdata);
                        j += 1
                    }
                    offset = offset + datalen * 32 + 32;
                },
                "bytes?[]" => {
                    let datalen: u128;
                    array_encode_head!(value, offset, value_data, data_ex, datalen);
                    let mut j: u128 = 0;
                    while j < datalen {
                        i = i + 1;
                        let value = call_vm
                            .InputValue
                            .get(i)
                            .ok_or(CustomError::new("Data number is error."))?;
                        let hexdata = t!(hex::decode(value));
                        data_ex.extend_from_slice(&hexdata);
                        data_ex.append(&mut vec![0u8; 32 - hexdata.len()]);
                        j += 1
                    }
                    offset = offset + datalen * 32 + 32;
                },
                "bool[]" => {
                    let datalen: u128;
                    array_encode_head!(value, offset, value_data, data_ex, datalen);
                    let mut j: u128 = 0;
                    while j < datalen {
                        i = i + 1;
                        let value = call_vm
                            .InputValue
                            .get(i)
                            .ok_or(CustomError::new("Data number is error."))?;
                        let data_value = match value.as_ref() {
                            "false" => vec![0u8; 32],
                            _ => {
                                let mut v = vec![0u8; 32];
                                v[31] = 1u8;
                                v
                            },
                        };
                        data_ex.extend_from_slice(&data_value);
                        j += 1
                    }
                    offset = offset + datalen * 32 + 32;
                },
                _ => (),
            }
            data.append(&mut value_data);
            i = i + 1;
        }

        let input = [&selector[..], &data[..], &data_ex[..]].concat();
        Ok((input.to_vec(), target))
    }

    macro_rules! array_decode_head {
        ($output_value:ident, $offset:ident, $output:ident, $call_return:ident, $datalen:ident) => {
            $offset = u128::from_be_bytes($output_value) as usize + 32;
            let mut out_data: [u8; 16] = Default::default();
            out_data.copy_from_slice(&$output[$offset - 16..$offset]);
            $datalen = u128::from_be_bytes(out_data) as usize;
            $call_return.ReturnValue.push($datalen.to_string());
        };
    }

    pub fn evm_decode(
        input: &Vec<u8>,
        output: &Vec<u8>,
        succ: bool,
        mesg: &str,
    ) -> Result<Vec<u8>> {
        let mut call_return: CallReturn =
            CallReturn { Result: 0, Message: Default::default(), ReturnValue: Vec::new() };

        match succ {
            true => {
                let call_vm: CallVM = t!(serde_json::from_slice(input.as_slice()));

                call_return.Result = 0;
                call_return.Message = String::from(mesg);
                let mut i: usize = 0;

                let output_type_main = call_vm
                    .OutputType
                    .get(0)
                    .ok_or(CustomError::new("OutputType parameter error"))?;

                let mut output_value: [u8; 16] = Default::default();
                let mut output_value32: [u8; 32] = Default::default();
                let mut output_addr: [u8; 20] = Default::default();
                let mut out_value: [u8; 16] = Default::default();

                for p in output_type_main {
                    output_value.copy_from_slice(&output[i * 32 + 16..(i + 1) * 32]);
                    output_value32.copy_from_slice(&output[i * 32..(i + 1) * 32]);
                    output_addr.copy_from_slice(&output[i * 32 + 12..(i + 1) * 32]);
                    match p.as_ref() {
                        "address" => {
                            let data_str = hex::encode(output_addr);
                            call_return.ReturnValue.push(data_str);
                        },
                        "uint" => {
                            let uintdata = u128::from_be_bytes(output_value);
                            call_return.ReturnValue.push(uintdata.to_string());
                        },
                        "int" => {
                            let intdata = i128::from_be_bytes(output_value);
                            call_return.ReturnValue.push(intdata.to_string());
                        },
                        "bytes?" => {
                            let data_str = hex::encode(output_value32);
                            call_return.ReturnValue.push(data_str);
                        },
                        "bool" => {
                            let uintdata = u128::from_be_bytes(output_value);
                            match uintdata {
                                0 => call_return.ReturnValue.push("false".to_string()),
                                _ => call_return.ReturnValue.push("true".to_string()),
                            }
                        },
                        "string" => {
                            let uintdata = u128::from_be_bytes(output_value) as usize;

                            out_value.copy_from_slice(&output[uintdata + 16..uintdata + 32]);
                            let datalen = u128::from_be_bytes(out_value) as usize;
                            let data = &output[uintdata + 32..uintdata + 32 + datalen];
                            let data_str = t!(String::from_utf8(data.to_vec()));

                            call_return.ReturnValue.push(data_str);
                        },
                        "bytes" => {
                            let uintdata = u128::from_be_bytes(output_value) as usize;

                            out_value.copy_from_slice(&output[uintdata + 16..uintdata + 32]);
                            let datalen = u128::from_be_bytes(out_value) as usize;
                            let databuf = &output[uintdata + 32..uintdata + 32 + datalen];
                            let data_str = hex::encode(databuf);

                            call_return.ReturnValue.push(String::from(data_str));
                        },
                        "address[]" => {
                            let offset: usize;
                            let datalen: usize;
                            array_decode_head!(output_value, offset, output, call_return, datalen);
                            let mut j: usize = 0;
                            while j < datalen {
                                let out_value = &output[offset + j * 32..offset + (j + 1) * 32];
                                let data_str = hex::encode(&out_value[12..32]);
                                call_return.ReturnValue.push(data_str);
                                j += 1;
                            }
                        },
                        "uint[]" => {
                            let offset: usize;
                            let datalen: usize;
                            array_decode_head!(output_value, offset, output, call_return, datalen);
                            let mut j: usize = 0;
                            while j < datalen {
                                out_value.copy_from_slice(
                                    &output[offset + j * 32 + 16..offset + (j + 1) * 32],
                                );
                                let uintdata = u128::from_be_bytes(out_value);
                                call_return.ReturnValue.push(uintdata.to_string());
                                j += 1;
                            }
                        },
                        "int[]" => {
                            let offset: usize;
                            let datalen: usize;
                            array_decode_head!(output_value, offset, output, call_return, datalen);
                            let mut j: usize = 0;
                            while j < datalen {
                                out_value.copy_from_slice(
                                    &output[offset + j * 32 + 16..offset + (j + 1) * 32],
                                );
                                let intdata = i128::from_be_bytes(out_value);
                                call_return.ReturnValue.push(intdata.to_string());
                                j += 1;
                            }
                        },
                        "bytes?[]" => {
                            let offset: usize;
                            let datalen: usize;
                            array_decode_head!(output_value, offset, output, call_return, datalen);
                            let mut j: usize = 0;
                            while j < datalen {
                                let out_value = &output[offset + j * 32..offset + (j + 1) * 32];
                                let data_str = hex::encode(out_value);
                                call_return.ReturnValue.push(data_str);
                                j += 1;
                            }
                        },
                        "bool[]" => {
                            let offset: usize;
                            let datalen: usize;
                            array_decode_head!(output_value, offset, output, call_return, datalen);
                            let mut j: usize = 0;
                            while j < datalen {
                                out_value.copy_from_slice(
                                    &output[offset + j * 32 + 16..offset + (j + 1) * 32],
                                );
                                let uintdata = u128::from_be_bytes(out_value);
                                match uintdata {
                                    0 => call_return.ReturnValue.push("false".to_string()),
                                    _ => call_return.ReturnValue.push("true".to_string()),
                                }
                                j += 1;
                            }
                        },
                        _ => (),
                    }
                    i = i + 1;
                }
            },
            false => {
                call_return.Result = 1;
                call_return.Message = String::from(mesg);
            },
        }

        let return_json = t!(serde_json::to_string(&call_return));
        Ok(String::encode(&return_json))
    }

    pub fn wasm_encode(input: &Vec<u8>) -> Result<(Vec<u8>, Vec<u8>)> {
        let call_vm: CallVM = t!(serde_json::from_slice(input.as_slice()));
        let account = call_vm.Account;
        let target = t!(hex::decode(&account[2..]).map_err(|_| "invalid hex address."));
        let selector = &<BlakeTwo256 as sp_core::Hasher>::hash(call_vm.Fun.as_bytes())[0..4];
        let mut data: Vec<u8> = Vec::new();
        let mut i: usize = 0;

        // scale codec LE: fixlength per fixed-width parameter,  dyn parameter: prefixed with a
        // compact encoding of the number of items compact integer with compact encoding: 00--one
        // byte  01--two bytes  10--four bytes  11--big number    The upper six bits are the
        // number of bytes following list inputValue: Vector u8 u8 u8    "3", "12","34","56"
        for p in call_vm.InputType {
            let value = call_vm.InputValue.get(i).ok_or(CustomError::new("Data number error"))?;
            let mut value_data: Vec<u8> = Vec::new();
            match p.as_ref() {
				"u8" => value_data.append(&mut to_scale::<u8>(&value)),
				"u16" => value_data.append(&mut to_scale::<u16>(&value)),
				"u32" => value_data.append(&mut to_scale::<u32>(&value)),
				"u64" => value_data.append(&mut to_scale::<u64>(&value)),
				"u128" => value_data.append(&mut to_scale::<u128>(&value)),
				"i8" => value_data.append(&mut to_scale::<i8>(&value)),
				"i16" => value_data.append(&mut to_scale::<i16>(&value)),
				"i32" => value_data.append(&mut to_scale::<i32>(&value)),
				"i64" => value_data.append(&mut to_scale::<i64>(&value)),
				"i128" => value_data.append(&mut to_scale::<i128>(&value)),
				//"f32" => value_data.append(&mut to_scale::<f32>(&value)),
				//"f64" => value_data.append(&mut to_scale::<f64>(&value)),
				"bool" => value_data.append(&mut to_scale::<u8>(&value)), // false: 00 true: 01
				"enum" => value_data.append(&mut to_scale::<u8>(&value)), /* Option  Result are
				                                                            * enum: None 00  Some
				                                                            * 01   Ok 00  Err 01 */
				//Option<bool> : None 00  Some true 01  Some false 02
				"char" => {
					let c = value.chars().next().ok_or(CustomError::new("Char value error"))?;
					value_data.append(&mut u32::encode(&(c as u32)));
				},
				"string" => value_data.append(&mut String::encode(value)),
				"vec" => {
					let val = t!(value.parse::<u64>());
					value_data.append(&mut Compact(val).encode());
				},
				"accountid" => {
					let mut data1 = t!(hex::decode(&value[2..]));
					value_data.append(&mut data1);
				},
				_ => (),
			}
            data.append(&mut value_data);
            i = i + 1;
        }

        let input = [&selector[..], &data[..]].concat();

        Ok((input.to_vec(), target))
    }

    fn to_scale<T: FromStr + Encode + Default>(value: &str) -> Vec<u8> {
        let val: T;
        match value.parse::<T>() {
            Ok(v) => val = v,
            _ => val = Default::default(),
        }

        let ret = val.encode();

        ret
    }

    //number 0 Vec<string> , when it has Vector or Enum type, then the number 0+1 Vec<string> it
    // set number x Vec<string>, Vec has detail info and Enum has index nmber x of the second
    // Vec<string> means 00:vec   01:vec example Vec   [ ...  "10", ...]   10th ["u8","string"...]
    // "0" means none example Enum  [ ...  "13", ...]   13th ["16","17","18"]    16th
    // ["u8","string"] "0" means none  index is the index position's type
    pub fn wasm_decode(
        input: &Vec<u8>,
        output: &Vec<u8>,
        succ: bool,
        mesg: &str,
    ) -> Result<Vec<u8>> {
        let mut call_return: CallReturn =
            CallReturn { Result: 0, Message: Default::default(), ReturnValue: Vec::new() };

        match succ {
            true => {
                let call_vm: CallVM = t!(serde_json::from_slice(input.as_slice()));

                call_return.Result = 0;
                call_return.Message = String::from(mesg);

                let mut offset: usize = 0;
                get_wasm_decode(&call_vm.OutputType, &output, &mut offset, &mut call_return, 0)?;
            },
            false => {
                call_return.Result = 1;
                call_return.Message = String::from(mesg);
            },
        }

        let return_json = t!(serde_json::to_string(&call_return));
        let return_bytes = return_json.into_bytes();
        let return_bytes_len: u128 = t!(return_bytes.len().try_into());
        let return_result =
            [&[0u8; 16][..], &return_bytes_len.to_be_bytes(), &return_bytes].concat();
        Ok(return_result)
    }

    fn get_wasm_decode(
        output_type: &Vec<Vec<String>>,
        output: &Vec<u8>,
        offset: &mut usize,
        call_return: &mut CallReturn,
        index: usize,
    ) -> Result<bool> {
        let output_type_index =
            output_type.get(index).ok_or(CustomError::new("OutputType number error"))?;
        let mut i: usize = 0;
        for p in output_type_index {
            match p.as_ref() {
                "u8" => call_return.ReturnValue.push(to_string_value::<u8>(&output, offset)),
                "u16" => call_return.ReturnValue.push(to_string_value::<u16>(&output, offset)),
                "u32" => call_return.ReturnValue.push(to_string_value::<u32>(&output, offset)),
                "u64" => call_return.ReturnValue.push(to_string_value::<u64>(&output, offset)),
                "u128" => call_return.ReturnValue.push(to_string_value::<u128>(&output, offset)),
                "i8" => call_return.ReturnValue.push(to_string_value::<i8>(&output, offset)),
                "i16" => call_return.ReturnValue.push(to_string_value::<i16>(&output, offset)),
                "i32" => call_return.ReturnValue.push(to_string_value::<i32>(&output, offset)),
                "i64" => call_return.ReturnValue.push(to_string_value::<i64>(&output, offset)),
                "i128" => call_return.ReturnValue.push(to_string_value::<i128>(&output, offset)),
                //"f32" => call_return.ReturnValue.push( to_string_value::<f32>(&output, offset)),
                //"f64" => call_return.ReturnValue.push( to_string_value::<f64>(&output, offset)),
                "bool" => call_return.ReturnValue.push(to_string_value::<u8>(&output, offset)),
                "char" => {
                    let width = 4; //size_of::<char>();
                    *offset += width;
                    let a = t!(String::from_utf8(output[*offset - width..*offset].to_vec()));
                    call_return.ReturnValue.push(a);
                },
                "string" => {
                    //Not support len>2**30-1 string
                    let (intlen, len) = get_compact_int(&output, offset)?;
                    let str_value = t!(String::from_utf8(
                        output[*offset + intlen..*offset + intlen + len].to_vec()
                    ));
                    *offset += intlen + len;
                    call_return.ReturnValue.push(str_value);
                },
                "accounid" => {
                    let (intlen, len) = get_compact_int(&output, offset)?;
                    let str_value =
                        hex::encode(&output[*offset + intlen..*offset + intlen + len * 4]);
                    *offset += intlen + len * 4;
                    call_return.ReturnValue.push(str_value);
                },
                "vec" => {
                    //Not support len>2**30-1 list or vector,
                    let (intlen, len) = get_compact_int(&output, offset)?;
                    *offset += intlen;
                    call_return.ReturnValue.push(len.to_string());

                    let type_index = output_type
                        .get(index + 1)
                        .ok_or(CustomError::new("OutputType number error"))?;
                    let type_index =
                        type_index.get(i).ok_or(CustomError::new("OutputType number error"))?;
                    let type_index = t!(type_index.parse::<usize>());
                    i = i + 1;

                    if type_index > 0 {
                        let mut j: usize = 0;
                        while j < len {
                            get_wasm_decode(
                                &output_type,
                                &output,
                                offset,
                                call_return,
                                type_index,
                            )?;
                            j += 1;
                        }
                    }
                },
                //Option  Result are enum: None 00 Some 01, Ok00 Err01; Option<bool> : None 00
                // Some true 01  Some false 02
                "enum" => {
                    let a = output[*offset] as usize;
                    call_return.ReturnValue.push(to_string_value::<u8>(&output, offset));

                    let type_index = output_type
                        .get(index + 1)
                        .ok_or(CustomError::new("OutputType number error"))?;
                    let type_index =
                        type_index.get(i).ok_or(CustomError::new("OutputType number error"))?;
                    let type_index = t!(type_index.parse::<usize>());
                    i = i + 1;
                    if type_index > 0 {
                        let type_index = output_type
                            .get(type_index)
                            .ok_or(CustomError::new("OutputType number error"))?;
                        let type_index =
                            type_index.get(a).ok_or(CustomError::new("OutputType number error"))?;
                        let type_index = t!(type_index.parse::<usize>());
                        if type_index > 0 {
                            get_wasm_decode(
                                &output_type,
                                &output,
                                offset,
                                call_return,
                                type_index,
                            )?;
                        }
                    }
                },
                _ => (),
            }
        }
        Ok(true)
    }

    pub trait FromLeBytes<T> {
        fn from_le_bytes(d: &[u8]) -> T;
    }

    macro_rules! impl_from_le_bytes{
		($($a:ty),+) => {
			$(impl FromLeBytes<$a> for $a {
				fn from_le_bytes(d: &[u8]) ->$a {
					<$a>::from_le_bytes(d.try_into().unwrap_or_default())
				}
			})+
		}
	}
    impl_from_le_bytes!(u8, u16, u32, u64, u128, i8, i16, i32, i64, i128);

    fn to_string_value<T: Sized + sp_std::fmt::Display + FromLeBytes<T>>(
        output: &Vec<u8>,
        offset: &mut usize,
    ) -> String {
        let width = size_of::<T>();
        *offset += width;
        let a: T = T::from_le_bytes(&output[*offset - width..*offset]);

        a.to_string()
    }

    fn get_compact_int(output: &Vec<u8>, offset: &mut usize) -> Result<(usize, usize)> {
        let mut a: u8 = output[*offset];
        let mut b: u8 = a & 0b0000_0011;
        a = a >> 2;
        let val: usize;

        match b {
            0 => val = a as usize,
            1 => {
                let val_bytes = [a, output[*offset + 1]];
                val = u16::from_le_bytes(val_bytes) as usize;
            },
            2 => {
                let val_bytes = [a, output[*offset + 1], output[*offset + 2], output[*offset + 3]];
                val = u32::from_le_bytes(val_bytes) as usize;
            },
            _ => return Err(CustomError::new("Not support.")), /* ob11 not support, which up six
                                                                * is the bignumber length. */
        }

        b = b * 2;
        if b == 0 {
            b = 1;
        }

        Ok((b as usize, val))
    }
}
