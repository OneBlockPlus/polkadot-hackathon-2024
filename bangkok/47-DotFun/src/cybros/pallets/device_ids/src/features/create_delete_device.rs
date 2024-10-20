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

//! This module contains helper methods to perform functionality associated with minting and burning
//! items for the NFTs pallet.

use crate::*;
use frame_support::pallet_prelude::*;

impl<T: Config> Pallet<T> {
	/// Mint a new unique item with the given `collection`, `item`, and other minting configuration
	/// details.
	///
	/// This function performs the minting of a new unique item. It checks if the item does not
	/// already exist in the given collection, and if the max supply limit (if configured) is not
	/// reached. It also reserves the required deposit for the item and sets the item details
	/// accordingly.
	///
	/// # Errors
	///
	/// This function returns a dispatch error in the following cases:
	/// - If the collection ID is invalid ([`UnknownCollection`](crate::Error::UnknownProduct)).
	/// - If the item already exists in the collection
	///   ([`AlreadyExists`](crate::Error::AlreadyExists)).
	/// - If the item configuration already exists
	///   ([`InconsistentItemConfig`](crate::Error::InconsistentDeviceConfig)).
	/// - If the max supply limit (if configured) for the collection is reached
	///   ([`MaxSupplyReached`](crate::Error::MaxSupplyReached)).
	/// - If any error occurs in the `with_details_and_config` closure.
	pub fn do_mint(
		product_id: T::ProductId,
		device_id: T::DeviceId,
		maybe_depositor: Option<T::AccountId>,
		mint_to: T::AccountId,
		device_config: DeviceConfig,
		with_entry_and_config: impl FnOnce(
			&ProductEntryFor<T>,
			&ProductConfig,
		) -> DispatchResult,
	) -> DispatchResult {
		ensure!(!DeviceCollection::<T>::contains_key(product_id, device_id), Error::<T>::AlreadyExists);

		ProductCollection::<T>::try_mutate(
			&product_id,
			|maybe_product| -> DispatchResult {
				let product =
					maybe_product.as_mut().ok_or(Error::<T>::UnknownProduct)?;

				let product_config = Self::get_product_config(&product_id)?;
				with_entry_and_config(product, &product_config)?;

				if let Some(max_supply) = product_config.max_supply {
					ensure!(product.devices_count < max_supply, Error::<T>::MaxSupplyReached);
				}

				product.devices_count.saturating_inc();

				// let collection_config = Self::get_product_config(&product_id)?;
				let deposit_amount = match product_config
					.is_setting_enabled(ProductSetting::DepositRequired)
				{
					true => T::DeviceEntryDeposit::get(),
					false => Zero::zero(),
				};
				let deposit_account = match maybe_depositor {
					None => product.owner.clone(),
					Some(depositor) => depositor,
				};

				let device_owner = mint_to.clone();
				Account::<T>::insert((&device_owner, &product_id, &device_id), ());

				if let Ok(existing_config) = DeviceConfigOf::<T>::try_get(&product_id, &device_id) {
					ensure!(existing_config == device_config, Error::<T>::InconsistentDeviceConfig);
				} else {
					DeviceConfigOf::<T>::insert(&product_id, &device_id, device_config);
					product.device_configs_count.saturating_inc();
				}

				<T as Config>::Currency::reserve(&deposit_account, deposit_amount)?;

				let deposit = DeviceEntryDeposit { account: deposit_account, amount: deposit_amount };
				let details = DeviceEntry {
					owner: device_owner,
					deposit,
				};
				DeviceCollection::<T>::insert(&product_id, &device_id, details);
				Ok(())
			},
		)?;

		Self::deposit_event(Event::DeviceIssued { product_id, device_id, owner: mint_to });
		Ok(())
	}

	/// Mints a new item using a pre-signed message.
	///
	/// This function allows minting a new item using a pre-signed message. The minting process is
	/// similar to the regular minting process, but it is performed by a pre-authorized account. The
	/// `mint_to` account receives the newly minted item. The minting process is configurable
	/// through the provided `mint_data`. The attributes and metadata are set
	/// according to the provided `mint_data`. The `with_details_and_config` closure is called to
	/// validate the provided `collection_details` and `collection_config` before minting the item.
	///
	/// - `mint_to`: The account that receives the newly minted item.
	/// - `mint_data`: The pre-signed minting data containing the `collection`, `item`,
	///   `attributes`, `metadata`, `deadline`, and `only_account`.
	/// - `signer`: The account that is authorized to mint the item using the pre-signed message.
	pub(crate) fn do_mint_device_pre_signed(
		mint_to: T::AccountId,
		mint_data: PreSignedMintOf<T>,
		signer: T::AccountId,
	) -> DispatchResult {
		let PreSignedMint {
			product_id,
			device_id,
			attributes,
			metadata,
			deadline,
			only_account,
		} = mint_data;
		let metadata = Self::construct_metadata(metadata)?;

		ensure!(
			attributes.len() <= T::MaxAttributesPerCall::get() as usize,
			Error::<T>::MaxAttributesLimitReached
		);
		if let Some(account) = only_account {
			ensure!(account == mint_to, Error::<T>::WrongOrigin);
		}

		let now = frame_system::Pallet::<T>::block_number();
		ensure!(deadline >= now, Error::<T>::DeadlineExpired);

		ensure!(
			Self::has_role(&product_id, &signer, ProductRole::Issuer),
			Error::<T>::NoPermission
		);

		let item_config = DeviceConfig { settings: Self::get_default_device_settings(&product_id)? };
		Self::do_mint(
			product_id,
			device_id,
			Some(mint_to.clone()),
			mint_to.clone(),
			item_config,
			|_, _| Ok(()),
		)?;
		let admin_account = Self::find_account_by_role(&product_id, ProductRole::Admin);
		if let Some(admin_account) = admin_account {
			for (key, value) in attributes {
				Self::do_set_attribute(
					admin_account.clone(),
					product_id,
					Some(device_id),
					AttributeNamespace::ProductOwner,
					Self::construct_attribute_key(key)?,
					Self::construct_attribute_value(value)?,
					mint_to.clone(),
				)?;
			}
			if !metadata.len().is_zero() {
				Self::do_set_item_metadata(
					Some(admin_account.clone()),
					product_id,
					device_id,
					metadata,
					Some(mint_to.clone()),
				)?;
			}
		}
		Ok(())
	}

	/// Burns the specified item with the given `collection`, `item`, and `with_details`.
	///
	/// # Errors
	///
	/// This function returns a dispatch error in the following cases:
	/// - If the collection ID is invalid ([`UnknownCollection`](crate::Error::UnknownProduct)).
	/// - If the item is locked ([`ItemLocked`](crate::Error::DeviceLocked)).
	pub fn do_burn(
		product_id: T::ProductId,
		device_id: T::DeviceId,
		with_entry: impl FnOnce(&DeviceEntryFor<T>) -> DispatchResult,
	) -> DispatchResult {
		ensure!(!T::Locker::is_locked(product_id, device_id), Error::<T>::DeviceLocked);
		ensure!(
			!Self::has_system_attribute(&product_id, &device_id, PalletAttributes::TransferDisabled)?,
			Error::<T>::DeviceLocked
		);
		let device_config = Self::get_device_config(&product_id, &device_id)?;
		// NOTE: if item's settings are not empty (e.g. item's metadata is locked)
		// then we keep the config record and don't remove it
		let remove_config = !device_config.has_disabled_settings();
		let owner = ProductCollection::<T>::try_mutate(
			&product_id,
			|maybe_product| -> Result<T::AccountId, DispatchError> {
				let product =
					maybe_product.as_mut().ok_or(Error::<T>::UnknownProduct)?;
				let device = DeviceCollection::<T>::get(&product_id, &device_id)
					.ok_or(Error::<T>::UnknownProduct)?;
				with_entry(&device)?;

				// Return the deposit.
				<T as Config>::Currency::unreserve(&device.deposit.account, device.deposit.amount);
				product.devices_count.saturating_dec();

				if remove_config {
					product.device_configs_count.saturating_dec();
				}

				// Clear the metadata if it's not locked.
				if device_config.is_setting_enabled(DeviceSetting::UnlockedMetadata) {
					if let Some(metadata) = DeviceMetadataOf::<T>::take(&product_id, &device_id) {
						let depositor_account =
							metadata.deposit.account.unwrap_or(product.owner.clone());

						<T as Config>::Currency::unreserve(&depositor_account, metadata.deposit.amount);
						product.device_metadata_count.saturating_dec();

						if depositor_account == product.owner {
							product
								.owner_deposit
								.saturating_reduce(metadata.deposit.amount);
						}
					}
				}

				Ok(device.owner)
			},
		)?;

		DeviceCollection::<T>::remove(&product_id, &device_id);
		Account::<T>::remove((&owner, &product_id, &device_id));
		DeviceAttributesApprovalsOf::<T>::remove(&product_id, &device_id);

		if remove_config {
			DeviceConfigOf::<T>::remove(&product_id, &device_id);
		}

		Self::deposit_event(Event::DeviceBurned { product_id, device_id, owner });
		Ok(())
	}
}
