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

use crate::*;
use frame_support::pallet_prelude::*;
use core::cmp::Ordering;

impl<T: Config> Pallet<T> {
	pub fn do_register_impl(
		impl_id: T::ImplId,
		owner: T::AccountId,
		attestation_method: AttestationMethod,
	) -> DispatchResult {
		ensure!(!Impls::<T>::contains_key(&impl_id), Error::<T>::ImplIdTaken);

		let deposit = T::RegisterImplDeposit::get();
		T::Currency::hold(&HoldReason::ImplRegistrationReserve.into(), &owner, deposit)?;

		let impl_info = ImplInfo::<T::ImplId, T::AccountId, BalanceOf<T>> {
			id: impl_id.clone(),
			owner: owner.clone(),
			owner_deposit: deposit,
			attestation_method: attestation_method.clone(),
			workers_count: 0,
		};

		Impls::<T>::insert(&impl_id, impl_info);
		AccountOwningImpls::<T>::insert(&owner, &impl_id, ());

		Self::deposit_event(Event::ImplRegistered {
			owner,
			attestation_method,
			impl_id,
		});
		Ok(())
	}

	pub fn do_deregister_impl(who: T::AccountId, impl_id: T::ImplId) -> DispatchResult {
		let impl_info = Impls::<T>::get(&impl_id).ok_or(Error::<T>::ImplNotFound)?;
		Self::ensure_impl_owner(&who, &impl_info)?;
		ensure!(impl_info.workers_count == 0, Error::<T>::ImplStillInUse);

		if let Some(metadata_entry) = ImplMetadata::<T>::take(&impl_id) {
			T::Currency::release(
				&HoldReason::ImplMetadataStorageReserve.into(),
				&metadata_entry.depositor,
				metadata_entry.actual_deposit,
				Precision::BestEffort,
			)?;
		}

		let _ = ImplBuilds::<T>::clear_prefix(&impl_id, T::MaxImplBuilds::get(), None);
		CounterForImplBuilds::<T>::remove(impl_info.id);

		Impls::<T>::remove(&impl_id);
		AccountOwningImpls::<T>::remove(&impl_info.owner, impl_id.clone());

		T::Currency::release(
			&HoldReason::ImplRegistrationReserve.into(),
			&impl_info.owner,
			impl_info.owner_deposit,
			Precision::BestEffort,
		)?;

		Self::deposit_event(Event::ImplDeregistered { impl_id });
		Ok(())
	}

	pub(crate) fn do_update_impl_metadata(
		impl_info: ImplInfo<T::ImplId, T::AccountId, BalanceOf<T>>,
		new_metadata: BoundedVec<u8, T::ImplMetadataLimit>,
	) -> DispatchResult {
		let impl_id = impl_info.id.clone();
		ImplMetadata::<T>::try_mutate_exists(&impl_id, |metadata_entry| {
			let deposit = T::ImplMetadataDepositPerByte::get()
				.saturating_mul(((new_metadata.len()) as u32).into())
				.saturating_add(T::ImplMetadataDepositBase::get());

			let old_deposit = metadata_entry.take().map_or(Zero::zero(), |m| m.actual_deposit);
			match deposit.cmp(&old_deposit) {
				Ordering::Greater => {
					T::Currency::hold(
						&HoldReason::ImplMetadataStorageReserve.into(),
						&impl_info.owner,
						deposit - old_deposit,
					)?;
				},
				Ordering::Less => {
					T::Currency::release(
						&HoldReason::ImplMetadataStorageReserve.into(),
						&impl_info.owner,
						old_deposit - deposit,
						Precision::BestEffort,
					)?;
				},
				_ => {},
			};

			*metadata_entry = Some(ChainStoredData {
				depositor: impl_info.owner.clone(),
				actual_deposit: deposit,
				surplus_deposit: Zero::zero(),
				data: new_metadata.clone(),
			});

			Self::deposit_event(Event::ImplMetadataUpdated {
				impl_id: impl_id.clone(),
				metadata: new_metadata.clone(),
			});
			Ok(())
		})
	}

	pub(crate) fn do_remove_impl_metadata(
		impl_info: ImplInfo<T::ImplId, T::AccountId, BalanceOf<T>>,
	) -> DispatchResult {
		let Some(metadata_entry) = ImplMetadata::<T>::get(&impl_info.id) else { return Ok(()) };

		ImplMetadata::<T>::remove(&impl_info.id);

		T::Currency::release(
			&HoldReason::ImplMetadataStorageReserve.into(),
			&impl_info.owner,
			metadata_entry.actual_deposit,
			Precision::BestEffort,
		)?;

		Self::deposit_event(Event::ImplMetadataRemoved { impl_id: impl_info.id.clone() });
		Ok(())
	}

	pub(crate) fn do_register_impl_build(
		impl_info: ImplInfo<T::ImplId, T::AccountId, BalanceOf<T>>,
		impl_build_version: ImplBuildVersion,
		magic_bytes: Option<ImplBuildMagicBytes>,
	) -> DispatchResult {
		let impl_id = impl_info.id.clone();
		ensure!(
			!ImplBuilds::<T>::contains_key(&impl_id, impl_build_version),
			Error::<T>::ImplBuildAlreadyRegistered
		);

		CounterForImplBuilds::<T>::try_mutate(&impl_id, |counter| -> Result<(), DispatchError> {
			ensure!(counter <= &mut T::MaxImplBuilds::get(), Error::<T>::ImplBuildsLimitExceeded);

			*counter += 1;
			Ok(())
		})?;

		let impl_build_info = ImplBuildInfo {
			version: impl_build_version,
			magic_bytes: magic_bytes.clone(),
			status: ImplBuildStatus::Released,
			workers_count: 0,
		};

		ImplBuilds::<T>::insert(&impl_id, impl_build_version, impl_build_info);

		Self::deposit_event(Event::<T>::ImplBuildRegistered {
			impl_id,
			impl_build_version,
			magic_bytes,
		});

		Ok(())
	}

	pub(crate) fn do_deregister_impl_build(
		impl_info: ImplInfo<T::ImplId, T::AccountId, BalanceOf<T>>,
		impl_build_version: ImplBuildVersion,
	) -> DispatchResult {
		let impl_id = impl_info.id.clone();
		let impl_build_info = ImplBuilds::<T>::get(&impl_id, impl_build_version)
			.ok_or(Error::<T>::ImplBuildNotFound)?;
		ensure!(impl_build_info.workers_count == 0, Error::<T>::ImplBuildStillInUse);

		ImplBuilds::<T>::remove(&impl_id, impl_build_version);
		CounterForImplBuilds::<T>::try_mutate(&impl_id, |counter| -> Result<(), DispatchError> {
			*counter -= 1;
			Ok(())
		})?;

		Self::deposit_event(Event::<T>::ImplBuildDeregistered { impl_id, impl_build_version });

		Ok(())
	}

	pub(crate) fn do_update_impl_build_status(
		impl_id: T::ImplId,
		impl_build_version: ImplBuildVersion,
		status: ImplBuildStatus,
	) -> DispatchResult {
		ImplBuilds::<T>::try_mutate(
			&impl_id,
			impl_build_version,
			|impl_build_info| -> Result<(), DispatchError> {
				let Some(info) = impl_build_info.as_mut() else {
					return Err(Error::<T>::ImplBuildNotFound.into())
				};

				info.status = status;

				Ok(())
			},
		)?;

		Self::deposit_event(Event::<T>::ImplBuildStatusUpdated {
			impl_id,
			impl_build_version,
			status,
		});

		Ok(())
	}
}
