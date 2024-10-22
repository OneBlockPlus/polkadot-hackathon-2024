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

//! DeviceId pallet benchmarking.

#![cfg(feature = "runtime-benchmarks")]

use super::*;
use enumflags2::{BitFlag, BitFlags};
use frame_benchmarking::v1::{
	account, benchmarks, whitelist_account, whitelisted_caller, BenchmarkError,
};
use frame_support::{
	assert_ok,
	traits::{EnsureOrigin, Get, UnfilteredDispatchable},
	BoundedVec,
};
use frame_system::{RawOrigin as SystemOrigin};
use sp_io::crypto::{sr25519_generate, sr25519_sign};
use sp_runtime::{
	traits::{Bounded, IdentifyAccount, One},
	AccountId32, MultiSignature, MultiSigner,
};

use crate::Pallet as ThePallet;

const SEED: u32 = 0;

fn simulate_create_product<T: Config>(
) -> (T::ProductId, T::AccountId, AccountIdLookupOf<T>) {
	let caller: T::AccountId = whitelisted_caller();
	let caller_lookup = T::Lookup::unlookup(caller.clone());
	let product_id = T::Helper::product(0);
	<T as Config>::Currency::make_free_balance_be(&caller, DepositBalanceOf::<T>::max_value());
	assert_ok!(ThePallet::<T>::force_create_product(
		SystemOrigin::Root.into(),
		caller_lookup.clone(),
		default_product_config::<T>()
	));
	(product_id, caller, caller_lookup)
}

fn simulate_add_product_metadata<T: Config>() -> (T::AccountId, AccountIdLookupOf<T>) {
	let caller = ProductCollection::<T>::get(T::Helper::product(0)).unwrap().owner;
	if caller != whitelisted_caller() {
		whitelist_account!(caller);
	}
	let caller_lookup = T::Lookup::unlookup(caller.clone());
	assert_ok!(ThePallet::<T>::set_product_metadata(
		SystemOrigin::Signed(caller.clone()).into(),
		T::Helper::product(0),
		vec![0; T::StringLimit::get() as usize].try_into().unwrap(),
	));
	(caller, caller_lookup)
}

fn simulate_mint_device<T: Config>(
	id: u16,
) -> (T::DeviceId, T::AccountId, AccountIdLookupOf<T>) {
	let device_id = T::Helper::device(id);
	let product_id = T::Helper::product(0);
	let caller = ProductCollection::<T>::get(product_id).unwrap().owner;
	if caller != whitelisted_caller() {
		whitelist_account!(caller);
	}
	let caller_lookup = T::Lookup::unlookup(caller.clone());
	let item_exists = DeviceCollection::<T>::contains_key(&product_id, &device_id);
	let item_config = DeviceConfigOf::<T>::get(&product_id, &device_id);
	if item_exists {
		return (device_id, caller, caller_lookup)
	} else if let Some(item_config) = item_config {
		assert_ok!(ThePallet::<T>::force_mint_device(
			SystemOrigin::Signed(caller.clone()).into(),
			product_id,
			device_id,
			caller_lookup.clone(),
			item_config,
		));
	} else {
		assert_ok!(ThePallet::<T>::mint_device(
			SystemOrigin::Signed(caller.clone()).into(),
			product_id,
			device_id,
			caller_lookup.clone(),
		));
	}
	(device_id, caller, caller_lookup)
}

fn simulate_lock_device<T: Config>(
	id: u16,
) -> (T::DeviceId, T::AccountId, AccountIdLookupOf<T>) {
	let caller = ProductCollection::<T>::get(T::Helper::product(0)).unwrap().owner;
	if caller != whitelisted_caller() {
		whitelist_account!(caller);
	}
	let caller_lookup = T::Lookup::unlookup(caller.clone());
	let device_id = T::Helper::device(id);
	assert_ok!(ThePallet::<T>::lock_device_transfer(
		SystemOrigin::Signed(caller.clone()).into(),
		T::Helper::product(0),
		device_id,
	));
	(device_id, caller, caller_lookup)
}

fn simulate_burn_device<T: Config>(
	id: u16,
) -> (T::DeviceId, T::AccountId, AccountIdLookupOf<T>) {
	let caller = ProductCollection::<T>::get(T::Helper::product(0)).unwrap().owner;
	if caller != whitelisted_caller() {
		whitelist_account!(caller);
	}
	let caller_lookup = T::Lookup::unlookup(caller.clone());
	let device_id = T::Helper::device(id);
	assert_ok!(ThePallet::<T>::burn_device(
		SystemOrigin::Signed(caller.clone()).into(),
		T::Helper::product(0),
		device_id,
	));
	(device_id, caller, caller_lookup)
}

fn simulate_add_device_metadata<T: Config>(
	device_id: T::DeviceId,
) -> (T::AccountId, AccountIdLookupOf<T>) {
	let caller = ProductCollection::<T>::get(T::Helper::product(0)).unwrap().owner;
	if caller != whitelisted_caller() {
		whitelist_account!(caller);
	}
	let caller_lookup = T::Lookup::unlookup(caller.clone());
	assert_ok!(ThePallet::<T>::set_device_metadata(
		SystemOrigin::Signed(caller.clone()).into(),
		T::Helper::product(0),
		device_id,
		vec![0; T::StringLimit::get() as usize].try_into().unwrap(),
	));
	(caller, caller_lookup)
}

fn simulate_add_device_attribute<T: Config>(
	device_id: T::DeviceId,
) -> (BoundedVec<u8, T::KeyLimit>, T::AccountId, AccountIdLookupOf<T>) {
	let caller = ProductCollection::<T>::get(T::Helper::product(0)).unwrap().owner;
	if caller != whitelisted_caller() {
		whitelist_account!(caller);
	}
	let caller_lookup = T::Lookup::unlookup(caller.clone());
	let key: BoundedVec<_, _> = vec![0; T::KeyLimit::get() as usize].try_into().unwrap();
	assert_ok!(ThePallet::<T>::set_attribute(
		SystemOrigin::Signed(caller.clone()).into(),
		T::Helper::product(0),
		Some(device_id),
		AttributeNamespace::ProductOwner,
		key.clone(),
		vec![0; T::ValueLimit::get() as usize].try_into().unwrap(),
	));
	(key, caller, caller_lookup)
}

fn simulate_add_product_attribute<T: Config>(
	product_id: u16,
) -> (BoundedVec<u8, T::KeyLimit>, T::AccountId, AccountIdLookupOf<T>) {
	let caller = ProductCollection::<T>::get(T::Helper::product(0)).unwrap().owner;
	if caller != whitelisted_caller() {
		whitelist_account!(caller);
	}
	let caller_lookup = T::Lookup::unlookup(caller.clone());
	let key: BoundedVec<_, _> = make_filled_vec(product_id, T::KeyLimit::get() as usize).try_into().unwrap();
	assert_ok!(ThePallet::<T>::set_attribute(
		SystemOrigin::Signed(caller.clone()).into(),
		T::Helper::product(0),
		None,
		AttributeNamespace::ProductOwner,
		key.clone(),
		vec![0; T::ValueLimit::get() as usize].try_into().unwrap(),
	));
	(key, caller, caller_lookup)
}

fn assert_last_event<T: Config>(generic_event: <T as Config>::RuntimeEvent) {
	let events = frame_system::Pallet::<T>::events();
	let system_event: <T as frame_system::Config>::RuntimeEvent = generic_event.into();
	// compare to the last event record
	let frame_system::EventRecord { event, .. } = &events[events.len() - 1];
	assert_eq!(event, &system_event);
}

fn make_product_config<T: Config>(
	disable_settings: BitFlags<ProductSetting>,
) -> ProductConfig {
	ProductConfig {
		settings: ProductSettings::from_disabled(disable_settings),
		max_supply: None,
		mint_settings: MintSettings::default(),
	}
}

fn default_product_config<T: Config>() -> ProductConfig {
	make_product_config::<T>(ProductSetting::empty())
}

fn default_device_config() -> DeviceConfig {
	DeviceConfig { settings: DeviceSettings::all_enabled() }
}

fn make_filled_vec(value: u16, length: usize) -> Vec<u8> {
	let mut vec = vec![0u8; length];
	let mut s = Vec::from(value.to_be_bytes());
	vec.truncate(length - s.len());
	vec.append(&mut s);
	vec
}

benchmarks! {
	where_clause {
		where
			T::OffchainSignature: From<MultiSignature>,
			T::AccountId: From<AccountId32>,
	}

	create_product {
		let product_id = T::Helper::product(0);
		let origin = T::CreateOrigin::try_successful_origin(&product_id)
			.map_err(|_| BenchmarkError::Weightless)?;
		let caller = T::CreateOrigin::ensure_origin(origin.clone(), &product_id).unwrap();
		whitelist_account!(caller);
		let admin = T::Lookup::unlookup(caller.clone());
		<T as Config>::Currency::make_free_balance_be(&caller, DepositBalanceOf::<T>::max_value());
		let call = Call::<T>::create_product { admin, config: default_product_config::<T>() };
	}: { call.dispatch_bypass_filter(origin)? }
	verify {
		assert_last_event::<T>(Event::NextProductIdIncremented { next_id: Some(T::Helper::product(1)) }.into());
	}

	force_create_product {
		let caller: T::AccountId = whitelisted_caller();
		let caller_lookup = T::Lookup::unlookup(caller.clone());
	}: _(SystemOrigin::Root, caller_lookup, default_product_config::<T>())
	verify {
		assert_last_event::<T>(Event::NextProductIdIncremented { next_id: Some(T::Helper::product(1)) }.into());
	}

	destroy_product {
		let m in 0 .. 1_000;
		let c in 0 .. 1_000;
		let a in 0 .. 1_000;

		let (product_id, caller, _) = simulate_create_product::<T>();
		simulate_add_product_metadata::<T>();
		for i in 0..m {
			simulate_mint_device::<T>(i as u16);
			simulate_add_device_metadata::<T>(T::Helper::device(i as u16));
			simulate_lock_device::<T>(i as u16);
			simulate_burn_device::<T>(i as u16);
		}
		for i in 0..c {
			simulate_mint_device::<T>(i as u16);
			simulate_lock_device::<T>(i as u16);
			simulate_burn_device::<T>(i as u16);
		}
		for i in 0..a {
			simulate_add_product_attribute::<T>(i as u16);
		}
		let witness = ProductCollection::<T>::get(product_id).unwrap().destroy_witness();
	}: _(SystemOrigin::Signed(caller), product_id, witness)
	verify {
		assert_last_event::<T>(Event::ProductDestroyed { product_id }.into());
	}

	mint_device {
		let (product_id, caller, caller_lookup) = simulate_create_product::<T>();
		let device_id = T::Helper::device(0);
	}: _(SystemOrigin::Signed(caller.clone()), product_id, device_id, caller_lookup)
	verify {
		assert_last_event::<T>(Event::DeviceIssued { product_id, device_id, owner: caller }.into());
	}

	force_mint_device {
		let (product_id, caller, caller_lookup) = simulate_create_product::<T>();
		let device_id = T::Helper::device(0);
	}: _(SystemOrigin::Signed(caller.clone()), product_id, device_id, caller_lookup, default_device_config())
	verify {
		assert_last_event::<T>(Event::DeviceIssued { product_id, device_id, owner: caller }.into());
	}

	burn_device {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);
	}: _(SystemOrigin::Signed(caller.clone()), product_id, device_id)
	verify {
		assert_last_event::<T>(Event::DeviceBurned { product_id, device_id, owner: caller }.into());
	}

	transfer_device {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);

		let target: T::AccountId = account("target", 0, SEED);
		let target_lookup = T::Lookup::unlookup(target.clone());
		<T as Config>::Currency::make_free_balance_be(&target, <T as Config>::Currency::minimum_balance());
	}: _(SystemOrigin::Signed(caller.clone()), product_id, device_id, target_lookup)
	verify {
		assert_last_event::<T>(Event::DeviceTransferred { product_id, device_id, from: caller, to: target }.into());
	}

	lock_device_transfer {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);
	}: _(SystemOrigin::Signed(caller.clone()), T::Helper::product(0), T::Helper::device(0))
	verify {
		assert_last_event::<T>(Event::DeviceTransferLocked { product_id: T::Helper::product(0), device_id: T::Helper::device(0) }.into());
	}

	unlock_device_transfer {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);
		ThePallet::<T>::lock_device_transfer(
			SystemOrigin::Signed(caller.clone()).into(),
			product_id,
			device_id,
		)?;
	}: _(SystemOrigin::Signed(caller.clone()), product_id, device_id)
	verify {
		assert_last_event::<T>(Event::DeviceTransferUnlocked { product_id, device_id }.into());
	}

	lock_product {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let lock_settings = ProductSettings::from_disabled(
			ProductSetting::TransferableItems |
				ProductSetting::UnlockedMetadata |
				ProductSetting::UnlockedAttributes |
				ProductSetting::UnlockedMaxSupply,
		);
	}: _(SystemOrigin::Signed(caller.clone()), product_id, lock_settings)
	verify {
		assert_last_event::<T>(Event::ProductLocked { product_id }.into());
	}

	transfer_product_ownership {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let target: T::AccountId = account("target", 0, SEED);
		let target_lookup = T::Lookup::unlookup(target.clone());
		<T as Config>::Currency::make_free_balance_be(&target, <T as Config>::Currency::minimum_balance());
		let origin = SystemOrigin::Signed(target.clone()).into();
		ThePallet::<T>::accept_product_ownership(origin, Some(product_id))?;
	}: _(SystemOrigin::Signed(caller), product_id, target_lookup)
	verify {
		assert_last_event::<T>(Event::ProductOwnerChanged { product_id, new_owner: target }.into());
	}

	set_product_team {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let target0 = Some(T::Lookup::unlookup(account("target", 0, SEED)));
		let target1 = Some(T::Lookup::unlookup(account("target", 1, SEED)));
		let target2 = Some(T::Lookup::unlookup(account("target", 2, SEED)));
	}: _(SystemOrigin::Signed(caller), product_id, target0, target1, target2)
	verify {
		assert_last_event::<T>(Event::ProductTeamChanged{
			product_id,
			issuer: Some(account("target", 0, SEED)),
			admin: Some(account("target", 1, SEED)),
			freezer: Some(account("target", 2, SEED)),
		}.into());
	}

	force_set_product_owner {
		let (product_id, _, _) = simulate_create_product::<T>();
		let origin =
			T::ForceOrigin::try_successful_origin().map_err(|_| BenchmarkError::Weightless)?;
		let target: T::AccountId = account("target", 0, SEED);
		let target_lookup = T::Lookup::unlookup(target.clone());
		<T as Config>::Currency::make_free_balance_be(&target, <T as Config>::Currency::minimum_balance());
		let call = Call::<T>::force_set_product_owner {
			product_id,
			owner: target_lookup,
		};
	}: { call.dispatch_bypass_filter(origin)? }
	verify {
		assert_last_event::<T>(Event::ProductOwnerChanged { product_id, new_owner: target }.into());
	}

	force_set_product_config {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let origin =
			T::ForceOrigin::try_successful_origin().map_err(|_| BenchmarkError::Weightless)?;
		let call = Call::<T>::force_set_product_config {
			product_id,
			config: make_product_config::<T>(ProductSetting::DepositRequired.into()),
		};
	}: { call.dispatch_bypass_filter(origin)? }
	verify {
		assert_last_event::<T>(Event::ProductConfigChanged { product_id }.into());
	}

	lock_device_properties {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);
		let lock_metadata = true;
		let lock_attributes = true;
	}: _(SystemOrigin::Signed(caller), product_id, device_id, lock_metadata, lock_attributes)
	verify {
		assert_last_event::<T>(Event::DevicePropertiesLocked { product_id, device_id, lock_metadata, lock_attributes }.into());
	}

	set_attribute {
		let key: BoundedVec<_, _> = vec![0u8; T::KeyLimit::get() as usize].try_into().unwrap();
		let value: BoundedVec<_, _> = vec![0u8; T::ValueLimit::get() as usize].try_into().unwrap();

		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);
	}: _(SystemOrigin::Signed(caller), product_id, Some(device_id), AttributeNamespace::ProductOwner, key.clone(), value.clone())
	verify {
		assert_last_event::<T>(
			Event::AttributeSet {
				product_id,
				maybe_device_id: Some(device_id),
				namespace: AttributeNamespace::ProductOwner,
				key,
				value,
			}
			.into(),
		);
	}

	force_set_attribute {
		let key: BoundedVec<_, _> = vec![0u8; T::KeyLimit::get() as usize].try_into().unwrap();
		let value: BoundedVec<_, _> = vec![0u8; T::ValueLimit::get() as usize].try_into().unwrap();

		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);
	}: _(SystemOrigin::Root, Some(caller), product_id, Some(device_id), AttributeNamespace::ProductOwner, key.clone(), value.clone())
	verify {
		assert_last_event::<T>(
			Event::AttributeSet {
				product_id,
				maybe_device_id: Some(device_id),
				namespace: AttributeNamespace::ProductOwner,
				key,
				value,
			}
			.into(),
		);
	}

	clear_attribute {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);
		simulate_add_device_metadata::<T>(device_id);
		let (key, ..) = simulate_add_device_attribute::<T>(device_id);
	}: _(SystemOrigin::Signed(caller), product_id, Some(device_id), AttributeNamespace::ProductOwner, key.clone())
	verify {
		assert_last_event::<T>(
			Event::AttributeCleared {
				product_id,
				maybe_device_id: Some(device_id),
				namespace: AttributeNamespace::ProductOwner,
				key,
			}.into(),
		);
	}

	approve_device_attributes {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);
		let target: T::AccountId = account("target", 0, SEED);
		let target_lookup = T::Lookup::unlookup(target.clone());
	}: _(SystemOrigin::Signed(caller), product_id, device_id, target_lookup)
	verify {
		assert_last_event::<T>(
			Event::DeviceAttributesApprovalAdded {
				product_id,
				device_id,
				delegate: target,
			}
			.into(),
		);
	}

	cancel_device_attributes_approval {
		let n in 0 .. 1_000;

		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);
		let target: T::AccountId = account("target", 0, SEED);
		let target_lookup = T::Lookup::unlookup(target.clone());
		ThePallet::<T>::approve_device_attributes(
			SystemOrigin::Signed(caller.clone()).into(),
			product_id,
			device_id,
			target_lookup.clone(),
		)?;
		<T as Config>::Currency::make_free_balance_be(&target, DepositBalanceOf::<T>::max_value());
		let value: BoundedVec<_, _> = vec![0u8; T::ValueLimit::get() as usize].try_into().unwrap();
		for i in 0..n {
			let key = make_filled_vec(i as u16, T::KeyLimit::get() as usize);
			ThePallet::<T>::set_attribute(
				SystemOrigin::Signed(target.clone()).into(),
				T::Helper::product(0),
				Some(device_id),
				AttributeNamespace::Account(target.clone()),
				key.try_into().unwrap(),
				value.clone(),
			)?;
		}
		let witness = CancelAttributesApprovalWitness { account_attributes: n };
	}: _(SystemOrigin::Signed(caller), product_id, device_id, target_lookup, witness)
	verify {
		assert_last_event::<T>(
			Event::DeviceAttributesApprovalRemoved {
				product_id,
				device_id,
				delegate: target,
			}
			.into(),
		);
	}

	set_device_metadata {
		let data: BoundedVec<_, _> = vec![0u8; T::StringLimit::get() as usize].try_into().unwrap();

		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);
	}: _(SystemOrigin::Signed(caller), product_id, device_id, data.clone())
	verify {
		assert_last_event::<T>(Event::DeviceMetadataSet { product_id, device_id, data }.into());
	}

	clear_device_metadata {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let (device_id, ..) = simulate_mint_device::<T>(0);
		simulate_add_device_metadata::<T>(device_id);
	}: _(SystemOrigin::Signed(caller), product_id, device_id)
	verify {
		assert_last_event::<T>(Event::DeviceMetadataCleared { product_id, device_id }.into());
	}

	set_product_metadata {
		let data: BoundedVec<_, _> = vec![0u8; T::StringLimit::get() as usize].try_into().unwrap();

		let (product_id, caller, _) = simulate_create_product::<T>();
	}: _(SystemOrigin::Signed(caller), product_id, data.clone())
	verify {
		assert_last_event::<T>(Event::ProductMetadataSet { product_id, data }.into());
	}

	clear_product_metadata {
		let (product_id, caller, _) = simulate_create_product::<T>();
		simulate_add_product_metadata::<T>();
	}: _(SystemOrigin::Signed(caller), product_id)
	verify {
		assert_last_event::<T>(Event::ProductMetadataCleared { product_id }.into());
	}

	accept_product_ownership {
		let caller: T::AccountId = whitelisted_caller();
		<T as Config>::Currency::make_free_balance_be(&caller, DepositBalanceOf::<T>::max_value());
		let product_id = T::Helper::product(0);
	}: _(SystemOrigin::Signed(caller.clone()), Some(product_id))
	verify {
		assert_last_event::<T>(Event::ProductOwnershipAcceptanceChanged {
			who: caller,
			maybe_product_id: Some(product_id),
		}.into());
	}

	set_product_max_supply {
		let (product_id, caller, _) = simulate_create_product::<T>();
	}: _(SystemOrigin::Signed(caller.clone()), product_id, u32::MAX)
	verify {
		assert_last_event::<T>(Event::ProductMaxSupplySet {
			product_id,
			max_supply: u32::MAX,
		}.into());
	}

	update_product_mint_settings {
		let (product_id, caller, _) = simulate_create_product::<T>();
		let mint_settings = MintSettings {
			mint_type: MintType::Issuer,
			default_device_settings: DeviceSettings::all_enabled(),
		};
	}: _(SystemOrigin::Signed(caller.clone()), product_id, mint_settings)
	verify {
		assert_last_event::<T>(Event::ProductMintSettingsUpdated { product_id }.into());
	}

	mint_device_pre_signed {
		let n in 0 .. T::MaxAttributesPerCall::get() as u32;
		let caller_public = sr25519_generate(0.into(), None);
		let caller = MultiSigner::Sr25519(caller_public).into_account().into();
		<T as Config>::Currency::make_free_balance_be(&caller, DepositBalanceOf::<T>::max_value());
		let caller_lookup = T::Lookup::unlookup(caller.clone());

		let product_id = T::Helper::product(0);
		let device_id = T::Helper::device(0);
		assert_ok!(ThePallet::<T>::force_create_product(
			SystemOrigin::Root.into(),
			caller_lookup.clone(),
			default_product_config::<T>()
		));

		let metadata = vec![0u8; T::StringLimit::get() as usize];
		let mut attributes = vec![];
		let attribute_value = vec![0u8; T::ValueLimit::get() as usize];
		for i in 0..n {
			let attribute_key = make_filled_vec(i as u16, T::KeyLimit::get() as usize);
			attributes.push((attribute_key, attribute_value.clone()));
		}
		let mint_data = PreSignedMint {
			product_id,
			device_id,
			attributes,
			metadata: metadata.clone(),
			only_account: None,
			deadline: One::one(),
		};
		let message = Encode::encode(&mint_data);
		let signature = MultiSignature::Sr25519(sr25519_sign(0.into(), &caller_public, &message).unwrap());

		let target: T::AccountId = account("target", 0, SEED);
		<T as Config>::Currency::make_free_balance_be(&target, DepositBalanceOf::<T>::max_value());
		frame_system::Pallet::<T>::set_block_number(One::one());
	}: _(SystemOrigin::Signed(target.clone()), Box::new(mint_data), signature.into(), caller)
	verify {
		let metadata: BoundedVec<_, _> = metadata.try_into().unwrap();
		assert_last_event::<T>(Event::DeviceMetadataSet { product_id, device_id, data: metadata }.into());
	}

	set_attributes_pre_signed {
		let n in 0 .. T::MaxAttributesPerCall::get() as u32;
		let (product_id, _, _) = simulate_create_product::<T>();

		let device_owner: T::AccountId = account("device_owner", 0, SEED);
		let device_owner_lookup = T::Lookup::unlookup(device_owner.clone());

		let signer_public = sr25519_generate(0.into(), None);
		let signer: T::AccountId = MultiSigner::Sr25519(signer_public).into_account().into();

		<T as Config>::Currency::make_free_balance_be(&device_owner, DepositBalanceOf::<T>::max_value());

		let device_id = T::Helper::device(0);
		assert_ok!(ThePallet::<T>::force_mint_device(
			SystemOrigin::Root.into(),
			product_id,
			device_id,
			device_owner_lookup.clone(),
			default_device_config(),
		));

		let mut attributes = vec![];
		let attribute_value = vec![0u8; T::ValueLimit::get() as usize];
		for i in 0..n {
			let attribute_key = make_filled_vec(i as u16, T::KeyLimit::get() as usize);
			attributes.push((attribute_key, attribute_value.clone()));
		}
		let pre_signed_data = PreSignedAttributes {
			product_id,
			device_id,
			attributes,
			namespace: AttributeNamespace::Account(signer.clone()),
			deadline: One::one(),
		};
		let message = Encode::encode(&pre_signed_data);
		let signature = MultiSignature::Sr25519(sr25519_sign(0.into(), &signer_public, &message).unwrap());

		frame_system::Pallet::<T>::set_block_number(One::one());
	}: _(SystemOrigin::Signed(device_owner.clone()), pre_signed_data, signature.into(), signer.clone())
	verify {
		assert_last_event::<T>(
			Event::PreSignedAttributesSet {
				product_id,
				device_id,
				namespace: AttributeNamespace::Account(signer.clone()),
			}
			.into(),
		);
	}

	impl_benchmark_test_suite!(ThePallet, crate::mock::new_test_ext(), crate::mock::Test);
}
