#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

pub mod weights;
pub use weights::*;

#[frame_support::pallet]
pub mod pallet {
    use log;
    use frame_support::{dispatch, dispatch::*, pallet_prelude::*};
    use frame_system::pallet_prelude::*;
    use scale_info::prelude;
    use sp_runtime::{FixedI64, FixedPointNumber, Rounding};
    use wasmi::{self, core::F64, AsContext, Store, Memory, StoreContext, Val};
    use wasmi::errors::ErrorKind;
    use sp_runtime::Vec;
    use sp_runtime::traits::BlakeTwo256;
    use sp_runtime::traits::Hash;
    use sp_runtime::Saturating;
    use sp_runtime::traits::Dispatchable;
    use scale_info::prelude::string::String;
    use scale_info::prelude::vec;
    use frame_support::traits::IsSubType;
    use frame_support::traits::UnfilteredDispatchable;
    use wasmi::{Func, Caller};

    use super::*;

    type HostState = u32;

    #[repr(C)]
    struct WasmSlice {
        offset: u32,
        length: u32,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct Algorithm {
        pub code: Vec<u8>
    }

    #[pallet::pallet]
    #[pallet::without_storage_info]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        type RuntimeCall: Parameter
        + Dispatchable<RuntimeOrigin = Self::RuntimeOrigin, PostInfo = PostDispatchInfo>
        + GetDispatchInfo
        + From<frame_system::Call<Self>>
        + UnfilteredDispatchable<RuntimeOrigin = Self::RuntimeOrigin>
        + IsSubType<Call<Self>>
        + IsType<<Self as frame_system::Config>::RuntimeCall>;
        type Hashing: Hash<Output = Self::Hash>;
        type WeightInfo: WeightInfo;
    }

    #[pallet::storage]
    pub type CloudFunctions<T: Config> =
    StorageMap<_, Blake2_128Concat, T::AccountId /*substrate_address*/, Algorithm, OptionQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub (super) fn deposit_event)]
    pub enum Event<T: Config> {
        CloudFunctionAdded {
            cloud_function_address: T::AccountId
        },
        AlgoResult {
            result: i64,
        },
        NestedCallDispatched { 
            success: bool,
            call_hash: T::Hash,
        },
    }

    #[pallet::error]
    pub enum Error<T> {
        DispatchFailed,
        CallDecodeFailed,
        MemoryError,
        AlgoNotFound,
        AttestationNotFound,
        AlgoError1,
        AlgoError2,
        AlgoError3,
        AlgoError4,
        AlgoError5,
        AlgoError6,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::call_index(1)]
        #[pallet::weight(100_000)]
        pub fn save_cloud_function(origin: OriginFor<T>, code: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let acc = Pallet::<T>::generate_keyless_account(&code);
            
            CloudFunctions::<T>::insert(acc.clone(), Algorithm {
                code
            });

            Self::deposit_event(Event::CloudFunctionAdded {
              cloud_function_address: acc
            });

            Ok(())
        }

        #[pallet::call_index(2)]
        #[pallet::weight(100_000)]
        pub fn run_algo_for(origin: OriginFor<T>, cloud_function_address: T::AccountId) -> DispatchResult {
            let who = ensure_signed(origin.clone())?;

            let algorithm = CloudFunctions::<T>::get(cloud_function_address.clone()).ok_or(Error::<T>::AlgoNotFound)?;

            return Pallet::<T>::run_code(origin, cloud_function_address, algorithm.code);
        }
    }

    impl<T: Config> Pallet<T> {
        pub fn process_dispatch_result(
            result: DispatchResultWithPostInfo,
            call_bytes: &[u8],
        ) -> Result<(), Error<T>> {
            // Calculate call hash
            let call_hash = <T as pallet::Config>::Hashing::hash(call_bytes);

            // Check dispatch result
            match result {
                Ok(post_info) => {
                    // Emit success event
                    Self::deposit_event(Event::NestedCallDispatched {
                        success: true,
                        call_hash,
                    });

                    // Process pending events
                    frame_system::Pallet::<T>::note_finished_extrinsics();

                    Ok(())
                },
                Err(error) => {
                    // Log the error
                    log::error!(
                        target: "runtime",
                        "Dispatch failed with error: {:?}",
                        error
                    );

                    // Emit failure event
                    Self::deposit_event(Event::NestedCallDispatched {
                        success: false,
                        call_hash,
                    });

                    // Still process events even on failure
                    frame_system::Pallet::<T>::note_finished_extrinsics();

                    Err(Error::<T>::DispatchFailed)
                }
            }
        }
        // Function to read Vec<u8> from WASM memory
        pub fn read_memory(memory: &Memory, ctx: StoreContext<'_, HostState>, offset: u32, length: u32) -> Result<Vec<u8>, Error<T>> {
            let mut buffer = vec![0u8; length as usize];
            memory.read(
                ctx,
                offset as usize,
                &mut buffer
            ).map_err(|_| Error::<T>::MemoryError)?;
            Ok(buffer)
        }

        pub fn generate_keyless_account(data: &Vec<u8>) -> T::AccountId {
          let hash = BlakeTwo256::hash(&data);
          
          // Convert the hash to AccountId
          T::AccountId::decode(&mut hash.as_ref())
              .expect("32 bytes can always be decoded to AccountId")
        }

        pub fn run_code(origin_source: OriginFor<T>, cloud_function_address: T::AccountId, code: Vec<u8>) -> DispatchResult {
          
          let who = ensure_signed(origin_source.clone())?;

          let engine = wasmi::Engine::default();

            let module =
                wasmi::Module::new(&engine, code.as_slice()).map_err(|_| Error::<T>::AlgoError1)?;

            let mut store = wasmi::Store::new(&engine, 42);
            let host_print = wasmi::Func::wrap(
                &mut store,
                |caller: wasmi::Caller<'_, HostState>, param: i32| {
                    log::debug!(target: "algo", "Message:{:?}", param);
                },
            );
            let abort_func = wasmi::Func::wrap(
              &mut store,
              |_: Caller<'_, HostState>, msg_id: i32, filename: i32, line: i32, col: i32| {
                  log::error!(
                      target: "algo",
                      "Abort called: msg_id={}, file={}, line={}, col={}",
                      msg_id, filename, line, col
                  );
                  // Err(wasmi::Trap::new(wasmi::TrapKind::Unreachable))
              },
            );

            let log_vec = wasmi::Func::wrap(
              &mut store,
              move |mut caller: Caller<'_, HostState>,
               ptr: i32, len: i32, is_sender_origin: i32| -> Result<i32, wasmi::Error> {
                  // Get the memory instance from the caller
                  let memory = match caller.get_export("memory") {
                      Some(wasmi::Extern::Memory(mem)) => mem,
                      _ => {
                          log::error!(target: "runtime", "Failed to get memory instance");
                          return Err(wasmi::Error::new("Failed to get memory instance"));;
                      }
                  };
      
                  // Read the bytes from WASM memory
                  match Self::read_memory(&memory, caller.as_context(), ptr as u32, len as u32) {
                      Ok(bytes) => {
                          log::debug!(
                              target: "runtime",
                              "Received bytes from WASM: {:?}",
                              bytes
                          );
                          
                          let call = match <T as pallet::Config>::RuntimeCall::decode(&mut &bytes[..]) {
                            Ok(c) => c,
                            Err(_) => return Err(wasmi::Error::new("Failed to decode call")),
                          };

                           let function_origin = if is_sender_origin == 0 {
                                frame_system::RawOrigin::Signed(cloud_function_address.clone()).into()
                            } else {
                                frame_system::RawOrigin::Signed(who.clone()).into()
                            };
                          let dispatch_result = call.dispatch_bypass_filter(function_origin);

                          
                          match Self::process_dispatch_result(dispatch_result, &bytes) {
                            Ok(()) => Ok(1), // Success
                            Err(e) => {
                                log::error!(
                                    target: "runtime",
                                    "Dispatch failed: {:?}",
                                    e
                                );
                                Ok(-1) // Failure, but not a trap
                            }
                        }
                      },
                      Err(e) => {
                          log::error!(
                              target: "runtime",
                              "Failed to read memory: {:?}",
                              e
                          );
                          Err(wasmi::Error::new("Failed to read memory"))
                      }
                  }
              },
          );

            let mut linker = <wasmi::Linker<HostState>>::new(&engine);
            linker.define("host", "print", host_print).map_err(|_| Error::<T>::AlgoError2)?;
      
            // Define the abort function in the linker
            linker.define("env", "abort", abort_func).map_err(|_| Error::<T>::AlgoError2)?;

            linker.define("env", "run_ext", log_vec).map_err(|_| Error::<T>::AlgoError2)?;

            let memory = wasmi::Memory::new(
              &mut store,
              wasmi::MemoryType::new(8, None).map_err(|_| Error::<T>::AlgoError2)?,
          )
              .map_err(|_| Error::<T>::AlgoError2)?;

              linker.define("env", "memory", memory).map_err(|_| Error::<T>::AlgoError2)?;

            let instance = linker
                .instantiate(&mut store, &module)
                .map_err(|e| {
                    log::error!(target: "algo", "Algo3 {:?}", e);
                    Error::<T>::AlgoError3
                })?
                .start(&mut store)
                .map_err(|_| Error::<T>::AlgoError4)?;

            let main = instance
                .get_typed_func::<(), i64>(&store, "main")
                .map_err(|_| Error::<T>::AlgoError5)?;

            // And finally we can call the wasm!
            let result = main.call(&mut store, ()).map_err(|e| {
                log::error!(target: "algo", "Algo6 {:?}", e);
                Error::<T>::AlgoError6
            })?;
            Self::deposit_event(Event::AlgoResult {
                result,
            });

            Ok(())
        }
    }
}
