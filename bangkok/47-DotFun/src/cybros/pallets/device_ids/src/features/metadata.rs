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

//! This module contains helper methods to configure the metadata of collections and items.

use crate::*;
use frame_support::pallet_prelude::*;

impl<T: Config> Pallet<T> {
	/// Sets the metadata for a specific item within a collection.
	///
	/// - `maybe_check_origin`: An optional account ID that is allowed to set the metadata. If
	///   `None`, it's considered the root account.
	/// - `collection`: The ID of the collection to which the item belongs.
	/// - `item`: The ID of the item to set the metadata for.
	/// - `data`: The metadata to set for the item.
	/// - `maybe_depositor`: An optional account ID that will provide the deposit for the metadata.
	///   If `None`, the collection's owner provides the deposit.
	///
	/// Emits `ItemMetadataSet` event upon successful setting of the metadata.
	/// Returns `Ok(())` on success, or one of the following dispatch errors:
	/// - `UnknownCollection`: The specified collection does not exist.
	/// - `UnknownItem`: The specified item does not exist within the collection.
	/// - `LockedItemMetadata`: The metadata for the item is locked and cannot be modified.
	/// - `NoPermission`: The caller does not have the required permission to set the metadata.
	/// - `DepositExceeded`: The deposit amount exceeds the maximum allowed value.
	pub(crate) fn do_set_item_metadata(
		maybe_check_origin: Option<T::AccountId>,
		product_id: T::ProductId,
		device_id: T::DeviceId,
		data: BoundedVec<u8, T::StringLimit>,
		maybe_depositor: Option<T::AccountId>,
	) -> DispatchResult {
		if let Some(check_origin) = &maybe_check_origin {
			ensure!(
				Self::has_role(&product_id, &check_origin, ProductRole::Admin),
				Error::<T>::NoPermission
			);
		}

		let is_root = maybe_check_origin.is_none();
		let mut product =
			ProductCollection::<T>::get(&product_id).ok_or(Error::<T>::UnknownProduct)?;

		let device_config = Self::get_device_config(&product_id, &device_id)?;
		ensure!(
			is_root || device_config.is_setting_enabled(DeviceSetting::UnlockedMetadata),
			Error::<T>::LockedDeviceMetadata
		);

		let product_config = Self::get_product_config(&product_id)?;

		DeviceMetadataOf::<T>::try_mutate_exists(product_id, device_id, |metadata| {
			if metadata.is_none() {
				product.device_metadata_count.saturating_inc();
			}

			let old_deposit = metadata
				.take()
				.map_or(DeviceMetadataDeposit { account: None, amount: Zero::zero() }, |m| m.deposit);

			let mut deposit = Zero::zero();
			if product_config.is_setting_enabled(ProductSetting::DepositRequired) && !is_root
			{
				deposit = <T as Config>::DepositPerByte::get()
					.saturating_mul(((data.len()) as u32).into())
					.saturating_add(T::MetadataDepositBase::get());
			}

			let depositor = maybe_depositor.clone().unwrap_or(product.owner.clone());
			let old_depositor = old_deposit.account.unwrap_or(product.owner.clone());

			if depositor != old_depositor {
				<T as Config>::Currency::unreserve(&old_depositor, old_deposit.amount);
				<T as Config>::Currency::reserve(&depositor, deposit)?;
			} else if deposit > old_deposit.amount {
				<T as Config>::Currency::reserve(&depositor, deposit - old_deposit.amount)?;
			} else if deposit < old_deposit.amount {
				<T as Config>::Currency::unreserve(&depositor, old_deposit.amount - deposit);
			}

			if maybe_depositor.is_none() {
				product.owner_deposit.saturating_accrue(deposit);
				product.owner_deposit.saturating_reduce(old_deposit.amount);
			}

			*metadata = Some(DeviceMetadata {
				deposit: DeviceMetadataDeposit { account: maybe_depositor, amount: deposit },
				data: data.clone(),
			});

			ProductCollection::<T>::insert(&product_id, &product);
			Self::deposit_event(Event::DeviceMetadataSet { product_id, device_id, data });
			Ok(())
		})
	}

	/// Clears the metadata for a specific item within a collection.
	///
	/// - `maybe_check_origin`: An optional account ID that is allowed to clear the metadata. If
	///   `None`, it's considered the root account.
	/// - `collection`: The ID of the collection to which the item belongs.
	/// - `item`: The ID of the item for which to clear the metadata.
	///
	/// Emits `ItemMetadataCleared` event upon successful clearing of the metadata.
	/// Returns `Ok(())` on success, or one of the following dispatch errors:
	/// - `UnknownCollection`: The specified collection does not exist.
	/// - `MetadataNotFound`: The metadata for the specified item was not found.
	/// - `LockedItemMetadata`: The metadata for the item is locked and cannot be modified.
	/// - `NoPermission`: The caller does not have the required permission to clear the metadata.
	pub(crate) fn do_clear_item_metadata(
		maybe_check_origin: Option<T::AccountId>,
		product_id: T::ProductId,
		device_id: T::DeviceId,
	) -> DispatchResult {
		if let Some(check_origin) = &maybe_check_origin {
			ensure!(
				Self::has_role(&product_id, &check_origin, ProductRole::Admin),
				Error::<T>::NoPermission
			);
		}

		let is_root = maybe_check_origin.is_none();
		let metadata = DeviceMetadataOf::<T>::take(product_id, device_id)
			.ok_or(Error::<T>::MetadataNotFound)?;
		let mut product =
			ProductCollection::<T>::get(&product_id).ok_or(Error::<T>::UnknownProduct)?;

		let depositor_account =
			metadata.deposit.account.unwrap_or(product.owner.clone());

		// NOTE: if the item was previously burned, the ItemConfigOf record might not exist
		let is_locked = Self::get_device_config(&product_id, &device_id)
			.map_or(false, |c| c.has_disabled_setting(DeviceSetting::UnlockedMetadata));

		ensure!(is_root || !is_locked, Error::<T>::LockedDeviceMetadata);

		product.device_metadata_count.saturating_dec();
		<T as Config>::Currency::unreserve(&depositor_account, metadata.deposit.amount);

		if depositor_account == product.owner {
			product.owner_deposit.saturating_reduce(metadata.deposit.amount);
		}

		ProductCollection::<T>::insert(&product_id, &product);
		Self::deposit_event(Event::DeviceMetadataCleared { product_id, device_id });

		Ok(())
	}

	/// Sets the metadata for a specific collection.
	///
	/// - `maybe_check_origin`: An optional account ID that is allowed to set the collection
	///   metadata. If `None`, it's considered the root account.
	/// - `collection`: The ID of the collection for which to set the metadata.
	/// - `data`: The metadata to set for the collection.
	///
	/// Emits `CollectionMetadataSet` event upon successful setting of the metadata.
	/// Returns `Ok(())` on success, or one of the following dispatch errors:
	/// - `UnknownCollection`: The specified collection does not exist.
	/// - `LockedCollectionMetadata`: The metadata for the collection is locked and cannot be
	///   modified.
	/// - `NoPermission`: The caller does not have the required permission to set the metadata.
	pub(crate) fn do_set_product_metadata(
		maybe_check_origin: Option<T::AccountId>,
		product_id: T::ProductId,
		data: BoundedVec<u8, T::StringLimit>,
	) -> DispatchResult {
		if let Some(check_origin) = &maybe_check_origin {
			ensure!(
				Self::has_role(&product_id, &check_origin, ProductRole::Admin),
				Error::<T>::NoPermission
			);
		}

		let is_root = maybe_check_origin.is_none();
		let product_config = Self::get_product_config(&product_id)?;
		ensure!(
			is_root || product_config.is_setting_enabled(ProductSetting::UnlockedMetadata),
			Error::<T>::LockedProductMetadata
		);

		let mut details =
			ProductCollection::<T>::get(&product_id).ok_or(Error::<T>::UnknownProduct)?;

		ProductMetadataOf::<T>::try_mutate_exists(product_id, |metadata| {
			let old_deposit = metadata.take().map_or(Zero::zero(), |m| m.deposit);
			details.owner_deposit.saturating_reduce(old_deposit);
			let mut deposit = Zero::zero();
			if !is_root && product_config.is_setting_enabled(ProductSetting::DepositRequired)
			{
				deposit = <T as Config>::DepositPerByte::get()
					.saturating_mul(((data.len()) as u32).into())
					.saturating_add(T::MetadataDepositBase::get());
			}
			if deposit > old_deposit {
				<T as Config>::Currency::reserve(&details.owner, deposit - old_deposit)?;
			} else if deposit < old_deposit {
				<T as Config>::Currency::unreserve(&details.owner, old_deposit - deposit);
			}
			details.owner_deposit.saturating_accrue(deposit);

			ProductCollection::<T>::insert(&product_id, details);

			*metadata = Some(ProductMetadata { deposit, data: data.clone() });

			Self::deposit_event(Event::ProductMetadataSet { product_id, data });
			Ok(())
		})
	}

	/// Clears the metadata for a specific collection.
	///
	/// - `maybe_check_origin`: An optional account ID that is allowed to clear the collection
	///   metadata. If `None`, it's considered the root account.
	/// - `collection`: The ID of the collection for which to clear the metadata.
	///
	/// Emits `CollectionMetadataCleared` event upon successful clearing of the metadata.
	/// Returns `Ok(())` on success, or one of the following dispatch errors:
	/// - `UnknownCollection`: The specified collection does not exist.
	/// - `MetadataNotFound`: The metadata for the collection was not found.
	/// - `LockedCollectionMetadata`: The metadata for the collection is locked and cannot be
	///   modified.
	/// - `NoPermission`: The caller does not have the required permission to clear the metadata.
	pub(crate) fn do_clear_collection_metadata(
		maybe_check_origin: Option<T::AccountId>,
		product_id: T::ProductId,
	) -> DispatchResult {
		if let Some(check_origin) = &maybe_check_origin {
			ensure!(
				Self::has_role(&product_id, &check_origin, ProductRole::Admin),
				Error::<T>::NoPermission
			);
		}

		let product =
			ProductCollection::<T>::get(&product_id).ok_or(Error::<T>::UnknownProduct)?;
		let product_config = Self::get_product_config(&product_id)?;

		ensure!(
			maybe_check_origin.is_none() ||
				product_config.is_setting_enabled(ProductSetting::UnlockedMetadata),
			Error::<T>::LockedProductMetadata
		);

		ProductMetadataOf::<T>::try_mutate_exists(product_id, |metadata| {
			let deposit = metadata.take().ok_or(Error::<T>::UnknownProduct)?.deposit;
			<T as Config>::Currency::unreserve(&product.owner, deposit);
			Self::deposit_event(Event::ProductMetadataCleared { product_id });
			Ok(())
		})
	}

	/// A helper method to construct metadata.
	///
	/// # Errors
	///
	/// This function returns an [`IncorrectMetadata`](crate::Error::IncorrectMetadata) dispatch
	/// error if the provided metadata is too long.
	pub fn construct_metadata(
		metadata: Vec<u8>,
	) -> Result<BoundedVec<u8, T::StringLimit>, DispatchError> {
		Ok(BoundedVec::try_from(metadata).map_err(|_| Error::<T>::IncorrectMetadata)?)
	}
}
