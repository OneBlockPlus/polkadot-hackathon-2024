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

//! This module contains helper methods to perform the transfer functionalities
//! of the NFTs pallet.

use crate::*;
use frame_support::pallet_prelude::*;

impl<T: Config> Pallet<T> {
	/// Transfer an NFT to the specified destination account.
	///
	/// - `collection`: The ID of the collection to which the NFT belongs.
	/// - `item`: The ID of the NFT to transfer.
	/// - `dest`: The destination account to which the NFT will be transferred.
	/// - `with_details`: A closure that provides access to the collection and item details,
	///   allowing customization of the transfer process.
	///
	/// This function performs the actual transfer of an NFT to the destination account.
	/// It checks various conditions like item lock status and transferability settings
	/// for the collection and item before transferring the NFT.
	///
	/// # Errors
	///
	/// This function returns a dispatch error in the following cases:
	/// - If the collection ID is invalid ([`UnknownCollection`](crate::Error::UnknownProduct)).
	/// - If the item ID is invalid ([`UnknownItem`](crate::Error::UnknownDevice)).
	/// - If the item is locked or transferring it is disabled
	///   ([`ItemLocked`](crate::Error::DeviceLocked)).
	/// - If the collection or item is non-transferable
	///   ([`ItemsNonTransferable`](crate::Error::DevicesNonTransferable)).
	pub fn do_transfer(
		product_id: T::ProductId,
		device_id: T::DeviceId,
		dest: T::AccountId,
		with_details: impl FnOnce(
			&ProductEntryFor<T>,
			&mut DeviceEntryFor<T>,
		) -> DispatchResult,
	) -> DispatchResult {
		// Retrieve collection details.
		let product =
			ProductCollection::<T>::get(&product_id).ok_or(Error::<T>::UnknownProduct)?;

		// Ensure the item is not locked.
		ensure!(!T::Locker::is_locked(product_id, device_id), Error::<T>::DeviceLocked);

		// Ensure the item is not transfer disabled on the system level attribute.
		ensure!(
			!Self::has_system_attribute(&product_id, &device_id, PalletAttributes::TransferDisabled)?,
			Error::<T>::DeviceLocked
		);

		// Retrieve collection config and check if items are transferable.
		let product_config = Self::get_product_config(&product_id)?;
		ensure!(
			product_config.is_setting_enabled(ProductSetting::TransferableItems),
			Error::<T>::DevicesNonTransferable
		);

		// Retrieve item config and check if the item is transferable.
		let device_config = Self::get_device_config(&product_id, &device_id)?;
		ensure!(
			device_config.is_setting_enabled(DeviceSetting::Transferable),
			Error::<T>::DeviceLocked
		);

		// Retrieve the item details.
		let mut device =
			DeviceCollection::<T>::get(&product_id, &device_id).ok_or(Error::<T>::UnknownDevice)?;

		// Perform the transfer with custom details using the provided closure.
		with_details(&product, &mut device)?;

		// Update account ownership information.
		Account::<T>::remove((&device.owner, &product_id, &device_id));
		Account::<T>::insert((&dest, &product_id, &device_id), ());
		let origin = device.owner;
		device.owner = dest;

		// Update item details.
		DeviceCollection::<T>::insert(&product_id, &device_id, &device);

		// Emit `Transferred` event.
		Self::deposit_event(Event::DeviceTransferred {
			product_id,
			device_id,
			from: origin,
			to: device.owner,
		});
		Ok(())
	}

	/// Transfer ownership of a collection to another account.
	///
	/// - `origin`: The account requesting the transfer.
	/// - `collection`: The ID of the collection to transfer ownership.
	/// - `owner`: The new account that will become the owner of the collection.
	///
	/// This function transfers the ownership of a collection to the specified account.
	/// It performs checks to ensure that the `origin` is the current owner and that the
	/// new owner is an acceptable account based on the collection's acceptance settings.
	pub(crate) fn do_transfer_ownership(
		origin: T::AccountId,
		product_id: T::ProductId,
		new_owner: T::AccountId,
	) -> DispatchResult {
		// Check if the new owner is acceptable based on the collection's acceptance settings.
		let acceptable_product = OwnershipAcceptance::<T>::get(&new_owner);
		ensure!(acceptable_product.as_ref() == Some(&product_id), Error::<T>::Unaccepted);

		// Try to retrieve and mutate the collection details.
		ProductCollection::<T>::try_mutate(product_id, |maybe_product| {
			let product = maybe_product.as_mut().ok_or(Error::<T>::UnknownProduct)?;
			// Check if the `origin` is the current owner of the collection.
			ensure!(origin == product.owner, Error::<T>::NoPermission);
			if product.owner == new_owner {
				return Ok(())
			}

			// Move the deposit to the new owner.
			<T as Config>::Currency::repatriate_reserved(
				&product.owner,
				&new_owner,
				product.owner_deposit,
				Reserved,
			)?;

			// Update account ownership information.
			ProductOwnerAccount::<T>::remove(&product.owner, &product_id);
			ProductOwnerAccount::<T>::insert(&new_owner, &product_id, ());

			product.owner = new_owner.clone();
			OwnershipAcceptance::<T>::remove(&new_owner);
			frame_system::Pallet::<T>::dec_consumers(&new_owner);

			// Emit `OwnerChanged` event.
			Self::deposit_event(Event::ProductOwnerChanged { product_id, new_owner });
			Ok(())
		})
	}
	/// Set or unset the ownership acceptance for an account regarding a specific collection.
	///
	/// - `who`: The account for which to set or unset the ownership acceptance.
	/// - `maybe_collection`: An optional collection ID to set the ownership acceptance.
	///
	/// If `maybe_collection` is `Some(collection)`, then the account `who` will accept
	/// ownership transfers for the specified collection. If `maybe_collection` is `None`,
	/// then the account `who` will unset the ownership acceptance, effectively refusing
	/// ownership transfers for any collection.
	pub(crate) fn do_accept_product_ownership(
		who: T::AccountId,
		maybe_product_id: Option<T::ProductId>,
	) -> DispatchResult {
		let exists = OwnershipAcceptance::<T>::contains_key(&who);
		match (exists, maybe_product_id.is_some()) {
			(false, true) => {
				frame_system::Pallet::<T>::inc_consumers(&who)?;
			},
			(true, false) => {
				frame_system::Pallet::<T>::dec_consumers(&who);
			},
			_ => {},
		}
		if let Some(product_id) = maybe_product_id.as_ref() {
			OwnershipAcceptance::<T>::insert(&who, product_id);
		} else {
			OwnershipAcceptance::<T>::remove(&who);
		}

		// Emit `OwnershipAcceptanceChanged` event.
		Self::deposit_event(Event::ProductOwnershipAcceptanceChanged { who, maybe_product_id });
		Ok(())
	}

	/// Forcefully change the owner of a collection.
	///
	/// - `collection`: The ID of the collection to change ownership.
	/// - `owner`: The new account that will become the owner of the collection.
	///
	/// This function allows for changing the ownership of a collection without any checks.
	/// It moves the deposit to the new owner, updates the collection's owner, and emits
	/// an `OwnerChanged` event.
	pub(crate) fn do_force_collection_owner(
		product_id: T::ProductId,
		owner: T::AccountId,
	) -> DispatchResult {
		// Try to retrieve and mutate the collection details.
		ProductCollection::<T>::try_mutate(product_id, |maybe_product| {
			let product = maybe_product.as_mut().ok_or(Error::<T>::UnknownProduct)?;
			if product.owner == owner {
				return Ok(())
			}

			// Move the deposit to the new owner.
			<T as Config>::Currency::repatriate_reserved(
				&product.owner,
				&owner,
				product.owner_deposit,
				Reserved,
			)?;

			// Update collection accounts and set the new owner.
			ProductOwnerAccount::<T>::remove(&product.owner, &product_id);
			ProductOwnerAccount::<T>::insert(&owner, &product_id, ());
			product.owner = owner.clone();

			// Emit `OwnerChanged` event.
			Self::deposit_event(Event::ProductOwnerChanged { product_id, new_owner: owner });
			Ok(())
		})
	}
}
