// This file is part of Cybros.

// Copyright (C) Jun Jiang.
// SPDX-License-Identifier: AGPL-3.0-only

// Cybros is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Cybros is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with Cybros.  If not, see <http://www.gnu.org/licenses/>.

#![cfg_attr(not(feature = "std"), no_std)]

mod features;
mod traits;
pub mod weights;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub use pallet::*;
pub use primitives::*;
pub use traits::OffchainWorkerLifecycleHooks;
pub use weights::WeightInfo;

/// The log target of this pallet.
pub const LOG_TARGET: &str = "runtime::offchain_computing-infra";

// Syntactic sugar for logging.
#[macro_export]
macro_rules! log {
	($level:tt, $patter:expr $(, $values:expr)* $(,)?) => {
		log::$level!(
			target: $crate::LOG_TARGET,
			concat!("[{:?}] ", $patter), <frame_system::Pallet<T>>::block_number() $(, $values)*
		)
	};
}

use frame_support::{
	dispatch::DispatchResult,
	ensure,
	traits::{Get, Incrementable, Randomness, UnixTime},
	transactional,
};
use scale_codec::{Decode, Encode};
use sp_core::{sr25519, H256};
use sp_io::crypto::sr25519_verify;
use sp_runtime::{
	DispatchError,
	traits::{StaticLookup, Zero},
	SaturatedConversion, Saturating,
};

pub(crate) use frame_support::traits::{
	fungible::{
		BalancedHold as BalancedHoldFungible, Credit, Inspect as InspectFungible,
		InspectHold as InspectHoldFungible, Mutate as MutateFungible,
		MutateHold as MutateHoldFungible,
	},
	tokens::{Fortitude, Precision, Preservation},
};
pub(crate) use frame_system::pallet_prelude::BlockNumberFor;

pub type AccountIdLookupOf<T> = <<T as frame_system::Config>::Lookup as StaticLookup>::Source;
pub type BalanceOf<T> =
	<<T as Config>::Currency as InspectFungible<<T as frame_system::Config>::AccountId>>::Balance;

#[frame_support::pallet]
mod pallet {
	use super::*;
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
	use sp_runtime::traits::AtLeast32BitUnsigned;
	use core::fmt::Display;

	/// The current storage version.
	const STORAGE_VERSION: StorageVersion = StorageVersion::new(1);

	#[pallet::pallet]
	#[pallet::storage_version(STORAGE_VERSION)]
	pub struct Pallet<T>(_);

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime definition of an event.
		type RuntimeEvent: From<Event<Self>>
			+ IsType<<Self as frame_system::Config>::RuntimeEvent>
			+ TryInto<Event<Self>>;

		/// Overarching hold reason.
		type RuntimeHoldReason: From<HoldReason>;

		/// The system's currency for payment.
		type Currency: InspectFungible<Self::AccountId>
			+ MutateFungible<Self::AccountId>
			+ InspectHoldFungible<Self::AccountId>
			+ MutateHoldFungible<Self::AccountId, Reason = Self::RuntimeHoldReason>
			+ BalancedHoldFungible<Self::AccountId>;

		/// Time used for verify attestation
		type UnixTime: UnixTime;

		/// Something that provides randomness in the runtime.
		type Randomness: Randomness<Self::Hash, BlockNumberFor<Self>>;

		/// Identifier for the protocol implementation.
		type ImplId: Member
			+ Parameter
			+ MaxEncodedLen
			+ Display
			+ AtLeast32BitUnsigned
			+ Incrementable;

		/// Who can register implementation
		type RegisterImplOrigin: EnsureOrigin<Self::RuntimeOrigin, Success = Self::AccountId>;

		/// The minimum amount required to keep a worker registration.
		#[pallet::constant]
		type RegisterWorkerDeposit: Get<BalanceOf<Self>>;

		/// The basic amount of funds that must be reserved for an implementation.
		#[pallet::constant]
		type RegisterImplDeposit: Get<BalanceOf<Self>>;

		/// The basic amount of funds that must be reserved when adding metadata to your item.
		#[pallet::constant]
		type ImplMetadataDepositBase: Get<BalanceOf<Self>>;

		/// The additional funds that must be reserved for the number of bytes store in input and
		/// output.
		#[pallet::constant]
		type ImplMetadataDepositPerByte: Get<BalanceOf<Self>>;

		/// The maximum length of implementation's metadata stored on-chain.
		#[pallet::constant]
		type ImplMetadataLimit: Get<u32>;

		/// The maximum length of implementation's metadata stored on-chain.
		#[pallet::constant]
		type MaxImplBuilds: Get<u32>;

		/// Max number of moving unresponsive workers to pending offline workers queue
		#[pallet::constant]
		type HandleUnresponsivePerBlockLimit: Get<u32>;

		/// The duration (blocks) of collecting workers' heartbeats
		#[pallet::constant]
		type CollectingHeartbeatsDurationInBlocks: Get<u32>;

		/// Allow Opt out attestation
		#[pallet::constant]
		type DisallowOptOutAttestation: Get<bool>;

		/// Weight information for extrinsic calls in this pallet.
		type WeightInfo: WeightInfo;

		/// A handler for manging worker slashing
		type OffchainWorkerLifecycleHooks: OffchainWorkerLifecycleHooks<
			Self::AccountId,
			Self::ImplId,
		>;
	}

	#[pallet::composite_enum]
	pub enum HoldReason {
		ImplRegistrationReserve,
		WorkerRegistrationReserve,
		ImplMetadataStorageReserve,
	}

	/// Storage for computing_workers.
	#[pallet::storage]
	pub(crate) type Workers<T: Config> = CountedStorageMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		WorkerInfo<T::AccountId, BalanceOf<T>, T::ImplId>,
	>;

	/// Storage for implementations.
	#[pallet::storage]
	pub(crate) type Impls<T: Config> = CountedStorageMap<
		_,
		Blake2_128Concat,
		T::ImplId,
		ImplInfo<T::ImplId, T::AccountId, BalanceOf<T>>,
	>;

	/// Metadata of an implementation.
	#[pallet::storage]
	pub(crate) type ImplMetadata<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		T::ImplId,
		ChainStoredData<T::AccountId, BalanceOf<T>, T::ImplMetadataLimit>,
		OptionQuery,
	>;

	/// Storage for worker's implementations' hashes.
	#[pallet::storage]
	pub(crate) type ImplBuilds<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::ImplId,
		Blake2_128Concat,
		ImplBuildVersion,
		ImplBuildInfo,
	>;

	#[pallet::storage]
	pub type CounterForImplBuilds<T: Config> =
		StorageMap<_, Blake2_128Concat, T::ImplId, u32, ValueQuery>;

	/// Storage for flip set, this is for online checking
	#[pallet::storage]
	pub(crate) type FlipSet<T: Config> =
		CountedStorageMap<_, Blake2_128Concat, T::AccountId, BlockNumberFor<T>>;

	/// Storage for flop set, this is for online checking
	#[pallet::storage]
	pub(crate) type FlopSet<T: Config> =
		CountedStorageMap<_, Blake2_128Concat, T::AccountId, BlockNumberFor<T>>;

	/// Storage for stage of flip-flop, this is used for online checking
	#[pallet::storage]
	pub(crate) type FlipOrFlop<T: Config> = StorageValue<_, FlipFlopStage, ValueQuery>;

	/// Storage for stage of flip-flop, this is used for online checking
	#[pallet::storage]
	pub(crate) type CurrentFlipFlopStartedAt<T: Config> =
		StorageValue<_, BlockNumberFor<T>, ValueQuery>;

	/// Stores the `ImplId` that is going to be used for the next implementation.
	/// This gets incremented whenever a new impl is created.
	#[pallet::storage]
	pub type NextImplId<T: Config> = StorageValue<_, T::ImplId, OptionQuery>;

	#[pallet::storage]
	pub type AccountOwningImpls<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		Blake2_128Concat,
		T::ImplId,
		(),
		OptionQuery,
	>;

	#[pallet::storage]
	pub type AccountOwningWorkers<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		Blake2_128Concat,
		T::AccountId,
		(),
		OptionQuery,
	>;

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// The worker registered successfully
		WorkerRegistered {
			worker: T::AccountId,
			owner: T::AccountId,
			impl_id: T::ImplId,
		},
		/// The worker registered successfully
		WorkerDeregistered {
			worker: T::AccountId,
			force: bool,
		},
		/// The worker is online
		WorkerOnline {
			worker: T::AccountId,
			impl_spec_version: ImplSpecVersion,
			impl_build_version: ImplBuildVersion,
			attestation_method: AttestationMethod,
			attestation_expires_at: Option<u64>,
			next_heartbeat: BlockNumberFor<T>,
		},
		WorkerUnresponsive {
			worker: T::AccountId,
		},
		/// The worker is requesting offline
		WorkerRequestingOffline {
			worker: T::AccountId,
		},
		/// The worker is offline
		WorkerOffline {
			worker: T::AccountId,
			reason: OfflineReason,
		},
		/// The worker send heartbeat successfully
		WorkerHeartbeatReceived {
			worker: T::AccountId,
			next: BlockNumberFor<T>,
			uptime: u64,
		},
		/// The worker refresh its attestation successfully
		WorkerAttestationRefreshed {
			worker: T::AccountId,
			expires_at: Option<u64>,
		},
		ImplRegistered {
			impl_id: T::ImplId,
			owner: T::AccountId,
			attestation_method: AttestationMethod,
		},
		ImplDeregistered {
			impl_id: T::ImplId,
		},
		ImplMetadataUpdated {
			impl_id: T::ImplId,
			metadata: BoundedVec<u8, T::ImplMetadataLimit>,
		},
		ImplMetadataRemoved {
			impl_id: T::ImplId,
		},
		/// Update worker's implementation permission successfully
		ImplBuildRegistered {
			impl_id: T::ImplId,
			impl_build_version: ImplBuildVersion,
			magic_bytes: Option<ImplBuildMagicBytes>,
		},
		/// Remove worker's implementation permission successfully
		ImplBuildDeregistered {
			impl_id: T::ImplId,
			impl_build_version: ImplBuildVersion,
		},
		ImplBuildStatusUpdated {
			impl_id: T::ImplId,
			impl_build_version: ImplBuildVersion,
			status: ImplBuildStatus,
		},
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		InternalError,
		ImplIdTaken,
		/// The own must not the worker it self
		InvalidOwner,
		/// Initial deposit for register a worker must equal or above `ExistentialDeposit`
		InitialBalanceTooLow,
		/// Worker already registered
		AlreadyRegistered,
		/// Downstream pallet report the worker can't deregister
		DeregisterBlocked,
		/// Worker's wallet reserved money smaller than should be reserved
		InsufficientDeposit,
		/// The extrinsic origin isn't the worker's owner
		NotTheOwner,
		/// The extrinsic origin isn't the worker
		NotTheWorker,
		/// The worker not exists
		WorkerNotFound,
		/// The worker is not online
		WorkerNotOnline,
		/// The worker must offline before do deregister
		WorkerNotOffline,
		/// The worker's status doesn't allow the operation
		WrongStatus,
		/// Attestation required
		OptOutAttestationDisallowed,
		/// Attestation expired,
		AttestationExpired,
		AttestationNeverExpire,
		/// Attestation invalid,
		InvalidAttestation,
		/// Attestation payload invalid
		CanNotVerifyPayload,
		/// Can't verify payload
		PayloadSignatureMismatched,
		ImplMismatched,
		ImplBuildChanged,
		/// Worker's software is blocked or deprecated.
		ImplBuildRestricted,
		/// worker implementation's hash mismatch
		ImplBuildMagicBytesMismatched,
		/// The attestation method must not change
		AttestationMethodChanged,
		/// AlreadySentHeartbeat
		HeartbeatAlreadySent,
		/// Too early to send heartbeat
		TooEarly,
		/// Already requested offline
		AlreadyRequestedOffline,
		ImplNotFound,
		NoPermission,
		ImplStillInUse,
		ImplBuildAlreadyRegistered,
		ImplBuildNotFound,
		ImplBuildsLimitExceeded,
		ImplBuildStillInUse,
	}

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
		fn on_initialize(n: BlockNumberFor<T>) -> Weight {
			let mut reads: u64 = 2; // Read FlipOrFlop and CurrentFlipFlopStartedAt
			let mut writes: u64 = 0;

			let mut flip_or_flop = FlipOrFlop::<T>::get();
			let current_flip_flop_started_at = CurrentFlipFlopStartedAt::<T>::get();
			if n == current_flip_flop_started_at +
				T::CollectingHeartbeatsDurationInBlocks::get().into()
			{
				match flip_or_flop {
					FlipFlopStage::Flip => {
						flip_or_flop = FlipFlopStage::FlipToFlop;
						FlipOrFlop::<T>::set(flip_or_flop);
						writes += 1;
					},
					FlipFlopStage::Flop => {
						flip_or_flop = FlipFlopStage::FlopToFlip;
						FlipOrFlop::<T>::set(flip_or_flop);
						writes += 1;
					},
					_ => {},
				}
			}
			match flip_or_flop {
				FlipFlopStage::FlipToFlop => {
					let iter = FlipSet::<T>::iter_keys()
						.take(T::HandleUnresponsivePerBlockLimit::get() as usize);
					let total_count = FlipSet::<T>::count();

					let mut i: u64 = 0;
					for worker in iter {
						FlipSet::<T>::remove(&worker);
						Self::handle_worker_unresponsive(&worker);
						i += 1;
					}

					reads += i;
					writes += i.saturating_mul(3);

					if i >= total_count as u64 {
						FlipOrFlop::<T>::set(FlipFlopStage::Flop);
						CurrentFlipFlopStartedAt::<T>::set(n);
						writes += 2;
					}
				},
				FlipFlopStage::FlopToFlip => {
					let iter = FlopSet::<T>::iter_keys()
						.take(T::HandleUnresponsivePerBlockLimit::get() as usize);
					let total_count = FlopSet::<T>::count();

					let mut i: u64 = 0;
					for worker in iter {
						FlopSet::<T>::remove(&worker);
						Self::handle_worker_unresponsive(&worker);
						i += 1;
					}

					reads += i;
					writes += i.saturating_mul(3);

					if i >= total_count as u64 {
						FlipOrFlop::<T>::set(FlipFlopStage::Flip);
						CurrentFlipFlopStartedAt::<T>::set(n);
						writes += 2;
					}
				},
				_ => {},
			}

			T::DbWeight::get().reads_writes(reads, writes)
		}
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// Register a computing workers.
		///
		/// ## Arguments
		/// - `origin`: Must be called by a `Signed` origin, it will become the worker's owner.
		/// - `worker`: The worker.
		/// - `initial_deposit`: Initial deposit amount.
		///
		/// ## Deposits/Fees
		/// The origin signed account will transfer `initial_deposit` to worker's current account
		/// that will use for slashing.
		/// If the balance below `ReservedDeposit`, the worker will be removed
		///
		/// ## Events
		/// The `Registered` event is emitted in case of success.
		#[transactional]
		#[pallet::call_index(0)]
		#[pallet::weight(T::WeightInfo::register_worker())]
		pub fn register_worker(
			origin: OriginFor<T>,
			worker: AccountIdLookupOf<T>,
			impl_id: T::ImplId,
			initial_deposit: BalanceOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			let worker = T::Lookup::lookup(worker)?;
			Self::do_register_worker(who, worker, impl_id, initial_deposit)
		}

		/// Deregister a computing workers.
		#[transactional]
		#[pallet::call_index(1)]
		#[pallet::weight(T::WeightInfo::deregister_worker())]
		pub fn deregister_worker(
			origin: OriginFor<T>,
			worker: AccountIdLookupOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			let worker = T::Lookup::lookup(worker)?;
			Self::do_deregister_worker(who, worker)
		}

		/// The same with balances.transfer_keep_alive(owner, worker, balance)
		#[transactional]
		#[pallet::call_index(2)]
		#[pallet::weight(T::WeightInfo::transfer_to_worker())]
		pub fn transfer_to_worker(
			origin: OriginFor<T>,
			worker: AccountIdLookupOf<T>,
			value: BalanceOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			let worker = T::Lookup::lookup(worker)?;
			let worker_info = Workers::<T>::get(&worker).ok_or(Error::<T>::WorkerNotFound)?;
			Self::ensure_owner(&who, &worker_info)?;

			<T as Config>::Currency::transfer(&who, &worker, value, Preservation::Preserve)?;
			Ok(())
		}

		/// The same with balances.transfer_keep_alive(worker, owner, balance)
		#[transactional]
		#[pallet::call_index(3)]
		#[pallet::weight(T::WeightInfo::withdraw_from_worker())]
		pub fn withdraw_from_worker(
			origin: OriginFor<T>,
			worker: AccountIdLookupOf<T>,
			value: BalanceOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			let worker = T::Lookup::lookup(worker)?;
			let worker_info = Workers::<T>::get(&worker).ok_or(Error::<T>::WorkerNotFound)?;
			Self::ensure_owner(&who, &worker_info)?;

			<T as Config>::Currency::transfer(&worker, &who, value, Preservation::Preserve)?;
			Ok(())
		}

		/// The worker claim for online
		#[transactional]
		#[pallet::call_index(4)]
		#[pallet::weight(T::WeightInfo::online())]
		pub fn online(
			origin: OriginFor<T>,
			payload: OnlinePayload<T::ImplId>,
			attestation: Attestation,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			Self::do_online(who, payload, attestation)
		}

		/// The worker requesting offline
		#[transactional]
		#[pallet::call_index(5)]
		#[pallet::weight(T::WeightInfo::request_offline())]
		pub fn request_offline(origin: OriginFor<T>) -> DispatchResult {
			let who = ensure_signed(origin)?;
			Self::do_request_offline(who, None)
		}

		/// The owner (or his proxy) requesting a worker to offline
		#[transactional]
		#[pallet::call_index(6)]
		#[pallet::weight(T::WeightInfo::request_offline_for())]
		pub fn request_offline_for(
			origin: OriginFor<T>,
			worker: AccountIdLookupOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			let worker = T::Lookup::lookup(worker)?;
			Self::do_request_offline(worker, Some(who))
		}

		/// The worker force offline, slashing will apply
		#[transactional]
		#[pallet::call_index(7)]
		#[pallet::weight(T::WeightInfo::force_offline())]
		pub fn force_offline(origin: OriginFor<T>) -> DispatchResult {
			let who = ensure_signed(origin)?;
			Self::do_force_offline(who, None)
		}

		/// The owner (or his proxy) force a worker to offline, will apply slash
		#[transactional]
		#[pallet::call_index(8)]
		#[pallet::weight(T::WeightInfo::force_offline_for())]
		pub fn force_offline_for(
			origin: OriginFor<T>,
			worker: AccountIdLookupOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			let worker = T::Lookup::lookup(worker)?;
			Self::do_force_offline(worker, Some(who))
		}

		#[transactional]
		#[pallet::call_index(9)]
		#[pallet::weight(T::WeightInfo::refresh_attestation())]
		pub fn refresh_attestation(
			origin: OriginFor<T>,
			payload: OnlinePayload<T::ImplId>,
			attestation: Attestation,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			Self::do_refresh_attestation(who, payload, attestation)
		}

		/// Worker report it is still online, must called by the worker
		#[transactional]
		#[pallet::call_index(10)]
		#[pallet::weight(T::WeightInfo::heartbeat())]
		pub fn heartbeat(origin: OriginFor<T>) -> DispatchResult {
			let who = ensure_signed(origin)?;
			Self::do_heartbeat(who)
		}

		#[transactional]
		#[pallet::call_index(11)]
		#[pallet::weight({0})]
		pub fn register_impl(
			origin: OriginFor<T>,
			attestation_method: AttestationMethod,
		) -> DispatchResult {
			let owner = T::RegisterImplOrigin::ensure_origin(origin)?;
			let impl_id = NextImplId::<T>::get().unwrap_or(101u32.into());

			Self::do_register_impl(
				impl_id.clone(),
				owner,
				attestation_method,
			)?;

			let next_impl_id = impl_id.increment();
			NextImplId::<T>::set(next_impl_id);

			Ok(())
		}

		#[transactional]
		#[pallet::call_index(12)]
		#[pallet::weight({0})]
		pub fn deregister_impl(origin: OriginFor<T>, impl_id: T::ImplId) -> DispatchResult {
			let who = T::RegisterImplOrigin::ensure_origin(origin)?;

			Self::do_deregister_impl(who, impl_id)
		}

		#[transactional]
		#[pallet::call_index(13)]
		#[pallet::weight({0})]
		pub fn update_impl_metadata(
			origin: OriginFor<T>,
			impl_id: T::ImplId,
			new_metadata: Option<BoundedVec<u8, T::ImplMetadataLimit>>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let impl_info = Impls::<T>::get(&impl_id).ok_or(Error::<T>::ImplNotFound)?;
			Self::ensure_impl_owner(&who, &impl_info)?;

			if let Some(new_metadata) = new_metadata {
				Self::do_update_impl_metadata(impl_info, new_metadata)?;
			} else {
				Self::do_remove_impl_metadata(impl_info)?;
			}

			Ok(())
		}

		#[transactional]
		#[pallet::call_index(14)]
		#[pallet::weight({0})]
		pub fn register_impl_build(
			origin: OriginFor<T>,
			impl_id: T::ImplId,
			version: ImplBuildVersion,
			magic_bytes: Option<ImplBuildMagicBytes>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let impl_info = Impls::<T>::get(impl_id).ok_or(Error::<T>::ImplNotFound)?;
			Self::ensure_impl_owner(&who, &impl_info)?;

			Self::do_register_impl_build(impl_info, version, magic_bytes)
		}

		#[transactional]
		#[pallet::call_index(15)]
		#[pallet::weight({0})]
		pub fn deregister_impl_build(
			origin: OriginFor<T>,
			impl_id: T::ImplId,
			version: ImplBuildVersion,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let impl_info = Impls::<T>::get(impl_id).ok_or(Error::<T>::ImplNotFound)?;
			Self::ensure_impl_owner(&who, &impl_info)?;

			Self::do_deregister_impl_build(impl_info, version)
		}

		#[transactional]
		#[pallet::call_index(16)]
		#[pallet::weight({0})]
		pub fn update_impl_build_status(
			origin: OriginFor<T>,
			impl_id: T::ImplId,
			version: ImplBuildVersion,
			status: ImplBuildStatus,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let impl_info = Impls::<T>::get(&impl_id).ok_or(Error::<T>::ImplNotFound)?;
			Self::ensure_impl_owner(&who, &impl_info)?;

			Self::do_update_impl_build_status(impl_id, version, status)
		}
	}
}

impl<T: Config> Pallet<T> {
	pub(crate) fn set_worker_unresponsive(worker: &T::AccountId) {
		FlipSet::<T>::remove(worker);
		FlopSet::<T>::remove(worker);
		Workers::<T>::mutate(worker, |worker_info| {
			if let Some(info) = worker_info.as_mut() {
				info.status = WorkerStatus::Unresponsive;
			}
		});

		Self::deposit_event(Event::<T>::WorkerUnresponsive { worker: worker.clone() });
	}

	pub(crate) fn set_worker_offline(worker: &T::AccountId, reason: OfflineReason) {
		T::OffchainWorkerLifecycleHooks::before_offline(worker, reason.clone());

		FlipSet::<T>::remove(worker);
		FlopSet::<T>::remove(worker);
		Workers::<T>::mutate(worker, |worker_info| {
			if let Some(info) = worker_info.as_mut() {
				if let Some(impl_build_version) = info.impl_build_version {
					ImplBuilds::<T>::mutate(&info.impl_id, impl_build_version, |impl_build_info| {
						if let Some(info) = impl_build_info.as_mut() {
							info.workers_count -= 1;
						}
					});
				}

				info.status = WorkerStatus::Offline;
				info.impl_spec_version = None;
				info.impl_build_version = None;
				info.attestation_method = None;
				info.attestation_expires_at = None;
				info.attested_at = None;
				info.last_sent_heartbeat_at = None;
				info.uptime_started_at = None;
				info.uptime = None;
			}
		});

		Self::deposit_event(Event::<T>::WorkerOffline { worker: worker.clone(), reason });
	}

	pub(crate) fn flip_flop_for_online(worker: &T::AccountId) -> BlockNumberFor<T> {
		let next_heartbeat = Self::generate_next_heartbeat_block();
		let stage = FlipOrFlop::<T>::get();
		match stage {
			FlipFlopStage::Flip | FlipFlopStage::FlopToFlip => {
				FlopSet::<T>::insert(worker, next_heartbeat);
			},
			FlipFlopStage::Flop | FlipFlopStage::FlipToFlop => {
				FlipSet::<T>::insert(worker, next_heartbeat);
			},
		}

		next_heartbeat
	}

	pub(crate) fn handle_worker_unresponsive(worker: &T::AccountId) {
		T::OffchainWorkerLifecycleHooks::after_unresponsive(worker);
		Self::set_worker_unresponsive(worker);
	}

	pub(crate) fn verify_attestation(
		attestation: &Attestation,
	) -> Result<VerifiedAttestation, DispatchError> {
		let now = T::UnixTime::now().as_secs().saturated_into::<u64>();
		let verified = attestation.verify(now);
		match verified {
			Ok(verified) => Ok(verified),
			Err(AttestationError::Expired) => Err(Error::<T>::AttestationExpired.into()),
			Err(AttestationError::Invalid) => Err(Error::<T>::InvalidAttestation.into()),
		}
	}

	pub(crate) fn verify_online_payload(
		worker: &T::AccountId,
		payload: &OnlinePayload<T::ImplId>,
		verified_attestation: &VerifiedAttestation,
	) -> DispatchResult {
		let Some(attestation_payload) = verified_attestation.payload() else { return Ok(()) };

		let encode_worker = T::AccountId::encode(worker);
		let h256_worker = H256::from_slice(&encode_worker);
		let worker_public_key = sr25519::Public::from_h256(h256_worker);

		let encoded_message = Encode::encode(payload);

		let Some(signature) = sr25519::Signature::from_slice(attestation_payload) else {
			return Err(Error::<T>::CanNotVerifyPayload.into())
		};

		ensure!(
			sr25519_verify(&signature, &encoded_message, &worker_public_key),
			Error::<T>::PayloadSignatureMismatched
		);

		Ok(())
	}

	pub(crate) fn ensure_owner(
		who: &T::AccountId,
		worker_info: &WorkerInfo<T::AccountId, BalanceOf<T>, T::ImplId>,
	) -> DispatchResult {
		ensure!(*who == worker_info.owner, Error::<T>::NotTheOwner);
		Ok(())
	}

	pub(crate) fn ensure_worker(
		who: &T::AccountId,
		worker_info: &WorkerInfo<T::AccountId, BalanceOf<T>, T::ImplId>,
	) -> DispatchResult {
		ensure!(*who == worker_info.account, Error::<T>::NotTheWorker);
		Ok(())
	}

	pub(crate) fn ensure_impl_owner(
		who: &T::AccountId,
		impl_info: &ImplInfo<T::ImplId, T::AccountId, BalanceOf<T>>,
	) -> DispatchResult {
		ensure!(who == &impl_info.owner, Error::<T>::NoPermission);

		Ok(())
	}

	pub(crate) fn ensure_attestation_method(
		attestation: &Attestation,
		worker_info: &WorkerInfo<T::AccountId, BalanceOf<T>, T::ImplId>,
	) -> DispatchResult {
		let Some(worker_attestation_method) = worker_info.attestation_method.clone() else {
			return Err(Error::<T>::InternalError.into())
		};

		ensure!(
			attestation.method() == worker_attestation_method,
			Error::<T>::AttestationMethodChanged
		);

		Ok(())
	}

	/// This function copied from pallet_lottery
	///
	/// Generate a random number from a given seed.
	/// Note that there is potential bias introduced by using modulus operator.
	/// You should call this function with different seed values until the random
	/// number lies within `u32::MAX - u32::MAX % n`.
	/// TODO: deal with randomness freshness
	/// https://github.com/paritytech/substrate/issues/8311
	pub(crate) fn generate_random_number(seed: u32) -> u32 {
		let (random_seed, _) = T::Randomness::random(&(b"computing_workers", seed).encode());
		let random_number = <u32>::decode(&mut random_seed.as_ref())
			.expect("secure hashes should always be bigger than u32; qed");
		// log!(info, "Random number: {}", random_number);

		random_number
	}

	pub(crate) fn generate_next_heartbeat_block() -> BlockNumberFor<T> {
		let current_flip_flop_started_at = CurrentFlipFlopStartedAt::<T>::get();
		let duration = T::CollectingHeartbeatsDurationInBlocks::get();
		let random_delay = Self::generate_random_number(0) % (duration * 4 / 5); // Give ~20% room

		current_flip_flop_started_at + (duration + random_delay).into()
	}

	pub fn impl_info(
		impl_id: &T::ImplId,
	) -> Option<ImplInfo<T::ImplId, T::AccountId, BalanceOf<T>>> {
		Impls::<T>::get(impl_id)
	}

	pub fn impl_exists(impl_id: &T::ImplId) -> bool {
		Impls::<T>::contains_key(impl_id)
	}

	pub fn worker_info(
		worker: &T::AccountId,
	) -> Option<WorkerInfo<T::AccountId, BalanceOf<T>, T::ImplId>> {
		Workers::<T>::get(worker)
	}

	pub fn worker_exists(worker: &T::AccountId) -> bool {
		Workers::<T>::contains_key(worker)
	}

	pub fn reward_worker(
		worker: &T::AccountId,
		source: &T::AccountId,
		value: BalanceOf<T>,
	) -> Result<BalanceOf<T>, DispatchError> {
		<T as Config>::Currency::transfer(source, worker, value, Preservation::Preserve)
	}

	pub fn slash_worker(
		worker: &T::AccountId,
		value: BalanceOf<T>,
	) -> (Credit<T::AccountId, T::Currency>, BalanceOf<T>) {
		<T as Config>::Currency::slash(&HoldReason::WorkerRegistrationReserve.into(), worker, value)
	}

	pub fn offline_worker(worker: &T::AccountId, reason: OfflineReason) -> DispatchResult {
		let mut worker_info = Workers::<T>::get(worker).ok_or(Error::<T>::WorkerNotFound)?;
		ensure!(
			matches!(worker_info.status, WorkerStatus::Online | WorkerStatus::RequestingOffline),
			Error::<T>::WorkerNotOnline
		);

		worker_info.status = WorkerStatus::Offline;
		Workers::<T>::insert(worker, worker_info);

		FlipSet::<T>::remove(worker);
		FlopSet::<T>::remove(worker);

		Self::deposit_event(Event::<T>::WorkerOffline { worker: worker.clone(), reason });

		Ok(())
	}
}
