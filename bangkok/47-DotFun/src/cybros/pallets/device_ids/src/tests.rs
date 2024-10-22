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

//! Tests for the pallet.

use crate::{mock::*, Event, *};
use enumflags2::BitFlags;
use frame_support::{
	assert_noop, assert_ok,
	traits::{
		tokens::nonfungibles_v2::{Create, Destroy, Inspect, Mutate},
		Currency,
	},
};
use pallet_balances::Error as BalancesError;
use sp_core::{bounded::BoundedVec, Pair};
use sp_runtime::{
	traits::IdentifyAccount,
	MultiSignature, MultiSigner,
};

type AccountIdOf<Test> = <Test as frame_system::Config>::AccountId;

fn account(id: u8) -> AccountIdOf<Test> {
	[id; 32].into()
}

fn items() -> Vec<(AccountIdOf<Test>, u32, u32)> {
	let mut r: Vec<_> = Account::<Test>::iter().map(|x| x.0).collect();
	r.sort();
	let mut s: Vec<_> = DeviceCollection::<Test>::iter().map(|x| (x.2.owner, x.0, x.1)).collect();
	s.sort();
	assert_eq!(r, s);
	for collection in DeviceCollection::<Test>::iter()
		.map(|x| x.0)
		.scan(None, |s, item| {
			if s.map_or(false, |last| last == item) {
				*s = Some(item);
				Some(None)
			} else {
				Some(Some(item))
			}
		})
		.flatten()
	{
		let details = ProductCollection::<Test>::get(collection).unwrap();
		let items = DeviceCollection::<Test>::iter_prefix(collection).count() as u32;
		assert_eq!(details.devices_count, items);
	}
	r
}

fn collections() -> Vec<(AccountIdOf<Test>, u32)> {
	let mut r: Vec<_> = ProductOwnerAccount::<Test>::iter().map(|x| (x.0, x.1)).collect();
	r.sort();
	let mut s: Vec<_> = ProductCollection::<Test>::iter().map(|x| (x.1.owner, x.0)).collect();
	s.sort();
	assert_eq!(r, s);
	r
}

macro_rules! bvec {
	($( $x:tt )*) => {
		vec![$( $x )*].try_into().unwrap()
	}
}

fn attributes(
	collection: u32,
) -> Vec<(Option<u32>, AttributeNamespace<AccountIdOf<Test>>, Vec<u8>, Vec<u8>)> {
	let mut s: Vec<_> = Attribute::<Test>::iter_prefix((collection,))
		.map(|(k, v)| (k.0, k.1, k.2.into(), v.0.into()))
		.collect();
	s.sort_by_key(|k: &(Option<u32>, AttributeNamespace<AccountIdOf<Test>>, Vec<u8>, Vec<u8>)| k.0);
	s.sort_by_key(|k: &(Option<u32>, AttributeNamespace<AccountIdOf<Test>>, Vec<u8>, Vec<u8>)| {
		k.2.clone()
	});
	s
}

fn item_attributes_approvals(collection_id: u32, item_id: u32) -> Vec<AccountIdOf<Test>> {
	let approvals = DeviceAttributesApprovalsOf::<Test>::get(collection_id, item_id);
	let s: Vec<_> = approvals.into_iter().collect();
	s
}

fn events() -> Vec<Event<Test>> {
	let result = System::events()
		.into_iter()
		.map(|r| r.event)
		.filter_map(|e| if let mock::RuntimeEvent::DeviceIds(inner) = e { Some(inner) } else { None })
		.collect::<Vec<_>>();

	System::reset_events();

	result
}

fn collection_config_from_disabled_settings(
	settings: BitFlags<ProductSetting>,
) -> ProductConfig {
	ProductConfig {
		settings: ProductSettings::from_disabled(settings),
		max_supply: None,
		mint_settings: MintSettings::default(),
	}
}

fn collection_config_with_all_settings_enabled() -> ProductConfig {
	ProductConfig {
		settings: ProductSettings::all_enabled(),
		max_supply: None,
		mint_settings: MintSettings::default(),
	}
}

fn default_collection_config() -> ProductConfig {
	collection_config_from_disabled_settings(ProductSetting::DepositRequired.into())
}

fn default_item_config() -> DeviceConfig {
	DeviceConfig { settings: DeviceSettings::all_enabled() }
}

fn item_config_from_disabled_settings(settings: BitFlags<DeviceSetting>) -> DeviceConfig {
	DeviceConfig { settings: DeviceSettings::from_disabled(settings) }
}

#[test]
fn basic_setup_works() {
	new_test_ext().execute_with(|| {
		assert_eq!(items(), vec![]);
	});
}

#[test]
fn basic_mint_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			default_collection_config()
		));
		assert_eq!(collections(), vec![(account(1), 0)]);
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 42, account(1)));
		assert_eq!(items(), vec![(account(1), 0, 42)]);

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(2),
			default_collection_config()
		));
		assert_eq!(collections(), vec![(account(1), 0), (account(2), 1)]);
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(2)), 1, 69, account(1)));
		assert_eq!(items(), vec![(account(1), 0, 42), (account(1), 1, 69)]);
	});
}

#[test]
fn mint_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			default_collection_config()
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 42, account(1)));
		assert_eq!(DeviceIds::owner(0, 42).unwrap(), account(1));
		assert_eq!(collections(), vec![(account(1), 0)]);
		assert_eq!(items(), vec![(account(1), 0, 42)]);
	});
}

#[test]
fn lifecycle_should_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);
		Balances::make_free_balance_be(&account(2), 100);
		assert_ok!(DeviceIds::create_product(
			RuntimeOrigin::signed(account(1)),
			account(1),
			collection_config_with_all_settings_enabled()
		));
		assert_eq!(Balances::reserved_balance(&account(1)), 2);
		assert_eq!(collections(), vec![(account(1), 0)]);
		assert_ok!(DeviceIds::set_product_metadata(
			RuntimeOrigin::signed(account(1)),
			0,
			bvec![0, 0]
		));
		assert_eq!(Balances::reserved_balance(&account(1)), 5);
		assert!(ProductMetadataOf::<Test>::contains_key(0));

		assert_ok!(DeviceIds::force_mint_device(
			RuntimeOrigin::signed(account(1)),
			0,
			42,
			account(10),
			default_item_config()
		));
		assert_eq!(Balances::reserved_balance(&account(1)), 6);
		assert_ok!(DeviceIds::force_mint_device(
			RuntimeOrigin::signed(account(1)),
			0,
			69,
			account(20),
			default_item_config()
		));
		assert_eq!(Balances::reserved_balance(&account(1)), 7);
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 70, account(1)));
		assert_eq!(items(), vec![(account(1), 0, 70), (account(10), 0, 42), (account(20), 0, 69)]);
		assert_eq!(ProductCollection::<Test>::get(0).unwrap().devices_count, 3);
		assert_eq!(ProductCollection::<Test>::get(0).unwrap().device_metadata_count, 0);
		assert_eq!(ProductCollection::<Test>::get(0).unwrap().device_configs_count, 3);

		assert_eq!(Balances::reserved_balance(&account(1)), 8);
		assert_ok!(DeviceIds::transfer_device(RuntimeOrigin::signed(account(1)), 0, 70, account(2)));
		assert_eq!(Balances::reserved_balance(&account(1)), 8);
		assert_eq!(Balances::reserved_balance(&account(2)), 0);

		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 42, bvec![42, 42]));
		assert_eq!(Balances::reserved_balance(&account(1)), 11);
		assert!(DeviceMetadataOf::<Test>::contains_key(0, 42));
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 69, bvec![69, 69]));
		assert_eq!(Balances::reserved_balance(&account(1)), 14);
		assert!(DeviceMetadataOf::<Test>::contains_key(0, 69));
		assert!(DeviceConfigOf::<Test>::contains_key(0, 69));
		let w = DeviceIds::get_destroy_witness(&0).unwrap();
		assert_eq!(w.device_metadata_count, 2);
		assert_eq!(w.device_configs_count, 3);
		assert_noop!(
			DeviceIds::destroy_product(RuntimeOrigin::signed(account(1)), 0, w),
			Error::<Test>::ProductNotEmpty
		);

		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(69),
			AttributeNamespace::ProductOwner,
			bvec![0],
			bvec![0],
		));
		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::signed(account(10)), 0, 42));
		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::signed(account(20)), 0, 69));
		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::root(), 0, 70));

		let w = DeviceIds::get_destroy_witness(&0).unwrap();
		assert_eq!(w.attributes_count, 1);
		assert_eq!(w.device_metadata_count, 0);
		assert_eq!(w.device_configs_count, 0);
		assert_ok!(DeviceIds::destroy_product(RuntimeOrigin::signed(account(1)), 0, w));
		assert_eq!(Balances::reserved_balance(&account(1)), 0);

		assert!(!ProductCollection::<Test>::contains_key(0));
		assert!(!ProductConfigOf::<Test>::contains_key(0));
		assert!(!DeviceCollection::<Test>::contains_key(0, 42));
		assert!(!DeviceCollection::<Test>::contains_key(0, 69));
		assert!(!ProductMetadataOf::<Test>::contains_key(0));
		assert!(!DeviceMetadataOf::<Test>::contains_key(0, 42));
		assert!(!DeviceMetadataOf::<Test>::contains_key(0, 69));
		assert!(!DeviceConfigOf::<Test>::contains_key(0, 69));
		assert_eq!(attributes(0), vec![]);
		assert_eq!(collections(), vec![]);
		assert_eq!(items(), vec![]);
	});
}

#[test]
fn destroy_product_with_bad_witness_should_not_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);
		assert_ok!(DeviceIds::create_product(
			RuntimeOrigin::signed(account(1)),
			account(1),
			collection_config_with_all_settings_enabled()
		));

		let w = ProductCollection::<Test>::get(0).unwrap().destroy_witness();
		assert_noop!(
			DeviceIds::destroy_product(
				RuntimeOrigin::signed(account(1)),
				0,
				DestroyWitness { device_configs_count: 1, ..w }
			),
			Error::<Test>::BadWitness
		);
	});
}

#[test]
fn destroy_product_should_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);
		assert_ok!(DeviceIds::create_product(
			RuntimeOrigin::signed(account(1)),
			account(1),
			collection_config_with_all_settings_enabled()
		));

		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 42, account(2)));
		assert_noop!(
			DeviceIds::destroy_product(
				RuntimeOrigin::signed(account(1)),
				0,
				DeviceIds::get_destroy_witness(&0).unwrap()
			),
			Error::<Test>::ProductNotEmpty
		);
		assert_ok!(DeviceIds::lock_device_transfer(RuntimeOrigin::signed(account(1)), 0, 42));
		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::signed(account(2)), 0, 42));
		assert_eq!(ProductCollection::<Test>::get(0).unwrap().device_configs_count, 1);
		assert_eq!(DeviceConfigOf::<Test>::iter_prefix(0).count() as u32, 1);
		assert!(DeviceConfigOf::<Test>::contains_key(0, 42));
		assert_ok!(DeviceIds::destroy_product(
			RuntimeOrigin::signed(account(1)),
			0,
			DeviceIds::get_destroy_witness(&0).unwrap()
		));
		assert!(!DeviceConfigOf::<Test>::contains_key(0, 42));
		assert_eq!(DeviceConfigOf::<Test>::iter_prefix(0).count() as u32, 0);
	});
}

#[test]
fn transfer_device_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			default_collection_config()
		));
		assert_ok!(DeviceIds::force_mint_device(
			RuntimeOrigin::signed(account(1)),
			0,
			42,
			account(2),
			default_item_config()
		));

		assert_ok!(DeviceIds::transfer_device(RuntimeOrigin::signed(account(2)), 0, 42, account(3)));
		assert_eq!(items(), vec![(account(3), 0, 42)]);
		assert_noop!(
			DeviceIds::transfer_device(RuntimeOrigin::signed(account(2)), 0, 42, account(4)),
			Error::<Test>::NoPermission
		);

		// validate we can't transfer non-transferable items
		let collection_id = 1;
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			collection_config_from_disabled_settings(
				ProductSetting::TransferableItems | ProductSetting::DepositRequired
			)
		));

		assert_ok!(DeviceIds::force_mint_device(
			RuntimeOrigin::signed(account(1)),
			1,
			1,
			account(42),
			default_item_config()
		));

		assert_noop!(
			DeviceIds::transfer_device(RuntimeOrigin::signed(account(1)), collection_id, 42, account(3)),
			Error::<Test>::DevicesNonTransferable
		);
	});
}

#[test]
fn lock_device_transfer_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			default_collection_config()
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 42, account(1)));
		assert_ok!(DeviceIds::lock_device_transfer(RuntimeOrigin::signed(account(1)), 0, 42));
		assert_noop!(
			DeviceIds::transfer_device(RuntimeOrigin::signed(account(1)), 0, 42, account(2)),
			Error::<Test>::DeviceLocked
		);

		assert_ok!(DeviceIds::unlock_device_transfer(RuntimeOrigin::signed(account(1)), 0, 42));
		assert_ok!(DeviceIds::lock_product(
			RuntimeOrigin::signed(account(1)),
			0,
			ProductSettings::from_disabled(ProductSetting::TransferableItems.into())
		));
		assert_noop!(
			DeviceIds::transfer_device(RuntimeOrigin::signed(account(1)), 0, 42, account(2)),
			Error::<Test>::DevicesNonTransferable
		);

		assert_ok!(DeviceIds::force_set_product_config(
			RuntimeOrigin::root(),
			0,
			collection_config_with_all_settings_enabled(),
		));
		assert_ok!(DeviceIds::transfer_device(RuntimeOrigin::signed(account(1)), 0, 42, account(2)));
	});
}

#[test]
fn origin_guards_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			default_collection_config()
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 42, account(1)));

		Balances::make_free_balance_be(&account(2), 100);
		assert_ok!(DeviceIds::accept_product_ownership(RuntimeOrigin::signed(account(2)), Some(0)));
		assert_noop!(
			DeviceIds::transfer_product_ownership(RuntimeOrigin::signed(account(2)), 0, account(2)),
			Error::<Test>::NoPermission
		);
		assert_noop!(
			DeviceIds::set_product_team(
				RuntimeOrigin::signed(account(2)),
				0,
				Some(account(2)),
				Some(account(2)),
				Some(account(2)),
			),
			Error::<Test>::NoPermission
		);
		assert_noop!(
			DeviceIds::lock_device_transfer(RuntimeOrigin::signed(account(2)), 0, 42),
			Error::<Test>::NoPermission
		);
		assert_noop!(
			DeviceIds::unlock_device_transfer(RuntimeOrigin::signed(account(2)), 0, 42),
			Error::<Test>::NoPermission
		);
		assert_noop!(
			DeviceIds::mint_device(RuntimeOrigin::signed(account(2)), 0, 69, account(2)),
			Error::<Test>::NoPermission
		);
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 43, account(2)));
		assert_noop!(
			DeviceIds::burn_device(RuntimeOrigin::signed(account(1)), 0, 43),
			Error::<Test>::NoPermission
		);
		let w = DeviceIds::get_destroy_witness(&0).unwrap();
		assert_noop!(
			DeviceIds::destroy_product(RuntimeOrigin::signed(account(2)), 0, w),
			Error::<Test>::NoPermission
		);
	});
}

#[test]
fn transfer_product_owner_should_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);
		Balances::make_free_balance_be(&account(2), 100);
		Balances::make_free_balance_be(&account(3), 100);
		assert_ok!(DeviceIds::create_product(
			RuntimeOrigin::signed(account(1)),
			account(1),
			collection_config_with_all_settings_enabled()
		));
		assert_eq!(collections(), vec![(account(1), 0)]);
		assert_noop!(
			DeviceIds::transfer_product_ownership(RuntimeOrigin::signed(account(1)), 0, account(2)),
			Error::<Test>::Unaccepted
		);
		assert_eq!(System::consumers(&account(2)), 0);

		assert_ok!(DeviceIds::accept_product_ownership(RuntimeOrigin::signed(account(2)), Some(0)));
		assert_eq!(System::consumers(&account(2)), 1);

		assert_ok!(DeviceIds::transfer_product_ownership(RuntimeOrigin::signed(account(1)), 0, account(2)));
		assert_eq!(System::consumers(&account(2)), 1); // one consumer is added due to deposit repatriation

		assert_eq!(collections(), vec![(account(2), 0)]);
		assert_eq!(Balances::total_balance(&account(1)), 98);
		assert_eq!(Balances::total_balance(&account(2)), 102);
		assert_eq!(Balances::reserved_balance(&account(1)), 0);
		assert_eq!(Balances::reserved_balance(&account(2)), 2);

		assert_ok!(DeviceIds::accept_product_ownership(RuntimeOrigin::signed(account(1)), Some(0)));
		assert_noop!(
			DeviceIds::transfer_product_ownership(RuntimeOrigin::signed(account(1)), 0, account(1)),
			Error::<Test>::NoPermission
		);

		// Mint and set metadata now and make sure that deposit gets transferred back.
		assert_ok!(DeviceIds::set_product_metadata(
			RuntimeOrigin::signed(account(1)),
			0,
			bvec![0u8; 20],
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 42, account(1)));
		assert_eq!(Balances::reserved_balance(&account(1)), 1);
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 42, bvec![0u8; 20]));
		assert_ok!(DeviceIds::accept_product_ownership(RuntimeOrigin::signed(account(3)), Some(0)));
		assert_ok!(DeviceIds::transfer_product_ownership(RuntimeOrigin::signed(account(2)), 0, account(3)));
		assert_eq!(collections(), vec![(account(3), 0)]);
		assert_eq!(Balances::total_balance(&account(2)), 58);
		assert_eq!(Balances::total_balance(&account(3)), 144);
		assert_eq!(Balances::reserved_balance(&account(2)), 0);
		assert_eq!(Balances::reserved_balance(&account(3)), 44);

		assert_ok!(DeviceIds::transfer_device(RuntimeOrigin::signed(account(1)), 0, 42, account(2)));
		// reserved_balance of accounts 1 & 2 should be unchanged:
		assert_eq!(Balances::reserved_balance(&account(1)), 1);
		assert_eq!(Balances::reserved_balance(&account(2)), 0);

		// 2's acceptance from before is reset when it became an owner, so it cannot be transferred
		// without a fresh acceptance.
		assert_noop!(
			DeviceIds::transfer_product_ownership(RuntimeOrigin::signed(account(3)), 0, account(2)),
			Error::<Test>::Unaccepted
		);
	});
}

#[test]
fn set_product_team_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			default_collection_config(),
		));
		assert_ok!(DeviceIds::set_product_team(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(account(2)),
			Some(account(3)),
			Some(account(4)),
		));

		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(2)), 0, 42, account(2)));

		// admin can't transfer/burn items he doesn't own
		assert_noop!(
			DeviceIds::transfer_device(RuntimeOrigin::signed(account(3)), 0, 42, account(3)),
			Error::<Test>::NoPermission
		);
		assert_noop!(
			DeviceIds::burn_device(RuntimeOrigin::signed(account(3)), 0, 42),
			Error::<Test>::NoPermission
		);

		assert_ok!(DeviceIds::lock_device_transfer(RuntimeOrigin::signed(account(4)), 0, 42));
		assert_ok!(DeviceIds::unlock_device_transfer(RuntimeOrigin::signed(account(4)), 0, 42));

		// validate we can set any role to None
		assert_ok!(DeviceIds::set_product_team(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(account(2)),
			Some(account(3)),
			None,
		));
		assert_noop!(
			DeviceIds::lock_device_transfer(RuntimeOrigin::signed(account(4)), 0, 42),
			Error::<Test>::NoPermission
		);

		// set all the roles to None
		assert_ok!(DeviceIds::set_product_team(RuntimeOrigin::signed(account(1)), 0, None, None, None,));

		// validate we can't set the roles back
		assert_noop!(
			DeviceIds::set_product_team(
				RuntimeOrigin::signed(account(1)),
				0,
				Some(account(2)),
				Some(account(3)),
				None,
			),
			Error::<Test>::NoPermission
		);

		// only the root account can change the roles from None to Some()
		assert_ok!(DeviceIds::set_product_team(
			RuntimeOrigin::root(),
			0,
			Some(account(2)),
			Some(account(3)),
			None,
		));
	});
}

#[test]
fn set_product_metadata_should_work() {
	new_test_ext().execute_with(|| {
		// Cannot add metadata to unknown item
		assert_noop!(
			DeviceIds::set_product_metadata(RuntimeOrigin::signed(account(1)), 0, bvec![0u8; 20]),
			Error::<Test>::NoPermission,
		);
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			collection_config_with_all_settings_enabled()
		));
		// Cannot add metadata to unowned item
		assert_noop!(
			DeviceIds::set_product_metadata(RuntimeOrigin::signed(account(2)), 0, bvec![0u8; 20]),
			Error::<Test>::NoPermission,
		);

		// Successfully add metadata and take deposit
		Balances::make_free_balance_be(&account(1), 30);
		assert_ok!(DeviceIds::set_product_metadata(
			RuntimeOrigin::signed(account(1)),
			0,
			bvec![0u8; 20]
		));
		assert_eq!(Balances::free_balance(&account(1)), 9);
		assert!(ProductMetadataOf::<Test>::contains_key(0));

		// Force origin works, too.
		assert_ok!(DeviceIds::set_product_metadata(RuntimeOrigin::root(), 0, bvec![0u8; 18]));

		// Update deposit
		assert_ok!(DeviceIds::set_product_metadata(
			RuntimeOrigin::signed(account(1)),
			0,
			bvec![0u8; 15]
		));
		assert_eq!(Balances::free_balance(&account(1)), 14);
		assert_ok!(DeviceIds::set_product_metadata(
			RuntimeOrigin::signed(account(1)),
			0,
			bvec![0u8; 25]
		));
		assert_eq!(Balances::free_balance(&account(1)), 4);

		// Cannot over-reserve
		assert_noop!(
			DeviceIds::set_product_metadata(RuntimeOrigin::signed(account(1)), 0, bvec![0u8; 40]),
			BalancesError::<Test>::InsufficientBalance,
		);

		// Can't set or clear metadata once frozen
		assert_ok!(DeviceIds::set_product_metadata(
			RuntimeOrigin::signed(account(1)),
			0,
			bvec![0u8; 15]
		));
		assert_ok!(DeviceIds::lock_product(
			RuntimeOrigin::signed(account(1)),
			0,
			ProductSettings::from_disabled(ProductSetting::UnlockedMetadata.into())
		));
		assert_noop!(
			DeviceIds::set_product_metadata(RuntimeOrigin::signed(account(1)), 0, bvec![0u8; 15]),
			Error::<Test>::LockedProductMetadata,
		);
		assert_noop!(
			DeviceIds::clear_product_metadata(RuntimeOrigin::signed(account(1)), 0),
			Error::<Test>::LockedProductMetadata
		);

		// Clear Metadata
		assert_ok!(DeviceIds::set_product_metadata(RuntimeOrigin::root(), 0, bvec![0u8; 15]));
		assert_noop!(
			DeviceIds::clear_product_metadata(RuntimeOrigin::signed(account(2)), 0),
			Error::<Test>::NoPermission
		);
		assert_noop!(
			DeviceIds::clear_product_metadata(RuntimeOrigin::signed(account(1)), 1),
			Error::<Test>::NoPermission
		);
		assert_noop!(
			DeviceIds::clear_product_metadata(RuntimeOrigin::signed(account(1)), 0),
			Error::<Test>::LockedProductMetadata
		);
		assert_ok!(DeviceIds::clear_product_metadata(RuntimeOrigin::root(), 0));
		assert!(!ProductMetadataOf::<Test>::contains_key(0));
	});
}

#[test]
fn set_device_metadata_should_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 30);

		// Cannot add metadata to unknown item
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			collection_config_with_all_settings_enabled()
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 42, account(1)));
		// Cannot add metadata to unowned item
		assert_noop!(
			DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(2)), 0, 42, bvec![0u8; 20]),
			Error::<Test>::NoPermission,
		);

		// Successfully add metadata and take deposit
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 42, bvec![0u8; 20]));
		assert_eq!(Balances::free_balance(&account(1)), 8);
		assert!(DeviceMetadataOf::<Test>::contains_key(0, 42));

		// Force origin works, too.
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::root(), 0, 42, bvec![0u8; 18]));

		// Update deposit
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 42, bvec![0u8; 15]));
		assert_eq!(Balances::free_balance(&account(1)), 13);
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 42, bvec![0u8; 25]));
		assert_eq!(Balances::free_balance(&account(1)), 3);

		// Cannot over-reserve
		assert_noop!(
			DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 42, bvec![0u8; 40]),
			BalancesError::<Test>::InsufficientBalance,
		);

		// Can't set or clear metadata once frozen
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 42, bvec![0u8; 15]));
		assert_ok!(DeviceIds::lock_device_properties(
			RuntimeOrigin::signed(account(1)),
			0,
			42,
			true,
			false
		));
		assert_noop!(
			DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 42, bvec![0u8; 15]),
			Error::<Test>::LockedDeviceMetadata,
		);
		assert_noop!(
			DeviceIds::clear_device_metadata(RuntimeOrigin::signed(account(1)), 0, 42),
			Error::<Test>::LockedDeviceMetadata,
		);

		// Clear Metadata
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::root(), 0, 42, bvec![0u8; 15]));
		assert_noop!(
			DeviceIds::clear_device_metadata(RuntimeOrigin::signed(account(2)), 0, 42),
			Error::<Test>::NoPermission,
		);
		assert_noop!(
			DeviceIds::clear_device_metadata(RuntimeOrigin::signed(account(1)), 1, 42),
			Error::<Test>::NoPermission,
		);
		assert_ok!(DeviceIds::clear_device_metadata(RuntimeOrigin::root(), 0, 42));
		assert!(!DeviceMetadataOf::<Test>::contains_key(0, 42));
	});
}

#[test]
fn set_product_owner_attributes_should_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			collection_config_with_all_settings_enabled()
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 0, account(1)));

		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			None,
			AttributeNamespace::ProductOwner,
			bvec![0],
			bvec![0],
		));
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(0),
			AttributeNamespace::ProductOwner,
			bvec![0],
			bvec![0],
		));
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(0),
			AttributeNamespace::ProductOwner,
			bvec![1],
			bvec![0],
		));
		assert_eq!(
			attributes(0),
			vec![
				(None, AttributeNamespace::ProductOwner, bvec![0], bvec![0]),
				(Some(0), AttributeNamespace::ProductOwner, bvec![0], bvec![0]),
				(Some(0), AttributeNamespace::ProductOwner, bvec![1], bvec![0]),
			]
		);
		assert_eq!(Balances::reserved_balance(account(1)), 10);
		assert_eq!(ProductCollection::<Test>::get(0).unwrap().owner_deposit, 9);

		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			None,
			AttributeNamespace::ProductOwner,
			bvec![0],
			bvec![0; 10],
		));
		assert_eq!(
			attributes(0),
			vec![
				(None, AttributeNamespace::ProductOwner, bvec![0], bvec![0; 10]),
				(Some(0), AttributeNamespace::ProductOwner, bvec![0], bvec![0]),
				(Some(0), AttributeNamespace::ProductOwner, bvec![1], bvec![0]),
			]
		);
		assert_eq!(Balances::reserved_balance(account(1)), 19);
		assert_eq!(ProductCollection::<Test>::get(0).unwrap().owner_deposit, 18);

		assert_ok!(DeviceIds::clear_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(0),
			AttributeNamespace::ProductOwner,
			bvec![1],
		));
		assert_eq!(
			attributes(0),
			vec![
				(None, AttributeNamespace::ProductOwner, bvec![0], bvec![0; 10]),
				(Some(0), AttributeNamespace::ProductOwner, bvec![0], bvec![0]),
			]
		);
		assert_eq!(Balances::reserved_balance(account(1)), 16);

		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::root(), 0, 0));
		let w = DeviceIds::get_destroy_witness(&0).unwrap();
		assert_ok!(DeviceIds::destroy_product(RuntimeOrigin::signed(account(1)), 0, w));
		assert_eq!(attributes(0), vec![]);
		assert_eq!(Balances::reserved_balance(account(1)), 0);
	});
}

#[test]
fn set_product_system_attributes_should_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			collection_config_with_all_settings_enabled()
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 0, account(1)));

		let collection_id = 0;
		let attribute_key = [0u8];
		let attribute_value = [0u8];

		assert_ok!(<DeviceIds as Mutate<AccountIdOf<Test>, DeviceConfig >>::set_collection_attribute(
			&collection_id,
			&attribute_key,
			&attribute_value
		));

		assert_eq!(attributes(0), vec![(None, AttributeNamespace::Pallet, bvec![0], bvec![0])]);

		assert_eq!(
			<DeviceIds as Inspect<AccountIdOf<Test>>>::system_attribute(
				&collection_id,
				None,
				&attribute_key
			),
			Some(attribute_value.to_vec())
		);

		// test typed system attribute
		let typed_attribute_key = [0u8; 32];
		#[derive(Encode, Decode, Clone, PartialEq, Eq, Debug)]
		struct TypedAttributeValue(u32);
		let typed_attribute_value = TypedAttributeValue(42);

		assert_ok!(
			<DeviceIds as Mutate<AccountIdOf<Test>, DeviceConfig >>::set_typed_collection_attribute(
				&collection_id,
				&typed_attribute_key,
				&typed_attribute_value
			)
		);

		assert_eq!(
			<DeviceIds as Inspect<AccountIdOf<Test>>>::typed_system_attribute(
				&collection_id,
				None,
				&typed_attribute_key
			),
			Some(typed_attribute_value)
		);

		// check storage
		assert_eq!(
			attributes(collection_id),
			[
				(None, AttributeNamespace::Pallet, bvec![0], bvec![0]),
				(
					None,
					AttributeNamespace::Pallet,
					bvec![
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						0, 0, 0, 0, 0, 0, 0
					],
					bvec![42, 0, 0, 0]
				)
			]
		);

		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::root(), collection_id, 0));
		let w = DeviceIds::get_destroy_witness(&0).unwrap();
		assert_ok!(DeviceIds::destroy_product(RuntimeOrigin::signed(account(1)), collection_id, w));
		assert_eq!(attributes(collection_id), vec![]);
	})
}

#[test]
fn set_device_owner_attributes_should_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);
		Balances::make_free_balance_be(&account(2), 100);
		Balances::make_free_balance_be(&account(3), 100);

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			collection_config_with_all_settings_enabled()
		));
		assert_ok!(DeviceIds::force_mint_device(
			RuntimeOrigin::signed(account(1)),
			0,
			0,
			account(2),
			default_item_config()
		));

		// can't set for the collection
		assert_noop!(
			DeviceIds::set_attribute(
				RuntimeOrigin::signed(account(2)),
				0,
				None,
				AttributeNamespace::DeviceOwner,
				bvec![0],
				bvec![0],
			),
			Error::<Test>::NoPermission,
		);
		// can't set for the non-owned item
		assert_noop!(
			DeviceIds::set_attribute(
				RuntimeOrigin::signed(account(1)),
				0,
				Some(0),
				AttributeNamespace::DeviceOwner,
				bvec![0],
				bvec![0],
			),
			Error::<Test>::NoPermission,
		);
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(2)),
			0,
			Some(0),
			AttributeNamespace::DeviceOwner,
			bvec![0],
			bvec![0],
		));
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(2)),
			0,
			Some(0),
			AttributeNamespace::DeviceOwner,
			bvec![1],
			bvec![0],
		));
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(2)),
			0,
			Some(0),
			AttributeNamespace::DeviceOwner,
			bvec![2],
			bvec![0],
		));
		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::DeviceOwner, bvec![0], bvec![0]),
				(Some(0), AttributeNamespace::DeviceOwner, bvec![1], bvec![0]),
				(Some(0), AttributeNamespace::DeviceOwner, bvec![2], bvec![0]),
			]
		);
		assert_eq!(Balances::reserved_balance(account(2)), 9);

		// validate an attribute can be updated
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(2)),
			0,
			Some(0),
			AttributeNamespace::DeviceOwner,
			bvec![0],
			bvec![0; 10],
		));
		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::DeviceOwner, bvec![0], bvec![0; 10]),
				(Some(0), AttributeNamespace::DeviceOwner, bvec![1], bvec![0]),
				(Some(0), AttributeNamespace::DeviceOwner, bvec![2], bvec![0]),
			]
		);
		assert_eq!(Balances::reserved_balance(account(2)), 18);

		// validate only item's owner (or the root) can remove an attribute
		assert_noop!(
			DeviceIds::clear_attribute(
				RuntimeOrigin::signed(account(1)),
				0,
				Some(0),
				AttributeNamespace::DeviceOwner,
				bvec![1],
			),
			Error::<Test>::NoPermission,
		);
		assert_ok!(DeviceIds::clear_attribute(
			RuntimeOrigin::signed(account(2)),
			0,
			Some(0),
			AttributeNamespace::DeviceOwner,
			bvec![1],
		));
		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::DeviceOwner, bvec![0], bvec![0; 10]),
				(Some(0), AttributeNamespace::DeviceOwner, bvec![2], bvec![0])
			]
		);
		assert_eq!(Balances::reserved_balance(account(2)), 15);

		// transfer item
		assert_ok!(DeviceIds::transfer_device(RuntimeOrigin::signed(account(2)), 0, 0, account(3)));

		// validate the attribute are still here & the deposit belongs to the previous owner
		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::DeviceOwner, bvec![0], bvec![0; 10]),
				(Some(0), AttributeNamespace::DeviceOwner, bvec![2], bvec![0])
			]
		);
		let key: BoundedVec<_, _> = bvec![0];
		let (_, deposit) =
			Attribute::<Test>::get((0, Some(0), AttributeNamespace::DeviceOwner, &key)).unwrap();
		assert_eq!(deposit.account, Some(account(2)));
		assert_eq!(deposit.amount, 12);

		// on attribute update the deposit should be returned to the previous owner
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(3)),
			0,
			Some(0),
			AttributeNamespace::DeviceOwner,
			bvec![0],
			bvec![0; 11],
		));
		let (_, deposit) =
			Attribute::<Test>::get((0, Some(0), AttributeNamespace::DeviceOwner, &key)).unwrap();
		assert_eq!(deposit.account, Some(account(3)));
		assert_eq!(deposit.amount, 13);
		assert_eq!(Balances::reserved_balance(account(2)), 3);
		assert_eq!(Balances::reserved_balance(account(3)), 13);

		// validate attributes on item deletion
		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::signed(account(3)), 0, 0));
		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::DeviceOwner, bvec![0], bvec![0; 11]),
				(Some(0), AttributeNamespace::DeviceOwner, bvec![2], bvec![0])
			]
		);
		assert_ok!(DeviceIds::clear_attribute(
			RuntimeOrigin::signed(account(3)),
			0,
			Some(0),
			AttributeNamespace::DeviceOwner,
			bvec![0],
		));
		assert_ok!(DeviceIds::clear_attribute(
			RuntimeOrigin::signed(account(2)),
			0,
			Some(0),
			AttributeNamespace::DeviceOwner,
			bvec![2],
		));
		assert_eq!(Balances::reserved_balance(account(2)), 0);
		assert_eq!(Balances::reserved_balance(account(3)), 0);
	});
}

#[test]
fn set_external_account_attributes_should_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);
		Balances::make_free_balance_be(&account(2), 100);

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			collection_config_with_all_settings_enabled()
		));
		assert_ok!(DeviceIds::force_mint_device(
			RuntimeOrigin::signed(account(1)),
			0,
			0,
			account(1),
			default_item_config()
		));
		assert_ok!(DeviceIds::approve_device_attributes(
			RuntimeOrigin::signed(account(1)),
			0,
			0,
			account(2)
		));

		assert_noop!(
			DeviceIds::set_attribute(
				RuntimeOrigin::signed(account(2)),
				0,
				Some(0),
				AttributeNamespace::Account(account(1)),
				bvec![0],
				bvec![0],
			),
			Error::<Test>::NoPermission,
		);
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(2)),
			0,
			Some(0),
			AttributeNamespace::Account(account(2)),
			bvec![0],
			bvec![0],
		));
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(2)),
			0,
			Some(0),
			AttributeNamespace::Account(account(2)),
			bvec![1],
			bvec![0],
		));
		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::Account(account(2)), bvec![0], bvec![0]),
				(Some(0), AttributeNamespace::Account(account(2)), bvec![1], bvec![0]),
			]
		);
		assert_eq!(Balances::reserved_balance(account(2)), 6);

		// remove permission to set attributes
		assert_ok!(DeviceIds::cancel_device_attributes_approval(
			RuntimeOrigin::signed(account(1)),
			0,
			0,
			account(2),
			CancelAttributesApprovalWitness { account_attributes: 2 },
		));
		assert_eq!(attributes(0), vec![]);
		assert_eq!(Balances::reserved_balance(account(2)), 0);
		assert_noop!(
			DeviceIds::set_attribute(
				RuntimeOrigin::signed(account(2)),
				0,
				Some(0),
				AttributeNamespace::Account(account(2)),
				bvec![0],
				bvec![0],
			),
			Error::<Test>::NoPermission,
		);
	});
}

#[test]
fn validate_deposit_required_setting() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);
		Balances::make_free_balance_be(&account(2), 100);
		Balances::make_free_balance_be(&account(3), 100);

		// with the disabled DepositRequired setting, only the collection's owner can set the
		// attributes for free.
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			default_collection_config()
		));
		assert_ok!(DeviceIds::force_mint_device(
			RuntimeOrigin::signed(account(1)),
			0,
			0,
			account(2),
			default_item_config()
		));
		assert_ok!(DeviceIds::approve_device_attributes(
			RuntimeOrigin::signed(account(2)),
			0,
			0,
			account(3)
		));

		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(0),
			AttributeNamespace::ProductOwner,
			bvec![0],
			bvec![0],
		));
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(2)),
			0,
			Some(0),
			AttributeNamespace::DeviceOwner,
			bvec![1],
			bvec![0],
		));
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(3)),
			0,
			Some(0),
			AttributeNamespace::Account(account(3)),
			bvec![2],
			bvec![0],
		));
		assert_ok!(<DeviceIds as Mutate<<Test as frame_system::Config>::AccountId, DeviceConfig >>::set_attribute(
			&0,
			&0,
			&[3],
			&[0],
		));
		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::ProductOwner, bvec![0], bvec![0]),
				(Some(0), AttributeNamespace::DeviceOwner, bvec![1], bvec![0]),
				(Some(0), AttributeNamespace::Account(account(3)), bvec![2], bvec![0]),
				(Some(0), AttributeNamespace::Pallet, bvec![3], bvec![0]),
			]
		);
		assert_eq!(Balances::reserved_balance(account(1)), 0);
		assert_eq!(Balances::reserved_balance(account(2)), 3);
		assert_eq!(Balances::reserved_balance(account(3)), 3);

		assert_ok!(
			<DeviceIds as Mutate<<Test as frame_system::Config>::AccountId, DeviceConfig >>::clear_attribute(
				&0,
				&0,
				&[3],
			)
		);
		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::ProductOwner, bvec![0], bvec![0]),
				(Some(0), AttributeNamespace::DeviceOwner, bvec![1], bvec![0]),
				(Some(0), AttributeNamespace::Account(account(3)), bvec![2], bvec![0]),
			]
		);
	});
}

#[test]
fn set_device_attribute_should_respect_lock() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			collection_config_with_all_settings_enabled(),
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 0, account(1)));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 1, account(1)));

		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			None,
			AttributeNamespace::ProductOwner,
			bvec![0],
			bvec![0],
		));
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(0),
			AttributeNamespace::ProductOwner,
			bvec![0],
			bvec![0],
		));
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(1),
			AttributeNamespace::ProductOwner,
			bvec![0],
			bvec![0],
		));
		assert_eq!(
			attributes(0),
			vec![
				(None, AttributeNamespace::ProductOwner, bvec![0], bvec![0]),
				(Some(0), AttributeNamespace::ProductOwner, bvec![0], bvec![0]),
				(Some(1), AttributeNamespace::ProductOwner, bvec![0], bvec![0]),
			]
		);
		assert_eq!(Balances::reserved_balance(account(1)), 11);

		assert_ok!(DeviceIds::set_product_metadata(RuntimeOrigin::signed(account(1)), 0, bvec![]));
		assert_ok!(DeviceIds::lock_product(
			RuntimeOrigin::signed(account(1)),
			0,
			ProductSettings::from_disabled(ProductSetting::UnlockedAttributes.into())
		));

		let e = Error::<Test>::LockedProductAttributes;
		assert_noop!(
			DeviceIds::set_attribute(
				RuntimeOrigin::signed(account(1)),
				0,
				None,
				AttributeNamespace::ProductOwner,
				bvec![0],
				bvec![0],
			),
			e
		);
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(0),
			AttributeNamespace::ProductOwner,
			bvec![0],
			bvec![1],
		));

		assert_ok!(DeviceIds::lock_device_properties(
			RuntimeOrigin::signed(account(1)),
			0,
			0,
			false,
			true
		));
		let e = Error::<Test>::LockedDeviceAttributes;
		assert_noop!(
			DeviceIds::set_attribute(
				RuntimeOrigin::signed(account(1)),
				0,
				Some(0),
				AttributeNamespace::ProductOwner,
				bvec![0],
				bvec![1],
			),
			e
		);
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(1),
			AttributeNamespace::ProductOwner,
			bvec![0],
			bvec![1],
		));
	});
}

#[test]
fn preserve_product_config_for_frozen_items() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			collection_config_with_all_settings_enabled()
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 0, account(1)));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 1, account(1)));

		// if the item is not locked/frozen then the config gets deleted on item burn
		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::signed(account(1)), 0, 1));
		assert!(!DeviceConfigOf::<Test>::contains_key(0, 1));

		// lock the item and ensure the config stays unchanged
		assert_ok!(DeviceIds::lock_device_properties(RuntimeOrigin::signed(account(1)), 0, 0, true, true));

		let expect_config = item_config_from_disabled_settings(
			DeviceSetting::UnlockedAttributes | DeviceSetting::UnlockedMetadata,
		);
		let config = DeviceConfigOf::<Test>::get(0, 0).unwrap();
		assert_eq!(config, expect_config);

		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::signed(account(1)), 0, 0));
		let config = DeviceConfigOf::<Test>::get(0, 0).unwrap();
		assert_eq!(config, expect_config);

		// can't mint with the different config
		assert_noop!(
			DeviceIds::force_mint_device(
				RuntimeOrigin::signed(account(1)),
				0,
				0,
				account(2),
				default_item_config()
			),
			Error::<Test>::InconsistentDeviceConfig
		);

		assert_ok!(DeviceIds::update_product_mint_settings(
			RuntimeOrigin::signed(account(1)),
			0,
			MintSettings {
				default_device_settings: DeviceSettings::from_disabled(
					DeviceSetting::UnlockedAttributes | DeviceSetting::UnlockedMetadata
				),
				..Default::default()
			}
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 0, account(1)));
	});
}

#[test]
fn force_update_product_should_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			collection_config_with_all_settings_enabled()
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 42, account(1)));
		assert_ok!(DeviceIds::force_mint_device(
			RuntimeOrigin::signed(account(1)),
			0,
			69,
			account(2),
			default_item_config(),
		));
		assert_ok!(DeviceIds::set_product_metadata(
			RuntimeOrigin::signed(account(1)),
			0,
			bvec![0; 20]
		));
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 42, bvec![0; 20]));
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 69, bvec![0; 20]));
		assert_eq!(Balances::reserved_balance(account(1)), 65);

		// force item status to be free holding
		assert_ok!(DeviceIds::force_set_product_config(
			RuntimeOrigin::root(),
			0,
			collection_config_from_disabled_settings(ProductSetting::DepositRequired.into()),
		));
		assert_ok!(DeviceIds::mint_device(RuntimeOrigin::signed(account(1)), 0, 142, account(1)));
		assert_ok!(DeviceIds::force_mint_device(
			RuntimeOrigin::signed(account(1)),
			0,
			169,
			account(2),
			default_item_config(),
		));
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 142, bvec![0; 20]));
		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(1)), 0, 169, bvec![0; 20]));

		Balances::make_free_balance_be(&account(5), 100);
		assert_ok!(DeviceIds::force_set_product_owner(RuntimeOrigin::root(), 0, account(5)));
		assert_ok!(DeviceIds::set_product_team(
			RuntimeOrigin::root(),
			0,
			Some(account(2)),
			Some(account(5)),
			Some(account(4)),
		));
		assert_eq!(collections(), vec![(account(5), 0)]);
		assert_eq!(Balances::reserved_balance(account(1)), 2);
		assert_eq!(Balances::reserved_balance(account(5)), 63);

		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(5)), 0, 42, bvec![0; 20]));
		assert_eq!(Balances::reserved_balance(account(5)), 42);

		assert_ok!(DeviceIds::set_device_metadata(RuntimeOrigin::signed(account(5)), 0, 69, bvec![0; 20]));
		assert_eq!(Balances::reserved_balance(account(5)), 21);

		assert_ok!(DeviceIds::set_product_metadata(
			RuntimeOrigin::signed(account(5)),
			0,
			bvec![0; 20]
		));
		assert_eq!(Balances::reserved_balance(account(5)), 0);

		// validate new roles
		assert_ok!(DeviceIds::set_product_team(
			RuntimeOrigin::root(),
			0,
			Some(account(2)),
			Some(account(3)),
			Some(account(4)),
		));
		assert_eq!(
			ProductRoleOf::<Test>::get(0, account(2)).unwrap(),
			ProductRoles(ProductRole::Issuer.into())
		);
		assert_eq!(
			ProductRoleOf::<Test>::get(0, account(3)).unwrap(),
			ProductRoles(ProductRole::Admin.into())
		);
		assert_eq!(
			ProductRoleOf::<Test>::get(0, account(4)).unwrap(),
			ProductRoles(ProductRole::Freezer.into())
		);

		assert_ok!(DeviceIds::set_product_team(
			RuntimeOrigin::root(),
			0,
			Some(account(3)),
			Some(account(2)),
			Some(account(3)),
		));

		assert_eq!(
			ProductRoleOf::<Test>::get(0, account(2)).unwrap(),
			ProductRoles(ProductRole::Admin.into())
		);
		assert_eq!(
			ProductRoleOf::<Test>::get(0, account(3)).unwrap(),
			ProductRoles(ProductRole::Issuer | ProductRole::Freezer)
		);
	});
}

#[test]
fn burn_device_works() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&account(1), 100);
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			collection_config_with_all_settings_enabled()
		));
		assert_ok!(DeviceIds::set_product_team(
			RuntimeOrigin::signed(account(1)),
			0,
			Some(account(2)),
			Some(account(3)),
			Some(account(4)),
		));

		assert_noop!(
			DeviceIds::burn_device(RuntimeOrigin::signed(account(5)), 0, 42),
			Error::<Test>::UnknownDevice
		);

		assert_ok!(DeviceIds::force_mint_device(
			RuntimeOrigin::signed(account(2)),
			0,
			42,
			account(5),
			default_item_config()
		));
		assert_ok!(DeviceIds::force_mint_device(
			RuntimeOrigin::signed(account(2)),
			0,
			69,
			account(5),
			default_item_config()
		));
		assert_eq!(Balances::reserved_balance(account(1)), 2);

		assert_noop!(
			DeviceIds::burn_device(RuntimeOrigin::signed(account(0)), 0, 42),
			Error::<Test>::NoPermission
		);

		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::signed(account(5)), 0, 42));
		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::signed(account(5)), 0, 69));
		assert_eq!(Balances::reserved_balance(account(1)), 0);
	});
}

#[test]
fn max_supply_should_work() {
	new_test_ext().execute_with(|| {
		let collection_id = 0;
		let user_id = account(1);
		let max_supply = 1;

		// validate set_collection_max_supply
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			user_id.clone(),
			default_collection_config()
		));
		assert_eq!(ProductConfigOf::<Test>::get(collection_id).unwrap().max_supply, None);
		assert!(!events().contains(&Event::<Test>::ProductMaxSupplySet {
			product_id: collection_id,
			max_supply,
		}));

		assert_ok!(DeviceIds::set_product_max_supply(
			RuntimeOrigin::signed(user_id.clone()),
			collection_id,
			max_supply
		));
		assert_eq!(
			ProductConfigOf::<Test>::get(collection_id).unwrap().max_supply,
			Some(max_supply)
		);

		assert!(events().contains(&Event::<Test>::ProductMaxSupplySet {
			product_id: collection_id,
			max_supply,
		}));

		assert_ok!(DeviceIds::set_product_max_supply(
			RuntimeOrigin::signed(user_id.clone()),
			collection_id,
			max_supply + 1
		));
		assert_ok!(DeviceIds::lock_product(
			RuntimeOrigin::signed(user_id.clone()),
			collection_id,
			ProductSettings::from_disabled(ProductSetting::UnlockedMaxSupply.into())
		));
		assert_noop!(
			DeviceIds::set_product_max_supply(
				RuntimeOrigin::signed(user_id.clone()),
				collection_id,
				max_supply + 2
			),
			Error::<Test>::MaxSupplyLocked
		);

		// validate we can't mint more to max supply
		assert_ok!(DeviceIds::mint_device(
			RuntimeOrigin::signed(user_id.clone()),
			collection_id,
			0,
			user_id.clone()
		));
		assert_ok!(DeviceIds::mint_device(
			RuntimeOrigin::signed(user_id.clone()),
			collection_id,
			1,
			user_id.clone()
		));
		assert_noop!(
			DeviceIds::mint_device(
				RuntimeOrigin::signed(user_id.clone()),
				collection_id,
				2,
				user_id.clone()
			),
			Error::<Test>::MaxSupplyReached
		);

		// validate the event gets emitted when we set the max supply on collection create
		let collection_id = 1;
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			user_id.clone(),
			ProductConfig { max_supply: Some(max_supply), ..default_collection_config() }
		));
		assert_eq!(
			ProductConfigOf::<Test>::get(collection_id).unwrap().max_supply,
			Some(max_supply)
		);
		assert!(events().contains(&Event::<Test>::ProductMaxSupplySet {
			product_id: collection_id,
			max_supply,
		}));
	});
}

#[test]
fn mint_settings_should_work() {
	new_test_ext().execute_with(|| {
		let collection_id = 0;
		let user_id = account(1);
		let item_id = 0;

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			user_id.clone(),
			default_collection_config()
		));
		assert_ok!(DeviceIds::mint_device(
			RuntimeOrigin::signed(user_id.clone()),
			collection_id,
			item_id,
			user_id.clone()
		));
		assert_eq!(
			DeviceConfigOf::<Test>::get(collection_id, item_id)
				.unwrap()
				.settings
				.get_disabled(),
			DeviceSettings::all_enabled().get_disabled()
		);

		let collection_id = 1;
		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			user_id.clone(),
			ProductConfig {
				mint_settings: MintSettings {
					default_device_settings: DeviceSettings::from_disabled(
						DeviceSetting::Transferable | DeviceSetting::UnlockedMetadata
					),
					..Default::default()
				},
				..default_collection_config()
			}
		));
		assert_ok!(DeviceIds::mint_device(
			RuntimeOrigin::signed(user_id.clone()),
			collection_id,
			item_id,
			user_id.clone()
		));
		assert_eq!(
			DeviceConfigOf::<Test>::get(collection_id, item_id)
				.unwrap()
				.settings
				.get_disabled(),
			DeviceSettings::from_disabled(DeviceSetting::Transferable | DeviceSetting::UnlockedMetadata)
				.get_disabled()
		);
	});
}

#[test]
fn various_product_settings() {
	new_test_ext().execute_with(|| {
		// when we set only one value it's required to call .into() on it
		let config =
			collection_config_from_disabled_settings(ProductSetting::TransferableItems.into());
		assert_ok!(DeviceIds::force_create_product(RuntimeOrigin::root(), account(1), config));

		let config = ProductConfigOf::<Test>::get(0).unwrap();
		assert!(!config.is_setting_enabled(ProductSetting::TransferableItems));
		assert!(config.is_setting_enabled(ProductSetting::UnlockedMetadata));

		// no need to call .into() for multiple values
		let config = collection_config_from_disabled_settings(
			ProductSetting::UnlockedMetadata | ProductSetting::TransferableItems,
		);
		assert_ok!(DeviceIds::force_create_product(RuntimeOrigin::root(), account(1), config));

		let config = ProductConfigOf::<Test>::get(1).unwrap();
		assert!(!config.is_setting_enabled(ProductSetting::TransferableItems));
		assert!(!config.is_setting_enabled(ProductSetting::UnlockedMetadata));

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			account(1),
			default_collection_config()
		));
	});
}

#[test]
fn lock_product_should_work() {
	new_test_ext().execute_with(|| {
		let user_id = account(1);
		let collection_id = 0;

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			user_id.clone(),
			collection_config_with_all_settings_enabled()
		));

		let lock_config =
			collection_config_from_disabled_settings(ProductSetting::DepositRequired.into());
		assert_noop!(
			DeviceIds::lock_product(
				RuntimeOrigin::signed(user_id.clone()),
				collection_id,
				lock_config.settings,
			),
			Error::<Test>::WrongSetting
		);

		// validate partial lock
		let lock_config = collection_config_from_disabled_settings(
			ProductSetting::TransferableItems | ProductSetting::UnlockedAttributes,
		);
		assert_ok!(DeviceIds::lock_product(
			RuntimeOrigin::signed(user_id.clone()),
			collection_id,
			lock_config.settings,
		));

		let stored_config = ProductConfigOf::<Test>::get(collection_id).unwrap();
		assert_eq!(stored_config, lock_config);

		// validate full lock
		assert_ok!(DeviceIds::lock_product(
			RuntimeOrigin::signed(user_id),
			collection_id,
			ProductSettings::from_disabled(ProductSetting::UnlockedMetadata.into()),
		));

		let stored_config = ProductConfigOf::<Test>::get(collection_id).unwrap();
		let full_lock_config = collection_config_from_disabled_settings(
			ProductSetting::TransferableItems |
				ProductSetting::UnlockedMetadata |
				ProductSetting::UnlockedAttributes,
		);
		assert_eq!(stored_config, full_lock_config);
	});
}

#[test]
fn group_roles_by_account_should_work() {
	new_test_ext().execute_with(|| {
		assert_eq!(DeviceIds::group_roles_by_account(vec![]), vec![]);

		let account_to_role = DeviceIds::group_roles_by_account(vec![
			(account(3), ProductRole::Freezer),
			(account(1), ProductRole::Issuer),
			(account(2), ProductRole::Admin),
		]);
		let expect = vec![
			(account(1), ProductRoles(ProductRole::Issuer.into())),
			(account(2), ProductRoles(ProductRole::Admin.into())),
			(account(3), ProductRoles(ProductRole::Freezer.into())),
		];
		assert_eq!(account_to_role, expect);

		let account_to_role = DeviceIds::group_roles_by_account(vec![
			(account(3), ProductRole::Freezer),
			(account(2), ProductRole::Issuer),
			(account(2), ProductRole::Admin),
		]);
		let expect = vec![
			(account(2), ProductRoles(ProductRole::Issuer | ProductRole::Admin)),
			(account(3), ProductRoles(ProductRole::Freezer.into())),
		];
		assert_eq!(account_to_role, expect);
	})
}

#[test]
fn add_remove_device_attributes_approval_should_work() {
	new_test_ext().execute_with(|| {
		let user_1 = account(1);
		let user_2 = account(2);
		let user_3 = account(3);
		let user_4 = account(4);
		let collection_id = 0;
		let item_id = 0;

		assert_ok!(DeviceIds::force_create_product(
			RuntimeOrigin::root(),
			user_1.clone(),
			default_collection_config()
		));
		assert_ok!(DeviceIds::mint_device(
			RuntimeOrigin::signed(user_1.clone()),
			collection_id,
			item_id,
			user_1.clone()
		));
		assert_ok!(DeviceIds::approve_device_attributes(
			RuntimeOrigin::signed(user_1.clone()),
			collection_id,
			item_id,
			user_2.clone(),
		));
		assert_eq!(item_attributes_approvals(collection_id, item_id), vec![user_2.clone()]);

		assert_ok!(DeviceIds::approve_device_attributes(
			RuntimeOrigin::signed(user_1.clone()),
			collection_id,
			item_id,
			user_3.clone(),
		));
		assert_ok!(DeviceIds::approve_device_attributes(
			RuntimeOrigin::signed(user_1.clone()),
			collection_id,
			item_id,
			user_2.clone(),
		));
		assert_eq!(
			item_attributes_approvals(collection_id, item_id),
			vec![user_2.clone(), user_3.clone()]
		);

		assert_noop!(
			DeviceIds::approve_device_attributes(
				RuntimeOrigin::signed(user_1.clone()),
				collection_id,
				item_id,
				user_4,
			),
			Error::<Test>::ReachedApprovalLimit
		);

		assert_ok!(DeviceIds::cancel_device_attributes_approval(
			RuntimeOrigin::signed(user_1),
			collection_id,
			item_id,
			user_2,
			CancelAttributesApprovalWitness { account_attributes: 1 },
		));
		assert_eq!(item_attributes_approvals(collection_id, item_id), vec![user_3]);
	})
}

#[test]
fn validate_signature() {
	new_test_ext().execute_with(|| {
		let user_1_pair = sp_core::sr25519::Pair::from_string("//Alice", None).unwrap();
		let user_1_signer = MultiSigner::Sr25519(user_1_pair.public());
		let user_1 = user_1_signer.clone().into_account();
		let mint_data: PreSignedMint<u32, u32, AccountId, u32> = PreSignedMint {
			product_id: 0,
			device_id: 0,
			attributes: vec![],
			metadata: vec![],
			only_account: None,
			deadline: 100000,
		};
		let encoded_data = Encode::encode(&mint_data);
		let signature = MultiSignature::Sr25519(user_1_pair.sign(&encoded_data));
		assert_ok!(DeviceIds::validate_signature(&encoded_data, &signature, &user_1));

		let mut wrapped_data: Vec<u8> = Vec::new();
		wrapped_data.extend(b"<Bytes>");
		wrapped_data.extend(&encoded_data);
		wrapped_data.extend(b"</Bytes>");

		let signature = MultiSignature::Sr25519(user_1_pair.sign(&wrapped_data));
		assert_ok!(DeviceIds::validate_signature(&encoded_data, &signature, &user_1));
	})
}

#[test]
fn pre_signed_device_mints_should_work() {
	new_test_ext().execute_with(|| {
		let user_0 = account(0);
		let user_1_pair = sp_core::sr25519::Pair::from_string("//Alice", None).unwrap();
		let user_1_signer = MultiSigner::Sr25519(user_1_pair.public());
		let user_1 = user_1_signer.clone().into_account();
		let mint_data = PreSignedMint {
			product_id: 0,
			device_id: 0,
			attributes: vec![(vec![0], vec![1]), (vec![2], vec![3])],
			metadata: vec![0, 1],
			only_account: None,
			deadline: 10000000,
		};
		let message = Encode::encode(&mint_data);
		let signature = MultiSignature::Sr25519(user_1_pair.sign(&message));
		let user_2 = account(2);
		let user_3 = account(3);

		Balances::make_free_balance_be(&user_0, 100);
		Balances::make_free_balance_be(&user_2, 100);
		assert_ok!(DeviceIds::create_product(
			RuntimeOrigin::signed(user_0.clone()),
			user_1.clone(),
			collection_config_with_all_settings_enabled(),
		));

		assert_ok!(DeviceIds::mint_device_pre_signed(
			RuntimeOrigin::signed(user_2.clone()),
			Box::new(mint_data.clone()),
			signature.clone(),
			user_1.clone(),
		));
		assert_eq!(items(), vec![(user_2.clone(), 0, 0)]);
		let metadata = DeviceMetadataOf::<Test>::get(0, 0).unwrap();
		assert_eq!(
			metadata.deposit,
			DeviceMetadataDeposit { account: Some(user_2.clone()), amount: 3 }
		);
		assert_eq!(metadata.data, vec![0, 1]);

		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::ProductOwner, bvec![0], bvec![1]),
				(Some(0), AttributeNamespace::ProductOwner, bvec![2], bvec![3]),
			]
		);
		let attribute_key: BoundedVec<_, _> = bvec![0];
		let (_, deposit) = Attribute::<Test>::get((
			0,
			Some(0),
			AttributeNamespace::ProductOwner,
			&attribute_key,
		))
		.unwrap();
		assert_eq!(deposit.account, Some(user_2.clone()));
		assert_eq!(deposit.amount, 3);

		assert_eq!(Balances::free_balance(&user_0), 100 - 2); // 2 - collection deposit
		assert_eq!(Balances::free_balance(&user_2), 100 - 1 - 3 - 6); // 1 - item deposit, 3 - metadata, 6 - attributes

		assert_noop!(
			DeviceIds::mint_device_pre_signed(
				RuntimeOrigin::signed(user_2.clone()),
				Box::new(mint_data),
				signature.clone(),
				user_1.clone(),
			),
			Error::<Test>::AlreadyExists
		);

		assert_ok!(DeviceIds::burn_device(RuntimeOrigin::signed(user_2.clone()), 0, 0));
		assert_eq!(Balances::free_balance(&user_2), 100 - 6);

		// validate the `only_account` field
		let mint_data = PreSignedMint {
			product_id: 0,
			device_id: 0,
			attributes: vec![],
			metadata: vec![],
			only_account: Some(account(2)),
			deadline: 10000000,
		};

		// can't mint with the wrong signature
		assert_noop!(
			DeviceIds::mint_device_pre_signed(
				RuntimeOrigin::signed(user_2.clone()),
				Box::new(mint_data.clone()),
				signature.clone(),
				user_1.clone(),
			),
			Error::<Test>::WrongSignature
		);

		let message = Encode::encode(&mint_data);
		let signature = MultiSignature::Sr25519(user_1_pair.sign(&message));

		assert_noop!(
			DeviceIds::mint_device_pre_signed(
				RuntimeOrigin::signed(user_3),
				Box::new(mint_data.clone()),
				signature.clone(),
				user_1.clone(),
			),
			Error::<Test>::WrongOrigin
		);

		// validate signature's expiration
		System::set_block_number(10000001);
		assert_noop!(
			DeviceIds::mint_device_pre_signed(
				RuntimeOrigin::signed(user_2.clone()),
				Box::new(mint_data),
				signature,
				user_1.clone(),
			),
			Error::<Test>::DeadlineExpired
		);
		System::set_block_number(1);

		// validate the collection
		let mint_data = PreSignedMint {
			product_id: 1,
			device_id: 0,
			attributes: vec![],
			metadata: vec![],
			only_account: Some(account(2)),
			deadline: 10000000,
		};
		let message = Encode::encode(&mint_data);
		let signature = MultiSignature::Sr25519(user_1_pair.sign(&message));

		assert_noop!(
			DeviceIds::mint_device_pre_signed(
				RuntimeOrigin::signed(user_2.clone()),
				Box::new(mint_data),
				signature,
				user_1.clone(),
			),
			Error::<Test>::NoPermission
		);

		// validate max attributes limit
		let mint_data = PreSignedMint {
			product_id: 0,
			device_id: 0,
			attributes: vec![(vec![0], vec![1]), (vec![2], vec![3]), (vec![2], vec![3])],
			metadata: vec![0, 1],
			only_account: None,
			deadline: 10000000,
		};
		let message = Encode::encode(&mint_data);
		let signature = MultiSignature::Sr25519(user_1_pair.sign(&message));
		assert_noop!(
			DeviceIds::mint_device_pre_signed(
				RuntimeOrigin::signed(user_2),
				Box::new(mint_data),
				signature,
				user_1.clone(),
			),
			Error::<Test>::MaxAttributesLimitReached
		);
	})
}

#[test]
fn pre_signed_attributes_should_work() {
	new_test_ext().execute_with(|| {
		let user_1_pair = sp_core::sr25519::Pair::from_string("//Alice", None).unwrap();
		let user_1_signer = MultiSigner::Sr25519(user_1_pair.public());
		let user_1 = user_1_signer.clone().into_account();
		let user_2 = account(2);
		let user_3_pair = sp_core::sr25519::Pair::from_string("//Bob", None).unwrap();
		let user_3_signer = MultiSigner::Sr25519(user_3_pair.public());
		let user_3 = user_3_signer.clone().into_account();
		let collection_id = 0;
		let item_id = 0;

		Balances::make_free_balance_be(&user_1, 100);
		Balances::make_free_balance_be(&user_2, 100);
		Balances::make_free_balance_be(&user_3, 100);
		assert_ok!(DeviceIds::create_product(
			RuntimeOrigin::signed(user_1.clone()),
			user_1.clone(),
			collection_config_with_all_settings_enabled(),
		));
		assert_ok!(DeviceIds::mint_device(
			RuntimeOrigin::signed(user_1.clone()),
			collection_id,
			item_id,
			user_2.clone(),
		));

		// validate the CollectionOwner namespace
		let pre_signed_data = PreSignedAttributes {
			product_id: 0,
			device_id: 0,
			attributes: vec![(vec![0], vec![1]), (vec![2], vec![3])],
			namespace: AttributeNamespace::ProductOwner,
			deadline: 10000000,
		};
		let message = Encode::encode(&pre_signed_data);
		let signature = MultiSignature::Sr25519(user_1_pair.sign(&message));

		assert_ok!(DeviceIds::set_attributes_pre_signed(
			RuntimeOrigin::signed(user_2.clone()),
			pre_signed_data.clone(),
			signature.clone(),
			user_1.clone(),
		));

		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::ProductOwner, bvec![0], bvec![1]),
				(Some(0), AttributeNamespace::ProductOwner, bvec![2], bvec![3]),
			]
		);
		let attribute_key: BoundedVec<_, _> = bvec![0];
		let (_, deposit) = Attribute::<Test>::get((
			0,
			Some(0),
			AttributeNamespace::ProductOwner,
			&attribute_key,
		))
		.unwrap();
		assert_eq!(deposit.account, Some(user_2.clone()));
		assert_eq!(deposit.amount, 3);

		assert_eq!(Balances::free_balance(&user_1), 100 - 2 - 1); // 2 - collection deposit, 1 - item deposit
		assert_eq!(Balances::free_balance(&user_2), 100 - 6); // 6 - attributes

		// validate the deposit gets returned on attribute update from collection's owner
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(user_1.clone()),
			collection_id,
			Some(item_id),
			AttributeNamespace::ProductOwner,
			bvec![0],
			bvec![1],
		));
		let (_, deposit) = Attribute::<Test>::get((
			0,
			Some(0),
			AttributeNamespace::ProductOwner,
			&attribute_key,
		))
		.unwrap();
		assert_eq!(deposit.account, None);
		assert_eq!(deposit.amount, 3);

		// validate we don't partially modify the state
		assert_eq!(item_attributes_approvals(collection_id, item_id), vec![]);
		let pre_signed_data = PreSignedAttributes {
			product_id: 0,
			device_id: 0,
			attributes: vec![(vec![0], vec![1]), (vec![2; 51], vec![3])],
			namespace: AttributeNamespace::Account(user_3.clone()),
			deadline: 10000000,
		};
		let message = Encode::encode(&pre_signed_data);
		let signature = MultiSignature::Sr25519(user_3_pair.sign(&message));

		assert_noop!(
			DeviceIds::set_attributes_pre_signed(
				RuntimeOrigin::signed(user_2.clone()),
				pre_signed_data.clone(),
				signature.clone(),
				user_3.clone(),
			),
			Error::<Test>::IncorrectData
		);

		// no new approval was set
		assert_eq!(item_attributes_approvals(collection_id, item_id), vec![]);

		// no new attributes were added
		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::ProductOwner, bvec![0], bvec![1]),
				(Some(0), AttributeNamespace::ProductOwner, bvec![2], bvec![3]),
			]
		);

		// validate the Account namespace
		let pre_signed_data = PreSignedAttributes {
			product_id: 0,
			device_id: 0,
			attributes: vec![(vec![0], vec![1]), (vec![2], vec![3])],
			namespace: AttributeNamespace::Account(user_3.clone()),
			deadline: 10000000,
		};
		let message = Encode::encode(&pre_signed_data);
		let signature = MultiSignature::Sr25519(user_3_pair.sign(&message));

		assert_ok!(DeviceIds::set_attributes_pre_signed(
			RuntimeOrigin::signed(user_2.clone()),
			pre_signed_data.clone(),
			signature.clone(),
			user_3.clone(),
		));

		assert_eq!(
			attributes(0),
			vec![
				(Some(0), AttributeNamespace::ProductOwner, bvec![0], bvec![1]),
				(Some(0), AttributeNamespace::Account(user_3.clone()), bvec![0], bvec![1]),
				(Some(0), AttributeNamespace::ProductOwner, bvec![2], bvec![3]),
				(Some(0), AttributeNamespace::Account(user_3.clone()), bvec![2], bvec![3]),
			]
		);
		assert_eq!(item_attributes_approvals(collection_id, item_id), vec![user_3.clone()]);

		let attribute_key: BoundedVec<_, _> = bvec![0];
		let (_, deposit) = Attribute::<Test>::get((
			0,
			Some(0),
			AttributeNamespace::Account(user_3.clone()),
			&attribute_key,
		))
		.unwrap();
		assert_eq!(deposit.account, Some(user_2.clone()));
		assert_eq!(deposit.amount, 3);

		assert_eq!(Balances::free_balance(&user_2), 100 - 9);
		assert_eq!(Balances::free_balance(&user_3), 100);

		// validate the deposit gets returned on attribute update from user_3
		assert_ok!(DeviceIds::set_attribute(
			RuntimeOrigin::signed(user_3.clone()),
			collection_id,
			Some(item_id),
			AttributeNamespace::Account(user_3.clone()),
			bvec![0],
			bvec![1],
		));
		let (_, deposit) = Attribute::<Test>::get((
			0,
			Some(0),
			AttributeNamespace::Account(user_3.clone()),
			&attribute_key,
		))
		.unwrap();
		assert_eq!(deposit.account, Some(user_3.clone()));
		assert_eq!(deposit.amount, 3);

		assert_eq!(Balances::free_balance(&user_2), 100 - 6);
		assert_eq!(Balances::free_balance(&user_3), 100 - 3);

		// can't update with the wrong signature
		assert_noop!(
			DeviceIds::set_attributes_pre_signed(
				RuntimeOrigin::signed(user_2.clone()),
				pre_signed_data.clone(),
				signature.clone(),
				user_1.clone(),
			),
			Error::<Test>::WrongSignature
		);

		// can't update if I don't own that item
		assert_noop!(
			DeviceIds::set_attributes_pre_signed(
				RuntimeOrigin::signed(user_3.clone()),
				pre_signed_data.clone(),
				signature.clone(),
				user_3.clone(),
			),
			Error::<Test>::NoPermission
		);

		// can't update the CollectionOwner namespace if the signer is not an owner of that
		// collection
		let pre_signed_data = PreSignedAttributes {
			product_id: 0,
			device_id: 0,
			attributes: vec![(vec![0], vec![1]), (vec![2], vec![3])],
			namespace: AttributeNamespace::ProductOwner,
			deadline: 10000000,
		};
		let message = Encode::encode(&pre_signed_data);
		let signature = MultiSignature::Sr25519(user_3_pair.sign(&message));

		assert_noop!(
			DeviceIds::set_attributes_pre_signed(
				RuntimeOrigin::signed(user_2.clone()),
				pre_signed_data.clone(),
				signature.clone(),
				user_3.clone(),
			),
			Error::<Test>::NoPermission
		);

		// validate signature's expiration
		System::set_block_number(10000001);
		assert_noop!(
			DeviceIds::set_attributes_pre_signed(
				RuntimeOrigin::signed(user_2.clone()),
				pre_signed_data.clone(),
				signature.clone(),
				user_3.clone(),
			),
			Error::<Test>::DeadlineExpired
		);
		System::set_block_number(1);

		// validate item & collection
		let pre_signed_data = PreSignedAttributes {
			product_id: 1,
			device_id: 1,
			attributes: vec![(vec![0], vec![1]), (vec![2], vec![3])],
			namespace: AttributeNamespace::ProductOwner,
			deadline: 10000000,
		};
		let message = Encode::encode(&pre_signed_data);
		let signature = MultiSignature::Sr25519(user_1_pair.sign(&message));

		assert_noop!(
			DeviceIds::set_attributes_pre_signed(
				RuntimeOrigin::signed(user_2.clone()),
				pre_signed_data.clone(),
				signature.clone(),
				user_1.clone(),
			),
			Error::<Test>::UnknownDevice
		);

		// validate max attributes limit
		let pre_signed_data = PreSignedAttributes {
			product_id: 1,
			device_id: 1,
			attributes: vec![(vec![0], vec![1]), (vec![2], vec![3]), (vec![2], vec![3])],
			namespace: AttributeNamespace::ProductOwner,
			deadline: 10000000,
		};
		let message = Encode::encode(&pre_signed_data);
		let signature = MultiSignature::Sr25519(user_1_pair.sign(&message));

		assert_noop!(
			DeviceIds::set_attributes_pre_signed(
				RuntimeOrigin::signed(user_2.clone()),
				pre_signed_data.clone(),
				signature.clone(),
				user_1.clone(),
			),
			Error::<Test>::MaxAttributesLimitReached
		);

		// validate the attribute's value length
		let pre_signed_data = PreSignedAttributes {
			product_id: 0,
			device_id: 0,
			attributes: vec![(vec![0], vec![1]), (vec![2], vec![3; 51])],
			namespace: AttributeNamespace::ProductOwner,
			deadline: 10000000,
		};
		let message = Encode::encode(&pre_signed_data);
		let signature = MultiSignature::Sr25519(user_1_pair.sign(&message));

		assert_noop!(
			DeviceIds::set_attributes_pre_signed(
				RuntimeOrigin::signed(user_2.clone()),
				pre_signed_data.clone(),
				signature.clone(),
				user_1.clone(),
			),
			Error::<Test>::IncorrectData
		);
	})
}

#[test]
fn basic_create_product_with_id_should_work() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			DeviceIds::create_collection_with_id(
				0u32,
				&account(1),
				&account(1),
				&default_collection_config(),
			),
			Error::<Test>::WrongSetting
		);

		Balances::make_free_balance_be(&account(1), 100);
		Balances::make_free_balance_be(&account(2), 100);

		assert_ok!(DeviceIds::create_collection_with_id(
			0u32,
			&account(1),
			&account(1),
			&collection_config_with_all_settings_enabled(),
		));

		assert_eq!(collections(), vec![(account(1), 0)]);

		// CollectionId already taken.
		assert_noop!(
			DeviceIds::create_collection_with_id(
				0u32,
				&account(2),
				&account(2),
				&collection_config_with_all_settings_enabled(),
			),
			Error::<Test>::ProductIdInUse
		);
	});
}
