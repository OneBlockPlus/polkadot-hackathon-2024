// This file is part of Substrate.

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

//! # Offchain Worker Example Pallet
//!
//! This pallet demonstrates concepts, APIs and structures common to most offchain workers.
//!
//! Run `cargo doc --package pallet-example-offchain-worker --open` to view this module's
//! documentation.
//!
//! - [`Config`]
//! - [`Call`]
//! - [`Pallet`]
//!
//! **This pallet serves as an example and is not meant for production use.**
//!
//! ## Overview
//!
//! This pallet implements a simple oracle for BTC/USD price and a task processing system.
//! The Offchain Worker (OCW) is triggered after every block to fetch the current price
//! and process any pending tasks. It prepares either signed or unsigned transactions
//! to feed the results back on-chain.

#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;

use alloc::format;
use codec::{Decode, Encode};
use frame_support::{
	pallet_prelude::{BoundedVec, MaxEncodedLen},
	traits::Get,
};
use frame_system::{
	self as system,
	offchain::{
		AppCrypto, CreateSignedTransaction, SendSignedTransaction, SendUnsignedTransaction,
		SignedPayload, Signer, SigningTypes, SubmitTransaction,
	},
	pallet_prelude::BlockNumberFor,
};
use lite_json::json::JsonValue;
use sp_core::crypto::KeyTypeId;
use sp_runtime::{
	offchain::{
		http,
		storage::{MutateStorageError, StorageRetrievalError, StorageValueRef},
		Duration,
		StorageKind,
	},
	traits::Zero,
	transaction_validity::{InvalidTransaction, TransactionValidity, ValidTransaction},
	RuntimeDebug,
};
use sp_io::offchain;

use sp_std::vec::Vec;
use sp_std::vec;

use serde::Deserialize;
use serde_json::Value;
use scale_info::prelude::string::String;
use scale_info::TypeInfo;
use sp_std::fmt::Debug;

#[cfg(test)]
mod tests;

/// Defines a task with a data availability height, blob data, and processing status.
#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, Default, TypeInfo, MaxEncodedLen)]
#[scale_info(skip_type_params(StringLimit))]
pub struct Task<StringLimit: Get<u32> + Clone> {
	pub da_height: u64,
	pub blob: BoundedVec<u8, StringLimit>,
	pub processed: bool,
}

/// Defines application identifier for crypto keys of this module.
pub const KEY_TYPE: KeyTypeId = KeyTypeId(*b"btc!");

/// Crypto wrapper for this module's keys.
pub mod crypto {
	use super::KEY_TYPE;
	use sp_core::sr25519::Signature as Sr25519Signature;
	use sp_runtime::{
		app_crypto::{app_crypto, sr25519},
		traits::Verify,
		MultiSignature, MultiSigner,
	};
	app_crypto!(sr25519, KEY_TYPE);

	pub struct TestAuthId;

	// Implementation of traits for app crypto
	impl frame_system::offchain::AppCrypto<MultiSigner, MultiSignature> for TestAuthId {
		type RuntimeAppPublic = Public;
		type GenericSignature = sp_core::sr25519::Signature;
		type GenericPublic = sp_core::sr25519::Public;
	}

	// Implementation for mock runtime in test
	impl frame_system::offchain::AppCrypto<<Sr25519Signature as Verify>::Signer, Sr25519Signature>
		for TestAuthId
	{
		type RuntimeAppPublic = Public;
		type GenericSignature = sp_core::sr25519::Signature;
		type GenericPublic = sp_core::sr25519::Public;
	}
}

pub use pallet::*;

/// Struct to deserialize the response from the Sui API
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ResponseData {
    is_succ: bool,
    #[serde(default)]
    res: Option<SuiData>,
    #[serde(default)]
    err: Option<ErrorData>,
}

/// Struct to hold Sui-specific data
#[derive(Deserialize, Debug)]
struct SuiData {
    sui_digest: String,
    time: String,
}

/// Struct to hold time data
#[derive(Deserialize, Debug)]
struct TimeData {
    time: String,
}

/// Struct to hold error data
#[derive(Deserialize, Debug)]
struct ErrorData {
    message: String,
    #[serde(rename = "type")]
    error_type: String,
    code: String,
}

#[frame_support::pallet]
pub mod pallet {
	use super::*;
	use super::Task;

	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;

	/// Configuration trait for this pallet.
	#[pallet::config]
	pub trait Config: CreateSignedTransaction<Call<Self>> + frame_system::Config {
		/// The identifier type for an offchain worker.
		type AuthorityId: AppCrypto<Self::Public, Self::Signature>;

		/// The overarching event type.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

		/// Grace period after sending a transaction.
		#[pallet::constant]
		type GracePeriod: Get<BlockNumberFor<Self>>;

		/// Number of blocks of cooldown after unsigned transaction is included.
		#[pallet::constant]
		type UnsignedInterval: Get<BlockNumberFor<Self>>;

		/// A configuration for base priority of unsigned transactions.
		#[pallet::constant]
		type UnsignedPriority: Get<TransactionPriority>;

		/// Maximum size of a task.
		#[pallet::constant]
		type StringLimit: Get<u32> + Clone;

		/// Maximum number of tasks.
		#[pallet::constant]
		type MaxTasks: Get<u32>;
	}

	#[pallet::pallet]
	pub struct Pallet<T>(_);

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
		/// Offchain Worker entry point.
		fn offchain_worker(block_number: BlockNumberFor<T>) {
			log::info!("Offchain worker started at block: {:?}", block_number);

			let tasks = Self::tasks();
			if !tasks.is_empty() {	
				log::info!("Number of tasks: {:?}", tasks.len());
				for (index, task) in tasks.iter().enumerate() {
					if !task.processed {
						log::info!("Processing task: {:?}", task.blob.clone());
						if let Err(e) = Self::process_task(block_number, index as u32, task) {
							log::error!("Error processing task: {:?}", e);
						}
					}
				}
				log::info!("All tasks processed");
			}
		}
	}

	/// Dispatchable functions for this pallet.
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// Submit a new task to be processed.
		#[pallet::call_index(0)]
		#[pallet::weight({0})]
		pub fn submit_task(origin: OriginFor<T>, da_height: u64, blob: Vec<u8>) -> DispatchResult {
			ensure_signed(origin)?;

			let last_height = Self::last_da_height();
			ensure!(da_height > last_height, Error::<T>::InvalidDaHeight);

			let bounded_blob: BoundedVec<u8, T::StringLimit> =
			blob.clone().try_into().map_err(|_| Error::<T>::BlobTooLong)?;

			let new_task = super::Task {
				da_height,
				blob: bounded_blob.clone(),
				processed: false,
			};

			Tasks::<T>::try_mutate(|tasks| {
				tasks.try_push(new_task.clone())
					.map_err(|_| Error::<T>::TooManyTasks)
			})?;

			TaskHistory::<T>::insert(da_height, (bounded_blob, false, None::<BoundedVec<u8, T::StringLimit>>, None::<BoundedVec<u8, T::StringLimit>>));
			
			// Update the last submitted da_height
			LastDaHeight::<T>::put(da_height);

			Self::deposit_event(Event::TaskSubmitted { da_height: new_task.da_height, blob: new_task.blob });
			Ok(())
		}

		/// Process a task and submit the result as an unsigned transaction.
		#[pallet::call_index(1)]
		#[pallet::weight({0})]
		pub fn process_task_unsigned(
			origin: OriginFor<T>,
			block_number: BlockNumberFor<T>,
			task_index: u32,
			sui_digest: Vec<u8>,
			time: Vec<u8>,
		) -> DispatchResultWithPostInfo {
			ensure_none(origin)?;

			let bounded_sui_digest: BoundedVec<u8, T::StringLimit> = 
				sui_digest.try_into().map_err(|_| Error::<T>::DigestTooLong)?;
			let bounded_time: BoundedVec<u8, T::StringLimit> = 
				time.try_into().map_err(|_| Error::<T>::TimeTooLong)?;

			Tasks::<T>::mutate(|tasks| {
				if let Some(task) = tasks.get_mut(task_index as usize) {
					task.processed = true;
					TaskHistory::<T>::insert(
						task.da_height,
						(task.blob.clone(), true, Some(bounded_sui_digest.clone()), Some(bounded_time.clone()))
					);

					Self::deposit_event(Event::TaskProcessed { 
						da_height: task.da_height, 
						blob: task.blob.clone(),
						sui_digest: Some(bounded_sui_digest),
						time: Some(bounded_time)
					});
				}
			});

			Self::remove_task(task_index);
			
			let current_block = <system::Pallet<T>>::block_number();
			<NextUnsignedAt<T>>::put(current_block + T::UnsignedInterval::get());
			
			Ok(().into())
		}
	}

	/// Events for this pallet.
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
        /// A new task has been submitted.
        TaskSubmitted{da_height: u64, blob: BoundedVec<u8, T::StringLimit>},
        /// A task has been processed.
        TaskProcessed{
            da_height: u64, 
            blob: BoundedVec<u8, T::StringLimit>,
            sui_digest: Option<BoundedVec<u8, T::StringLimit>>,
            time: Option<BoundedVec<u8, T::StringLimit>>
        },
	}

	/// Errors for this pallet.
	#[pallet::error]
	pub enum Error<T> {
		/// Too many tasks have been submitted.
		TooManyTasks,
		/// The DA height is too long.
		DaHeightTooLong,
		/// The blob is too long.
		BlobTooLong,
		/// The DA height is invalid.
		InvalidDaHeight,
		/// The digest is too long.
		DigestTooLong,
		/// The time is too long.
		TimeTooLong,
	}

	/// Validate unsigned transactions.
	#[pallet::validate_unsigned]
	impl<T: Config> ValidateUnsigned for Pallet<T> {
		type Call = Call<T>;

		fn validate_unsigned(_source: TransactionSource, call: &Self::Call) -> TransactionValidity {
			if let Call::process_task_unsigned { block_number, task_index, sui_digest: _, time: _ } = call {
				// Check if it's time to submit a new unsigned transaction
				let current_block = <system::Pallet<T>>::block_number();
				let next_unsigned_at = <NextUnsignedAt<T>>::get();
				if current_block < next_unsigned_at {
					return InvalidTransaction::Stale.into();
				}

				// Check if the task exists
				let tasks = Self::tasks();
				if (*task_index as usize) >= tasks.len() {
					return InvalidTransaction::Custom(1).into(); // Task doesn't exist
				}

				ValidTransaction::with_tag_prefix("ExampleOffchainWorker")
					.priority(T::UnsignedPriority::get())
					.and_provides((*block_number, *task_index))
					.longevity(5)
					.propagate(true)
					.build()
			} else {
				InvalidTransaction::Call.into()
			}
		}
	}

	/// Storage for tasks.
	#[pallet::storage]
	#[pallet::getter(fn tasks)]
	pub type Tasks<T: Config> = StorageValue<_, BoundedVec<Task<T::StringLimit>, T::MaxTasks>, ValueQuery>;

	/// Storage for task history.
	#[pallet::storage]
	#[pallet::getter(fn task_by_height)]
	pub type TaskHistory<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		u64,  // da_height as key
		(BoundedVec<u8, T::StringLimit>, bool, Option<BoundedVec<u8, T::StringLimit>>, Option<BoundedVec<u8, T::StringLimit>>),  // (blob, processed, sui_digest, time) as value
		ValueQuery
	>;

	/// Storage for the next block to submit an unsigned transaction.
	#[pallet::storage]
	pub(super) type NextUnsignedAt<T: Config> = StorageValue<_, BlockNumberFor<T>, ValueQuery>;

	/// Storage for the last processed DA height.
	#[pallet::storage]
	#[pallet::getter(fn last_da_height)]
	pub type LastDaHeight<T: Config> = StorageValue<_, u64, ValueQuery>;
}

/// Payload used by this example crate to hold price data required to submit a transaction.
#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, scale_info::TypeInfo)]
pub struct PricePayload<Public, BlockNumber> {
	block_number: BlockNumber,
	price: u32,
	public: Public,
}

impl<T: SigningTypes> SignedPayload<T> for PricePayload<T::Public, BlockNumberFor<T>> {
	fn public(&self) -> T::Public {
		self.public.clone()
	}
}

impl<T: Config> Pallet<T> {
    /// Process a task by fetching Sui data and submitting an unsigned transaction.
    fn process_task(
		block_number: BlockNumberFor<T>,
		task_index: u32, 
		task: &Task<T::StringLimit>
	) -> Result<(), &'static str> {
        log::info!("Processing task: {:?}", task.blob.clone());
        
        match Self::fetch_sui_data(task.da_height, task.blob.clone()) {
            Ok((sui_digest, time)) => {
                log::info!("Sui digest: {:?}, Time: {:?}", sui_digest, time);
                
                // Submit unsigned transaction with sui_digest and time
                let call = Call::process_task_unsigned { 
                    block_number, 
                    task_index,
                    sui_digest: sui_digest.into_bytes(),
                    time: time.into_bytes(),
                };

                SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(call.into())
                    .map_err(|()| "Unable to submit unsigned transaction")?;

                Ok(())
            },
            Err(e) => {
                log::error!("Error getting Sui data: {:?}", e);
                Err("Failed to get Sui data")
            }
        }
    }

    /// Remove a processed task from storage and update its history.
    fn remove_task(task_index: u32) {
        let mut da_height = None;
        Tasks::<T>::mutate(|tasks| {
            if (task_index as usize) < tasks.len() {
                if let Some(task) = tasks.get(task_index as usize) {
                    da_height = Some(task.da_height);
                }
                tasks.remove(task_index as usize);
            }
        });

        if let Some(height) = da_height {
            // Update processing status in task history
            TaskHistory::<T>::mutate(height, |task| {
                let (blob, _, sui_digest, time) = task;
                *task = (blob.clone(), true, sui_digest.clone(), time.clone());
            });
        }
    }
	/// Test the Sui API by sending a request with task data.
	fn fetch_sui_data(da_height: u64, blob: BoundedVec<u8, T::StringLimit>) -> Result<(String, String), http::Error> {
		let deadline = sp_io::offchain::timestamp().add(Duration::from_millis(2_000));
		let url = "http://47.236.78.251:3000/v1/Warlus/Store";
		
		let blob_str = sp_std::str::from_utf8(&blob).map_err(|_| {
			log::error!("Unable to convert blob to string");
			http::Error::Unknown
		})?;
		
		let request_body = format!(
			r#"{{"da_height": "{}", "blob": "{}", "epochs": 1}}"#,
			da_height, blob_str
		);
		
		log::info!("Preparing to send request to {}", url);
		log::info!("Request body: {}", request_body);
		let request = http::Request::post(url, vec![request_body])
			.add_header("Content-Type", "application/json");
		
		let pending = request
			.deadline(deadline)
			.send()
			.map_err(|e| {
				log::error!("Failed to send request: {:?}", e);
				http::Error::IoError
			})?;
		
		log::info!("Request sent, waiting for response");
		let response = pending.try_wait(deadline).map_err(|_| http::Error::DeadlineReached)??;
		log::info!("Response received, status code: {}", response.code);
		
		if response.code != 200 {
			log::error!("Unexpected status code: {}", response.code);
			return Err(http::Error::Unknown);
		}
	
		let body = response.body().collect::<Vec<u8>>();
		let body_str = sp_std::str::from_utf8(&body).map_err(|_| {
			log::error!("Response body is not valid UTF-8");
			http::Error::Unknown
		})?;
	
		log::info!("Received response body: {}", body_str);
	
		let response_json: ResponseData = serde_json::from_str(body_str).map_err(|err| {
			log::error!("Failed to parse JSON response: {}", err);
			http::Error::Unknown
		})?;
	
		log::info!("Parsed JSON: {:?}", response_json);
	
		if !response_json.is_succ {
			if let Some(err) = response_json.err {
				log::error!("Error from server: {:?}", err);
			}
			return Err(http::Error::Unknown);
		}

		let sui_data = response_json.res.ok_or_else(|| {
			log::error!("Missing 'res' field in successful response");
			http::Error::Unknown
		})?;

		log::info!("Sui digest: {}, Time: {}", sui_data.sui_digest, sui_data.time);

		Ok((sui_data.sui_digest, sui_data.time))
	}
}
