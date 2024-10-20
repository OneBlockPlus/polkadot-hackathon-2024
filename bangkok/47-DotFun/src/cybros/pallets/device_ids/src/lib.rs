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

//! # DeviceId Module
//!
//! A simple, secure module for dealing with non-fungible items.
//!
//! ## Related Modules
//!
//! * [`System`](../frame_system/index.html)
//! * [`Support`](../frame_support/index.html)

#![recursion_limit = "256"]
// Ensure we're `no_std` when compiling for Wasm.
#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

#[cfg(test)]
pub mod mock;
#[cfg(test)]
mod tests;

mod common_functions;
/// A library providing the feature set of this pallet. It contains modules with helper methods that
/// perform storage updates and checks required by this pallet's dispatchables. To use pallet level
/// features, make sure to set appropriate bitflags for [`Config::Features`] in your runtime
/// configuration trait.
mod features;
mod impl_nonfungibles;
mod types;

pub mod macros;
pub mod weights;

use scale_codec::{Decode, Encode};
use frame_support::traits::{
    tokens::Locker, BalanceStatus::Reserved, Currency, EnsureOriginWithArg, Incrementable,
    ReservableCurrency,
};
use sp_runtime::traits::{IdentifyAccount, Saturating, StaticLookup, Verify, Zero};

pub use pallet::*;
pub use types::*;
pub use weights::WeightInfo;

/// The log target of this pallet.
pub const LOG_TARGET: &'static str = "runtime::device_id";

/// A type alias for the account ID type used in the dispatchable functions of this pallet.
type AccountIdLookupOf<T> = <<T as frame_system::Config>::Lookup as StaticLookup>::Source;

#[frame_support::pallet]
pub mod pallet {
    use super::*;
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;

    /// The current storage version.
    const STORAGE_VERSION: StorageVersion = StorageVersion::new(1);

    #[pallet::pallet]
    #[pallet::storage_version(STORAGE_VERSION)]
    pub struct Pallet<T>(_);

    #[cfg(feature = "runtime-benchmarks")]
    pub trait BenchmarkHelper<ProductId, DeviceId> {
        fn product(i: u16) -> ProductId;
        fn device(i: u16) -> DeviceId;
    }
    #[cfg(feature = "runtime-benchmarks")]
    impl<ProductId: From<u16>, DeviceId: From<u16>> BenchmarkHelper<ProductId, DeviceId> for () {
        fn product(i: u16) -> ProductId {
            i.into()
        }
        fn device(i: u16) -> DeviceId {
            i.into()
        }
    }

    #[pallet::config]
    /// The module configuration trait.
    pub trait Config: frame_system::Config + pallet_contracts::Config {
        /// The overarching event type.
        type RuntimeEvent: From<Event<Self>>
            + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        /// Identifier for the collection of item.
        ///
        /// SAFETY: The functions in the `Incrementable` trait are fallible. If the functions
        /// of the implementation both return `None`, the automatic CollectionId generation
        /// should not be used. So the `create` and `force_create` extrinsics and the
        /// `create_collection` function will return an `UnknownCollection` Error. Instead use
        /// the `create_collection_with_id` function. However, if the `Incrementable` trait
        /// implementation has an incremental order, the `create_collection_with_id` function
        /// should not be used as it can claim a value in the ID sequence.
        type ProductId: Member + Parameter + MaxEncodedLen + Copy + Incrementable;

        /// The type used to identify a unique item within a collection.
        type DeviceId: Member + Parameter + MaxEncodedLen + Copy;

        /// The currency mechanism, used for paying for reserves.
        type Currency: ReservableCurrency<Self::AccountId>;

        /// The origin which may forcibly create or destroy an item or otherwise alter privileged
        /// attributes.
        type ForceOrigin: EnsureOrigin<Self::RuntimeOrigin>;

        /// Standard collection creation is only allowed if the origin attempting it and the
        /// collection are in this set.
        type CreateOrigin: EnsureOriginWithArg<
            Self::RuntimeOrigin,
            Self::ProductId,
            Success = Self::AccountId,
        >;

        /// Locker trait to enable Locking mechanism downstream.
        type Locker: Locker<Self::ProductId, Self::DeviceId>;

        /// The basic amount of funds that must be reserved for collection.
        #[pallet::constant]
        type ProductEntryDeposit: Get<DepositBalanceOf<Self>>;

        /// The basic amount of funds that must be reserved for an item.
        #[pallet::constant]
        type DeviceEntryDeposit: Get<DepositBalanceOf<Self>>;

        /// The basic amount of funds that must be reserved when adding metadata to your item.
        #[pallet::constant]
        type MetadataDepositBase: Get<DepositBalanceOf<Self>>;

        /// The basic amount of funds that must be reserved when adding an attribute to an item.
        #[pallet::constant]
        type AttributeDepositBase: Get<DepositBalanceOf<Self>>;

        /// The additional funds that must be reserved for the number of bytes store in metadata,
        /// either "normal" metadata or attribute metadata.
        #[pallet::constant]
        type DepositPerByte: Get<DepositBalanceOf<Self>>;

        /// The maximum length of data stored on-chain.
        #[pallet::constant]
        type StringLimit: Get<u32>;

        /// The maximum length of an attribute key.
        #[pallet::constant]
        type KeyLimit: Get<u32>;

        /// The maximum length of an attribute value.
        #[pallet::constant]
        type ValueLimit: Get<u32>;

        /// The maximum attributes approvals an item could have.
        #[pallet::constant]
        type DeviceAttributesApprovalsLimit: Get<u32>;

        /// The max number of attributes a user could set per call.
        #[pallet::constant]
        type MaxAttributesPerCall: Get<u32>;

        /// Off-Chain signature type.
        ///
        /// Can verify whether an `Self::OffchainPublic` created a signature.
        type OffchainSignature: Verify<Signer = Self::OffchainPublic> + Parameter;

        /// Off-Chain public key.
        ///
        /// Must identify as an on-chain `Self::AccountId`.
        type OffchainPublic: IdentifyAccount<AccountId = Self::AccountId>;

        #[cfg(feature = "runtime-benchmarks")]
        /// A set of helper functions for benchmarking.
        type Helper: BenchmarkHelper<Self::ProductId, Self::DeviceId>;

        /// Weight information for extrinsics in this pallet.
        type WeightInfo: WeightInfo;
    }

    /// Details of a collection.
    #[pallet::storage]
    pub type ProductCollection<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::ProductId,
        ProductEntry<T::AccountId, DepositBalanceOf<T>>,
    >;

    /// The collection, if any, of which an account is willing to take ownership.
    #[pallet::storage]
    pub type OwnershipAcceptance<T: Config> =
        StorageMap<_, Blake2_128Concat, T::AccountId, T::ProductId>;

    /// The items held by any given account; set out this way so that items owned by a single
    /// account can be enumerated.
    #[pallet::storage]
    pub type Account<T: Config> = StorageNMap<
        _,
        (
            NMapKey<Blake2_128Concat, T::AccountId>, // owner
            NMapKey<Blake2_128Concat, T::ProductId>,
            NMapKey<Blake2_128Concat, T::DeviceId>,
        ),
        (),
        OptionQuery,
    >;

    /// The collections owned by any given account; set out this way so that collections owned by
    /// a single account can be enumerated.
    #[pallet::storage]
    pub type ProductOwnerAccount<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        Blake2_128Concat,
        T::ProductId,
        (),
        OptionQuery,
    >;

    /// The items in existence and their ownership details.
    #[pallet::storage]
    /// Stores collection roles as per account.
    pub type ProductRoleOf<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::ProductId,
        Blake2_128Concat,
        T::AccountId,
        ProductRoles,
        OptionQuery,
    >;

    /// The items in existence and their ownership details.
    #[pallet::storage]
    pub type DeviceCollection<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::ProductId,
        Blake2_128Concat,
        T::DeviceId,
        DeviceEntry<T::AccountId, DeviceEntryDepositOf<T>>,
        OptionQuery,
    >;

    /// Metadata of a collection.
    #[pallet::storage]
    pub type ProductMetadataOf<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::ProductId,
        ProductMetadata<DepositBalanceOf<T>, T::StringLimit>,
        OptionQuery,
    >;

    /// Metadata of an item.
    #[pallet::storage]
    pub type DeviceMetadataOf<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::ProductId,
        Blake2_128Concat,
        T::DeviceId,
        DeviceMetadata<DeviceMetadataDepositOf<T>, T::StringLimit>,
        OptionQuery,
    >;

    /// Attributes of a collection.
    #[pallet::storage]
    pub type Attribute<T: Config> = StorageNMap<
        _,
        (
            NMapKey<Blake2_128Concat, T::ProductId>,
            NMapKey<Blake2_128Concat, Option<T::DeviceId>>,
            NMapKey<Blake2_128Concat, AttributeNamespace<T::AccountId>>,
            NMapKey<Blake2_128Concat, BoundedVec<u8, T::KeyLimit>>,
        ),
        (BoundedVec<u8, T::ValueLimit>, AttributeDepositOf<T>),
        OptionQuery,
    >;

    /// Item attribute approvals.
    #[pallet::storage]
    pub type DeviceAttributesApprovalsOf<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::ProductId,
        Blake2_128Concat,
        T::DeviceId,
        DeviceAttributesApprovals<T>,
        ValueQuery,
    >;

    /// Stores the `CollectionId` that is going to be used for the next collection.
    /// This gets incremented whenever a new collection is created.
    #[pallet::storage]
    pub type NextProductId<T: Config> =
        StorageValue<_, T::ProductId, OptionQuery>;

    /// Config of a collection.
    #[pallet::storage]
    pub type ProductConfigOf<T: Config> =
        StorageMap<_, Blake2_128Concat, T::ProductId, ProductConfig, OptionQuery>;

    /// Config of an item.
    #[pallet::storage]
    pub type DeviceConfigOf<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::ProductId,
        Blake2_128Concat,
        T::DeviceId,
        DeviceConfig,
        OptionQuery,
    >;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// A `collection` was created.
        ProductCreated { product_id: T::ProductId, creator: T::AccountId, owner: T::AccountId },
        /// A `collection` was force-created.
        ProductForceCreated { product_id: T::ProductId, owner: T::AccountId },
        /// A `collection` was destroyed.
        ProductDestroyed { product_id: T::ProductId },
        /// An `item` was issued.
        DeviceIssued { product_id: T::ProductId, device_id: T::DeviceId, owner: T::AccountId },
        /// An `item` was transferred.
        DeviceTransferred {
            product_id: T::ProductId,
            device_id: T::DeviceId,
            from: T::AccountId,
            to: T::AccountId,
        },
        /// An `item` was destroyed.
        DeviceBurned { product_id: T::ProductId, device_id: T::DeviceId, owner: T::AccountId },
        /// An `item` became non-transferable.
        DeviceTransferLocked { product_id: T::ProductId, device_id: T::DeviceId },
        /// An `item` became transferable.
        DeviceTransferUnlocked { product_id: T::ProductId, device_id: T::DeviceId },
        /// `item` metadata or attributes were locked.
        DevicePropertiesLocked {
            product_id: T::ProductId,
            device_id: T::DeviceId,
            lock_metadata: bool,
            lock_attributes: bool,
        },
        /// Some `collection` was locked.
        ProductLocked { product_id: T::ProductId },
        /// The owner changed.
        ProductOwnerChanged { product_id: T::ProductId, new_owner: T::AccountId },
        /// The management team changed.
        ProductTeamChanged {
            product_id: T::ProductId,
            issuer: Option<T::AccountId>,
            admin: Option<T::AccountId>,
            freezer: Option<T::AccountId>,
        },
        /// A `collection` has had its config changed by the `Force` origin.
        ProductConfigChanged { product_id: T::ProductId },
        /// New metadata has been set for a `collection`.
        ProductMetadataSet { product_id: T::ProductId, data: BoundedVec<u8, T::StringLimit> },
        /// Metadata has been cleared for a `collection`.
        ProductMetadataCleared { product_id: T::ProductId },
        /// New metadata has been set for an item.
        DeviceMetadataSet {
            product_id: T::ProductId,
            device_id: T::DeviceId,
            data: BoundedVec<u8, T::StringLimit>,
        },
        /// Metadata has been cleared for an item.
        DeviceMetadataCleared { product_id: T::ProductId, device_id: T::DeviceId },
        /// New attribute metadata has been set for a `collection` or `item`.
        AttributeSet {
            product_id: T::ProductId,
            maybe_device_id: Option<T::DeviceId>,
            key: BoundedVec<u8, T::KeyLimit>,
            value: BoundedVec<u8, T::ValueLimit>,
            namespace: AttributeNamespace<T::AccountId>,
        },
        /// Attribute metadata has been cleared for a `collection` or `item`.
        AttributeCleared {
            product_id: T::ProductId,
            maybe_device_id: Option<T::DeviceId>,
            key: BoundedVec<u8, T::KeyLimit>,
            namespace: AttributeNamespace<T::AccountId>,
        },
        /// A new approval to modify item attributes was added.
        DeviceAttributesApprovalAdded {
            product_id: T::ProductId,
            device_id: T::DeviceId,
            delegate: T::AccountId,
        },
        /// A new approval to modify item attributes was removed.
        DeviceAttributesApprovalRemoved {
            product_id: T::ProductId,
            device_id: T::DeviceId,
            delegate: T::AccountId,
        },
        /// Ownership acceptance has changed for an account.
        ProductOwnershipAcceptanceChanged { who: T::AccountId, maybe_product_id: Option<T::ProductId> },
        /// Max supply has been set for a collection.
        ProductMaxSupplySet { product_id: T::ProductId, max_supply: u32 },
        /// Mint settings for a collection had changed.
        ProductMintSettingsUpdated { product_id: T::ProductId },
        /// Event gets emitted when the `NextCollectionId` gets incremented.
        NextProductIdIncremented { next_id: Option<T::ProductId> },
        /// New attributes have been set for an `item` of the `collection`.
        PreSignedAttributesSet {
            product_id: T::ProductId,
            device_id: T::DeviceId,
            namespace: AttributeNamespace<T::AccountId>,
        },
        /// A new attribute in the `Pallet` namespace was set for the `collection` or an `item`
        /// within that `collection`.
        PalletAttributeSet {
            product_id: T::ProductId,
            device_id: Option<T::DeviceId>,
            attribute: PalletAttributes,
            value: BoundedVec<u8, T::ValueLimit>,
        },
    }

    #[pallet::error]
    pub enum Error<T> {
        /// The signing account has no permission to do the operation.
        NoPermission,
        /// The given item ID is unknown.
        UnknownProduct,
        /// The item ID has already been used for an item.
        AlreadyExists,
        /// The owner turned out to be different to what was expected.
        WrongOwner,
        /// The witness data given does not match the current state of the chain.
        BadWitness,
        /// Collection ID is already taken.
        ProductIdInUse,
        /// Items within that collection are non-transferable.
        DevicesNonTransferable,
        /// The named owner has not signed ownership acceptance of the collection.
        Unaccepted,
        /// The item is locked (non-transferable).
        DeviceLocked,
        /// Item's attributes are locked.
        LockedDeviceAttributes,
        /// Collection's attributes are locked.
        LockedProductAttributes,
        /// Item's metadata is locked.
        LockedDeviceMetadata,
        /// Collection's metadata is locked.
        LockedProductMetadata,
        /// All items have been minted.
        MaxSupplyReached,
        /// The max supply is locked and can't be changed.
        MaxSupplyLocked,
        /// The provided max supply is less than the number of items a collection already has.
        MaxSupplyTooSmall,
        /// The given item ID is unknown.
        UnknownDevice,
        /// The given item has no metadata set.
        MetadataNotFound,
        /// The provided attribute can't be found.
        AttributeNotFound,
        /// The item has reached its approval limit.
        ReachedApprovalLimit,
        /// The deadline has already expired.
        DeadlineExpired,
        /// The provided setting can't be set.
        WrongSetting,
        /// Item's config already exists and should be equal to the provided one.
        InconsistentDeviceConfig,
        /// Config for a collection or an item can't be found.
        NoConfig,
        /// Some roles were not cleared.
        RolesNotCleared,
        /// The provided data is incorrect.
        IncorrectData,
        /// The extrinsic was sent by the wrong origin.
        WrongOrigin,
        /// The provided signature is incorrect.
        WrongSignature,
        /// The provided metadata might be too long.
        IncorrectMetadata,
        /// Can't set more attributes per one call.
        MaxAttributesLimitReached,
        /// The provided namespace isn't supported in this call.
        WrongNamespace,
        /// Can't delete non-empty collections.
        ProductNotEmpty,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Issue a new collection of non-fungible items from a public origin.
        ///
        /// This new collection has no items initially and its owner is the origin.
        ///
        /// The origin must be Signed and the sender must have sufficient funds free.
        ///
        /// `CollectionDeposit` funds of sender are reserved.
        ///
        /// Parameters:
        /// - `admin`: The admin of this collection. The admin is the initial address of each
        /// member of the collection's admin team.
        ///
        /// Emits `Created` event when successful.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(0)]
        #[pallet::weight(<T as Config>::WeightInfo::create_product())]
        pub fn create_product(
            origin: OriginFor<T>,
            admin: AccountIdLookupOf<T>,
            config: ProductConfig,
        ) -> DispatchResult {
            let product_id = NextProductId::<T>::get()
                .or(T::ProductId::initial_value())
                .ok_or(Error::<T>::UnknownProduct)?;

            let owner = T::CreateOrigin::ensure_origin(origin, &product_id)?;
            let admin = T::Lookup::lookup(admin)?;

            // DepositRequired can be disabled by calling the force_create() only
            ensure!(
				!config.has_disabled_setting(ProductSetting::DepositRequired),
				Error::<T>::WrongSetting
			);

            Self::do_create_product(
                product_id,
                owner.clone(),
                admin.clone(),
                config,
                T::ProductEntryDeposit::get(),
                Event::ProductCreated { product_id, creator: owner, owner: admin },
            )?;

            Self::set_next_collection_id(product_id);
            Ok(())
        }

        /// Issue a new collection of non-fungible items from a privileged origin.
        ///
        /// This new collection has no items initially.
        ///
        /// The origin must conform to `ForceOrigin`.
        ///
        /// Unlike `create`, no funds are reserved.
        ///
        /// - `owner`: The owner of this collection of items. The owner has full superuser
        ///   permissions over this item, but may later change and configure the permissions using
        ///   `transfer_ownership` and `set_team`.
        ///
        /// Emits `ForceCreated` event when successful.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(1)]
        #[pallet::weight(<T as Config>::WeightInfo::force_create_product())]
        pub fn force_create_product(
            origin: OriginFor<T>,
            owner: AccountIdLookupOf<T>,
            config: ProductConfig,
        ) -> DispatchResult {
            T::ForceOrigin::ensure_origin(origin)?;
            let owner = T::Lookup::lookup(owner)?;

            let product_id = NextProductId::<T>::get()
                .or(T::ProductId::initial_value())
                .ok_or(Error::<T>::UnknownProduct)?;

            Self::do_create_product(
                product_id,
                owner.clone(),
                owner.clone(),
                config,
                Zero::zero(),
                Event::ProductForceCreated { product_id, owner },
            )?;

            Self::set_next_collection_id(product_id);
            Ok(())
        }

        /// Destroy a collection of fungible items.
        ///
        /// The origin must conform to `ForceOrigin` or must be `Signed` and the sender must be the
        /// owner of the `collection`.
        ///
        /// NOTE: The collection must have 0 items to be destroyed.
        ///
        /// - `collection`: The identifier of the collection to be destroyed.
        /// - `witness`: Information on the items minted in the collection. This must be
        /// correct.
        ///
        /// Emits `Destroyed` event when successful.
        ///
        /// Weight: `O(m + c + a)` where:
        /// - `m = witness.item_metadatas`
        /// - `c = witness.item_configs`
        /// - `a = witness.attributes`
        #[pallet::call_index(2)]
        #[pallet::weight(<T as Config>::WeightInfo::destroy_product(
            witness.device_metadata_count,
            witness.device_configs_count,
            witness.attributes_count,
        ))]
        pub fn destroy_product(
            origin: OriginFor<T>,
            collection: T::ProductId,
            witness: DestroyWitness,
        ) -> DispatchResultWithPostInfo {
            let maybe_check_owner = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;
            let details = Self::do_destroy_collection(collection, witness, maybe_check_owner)?;

            Ok(Some(<T as Config>::WeightInfo::destroy_product(
                details.device_metadata_count,
                details.device_configs_count,
                details.attributes_count,
            )).into())
        }

        /// Mint an item of a particular collection.
        ///
        /// The origin must be Signed and the sender must comply with the `mint_settings` rules.
        ///
        /// - `collection`: The collection of the item to be minted.
        /// - `item`: An identifier of the new item.
        /// - `mint_to`: Account into which the item will be minted.
        /// - `witness_data`: When the mint type is `HolderOf(collection_id)`, then the owned
        ///   item_id from that collection needs to be provided within the witness data object.
        ///
        /// Note: the deposit will be taken from the `origin` and not the `owner` of the `item`.
        ///
        /// Emits `Issued` event when successful.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(3)]
        #[pallet::weight(<T as Config>::WeightInfo::mint_device())]
        pub fn mint_device(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            device_id: T::DeviceId,
            mint_to: AccountIdLookupOf<T>,
        ) -> DispatchResult {
            let caller = ensure_signed(origin)?;
            let mint_to = T::Lookup::lookup(mint_to)?;
            let device_config =
                DeviceConfig { settings: Self::get_default_device_settings(&product_id)? };

            Self::do_mint(
                product_id,
                device_id,
                Some(caller.clone()),
                mint_to.clone(),
                device_config,
                |_product, product_config| {
                    let mint_settings = product_config.mint_settings;

                    match mint_settings.mint_type {
                        MintType::Issuer => {
                            ensure!(
								Self::has_role(&product_id, &caller, ProductRole::Issuer),
								Error::<T>::NoPermission
							);
                        },
                        // _ => {},
                    }

                    Ok(())
                },
            )
        }

        /// Mint an item of a particular collection from a privileged origin.
        ///
        /// The origin must conform to `ForceOrigin` or must be `Signed` and the sender must be the
        /// Issuer of the `collection`.
        ///
        /// - `collection`: The collection of the item to be minted.
        /// - `item`: An identifier of the new item.
        /// - `mint_to`: Account into which the item will be minted.
        /// - `item_config`: A config of the new item.
        ///
        /// Emits `Issued` event when successful.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(4)]
        #[pallet::weight(<T as Config>::WeightInfo::force_mint_device())]
        pub fn force_mint_device(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            device_id: T::DeviceId,
            mint_to: AccountIdLookupOf<T>,
            device_config: DeviceConfig,
        ) -> DispatchResult {
            let maybe_check_origin = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;
            let mint_to = T::Lookup::lookup(mint_to)?;

            if let Some(check_origin) = maybe_check_origin {
                ensure!(
					Self::has_role(&product_id, &check_origin, ProductRole::Issuer),
					Error::<T>::NoPermission
				);
            }
            Self::do_mint(product_id, device_id, None, mint_to, device_config, |_, _| Ok(()))
        }

        /// Destroy a single item.
        ///
        /// The origin must conform to `ForceOrigin` or must be Signed and the signing account must
        /// be the owner of the `item`.
        ///
        /// - `collection`: The collection of the item to be burned.
        /// - `item`: The item to be burned.
        ///
        /// Emits `Burned`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(5)]
        #[pallet::weight(<T as Config>::WeightInfo::burn_device())]
        pub fn burn_device(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            device_id: T::DeviceId,
        ) -> DispatchResult {
            let maybe_check_origin = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;

            Self::do_burn(product_id, device_id, |details| {
                if let Some(check_origin) = maybe_check_origin {
                    ensure!(details.owner == check_origin, Error::<T>::NoPermission);
                }
                Ok(())
            })
        }

        /// Move an item from the sender account to another.
        ///
        /// Origin must be Signed and the signing account must be either:
        /// - the Owner of the `item`;
        /// - the approved delegate for the `item` (in this case, the approval is reset).
        ///
        /// Arguments:
        /// - `collection`: The collection of the item to be transferred.
        /// - `item`: The item to be transferred.
        /// - `dest`: The account to receive ownership of the item.
        ///
        /// Emits `Transferred`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(6)]
        #[pallet::weight(<T as Config>::WeightInfo::transfer_device())]
        pub fn transfer_device(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            device_id: T::DeviceId,
            dest: AccountIdLookupOf<T>,
        ) -> DispatchResult {
            let origin = ensure_signed(origin)?;
            let dest = T::Lookup::lookup(dest)?;

            Self::do_transfer(product_id, device_id, dest, |_, device| {
                ensure!(device.owner == origin, Error::<T>::NoPermission);
                Ok(())
            })
        }

        /// Disallow further unprivileged transfer of an item.
        ///
        /// Origin must be Signed and the sender should be the Freezer of the `collection`.
        ///
        /// - `collection`: The collection of the item to be changed.
        /// - `item`: The item to become non-transferable.
        ///
        /// Emits `ItemTransferLocked`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(7)]
        #[pallet::weight(<T as Config>::WeightInfo::lock_device_transfer())]
        pub fn lock_device_transfer(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            device_id: T::DeviceId,
        ) -> DispatchResult {
            let origin = ensure_signed(origin)?;
            Self::do_lock_device_transfer(origin, product_id, device_id)
        }

        /// Re-allow unprivileged transfer of an item.
        ///
        /// Origin must be Signed and the sender should be the Freezer of the `collection`.
        ///
        /// - `collection`: The collection of the item to be changed.
        /// - `item`: The item to become transferable.
        ///
        /// Emits `ItemTransferUnlocked`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(8)]
        #[pallet::weight(<T as Config>::WeightInfo::unlock_device_transfer())]
        pub fn unlock_device_transfer(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            device_id: T::DeviceId,
        ) -> DispatchResult {
            let origin = ensure_signed(origin)?;
            Self::do_unlock_device_transfer(origin, product_id, device_id)
        }

        /// Disallows specified settings for the whole collection.
        ///
        /// Origin must be Signed and the sender should be the Owner of the `collection`.
        ///
        /// - `collection`: The collection to be locked.
        /// - `lock_settings`: The settings to be locked.
        ///
        /// Note: it's possible to only lock(set) the setting, but not to unset it.
        ///
        /// Emits `CollectionLocked`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(9)]
        #[pallet::weight(<T as Config>::WeightInfo::lock_product())]
        pub fn lock_product(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            lock_settings: ProductSettings,
        ) -> DispatchResult {
            let origin = ensure_signed(origin)?;
            Self::do_lock_product(origin, product_id, lock_settings)
        }

        /// Change the Owner of a collection.
        ///
        /// Origin must be Signed and the sender should be the Owner of the `collection`.
        ///
        /// - `collection`: The collection whose owner should be changed.
        /// - `owner`: The new Owner of this collection. They must have called
        ///   `set_accept_ownership` with `collection` in order for this operation to succeed.
        ///
        /// Emits `OwnerChanged`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(10)]
        #[pallet::weight(<T as Config>::WeightInfo::transfer_product_ownership())]
        pub fn transfer_product_ownership(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            new_owner: AccountIdLookupOf<T>,
        ) -> DispatchResult {
            let origin = ensure_signed(origin)?;
            let new_owner = T::Lookup::lookup(new_owner)?;
            Self::do_transfer_ownership(origin, product_id, new_owner)
        }

        /// Change the Issuer, Admin and Freezer of a collection.
        ///
        /// Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
        /// `collection`.
        ///
        /// Note: by setting the role to `None` only the `ForceOrigin` will be able to change it
        /// after to `Some(account)`.
        ///
        /// - `collection`: The collection whose team should be changed.
        /// - `issuer`: The new Issuer of this collection.
        /// - `admin`: The new Admin of this collection.
        /// - `freezer`: The new Freezer of this collection.
        ///
        /// Emits `TeamChanged`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(11)]
        #[pallet::weight(<T as Config>::WeightInfo::set_product_team())]
        pub fn set_product_team(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            issuer: Option<AccountIdLookupOf<T>>,
            admin: Option<AccountIdLookupOf<T>>,
            freezer: Option<AccountIdLookupOf<T>>,
        ) -> DispatchResult {
            let maybe_check_owner = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;
            let issuer = issuer.map(T::Lookup::lookup).transpose()?;
            let admin = admin.map(T::Lookup::lookup).transpose()?;
            let freezer = freezer.map(T::Lookup::lookup).transpose()?;
            Self::do_set_team(maybe_check_owner, product_id, issuer, admin, freezer)
        }

        /// Change the Owner of a collection.
        ///
        /// Origin must be `ForceOrigin`.
        ///
        /// - `collection`: The identifier of the collection.
        /// - `owner`: The new Owner of this collection.
        ///
        /// Emits `OwnerChanged`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(12)]
        #[pallet::weight(<T as Config>::WeightInfo::force_set_product_owner())]
        pub fn force_set_product_owner(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            owner: AccountIdLookupOf<T>,
        ) -> DispatchResult {
            T::ForceOrigin::ensure_origin(origin)?;
            let new_owner = T::Lookup::lookup(owner)?;
            Self::do_force_collection_owner(product_id, new_owner)
        }

        /// Change the config of a collection.
        ///
        /// Origin must be `ForceOrigin`.
        ///
        /// - `collection`: The identifier of the collection.
        /// - `config`: The new config of this collection.
        ///
        /// Emits `CollectionConfigChanged`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(13)]
        #[pallet::weight(<T as Config>::WeightInfo::force_set_product_config())]
        pub fn force_set_product_config(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            config: ProductConfig,
        ) -> DispatchResult {
            T::ForceOrigin::ensure_origin(origin)?;
            Self::do_force_set_product_config(product_id, config)
        }

        /// Disallows changing the metadata or attributes of the item.
        ///
        /// Origin must be either `ForceOrigin` or Signed and the sender should be the Admin
        /// of the `collection`.
        ///
        /// - `collection`: The collection if the `item`.
        /// - `item`: An item to be locked.
        /// - `lock_metadata`: Specifies whether the metadata should be locked.
        /// - `lock_attributes`: Specifies whether the attributes in the `CollectionOwner` namespace
        ///   should be locked.
        ///
        /// Note: `lock_attributes` affects the attributes in the `CollectionOwner` namespace only.
        /// When the metadata or attributes are locked, it won't be possible the unlock them.
        ///
        /// Emits `ItemPropertiesLocked`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(14)]
        #[pallet::weight(<T as Config>::WeightInfo::lock_device_properties())]
        pub fn lock_device_properties(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            device_id: T::DeviceId,
            lock_metadata: bool,
            lock_attributes: bool,
        ) -> DispatchResult {
            let maybe_check_origin = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;
            Self::do_lock_item_properties(
                maybe_check_origin,
                product_id,
                device_id,
                lock_metadata,
                lock_attributes,
            )
        }

        /// Set an attribute for a collection or item.
        ///
        /// Origin must be Signed and must conform to the namespace ruleset:
        /// - `CollectionOwner` namespace could be modified by the `collection` Admin only;
        /// - `ItemOwner` namespace could be modified by the `maybe_item` owner only. `maybe_item`
        ///   should be set in that case;
        /// - `Account(AccountId)` namespace could be modified only when the `origin` was given a
        ///   permission to do so;
        ///
        /// The funds of `origin` are reserved according to the formula:
        /// `AttributeDepositBase + DepositPerByte * (key.len + value.len)` taking into
        /// account any already reserved funds.
        ///
        /// - `collection`: The identifier of the collection whose item's metadata to set.
        /// - `maybe_item`: The identifier of the item whose metadata to set.
        /// - `namespace`: Attribute's namespace.
        /// - `key`: The key of the attribute.
        /// - `value`: The value to which to set the attribute.
        ///
        /// Emits `AttributeSet`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(15)]
        #[pallet::weight(<T as Config>::WeightInfo::set_attribute())]
        pub fn set_attribute(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            maybe_device_id: Option<T::DeviceId>,
            namespace: AttributeNamespace<T::AccountId>,
            key: BoundedVec<u8, T::KeyLimit>,
            value: BoundedVec<u8, T::ValueLimit>,
        ) -> DispatchResult {
            let origin = ensure_signed(origin)?;
            let depositor = match namespace {
                AttributeNamespace::ProductOwner =>
                    Self::collection_owner(product_id).ok_or(Error::<T>::UnknownProduct)?,
                _ => origin.clone(),
            };
            Self::do_set_attribute(origin, product_id, maybe_device_id, namespace, key, value, depositor)
        }

        /// Force-set an attribute for a collection or item.
        ///
        /// Origin must be `ForceOrigin`.
        ///
        /// If the attribute already exists and it was set by another account, the deposit
        /// will be returned to the previous owner.
        ///
        /// - `set_as`: An optional owner of the attribute.
        /// - `collection`: The identifier of the collection whose item's metadata to set.
        /// - `maybe_item`: The identifier of the item whose metadata to set.
        /// - `namespace`: Attribute's namespace.
        /// - `key`: The key of the attribute.
        /// - `value`: The value to which to set the attribute.
        ///
        /// Emits `AttributeSet`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(16)]
        #[pallet::weight(<T as Config>::WeightInfo::force_set_attribute())]
        pub fn force_set_attribute(
            origin: OriginFor<T>,
            set_as: Option<T::AccountId>,
            product_id: T::ProductId,
            maybe_device_id: Option<T::DeviceId>,
            namespace: AttributeNamespace<T::AccountId>,
            key: BoundedVec<u8, T::KeyLimit>,
            value: BoundedVec<u8, T::ValueLimit>,
        ) -> DispatchResult {
            T::ForceOrigin::ensure_origin(origin)?;
            Self::do_force_set_attribute(set_as, product_id, maybe_device_id, namespace, key, value)
        }

        /// Clear an attribute for a collection or item.
        ///
        /// Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
        /// attribute.
        ///
        /// Any deposit is freed for the collection's owner.
        ///
        /// - `collection`: The identifier of the collection whose item's metadata to clear.
        /// - `maybe_item`: The identifier of the item whose metadata to clear.
        /// - `namespace`: Attribute's namespace.
        /// - `key`: The key of the attribute.
        ///
        /// Emits `AttributeCleared`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(17)]
        #[pallet::weight(<T as Config>::WeightInfo::clear_attribute())]
        pub fn clear_attribute(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            maybe_device_id: Option<T::DeviceId>,
            namespace: AttributeNamespace<T::AccountId>,
            key: BoundedVec<u8, T::KeyLimit>,
        ) -> DispatchResult {
            let maybe_check_owner = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;
            Self::do_clear_attribute(maybe_check_owner, product_id, maybe_device_id, namespace, key)
        }

        /// Approve item's attributes to be changed by a delegated third-party account.
        ///
        /// Origin must be Signed and must be an owner of the `item`.
        ///
        /// - `collection`: A collection of the item.
        /// - `item`: The item that holds attributes.
        /// - `delegate`: The account to delegate permission to change attributes of the item.
        ///
        /// Emits `ItemAttributesApprovalAdded` on success.
        #[pallet::call_index(18)]
        #[pallet::weight(<T as Config>::WeightInfo::approve_device_attributes())]
        pub fn approve_device_attributes(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            device_id: T::DeviceId,
            delegate: AccountIdLookupOf<T>,
        ) -> DispatchResult {
            let origin = ensure_signed(origin)?;
            let delegate = T::Lookup::lookup(delegate)?;
            Self::do_approve_device_attributes(origin, product_id, device_id, delegate)
        }

        /// Cancel the previously provided approval to change item's attributes.
        /// All the previously set attributes by the `delegate` will be removed.
        ///
        /// Origin must be Signed and must be an owner of the `item`.
        ///
        /// - `collection`: Collection that the item is contained within.
        /// - `item`: The item that holds attributes.
        /// - `delegate`: The previously approved account to remove.
        ///
        /// Emits `ItemAttributesApprovalRemoved` on success.
        #[pallet::call_index(19)]
        #[pallet::weight(<T as Config>::WeightInfo::cancel_device_attributes_approval(
            witness.account_attributes
        ))]
        pub fn cancel_device_attributes_approval(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            device_id: T::DeviceId,
            delegate: AccountIdLookupOf<T>,
            witness: CancelAttributesApprovalWitness,
        ) -> DispatchResult {
            let origin = ensure_signed(origin)?;
            let delegate = T::Lookup::lookup(delegate)?;
            Self::do_cancel_item_attributes_approval(origin, product_id, device_id, delegate, witness)
        }

        /// Set the metadata for an item.
        ///
        /// Origin must be either `ForceOrigin` or Signed and the sender should be the Admin of the
        /// `collection`.
        ///
        /// If the origin is Signed, then funds of signer are reserved according to the formula:
        /// `MetadataDepositBase + DepositPerByte * data.len` taking into
        /// account any already reserved funds.
        ///
        /// - `collection`: The identifier of the collection whose item's metadata to set.
        /// - `item`: The identifier of the item whose metadata to set.
        /// - `data`: The general information of this item. Limited in length by `StringLimit`.
        ///
        /// Emits `ItemMetadataSet`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(20)]
        #[pallet::weight(<T as Config>::WeightInfo::set_device_metadata())]
        pub fn set_device_metadata(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            device_id: T::DeviceId,
            data: BoundedVec<u8, T::StringLimit>,
        ) -> DispatchResult {
            let maybe_check_origin = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;
            Self::do_set_item_metadata(maybe_check_origin, product_id, device_id, data, None)
        }

        /// Clear the metadata for an item.
        ///
        /// Origin must be either `ForceOrigin` or Signed and the sender should be the Admin of the
        /// `collection`.
        ///
        /// Any deposit is freed for the collection's owner.
        ///
        /// - `collection`: The identifier of the collection whose item's metadata to clear.
        /// - `item`: The identifier of the item whose metadata to clear.
        ///
        /// Emits `ItemMetadataCleared`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(21)]
        #[pallet::weight(<T as Config>::WeightInfo::clear_device_metadata())]
        pub fn clear_device_metadata(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            device_id: T::DeviceId,
        ) -> DispatchResult {
            let maybe_check_origin = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;
            Self::do_clear_item_metadata(maybe_check_origin, product_id, device_id)
        }

        /// Set the metadata for a collection.
        ///
        /// Origin must be either `ForceOrigin` or `Signed` and the sender should be the Admin of
        /// the `collection`.
        ///
        /// If the origin is `Signed`, then funds of signer are reserved according to the formula:
        /// `MetadataDepositBase + DepositPerByte * data.len` taking into
        /// account any already reserved funds.
        ///
        /// - `collection`: The identifier of the item whose metadata to update.
        /// - `data`: The general information of this item. Limited in length by `StringLimit`.
        ///
        /// Emits `CollectionMetadataSet`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(22)]
        #[pallet::weight(<T as Config>::WeightInfo::set_product_metadata())]
        pub fn set_product_metadata(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            data: BoundedVec<u8, T::StringLimit>,
        ) -> DispatchResult {
            let maybe_check_origin = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;
            Self::do_set_product_metadata(maybe_check_origin, product_id, data)
        }

        /// Clear the metadata for a collection.
        ///
        /// Origin must be either `ForceOrigin` or `Signed` and the sender should be the Admin of
        /// the `collection`.
        ///
        /// Any deposit is freed for the collection's owner.
        ///
        /// - `collection`: The identifier of the collection whose metadata to clear.
        ///
        /// Emits `CollectionMetadataCleared`.
        ///
        /// Weight: `O(1)`
        #[pallet::call_index(23)]
        #[pallet::weight(<T as Config>::WeightInfo::clear_product_metadata())]
        pub fn clear_product_metadata(
            origin: OriginFor<T>,
            product_id: T::ProductId,
        ) -> DispatchResult {
            let maybe_check_origin = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;
            Self::do_clear_collection_metadata(maybe_check_origin, product_id)
        }

        /// Set (or reset) the acceptance of ownership for a particular account.
        ///
        /// Origin must be `Signed` and if `maybe_collection` is `Some`, then the signer must have a
        /// provider reference.
        ///
        /// - `maybe_collection`: The identifier of the collection whose ownership the signer is
        ///   willing to accept, or if `None`, an indication that the signer is willing to accept no
        ///   ownership transferal.
        ///
        /// Emits `OwnershipAcceptanceChanged`.
        #[pallet::call_index(24)]
        #[pallet::weight(<T as Config>::WeightInfo::accept_product_ownership())]
        pub fn accept_product_ownership(
            origin: OriginFor<T>,
            maybe_product_id: Option<T::ProductId>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Self::do_accept_product_ownership(who, maybe_product_id)
        }

        /// Set the maximum number of items a collection could have.
        ///
        /// Origin must be either `ForceOrigin` or `Signed` and the sender should be the Owner of
        /// the `collection`.
        ///
        /// - `collection`: The identifier of the collection to change.
        /// - `max_supply`: The maximum number of items a collection could have.
        ///
        /// Emits `CollectionMaxSupplySet` event when successful.
        #[pallet::call_index(25)]
        #[pallet::weight(<T as Config>::WeightInfo::set_product_max_supply())]
        pub fn set_product_max_supply(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            max_supply: u32,
        ) -> DispatchResult {
            let maybe_check_owner = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;
            Self::do_set_product_max_supply(maybe_check_owner, product_id, max_supply)
        }

        /// Update mint settings.
        ///
        /// Origin must be either `ForceOrigin` or `Signed` and the sender should be the Issuer
        /// of the `collection`.
        ///
        /// - `collection`: The identifier of the collection to change.
        /// - `mint_settings`: The new mint settings.
        ///
        /// Emits `CollectionMintSettingsUpdated` event when successful.
        #[pallet::call_index(26)]
        #[pallet::weight(<T as Config>::WeightInfo::update_product_mint_settings())]
        pub fn update_product_mint_settings(
            origin: OriginFor<T>,
            product_id: T::ProductId,
            mint_settings: MintSettings,
        ) -> DispatchResult {
            let maybe_check_origin = T::ForceOrigin::try_origin(origin)
                .map(|_| None)
                .or_else(|origin| ensure_signed(origin).map(Some).map_err(DispatchError::from))?;
            Self::do_update_product_mint_settings(maybe_check_origin, product_id, mint_settings)
        }

        /// Mint an item by providing the pre-signed approval.
        ///
        /// Origin must be Signed.
        ///
        /// - `mint_data`: The pre-signed approval that consists of the information about the item,
        ///   its metadata, attributes, who can mint it (`None` for anyone) and until what block
        ///   number.
        /// - `signature`: The signature of the `data` object.
        /// - `signer`: The `data` object's signer. Should be an Issuer of the collection.
        ///
        /// Emits `Issued` on success.
        /// Emits `AttributeSet` if the attributes were provided.
        /// Emits `ItemMetadataSet` if the metadata was not empty.
        #[pallet::call_index(27)]
        #[pallet::weight(<T as Config>::WeightInfo::mint_device_pre_signed(mint_data.attributes.len() as u32))]
        pub fn mint_device_pre_signed(
            origin: OriginFor<T>,
            mint_data: Box<PreSignedMintOf<T>>,
            signature: T::OffchainSignature,
            signer: T::AccountId,
        ) -> DispatchResult {
            let origin = ensure_signed(origin)?;
            Self::validate_signature(&Encode::encode(&mint_data), &signature, &signer)?;
            Self::do_mint_device_pre_signed(origin, *mint_data, signer)
        }

        /// Set attributes for an item by providing the pre-signed approval.
        ///
        /// Origin must be Signed and must be an owner of the `data.item`.
        ///
        /// - `data`: The pre-signed approval that consists of the information about the item,
        ///   attributes to update and until what block number.
        /// - `signature`: The signature of the `data` object.
        /// - `signer`: The `data` object's signer. Should be an Admin of the collection for the
        ///   `CollectionOwner` namespace.
        ///
        /// Emits `AttributeSet` for each provided attribute.
        /// Emits `ItemAttributesApprovalAdded` if the approval wasn't set before.
        /// Emits `PreSignedAttributesSet` on success.
        #[pallet::call_index(28)]
        #[pallet::weight(<T as Config>::WeightInfo::set_attributes_pre_signed(data.attributes.len() as u32))]
        pub fn set_attributes_pre_signed(
            origin: OriginFor<T>,
            data: PreSignedAttributesOf<T>,
            signature: T::OffchainSignature,
            signer: T::AccountId,
        ) -> DispatchResult {
            let origin = ensure_signed(origin)?;
            Self::validate_signature(&Encode::encode(&data), &signature, &signer)?;
            Self::do_set_attributes_pre_signed(origin, data, signer)
        }
    }
}

sp_core::generate_feature_enabled_macro!(runtime_benchmarks_enabled, feature = "runtime-benchmarks", $);
