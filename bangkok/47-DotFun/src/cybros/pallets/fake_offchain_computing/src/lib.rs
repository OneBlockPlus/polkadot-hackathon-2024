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

/// Edit this file to define custom logic or remove it if it is not needed.
/// Learn more about FRAME and the core library of Substrate FRAME pallets:
/// <https://docs.substrate.io/reference/frame-pallets/>
pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

/// The log target of this pallet.
pub const LOG_TARGET: &str = "runtime::fake_offchain_computing";

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

use frame_support::sp_runtime::Saturating;
use pallet_offchain_computing_infra::{
	BalanceOf, OffchainWorkerLifecycleHooks, OfflineReason, OnlinePayload, VerifiedAttestation,
};

pub(crate) type PalletInfra<T> = pallet_offchain_computing_infra::Pallet<T>;

#[frame_support::pallet]
pub mod pallet {
	use super::*;
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;

	/// The current storage version.
	const STORAGE_VERSION: StorageVersion = StorageVersion::new(1);

	#[pallet::pallet]
	#[pallet::storage_version(STORAGE_VERSION)]
	pub struct Pallet<T>(_);

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config + pallet_offchain_computing_infra::Config {
		/// Because this pallet emits events, it depends on the runtime definition of an event.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

		#[pallet::constant]
		type SlashingCardinal: Get<BalanceOf<Self>>;
	}

	#[pallet::storage]
	pub type RunningWorkers<T: Config> = StorageMap<_, Identity, T::AccountId, ()>;

	#[pallet::storage]
	pub type BlockedWorkers<T: Config> = StorageMap<_, Identity, T::AccountId, ()>;

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		Started { worker: T::AccountId },
		Stopped { worker: T::AccountId },
		Slashed { worker: T::AccountId, amount: BalanceOf<T> },
		Offline { worker: T::AccountId },
		Blocked { worker: T::AccountId },
		Unblocked { worker: T::AccountId },
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		AlreadyStarted,
		AlreadyStopped,
		Blocked,
		NotStarted,
		InsufficientFundsForSlashing,
		NotTheOwner,
		WorkerNotExists,
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		#[pallet::call_index(0)]
		#[pallet::weight({0})]
		pub fn start(origin: OriginFor<T>, worker: T::AccountId) -> DispatchResult {
			Self::ensure_owner_or_root(origin, &worker)?;

			ensure!(!<RunningWorkers<T>>::contains_key(&worker), Error::<T>::AlreadyStarted);
			ensure!(!<BlockedWorkers<T>>::contains_key(&worker), Error::<T>::Blocked);

			<RunningWorkers<T>>::insert(&worker, ());

			Self::deposit_event(Event::Started { worker });
			Ok(())
		}

		#[pallet::call_index(1)]
		#[pallet::weight({0})]
		pub fn stop(origin: OriginFor<T>, worker: T::AccountId) -> DispatchResult {
			Self::ensure_owner_or_root(origin, &worker)?;

			ensure!(<RunningWorkers<T>>::contains_key(&worker), Error::<T>::AlreadyStopped);

			<RunningWorkers<T>>::remove(&worker);

			Self::deposit_event(Event::Stopped { worker });
			Ok(())
		}
	}

	impl<T: Config> Pallet<T> {
		fn ensure_owner_or_root(origin: OriginFor<T>, worker: &T::AccountId) -> DispatchResult {
			let who = ensure_signed_or_root(origin)?;
			if let Some(worker_info) = PalletInfra::<T>::worker_info(worker) {
				if let Some(owner) = who {
					ensure!(owner == worker_info.owner, Error::<T>::NotTheOwner)
				}
			} else {
				return Err(Error::<T>::WorkerNotExists.into())
			}

			Ok(())
		}
	}

	impl<T: Config> OffchainWorkerLifecycleHooks<T::AccountId, T::ImplId> for Pallet<T> {
		fn can_online(
			worker: &T::AccountId,
			_payload: &OnlinePayload<T::ImplId>,
			_verified_attestation: &VerifiedAttestation,
		) -> DispatchResult {
			log!(info, "can_online: {:?}", worker);

			ensure!(!<BlockedWorkers<T>>::contains_key(worker), Error::<T>::Blocked);
			ensure!(!<RunningWorkers<T>>::contains_key(worker), Error::<T>::AlreadyStarted);

			Ok(())
		}

		fn after_online(worker: &T::AccountId) {
			log!(info, "after_online: {:?}", worker);

			<RunningWorkers<T>>::insert(worker, ());

			Self::deposit_event(Event::Started { worker: worker.clone() });
		}

		fn can_offline(worker: &T::AccountId) -> bool {
			log!(info, "can_offline: {:?}", worker);

			!<RunningWorkers<T>>::contains_key(worker)
		}

		fn after_unresponsive(worker: &T::AccountId) {
			log!(info, "after_unresponsive: {:?}", worker);
		}

		fn before_offline(worker: &T::AccountId, reason: OfflineReason) {
			log!(info, "before_offline: {:?}", worker);

			if !<RunningWorkers<T>>::contains_key(worker) {
				return
			}

			if reason != OfflineReason::Graceful {
				let _ = PalletInfra::<T>::slash_worker(
					worker,
					T::SlashingCardinal::get().saturating_mul(10u32.into()),
				);
			}

			<RunningWorkers<T>>::remove(worker);
		}

		fn after_refresh_attestation(
			worker: &T::AccountId,
			_payload: &OnlinePayload<T::ImplId>,
			_verified_attestation: &VerifiedAttestation,
		) {
			log!(info, "after_refresh_attestation: {:?}", worker);
		}

		fn after_requesting_offline(worker: &T::AccountId) {
			log!(info, "after_requesting_offline: {:?}", worker);
		}

		fn can_deregister(_worker: &T::AccountId) -> bool {
			true
		}

		fn before_deregister(worker: &T::AccountId) {
			log!(info, "before_deregister: {:?}", worker);
		}
	}
}
