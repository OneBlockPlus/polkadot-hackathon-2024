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

//! This module contains helper methods to perform functionality associated with creating and
//! destroying collections for the NFTs pallet.

use crate::*;
use frame_support::pallet_prelude::*;

impl<T: Config> Pallet<T> {
	/// Create a new collection with the given `collection`, `owner`, `admin`, `config`, `deposit`,
	/// and `event`.
	///
	/// This function creates a new collection with the provided parameters. It reserves the
	/// required deposit from the owner's account, sets the collection details, assigns admin roles,
	/// and inserts the provided configuration. Finally, it emits the specified event upon success.
	///
	/// # Errors
	///
	/// This function returns a [`CollectionIdInUse`](crate::Error::ProductIdInUse) error if the
	/// collection ID is already in use.
	pub fn do_create_product(
		product_id: T::ProductId,
		owner: T::AccountId,
		admin: T::AccountId,
		config: ProductConfig,
		deposit: DepositBalanceOf<T>,
		event: Event<T>,
	) -> DispatchResult {
		ensure!(!ProductCollection::<T>::contains_key(product_id), Error::<T>::ProductIdInUse);

		<T as Config>::Currency::reserve(&owner, deposit)?;

		ProductCollection::<T>::insert(
			product_id,
			ProductEntry {
				owner: owner.clone(),
				owner_deposit: deposit,
				devices_count: 0,
				device_metadata_count: 0,
				device_configs_count: 0,
				attributes_count: 0,
			},
		);
		ProductRoleOf::<T>::insert(
			product_id,
			admin,
			ProductRoles(
				ProductRole::Admin | ProductRole::Freezer | ProductRole::Issuer,
			),
		);

		ProductConfigOf::<T>::insert(&product_id, config);
		ProductOwnerAccount::<T>::insert(&owner, &product_id, ());

		Self::deposit_event(event);

		if let Some(max_supply) = config.max_supply {
			Self::deposit_event(Event::ProductMaxSupplySet { product_id, max_supply });
		}

		Ok(())
	}

	/// Destroy the specified collection with the given `collection`, `witness`, and
	/// `maybe_check_owner`.
	///
	/// This function destroys the specified collection if it exists and meets the necessary
	/// conditions. It checks the provided `witness` against the actual collection details and
	/// removes the collection along with its associated metadata, attributes, and configurations.
	/// The necessary deposits are returned to the corresponding accounts, and the roles and
	/// configurations for the collection are cleared. Finally, it emits the `Destroyed` event upon
	/// successful destruction.
	///
	/// # Errors
	///
	/// This function returns a dispatch error in the following cases:
	/// - If the collection ID is not found
	///   ([`UnknownCollection`](crate::Error::UnknownProduct)).
	/// - If the provided `maybe_check_owner` does not match the actual owner
	///   ([`NoPermission`](crate::Error::NoPermission)).
	/// - If the collection is not empty (contains items)
	///   ([`CollectionNotEmpty`](crate::Error::ProductNotEmpty)).
	/// - If the `witness` does not match the actual collection details
	///   ([`BadWitness`](crate::Error::BadWitness)).
	pub fn do_destroy_collection(
		product_id: T::ProductId,
		witness: DestroyWitness,
		maybe_check_owner: Option<T::AccountId>,
	) -> Result<DestroyWitness, DispatchError> {
		ProductCollection::<T>::try_mutate_exists(product_id, |maybe_product| {
			let product =
				maybe_product.take().ok_or(Error::<T>::UnknownProduct)?;
			if let Some(check_owner) = maybe_check_owner {
				ensure!(product.owner == check_owner, Error::<T>::NoPermission);
			}
			ensure!(product.devices_count == 0, Error::<T>::ProductNotEmpty);
			ensure!(product.attributes_count == witness.attributes_count, Error::<T>::BadWitness);
			ensure!(
				product.device_metadata_count == witness.device_metadata_count,
				Error::<T>::BadWitness
			);
			ensure!(
				product.device_configs_count == witness.device_configs_count,
				Error::<T>::BadWitness
			);

			for (_, metadata) in DeviceMetadataOf::<T>::drain_prefix(&product_id) {
				if let Some(depositor) = metadata.deposit.account {
					<T as Config>::Currency::unreserve(&depositor, metadata.deposit.amount);
				}
			}

			ProductMetadataOf::<T>::remove(&product_id);
			Self::clear_roles(&product_id)?;

			for (_, (_, deposit)) in Attribute::<T>::drain_prefix((&product_id,)) {
				if !deposit.amount.is_zero() {
					if let Some(account) = deposit.account {
						<T as Config>::Currency::unreserve(&account, deposit.amount);
					}
				}
			}

			ProductOwnerAccount::<T>::remove(&product.owner, &product_id);
			<T as Config>::Currency::unreserve(&product.owner, product.owner_deposit);
			ProductConfigOf::<T>::remove(&product_id);
			let _ = DeviceConfigOf::<T>::clear_prefix(&product_id, witness.device_configs_count, None);

			Self::deposit_event(Event::ProductDestroyed { product_id });

			Ok(DestroyWitness {
				device_metadata_count: product.device_metadata_count,
				device_configs_count: product.device_configs_count,
				attributes_count: product.attributes_count,
			})
		})
	}
}
