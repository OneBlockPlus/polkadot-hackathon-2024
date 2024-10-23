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

//! Implementations for `nonfungibles` traits.

use super::*;
use frame_support::{
	ensure,
	storage::KeyPrefixIterator,
	traits::{tokens::nonfungibles_v2::*, Get},
	BoundedSlice,
};
use sp_runtime::{DispatchError, DispatchResult};

impl<T: Config> Inspect<<T as frame_system::Config>::AccountId> for Pallet<T> {
	type ItemId = T::DeviceId;
	type CollectionId = T::ProductId;

	fn owner(
		collection: &Self::CollectionId,
		item: &Self::ItemId,
	) -> Option<<T as frame_system::Config>::AccountId> {
		DeviceCollection::<T>::get(collection, item).map(|a| a.owner)
	}

	fn collection_owner(collection: &Self::CollectionId) -> Option<<T as frame_system::Config>::AccountId> {
		ProductCollection::<T>::get(collection).map(|a| a.owner)
	}

	/// Returns the attribute value of `item` of `collection` corresponding to `key`.
	///
	/// When `key` is empty, we return the item metadata value.
	///
	/// By default this is `None`; no attributes are defined.
	fn attribute(
		collection: &Self::CollectionId,
		item: &Self::ItemId,
		key: &[u8],
	) -> Option<Vec<u8>> {
		if key.is_empty() {
			// We make the empty key map to the item metadata value.
			DeviceMetadataOf::<T>::get(collection, item).map(|m| m.data.into())
		} else {
			let namespace = AttributeNamespace::ProductOwner;
			let key = BoundedSlice::<_, _>::try_from(key).ok()?;
			Attribute::<T>::get((collection, Some(item), namespace, key)).map(|a| a.0.into())
		}
	}

	/// Returns the custom attribute value of `item` of `collection` corresponding to `key`.
	///
	/// By default this is `None`; no attributes are defined.
	fn custom_attribute(
		account: &T::AccountId,
		collection: &Self::CollectionId,
		item: &Self::ItemId,
		key: &[u8],
	) -> Option<Vec<u8>> {
		let namespace = Account::<T>::get((account, collection, item))
			.map(|_| AttributeNamespace::DeviceOwner)
			.unwrap_or_else(|| AttributeNamespace::Account(account.clone()));

		let key = BoundedSlice::<_, _>::try_from(key).ok()?;
		Attribute::<T>::get((collection, Some(item), namespace, key)).map(|a| a.0.into())
	}

	/// Returns the system attribute value of `item` of `collection` corresponding to `key` if
	/// `item` is `Some`. Otherwise, returns the system attribute value of `collection`
	/// corresponding to `key`.
	///
	/// By default this is `None`; no attributes are defined.
	fn system_attribute(
		collection: &Self::CollectionId,
		item: Option<&Self::ItemId>,
		key: &[u8],
	) -> Option<Vec<u8>> {
		let namespace = AttributeNamespace::Pallet;
		let key = BoundedSlice::<_, _>::try_from(key).ok()?;
		Attribute::<T>::get((collection, item, namespace, key)).map(|a| a.0.into())
	}

	/// Returns the attribute value of `item` of `collection` corresponding to `key`.
	///
	/// When `key` is empty, we return the item metadata value.
	///
	/// By default this is `None`; no attributes are defined.
	fn collection_attribute(collection: &Self::CollectionId, key: &[u8]) -> Option<Vec<u8>> {
		if key.is_empty() {
			// We make the empty key map to the item metadata value.
			ProductMetadataOf::<T>::get(collection).map(|m| m.data.into())
		} else {
			let key = BoundedSlice::<_, _>::try_from(key).ok()?;
			Attribute::<T>::get((
				collection,
				Option::<T::DeviceId>::None,
				AttributeNamespace::ProductOwner,
				key,
			))
			.map(|a| a.0.into())
		}
	}

	/// Returns `true` if the `item` of `collection` may be transferred.
	///
	/// Default implementation is that all items are transferable.
	fn can_transfer(collection: &Self::CollectionId, item: &Self::ItemId) -> bool {
		use PalletAttributes::TransferDisabled;
		match Self::has_system_attribute(&collection, &item, TransferDisabled) {
			Ok(transfer_disabled) if transfer_disabled => return false,
			_ => (),
		}
		match (
			ProductConfigOf::<T>::get(collection),
			DeviceConfigOf::<T>::get(collection, item),
		) {
			(Some(cc), Some(ic))
				if cc.is_setting_enabled(ProductSetting::TransferableItems) &&
					ic.is_setting_enabled(DeviceSetting::Transferable) =>
				true,
			_ => false,
		}
	}
}

impl<T: Config> InspectRole<<T as frame_system::Config>::AccountId> for Pallet<T> {
	fn is_issuer(collection: &Self::CollectionId, who: &<T as frame_system::Config>::AccountId) -> bool {
		Self::has_role(collection, who, ProductRole::Issuer)
	}
	fn is_admin(collection: &Self::CollectionId, who: &<T as frame_system::Config>::AccountId) -> bool {
		Self::has_role(collection, who, ProductRole::Admin)
	}
	fn is_freezer(collection: &Self::CollectionId, who: &<T as frame_system::Config>::AccountId) -> bool {
		Self::has_role(collection, who, ProductRole::Freezer)
	}
}

impl<T: Config> Create<<T as frame_system::Config>::AccountId, ProductConfig>
	for Pallet<T>
{
	/// Create a `collection` of nonfungible items to be owned by `who` and managed by `admin`.
	fn create_collection(
		who: &T::AccountId,
		admin: &T::AccountId,
		config: &ProductConfig,
	) -> Result<T::ProductId, DispatchError> {
		// DepositRequired can be disabled by calling the force_create() only
		ensure!(
			!config.has_disabled_setting(ProductSetting::DepositRequired),
			Error::<T>::WrongSetting
		);

		let collection = NextProductId::<T>::get()
			.or(T::ProductId::initial_value())
			.ok_or(Error::<T>::UnknownProduct)?;

		Self::do_create_product(
			collection,
			who.clone(),
			admin.clone(),
			*config,
			T::ProductEntryDeposit::get(),
			Event::ProductCreated { product_id: collection, creator: who.clone(), owner: admin.clone() },
		)?;

		Self::set_next_collection_id(collection);

		Ok(collection)
	}

	/// Create a collection of nonfungible items with `collection` Id to be owned by `who` and
	/// managed by `admin`. Should be only used for applications that do not have an
	/// incremental order for the collection IDs and is a replacement for the auto id creation.
	///
	///
	/// SAFETY: This function can break the pallet if it is used in combination with the auto
	/// increment functionality, as it can claim a value in the ID sequence.
	fn create_collection_with_id(
		collection: T::ProductId,
		who: &T::AccountId,
		admin: &T::AccountId,
		config: &ProductConfig,
	) -> Result<(), DispatchError> {
		// DepositRequired can be disabled by calling the force_create() only
		ensure!(
			!config.has_disabled_setting(ProductSetting::DepositRequired),
			Error::<T>::WrongSetting
		);

		Self::do_create_product(
			collection,
			who.clone(),
			admin.clone(),
			*config,
			T::ProductEntryDeposit::get(),
			Event::ProductCreated { product_id: collection, creator: who.clone(), owner: admin.clone() },
		)
	}
}

impl<T: Config> Destroy<<T as frame_system::Config>::AccountId> for Pallet<T> {
	type DestroyWitness = DestroyWitness;

	fn get_destroy_witness(collection: &Self::CollectionId) -> Option<DestroyWitness> {
		ProductCollection::<T>::get(collection).map(|a| a.destroy_witness())
	}

	fn destroy(
		collection: Self::CollectionId,
		witness: Self::DestroyWitness,
		maybe_check_owner: Option<T::AccountId>,
	) -> Result<Self::DestroyWitness, DispatchError> {
		Self::do_destroy_collection(collection, witness, maybe_check_owner)
	}
}

impl<T: Config> Mutate<<T as frame_system::Config>::AccountId, DeviceConfig> for Pallet<T> {
	fn mint_into(
		collection: &Self::CollectionId,
		item: &Self::ItemId,
		who: &T::AccountId,
		item_config: &DeviceConfig,
		deposit_collection_owner: bool,
	) -> DispatchResult {
		Self::do_mint(
			*collection,
			*item,
			match deposit_collection_owner {
				true => None,
				false => Some(who.clone()),
			},
			who.clone(),
			*item_config,
			|_, _| Ok(()),
		)
	}

	fn burn(
		collection: &Self::CollectionId,
		item: &Self::ItemId,
		maybe_check_owner: Option<&T::AccountId>,
	) -> DispatchResult {
		Self::do_burn(*collection, *item, |d| {
			if let Some(check_owner) = maybe_check_owner {
				if &d.owner != check_owner {
					return Err(Error::<T>::NoPermission.into())
				}
			}
			Ok(())
		})
	}

	fn set_attribute(
		collection: &Self::CollectionId,
		item: &Self::ItemId,
		key: &[u8],
		value: &[u8],
	) -> DispatchResult {
		Self::do_force_set_attribute(
			None,
			*collection,
			Some(*item),
			AttributeNamespace::Pallet,
			Self::construct_attribute_key(key.to_vec())?,
			Self::construct_attribute_value(value.to_vec())?,
		)
	}

	fn set_typed_attribute<K: Encode, V: Encode>(
		collection: &Self::CollectionId,
		item: &Self::ItemId,
		key: &K,
		value: &V,
	) -> DispatchResult {
		key.using_encoded(|k| {
			value.using_encoded(|v| {
				<Self as Mutate<T::AccountId, DeviceConfig>>::set_attribute(collection, item, k, v)
			})
		})
	}

	fn set_collection_attribute(
		collection: &Self::CollectionId,
		key: &[u8],
		value: &[u8],
	) -> DispatchResult {
		Self::do_force_set_attribute(
			None,
			*collection,
			None,
			AttributeNamespace::Pallet,
			Self::construct_attribute_key(key.to_vec())?,
			Self::construct_attribute_value(value.to_vec())?,
		)
	}

	fn set_typed_collection_attribute<K: Encode, V: Encode>(
		collection: &Self::CollectionId,
		key: &K,
		value: &V,
	) -> DispatchResult {
		key.using_encoded(|k| {
			value.using_encoded(|v| {
				<Self as Mutate<T::AccountId, DeviceConfig>>::set_collection_attribute(
					collection, k, v,
				)
			})
		})
	}

	fn set_item_metadata(
		who: Option<&T::AccountId>,
		collection: &Self::CollectionId,
		item: &Self::ItemId,
		data: &[u8],
	) -> DispatchResult {
		Self::do_set_item_metadata(
			who.cloned(),
			*collection,
			*item,
			Self::construct_metadata(data.to_vec())?,
			None,
		)
	}

	fn set_collection_metadata(
		who: Option<&T::AccountId>,
		collection: &Self::CollectionId,
		data: &[u8],
	) -> DispatchResult {
		Self::do_set_product_metadata(
			who.cloned(),
			*collection,
			Self::construct_metadata(data.to_vec())?,
		)
	}

	fn clear_attribute(
		collection: &Self::CollectionId,
		item: &Self::ItemId,
		key: &[u8],
	) -> DispatchResult {
		Self::do_clear_attribute(
			None,
			*collection,
			Some(*item),
			AttributeNamespace::Pallet,
			Self::construct_attribute_key(key.to_vec())?,
		)
	}

	fn clear_typed_attribute<K: Encode>(
		collection: &Self::CollectionId,
		item: &Self::ItemId,
		key: &K,
	) -> DispatchResult {
		key.using_encoded(|k| {
			<Self as Mutate<T::AccountId, DeviceConfig>>::clear_attribute(collection, item, k)
		})
	}

	fn clear_collection_attribute(collection: &Self::CollectionId, key: &[u8]) -> DispatchResult {
		Self::do_clear_attribute(
			None,
			*collection,
			None,
			AttributeNamespace::Pallet,
			Self::construct_attribute_key(key.to_vec())?,
		)
	}

	fn clear_typed_collection_attribute<K: Encode>(
		collection: &Self::CollectionId,
		key: &K,
	) -> DispatchResult {
		key.using_encoded(|k| {
			<Self as Mutate<T::AccountId, DeviceConfig>>::clear_collection_attribute(collection, k)
		})
	}

	fn clear_item_metadata(
		who: Option<&T::AccountId>,
		collection: &Self::CollectionId,
		item: &Self::ItemId,
	) -> DispatchResult {
		Self::do_clear_item_metadata(who.cloned(), *collection, *item)
	}

	fn clear_collection_metadata(
		who: Option<&T::AccountId>,
		collection: &Self::CollectionId,
	) -> DispatchResult {
		Self::do_clear_collection_metadata(who.cloned(), *collection)
	}
}

impl<T: Config> Transfer<T::AccountId> for Pallet<T> {
	fn transfer(
		collection: &Self::CollectionId,
		item: &Self::ItemId,
		destination: &T::AccountId,
	) -> DispatchResult {
		Self::do_transfer(*collection, *item, destination.clone(), |_, _| Ok(()))
	}

	fn disable_transfer(collection: &Self::CollectionId, item: &Self::ItemId) -> DispatchResult {
		let transfer_disabled =
			Self::has_system_attribute(&collection, &item, PalletAttributes::TransferDisabled)?;
		// Can't lock the item twice
		if transfer_disabled {
			return Err(Error::<T>::DeviceLocked.into())
		}

		<Self as Mutate<T::AccountId, DeviceConfig>>::set_attribute(
			collection,
			item,
			&PalletAttributes::TransferDisabled.encode(),
			&[],
		)
	}

	fn enable_transfer(collection: &Self::CollectionId, item: &Self::ItemId) -> DispatchResult {
		<Self as Mutate<T::AccountId, DeviceConfig>>::clear_attribute(
			collection,
			item,
			&PalletAttributes::TransferDisabled.encode(),
		)
	}
}

impl<T: Config> InspectEnumerable<T::AccountId> for Pallet<T> {
	type CollectionsIterator = KeyPrefixIterator<<T as Config>::ProductId>;
	type ItemsIterator = KeyPrefixIterator<<T as Config>::DeviceId>;
	type OwnedIterator =
		KeyPrefixIterator<(<T as Config>::ProductId, <T as Config>::DeviceId)>;
	type OwnedInCollectionIterator = KeyPrefixIterator<<T as Config>::DeviceId>;

	/// Returns an iterator of the collections in existence.
	///
	/// NOTE: iterating this list invokes a storage read per item.
	fn collections() -> Self::CollectionsIterator {
		ProductCollection::<T>::iter_keys()
	}

	/// Returns an iterator of the items of a `collection` in existence.
	///
	/// NOTE: iterating this list invokes a storage read per item.
	fn items(collection: &Self::CollectionId) -> Self::ItemsIterator {
		DeviceCollection::<T>::iter_key_prefix(collection)
	}

	/// Returns an iterator of the items of all collections owned by `who`.
	///
	/// NOTE: iterating this list invokes a storage read per item.
	fn owned(who: &T::AccountId) -> Self::OwnedIterator {
		Account::<T>::iter_key_prefix((who,))
	}

	/// Returns an iterator of the items of `collection` owned by `who`.
	///
	/// NOTE: iterating this list invokes a storage read per item.
	fn owned_in_collection(
		collection: &Self::CollectionId,
		who: &T::AccountId,
	) -> Self::OwnedInCollectionIterator {
		Account::<T>::iter_key_prefix((who, collection))
	}
}
