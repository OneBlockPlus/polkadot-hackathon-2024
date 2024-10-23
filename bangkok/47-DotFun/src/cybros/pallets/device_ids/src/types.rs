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

//! This module contains various basic types and data structures used in the NFTs pallet.

use super::*;
use crate::macros::*;
use scale_codec::EncodeLike;
use enumflags2::{bitflags, BitFlags};
use frame_support::{
	pallet_prelude::{BoundedVec, MaxEncodedLen},
	traits::Get,
	BoundedBTreeSet,
};
use frame_system::pallet_prelude::BlockNumberFor;
use scale_info::{build::Fields, meta_type, Path, Type, TypeInfo, TypeParameter};

/// A type alias for handling balance deposits.
pub(super) type DepositBalanceOf<T> =
	<<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;
// pub type ContractBalanceOf<T> =
// 	<<T as pallet_contracts::Config>::Currency as InspectFungible<<T as frame_system::Config>::AccountId>>::Balance;
/// A type alias representing the details of a collection.
pub(super) type ProductEntryFor<T> =
	ProductEntry<<T as frame_system::Config>::AccountId, DepositBalanceOf<T>>;
/// A type alias for keeping track of approvals for an item's attributes.
pub(super) type DeviceAttributesApprovals<T> =
	BoundedBTreeSet<<T as frame_system::Config>::AccountId, <T as Config>::DeviceAttributesApprovalsLimit>;
/// A type that holds the deposit for a single item.
pub(super) type DeviceEntryDepositOf<T> =
	DeviceEntryDeposit<DepositBalanceOf<T>, <T as frame_system::Config>::AccountId>;
/// A type that holds the deposit amount for an item's attribute.
pub(super) type AttributeDepositOf<T> =
	AttributeDeposit<DepositBalanceOf<T>, <T as frame_system::Config>::AccountId>;
/// A type that holds the deposit amount for an item's metadata.
pub(super) type DeviceMetadataDepositOf<T> =
	DeviceMetadataDeposit<DepositBalanceOf<T>, <T as frame_system::Config>::AccountId>;
/// A type that holds the details of a single item.
pub(super) type DeviceEntryFor<T> =
	DeviceEntry<<T as frame_system::Config>::AccountId, DeviceEntryDepositOf<T>>;
/// A type alias for the pre-signed minting configuration for a specified collection.
pub(super) type PreSignedMintOf<T> = PreSignedMint<
	<T as Config>::ProductId,
	<T as Config>::DeviceId,
	<T as frame_system::Config>::AccountId,
	BlockNumberFor<T>,
>;
/// A type alias for the pre-signed minting configuration on the attribute level of an item.
pub(super) type PreSignedAttributesOf<T> = PreSignedAttributes<
	<T as Config>::ProductId,
	<T as Config>::DeviceId,
	<T as frame_system::Config>::AccountId,
	BlockNumberFor<T>,
>;

/// Information about a collection.
#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub struct ProductEntry<AccountId, DepositBalance> {
	/// Collection's owner.
	pub(super) owner: AccountId,
	/// The total balance deposited by the owner for all the storage data associated with this
	/// collection. Used by `destroy`.
	pub(super) owner_deposit: DepositBalance,
	/// The total number of outstanding items of this collection.
	pub(super) devices_count: u32,
	/// The total number of outstanding item metadata of this collection.
	pub(super) device_metadata_count: u32,
	/// The total number of outstanding item configs of this collection.
	pub(super) device_configs_count: u32,
	/// The total number of attributes for this collection.
	pub(super) attributes_count: u32,
}

/// Witness data for the destroy transactions.
#[derive(Copy, Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub struct DestroyWitness {
	/// The total number of items in this collection that have outstanding item metadata.
	#[codec(compact)]
	pub device_metadata_count: u32,
	/// The total number of outstanding item configs of this collection.
	#[codec(compact)]
	pub device_configs_count: u32,
	/// The total number of attributes for this collection.
	#[codec(compact)]
	pub attributes_count: u32,
}

impl<AccountId, DepositBalance> ProductEntry<AccountId, DepositBalance> {
	pub fn destroy_witness(&self) -> DestroyWitness {
		DestroyWitness {
			device_metadata_count: self.device_metadata_count,
			device_configs_count: self.device_configs_count,
			attributes_count: self.attributes_count,
		}
	}
}

/// Information concerning the ownership of a single unique item.
#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, Default, TypeInfo, MaxEncodedLen)]
pub struct DeviceEntry<AccountId, Deposit> {
	/// The owner of this item.
	pub(super) owner: AccountId,
	/// The amount held in the pallet's default account for this item. Free-hold items will have
	/// this as zero.
	pub(super) deposit: Deposit,
}

/// Information about the reserved item deposit.
#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub struct DeviceEntryDeposit<DepositBalance, AccountId> {
	/// A depositor account.
	pub(super) account: AccountId,
	/// An amount that gets reserved.
	pub(super) amount: DepositBalance,
}

/// Information about the collection's metadata.
#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, Default, TypeInfo, MaxEncodedLen)]
#[scale_info(skip_type_params(StringLimit))]
#[codec(mel_bound(Deposit: MaxEncodedLen))]
pub struct ProductMetadata<Deposit, StringLimit: Get<u32>> {
	/// The balance deposited for this metadata.
	///
	/// This pays for the data stored in this struct.
	pub(super) deposit: Deposit,
	/// General information concerning this collection. Limited in length by `StringLimit`. This
	/// will generally be either a JSON dump or the hash of some JSON which can be found on a
	/// hash-addressable global publication system such as IPFS.
	pub(super) data: BoundedVec<u8, StringLimit>,
}

/// Information about the item's metadata.
#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, Default, TypeInfo, MaxEncodedLen)]
#[scale_info(skip_type_params(StringLimit))]
pub struct DeviceMetadata<Deposit, StringLimit: Get<u32>> {
	/// The balance deposited for this metadata.
	///
	/// This pays for the data stored in this struct.
	pub(super) deposit: Deposit,
	/// General information concerning this item. Limited in length by `StringLimit`. This will
	/// generally be either a JSON dump or the hash of some JSON which can be found on a
	/// hash-addressable global publication system such as IPFS.
	pub(super) data: BoundedVec<u8, StringLimit>,
}

/// Information about the reserved attribute deposit.
#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub struct AttributeDeposit<DepositBalance, AccountId> {
	/// A depositor account.
	pub(super) account: Option<AccountId>,
	/// An amount that gets reserved.
	pub(super) amount: DepositBalance,
}

/// Information about the reserved item's metadata deposit.
#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub struct DeviceMetadataDeposit<DepositBalance, AccountId> {
	/// A depositor account, None means the deposit is collection's owner.
	pub(super) account: Option<AccountId>,
	/// An amount that gets reserved.
	pub(super) amount: DepositBalance,
}

/// Support for up to 64 user-enabled features on a collection.
#[bitflags]
#[repr(u64)]
#[derive(Copy, Clone, Debug, PartialEq, Eq, Encode, Decode, MaxEncodedLen, TypeInfo)]
pub enum ProductSetting {
	/// Items in this collection are transferable.
	TransferableItems,
	/// The metadata of this collection can be modified.
	UnlockedMetadata,
	/// Attributes of this collection can be modified.
	UnlockedAttributes,
	/// The supply of this collection can be modified.
	UnlockedMaxSupply,
	/// When this isn't set then the deposit is required to hold the items of this collection.
	DepositRequired,
}

/// Wrapper type for `BitFlags<CollectionSetting>` that implements `Codec`.
#[derive(Clone, Copy, PartialEq, Eq, Default, Debug)]
pub struct ProductSettings(pub BitFlags<ProductSetting>);

impl ProductSettings {
	pub fn all_enabled() -> Self {
		Self(BitFlags::EMPTY)
	}
	pub fn get_disabled(&self) -> BitFlags<ProductSetting> {
		self.0
	}
	pub fn is_disabled(&self, setting: ProductSetting) -> bool {
		self.0.contains(setting)
	}
	pub fn from_disabled(settings: BitFlags<ProductSetting>) -> Self {
		Self(settings)
	}
}

impl_codec_bitflags!(ProductSettings, u64, ProductSetting);

/// Mint type. Can the NFT be create by anyone, or only the creator of the collection,
/// or only by wallets that already hold an NFT from a certain collection?
/// The ownership of a privately minted NFT is still publicly visible.
#[derive(Clone, Copy, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub enum MintType {
	/// Only an `Issuer` could mint items.
	Issuer,
}

/// Holds the information about minting.
#[derive(Clone, Copy, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub struct MintSettings {
	/// Whether anyone can mint or if minters are restricted to some subset.
	pub mint_type: MintType,
	/// Default settings each item will get during the mint.
	pub default_device_settings: DeviceSettings,
}

impl Default for MintSettings {
	fn default() -> Self {
		Self {
			mint_type: MintType::Issuer,
			default_device_settings: DeviceSettings::all_enabled(),
		}
	}
}

/// Attribute namespaces for non-fungible tokens.
#[derive(
	Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen,
)]
pub enum AttributeNamespace<AccountId> {
	/// An attribute was set by the pallet.
	Pallet,
	/// An attribute was set by collection's owner.
	ProductOwner,
	/// An attribute was set by item's owner.
	DeviceOwner,
	/// An attribute was set by pre-approved account.
	Account(AccountId),
}

/// A witness data to cancel attributes approval operation.
#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo)]
pub struct CancelAttributesApprovalWitness {
	/// An amount of attributes previously created by account.
	pub account_attributes: u32,
}

/// A list of possible pallet-level attributes.
#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub enum PalletAttributes {
	/// Marks an item as being restricted from transferring.
	TransferDisabled,
}

/// Collection's configuration.
#[derive(
	Clone, Copy, Decode, Default, Encode, MaxEncodedLen, PartialEq, Debug, TypeInfo,
)]
pub struct ProductConfig {
	/// Collection's settings.
	pub settings: ProductSettings,
	/// Collection's max supply.
	pub max_supply: Option<u32>,
	/// Default settings each item will get during the mint.
	pub mint_settings: MintSettings,
}

impl ProductConfig {
	pub fn is_setting_enabled(&self, setting: ProductSetting) -> bool {
		!self.settings.is_disabled(setting)
	}
	pub fn has_disabled_setting(&self, setting: ProductSetting) -> bool {
		self.settings.is_disabled(setting)
	}
	pub fn enable_setting(&mut self, setting: ProductSetting) {
		self.settings.0.remove(setting);
	}
	pub fn disable_setting(&mut self, setting: ProductSetting) {
		self.settings.0.insert(setting);
	}
}

/// Support for up to 64 user-enabled features on an item.
#[bitflags]
#[repr(u64)]
#[derive(Copy, Clone, Debug, PartialEq, Eq, Encode, Decode, MaxEncodedLen, TypeInfo)]
pub enum DeviceSetting {
	/// This item is transferable.
	Transferable,
	/// The metadata of this item can be modified.
	UnlockedMetadata,
	/// Attributes of this item can be modified.
	UnlockedAttributes,
}

/// Wrapper type for `BitFlags<ItemSetting>` that implements `Codec`.
#[derive(Clone, Copy, PartialEq, Eq, Default, Debug)]
pub struct DeviceSettings(pub BitFlags<DeviceSetting>);

impl DeviceSettings {
	pub fn all_enabled() -> Self {
		Self(BitFlags::EMPTY)
	}
	pub fn get_disabled(&self) -> BitFlags<DeviceSetting> {
		self.0
	}
	pub fn is_disabled(&self, setting: DeviceSetting) -> bool {
		self.0.contains(setting)
	}
	pub fn from_disabled(settings: BitFlags<DeviceSetting>) -> Self {
		Self(settings)
	}
}

impl_codec_bitflags!(DeviceSettings, u64, DeviceSetting);

/// Item's configuration.
#[derive(
	Encode, Decode, Default, PartialEq, Debug, Clone, Copy, MaxEncodedLen, TypeInfo,
)]
pub struct DeviceConfig {
	/// Item's settings.
	pub settings: DeviceSettings,
}

impl DeviceConfig {
	pub fn is_setting_enabled(&self, setting: DeviceSetting) -> bool {
		!self.settings.is_disabled(setting)
	}
	pub fn has_disabled_setting(&self, setting: DeviceSetting) -> bool {
		self.settings.is_disabled(setting)
	}
	pub fn has_disabled_settings(&self) -> bool {
		!self.settings.get_disabled().is_empty()
	}
	pub fn enable_setting(&mut self, setting: DeviceSetting) {
		self.settings.0.remove(setting);
	}
	pub fn disable_setting(&mut self, setting: DeviceSetting) {
		self.settings.0.insert(setting);
	}
}

/// Support for up to 8 different roles for collections.
#[bitflags]
#[repr(u8)]
#[derive(Copy, Clone, Debug, PartialEq, Eq, Encode, Decode, MaxEncodedLen, TypeInfo)]
pub enum ProductRole {
	/// Can mint items.
	Issuer,
	/// Can freeze items.
	Freezer,
	/// Can thaw items, force transfers and burn items from any account.
	Admin,
}

/// A wrapper type that implements `Codec`.
#[derive(Clone, Copy, PartialEq, Eq, Default, Debug)]
pub struct ProductRoles(pub BitFlags<ProductRole>);

impl ProductRoles {
	pub fn none() -> Self {
		Self(BitFlags::EMPTY)
	}
	pub fn has_role(&self, role: ProductRole) -> bool {
		self.0.contains(role)
	}
	pub fn add_role(&mut self, role: ProductRole) {
		self.0.insert(role);
	}
	pub fn max_roles() -> u8 {
		let all: BitFlags<ProductRole> = BitFlags::all();
		all.len() as u8
	}
}
impl_codec_bitflags!(ProductRoles, u8, ProductRole);

#[derive(Clone, Eq, PartialEq, Encode, Decode, Debug, TypeInfo)]
pub struct PreSignedMint<ProductId, DeviceId, AccountId, Deadline> {
	/// A collection of the item to be minted.
	pub(super) product_id: ProductId,
	/// Item's ID.
	pub(super) device_id: DeviceId,
	/// Additional item's key-value attributes.
	pub(super) attributes: Vec<(Vec<u8>, Vec<u8>)>,
	/// Additional item's metadata.
	pub(super) metadata: Vec<u8>,
	/// Restrict the claim to a particular account.
	pub(super) only_account: Option<AccountId>,
	/// A deadline for the signature.
	pub(super) deadline: Deadline,
}

#[derive(Clone, Eq, PartialEq, Encode, Decode, Debug, TypeInfo)]
pub struct PreSignedAttributes<ProductId, DeviceId, AccountId, Deadline> {
	/// Collection's ID.
	pub(super) product_id: ProductId,
	/// Item's ID.
	pub(super) device_id: DeviceId,
	/// Key-value attributes.
	pub(super) attributes: Vec<(Vec<u8>, Vec<u8>)>,
	/// Attributes' namespace.
	pub(super) namespace: AttributeNamespace<AccountId>,
	/// A deadline for the signature.
	pub(super) deadline: Deadline,
}
