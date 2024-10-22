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

//! This module contains helper methods to configure locks on collections and items for the NFTs
//! pallet.

use crate::*;
use frame_support::pallet_prelude::*;

impl<T: Config> Pallet<T> {
	/// Locks a collection with specified settings.
	///
	/// The origin must be the owner of the collection to lock it. This function disables certain
	/// settings on the collection. The only setting that can't be disabled is `DepositRequired`.
	///
	/// Note: it's possible only to lock the setting, but not to unlock it after.

	///
	/// - `origin`: The origin of the transaction, representing the account attempting to lock the
	///   collection.
	/// - `collection`: The identifier of the collection to be locked.
	/// - `lock_settings`: The collection settings to be locked.
	pub(crate) fn do_lock_product(
		origin: T::AccountId,
		product_id: T::ProductId,
		lock_settings: ProductSettings,
	) -> DispatchResult {
		ensure!(Self::collection_owner(product_id) == Some(origin), Error::<T>::NoPermission);
		ensure!(
			!lock_settings.is_disabled(ProductSetting::DepositRequired),
			Error::<T>::WrongSetting
		);
		ProductConfigOf::<T>::try_mutate(product_id, |maybe_config| {
			let config = maybe_config.as_mut().ok_or(Error::<T>::NoConfig)?;

			for setting in lock_settings.get_disabled() {
				config.disable_setting(setting);
			}

			Self::deposit_event(Event::<T>::ProductLocked { product_id });
			Ok(())
		})
	}

	/// Locks the transfer of an item within a collection.
	///
	/// The origin must have the `Freezer` role within the collection to lock the transfer of the
	/// item. This function disables the `Transferable` setting on the item, preventing it from
	/// being transferred to other accounts.
	///
	/// - `origin`: The origin of the transaction, representing the account attempting to lock the
	///   item transfer.
	/// - `collection`: The identifier of the collection to which the item belongs.
	/// - `item`: The identifier of the item to be locked for transfer.
	pub(crate) fn do_lock_device_transfer(
		origin: T::AccountId,
		product_id: T::ProductId,
		device_id: T::DeviceId,
	) -> DispatchResult {
		ensure!(
			Self::has_role(&product_id, &origin, ProductRole::Freezer),
			Error::<T>::NoPermission
		);

		let mut config = Self::get_device_config(&product_id, &device_id)?;
		if !config.has_disabled_setting(DeviceSetting::Transferable) {
			config.disable_setting(DeviceSetting::Transferable);
		}
		DeviceConfigOf::<T>::insert(&product_id, &device_id, config);

		Self::deposit_event(Event::<T>::DeviceTransferLocked { product_id, device_id });
		Ok(())
	}

	/// Unlocks the transfer of an item within a collection.
	///
	/// The origin must have the `Freezer` role within the collection to unlock the transfer of the
	/// item. This function enables the `Transferable` setting on the item, allowing it to be
	/// transferred to other accounts.
	///
	/// - `origin`: The origin of the transaction, representing the account attempting to unlock the
	///   item transfer.
	/// - `collection`: The identifier of the collection to which the item belongs.
	/// - `item`: The identifier of the item to be unlocked for transfer.
	pub(crate) fn do_unlock_device_transfer(
		origin: T::AccountId,
		product_id: T::ProductId,
		device_id: T::DeviceId,
	) -> DispatchResult {
		ensure!(
			Self::has_role(&product_id, &origin, ProductRole::Freezer),
			Error::<T>::NoPermission
		);

		let mut config = Self::get_device_config(&product_id, &device_id)?;
		if config.has_disabled_setting(DeviceSetting::Transferable) {
			config.enable_setting(DeviceSetting::Transferable);
		}
		DeviceConfigOf::<T>::insert(&product_id, &device_id, config);

		Self::deposit_event(Event::<T>::DeviceTransferUnlocked { product_id, device_id });
		Ok(())
	}

	/// Locks the metadata and attributes of an item within a collection.
	///
	/// The origin must have the `Admin` role within the collection to lock the metadata and
	/// attributes of the item. This function disables the `UnlockedMetadata` and
	/// `UnlockedAttributes` settings on the item, preventing modifications to its metadata and
	/// attributes.
	///
	/// - `maybe_check_origin`: An optional origin representing the account attempting to lock the
	///   item properties. If provided, this account must have the `Admin` role within the
	///   collection. If `None`, no permission check is performed, and the function can be called
	///   from any origin.
	/// - `collection`: The identifier of the collection to which the item belongs.
	/// - `item`: The identifier of the item to be locked for properties.
	/// - `lock_metadata`: A boolean indicating whether to lock the metadata of the item.
	/// - `lock_attributes`: A boolean indicating whether to lock the attributes of the item.
	pub(crate) fn do_lock_item_properties(
		maybe_check_origin: Option<T::AccountId>,
		product_id: T::ProductId,
		device_id: T::DeviceId,
		lock_metadata: bool,
		lock_attributes: bool,
	) -> DispatchResult {
		if let Some(check_origin) = &maybe_check_origin {
			ensure!(
				Self::has_role(&product_id, &check_origin, ProductRole::Admin),
				Error::<T>::NoPermission
			);
		}

		DeviceConfigOf::<T>::try_mutate(product_id, device_id, |maybe_config| {
			let config = maybe_config.as_mut().ok_or(Error::<T>::UnknownDevice)?;

			if lock_metadata {
				config.disable_setting(DeviceSetting::UnlockedMetadata);
			}
			if lock_attributes {
				config.disable_setting(DeviceSetting::UnlockedAttributes);
			}

			Self::deposit_event(Event::<T>::DevicePropertiesLocked {
				product_id,
				device_id,
				lock_metadata,
				lock_attributes,
			});
			Ok(())
		})
	}
}
