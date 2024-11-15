//! Type definitions for the IP pallet.
//!
//! This module contains all core types used in the IP pallet, including NFTs,
//! offers, contracts, and payment structures.

use crate::pallet::Config;
use frame_support::{pallet_prelude::*, traits::Currency};
use frame_system::pallet_prelude::*;
use sp_std::prelude::*;

pub type BalanceOf<T> =
    <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

/// Represents an offer for either licensing or purchasing an NFT
///
/// This is the initial offer structure created by NFT owners before
/// a contract is formed. See [`Contract`] for the activated version.
#[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen, Debug)]
#[scale_info(skip_type_params(T))]
pub enum Offer<T: Config> {
    /// A license offer for temporary IP rights
    License(LicenseOffer<T>),
    /// A purchase offer for permanent IP transfer
    Purchase(PurchaseOffer<T>),
}

/// Distinguishes between license and purchase contracts
///
/// Used for type-level distinction of contract variants.
#[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen, Debug)]
pub enum ContractType {
    /// Temporary rights transfer through licensing
    License,
    /// Permanent rights transfer through purchase
    Purchase,
}

/// An active contract created from an accepted offer
///
/// Created when a [`LicenseOffer`] or [`PurchaseOffer`] is accepted by a counterparty.
/// Contains all necessary information for managing the agreement including payment schedules.
#[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen, Debug)]
#[scale_info(skip_type_params(T))]
pub enum Contract<T: Config> {
    /// An active license agreement
    License(License<T>),
    /// An active purchase agreement
    Purchase(PurchaseContract<T>),
}

/// Defines payment terms for a contract
///
/// Supports both one-time payments and periodic payment schedules.
/// Used in both offers and active contracts.
#[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen)]
#[scale_info(skip_type_params(T))]
pub enum PaymentType<T: Config> {
    /// Single upfront payment
    ///
    /// # Parameters
    /// * `BalanceOf<T>` - The full payment amount
    OneTime(BalanceOf<T>),

    /// Multiple payments over time
    ///
    /// # Parameters
    /// * `amount_per_payment` - Amount due for each installment
    /// * `total_payments` - Number of installments required
    /// * `frequency` - Blocks between payments
    Periodic {
        /// Amount to be paid in each installment
        amount_per_payment: BalanceOf<T>,
        /// Total number of payments to complete the contract
        total_payments: T::Index,
        /// Number of blocks between payments
        frequency: BlockNumberFor<T>,
    },
}

impl<T: Config> core::fmt::Debug for PaymentType<T>
where
    BalanceOf<T>: core::fmt::Debug,
    T::Index: core::fmt::Debug,
    BlockNumberFor<T>: core::fmt::Debug,
{
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        match self {
            PaymentType::OneTime(amount) => f.debug_tuple("OneTime").field(amount).finish(),
            PaymentType::Periodic {
                amount_per_payment,
                total_payments,
                frequency,
            } => f
                .debug_struct("Periodic")
                .field("amount_per_payment", amount_per_payment)
                .field("total_payments", total_payments)
                .field("frequency", frequency)
                .finish(),
        }
    }
}

/// Represents an intellectual property NFT
///
/// The core asset type of the pallet, representing registered intellectual property
/// with associated metadata and ownership information.
#[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
#[scale_info(skip_type_params(T))]
pub struct NFT<T: Config> {
    /// Unique identifier for this NFT
    pub id: T::NFTId,
    /// Current owner's account
    pub owner: T::AccountId,
    /// Name of the intellectual property
    ///
    /// Limited by [`Config::MaxNameLength`]
    pub name: BoundedVec<u8, T::MaxNameLength>,
    /// Detailed description of the intellectual property
    ///
    /// Limited by [`Config::MaxDescriptionLength`]
    pub description: BoundedVec<u8, T::MaxDescriptionLength>,
    /// Date when the IP was filed
    ///
    /// Format should be consistent (e.g., "YYYY-MM-DD")
    pub filing_date: BoundedVec<u8, T::MaxNameLength>,
    /// Legal jurisdiction where the IP is registered
    ///
    /// Country or region code (e.g., "US", "EU")
    pub jurisdiction: BoundedVec<u8, T::MaxNameLength>,
}
/// An offer to license an NFT
///
/// Created by NFT owners to specify license terms before a contract is formed.
/// See [`License`] for the activated version after acceptance.
#[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen, Debug)]
#[scale_info(skip_type_params(T))]
pub struct LicenseOffer<T: Config> {
    /// ID of the NFT being licensed
    pub nft_id: T::NFTId,
    /// Account offering the license (must be NFT owner)
    pub licensor: T::AccountId,
    /// Payment terms for the license
    pub payment_type: PaymentType<T>,
    /// Whether this is an exclusive license
    pub is_exclusive: bool,
    /// How long the license lasts (in blocks)
    pub duration: BlockNumberFor<T>,
}

/// An offer to purchase an NFT
///
/// Created by NFT owners to specify sale terms before a contract is formed.
/// See [`PurchaseContract`] for the activated version after acceptance.
#[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen, Debug)]
#[scale_info(skip_type_params(T))]
pub struct PurchaseOffer<T: Config> {
    /// ID of the NFT being sold
    pub nft_id: T::NFTId,
    /// Account selling the NFT (must be owner)
    pub seller: T::AccountId,
    /// Payment terms for the purchase
    pub payment_type: PaymentType<T>,
}

/// An active license contract
///
/// Created when a [`LicenseOffer`] is accepted. Tracks the ongoing
/// license relationship including payments and duration.
#[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
#[scale_info(skip_type_params(T))]
pub struct License<T: Config> {
    /// ID of the licensed NFT
    pub nft_id: T::NFTId,
    /// Account that owns and licensed the NFT
    pub licensor: T::AccountId,
    /// Account that accepted the license
    pub licensee: T::AccountId,
    /// How long the license lasts (in blocks)
    pub duration: BlockNumberFor<T>,
    /// When the license period began
    pub start_block: BlockNumberFor<T>,
    /// Payment terms for the license
    pub payment_type: PaymentType<T>,
    /// Payment tracking for periodic payments
    pub payment_schedule: Option<PaymentSchedule<T>>,
    /// Whether this is an exclusive license
    pub is_exclusive: bool,
}

/// An active purchase contract
///
/// Created when a [`PurchaseOffer`] is accepted. Tracks the purchase
/// agreement including any ongoing payments.
#[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen, Debug)]
#[scale_info(skip_type_params(T))]
pub struct PurchaseContract<T: Config> {
    /// ID of the NFT being purchased
    pub nft_id: T::NFTId,
    /// Account selling the NFT
    pub seller: T::AccountId,
    /// Account buying the NFT
    pub buyer: T::AccountId,
    /// Payment terms for the purchase
    pub payment_type: PaymentType<T>,
    /// Payment tracking for periodic payments
    pub payment_schedule: Option<PaymentSchedule<T>>,
}

/// Tracks progress of periodic payments
///
/// Used by both license and purchase contracts to manage
/// installment payments and handle missed payments.
#[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen)]
#[scale_info(skip_type_params(T))]
pub struct PaymentSchedule<T: Config> {
    /// When the payment schedule began
    pub start_block: BlockNumberFor<T>,
    /// When the next payment is due
    pub next_payment_block: BlockNumberFor<T>,
    /// Number of payments completed
    pub payments_made: T::Index,
    /// Number of payments remaining
    pub payments_due: T::Index,
    /// Track missed payments for penalties
    pub missed_payments: Option<T::Index>,
    /// Current penalty amount (if any)
    pub penalty_amount: Option<BalanceOf<T>>,
    /// Blocks between payments
    pub frequency: BlockNumberFor<T>,
}

impl<T: Config> PaymentSchedule<T> {
    pub fn increment(&mut self) {
        self.next_payment_block = self.next_payment_block + self.frequency;
        self.payments_made = self.payments_made + 1u32.into();
        self.payments_due = self.payments_due - 1u32.into();
    }
}

impl<T: Config> core::fmt::Debug for PaymentSchedule<T>
where
    T::Index: core::fmt::Debug,
    BlockNumberFor<T>: core::fmt::Debug,
    BalanceOf<T>: core::fmt::Debug,
{
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        f.debug_struct("PaymentSchedule")
            .field("start_block", &self.start_block)
            .field("next_payment_block", &self.next_payment_block)
            .field("payments_made", &self.payments_made)
            .field("payments_due", &self.payments_due)
            .field("missed_payments", &self.missed_payments)
            .field("penalty_amount", &self.penalty_amount)
            .field("frequency", &self.frequency)
            .finish()
    }
}

impl<T: Config> LicenseOffer<T> {
    pub fn init(self, licensee: T::AccountId) -> License<T> {
        let start_block = frame_system::Pallet::<T>::block_number();
        // Create payment schedule based on payment type
        let payment_schedule = match &self.payment_type {
            PaymentType::Periodic {
                amount_per_payment: _,
                total_payments,
                frequency,
            } => Some(PaymentSchedule {
                start_block,
                next_payment_block: start_block,
                payments_made: T::Index::default(),
                payments_due: *total_payments,
                missed_payments: None,
                penalty_amount: None,
                frequency: *frequency,
            }),
            PaymentType::OneTime(_) => None,
        };

        License {
            nft_id: self.nft_id,
            licensor: self.licensor,
            licensee,
            duration: self.duration,
            start_block,
            payment_type: self.payment_type,
            payment_schedule,
            is_exclusive: self.is_exclusive,
        }
    }
}

impl<T: Config> PurchaseOffer<T> {
    pub fn init(self, buyer: T::AccountId) -> PurchaseContract<T> {
        let start_block = frame_system::Pallet::<T>::block_number();
        // Create payment schedule based on payment type
        let payment_schedule = match &self.payment_type {
            PaymentType::Periodic {
                amount_per_payment: _,
                total_payments,
                frequency,
            } => Some(PaymentSchedule {
                start_block,
                next_payment_block: start_block,
                payments_made: T::Index::default(),
                payments_due: *total_payments,
                missed_payments: None,
                penalty_amount: None,
                frequency: *frequency,
            }),
            PaymentType::OneTime(_) => None,
        };

        PurchaseContract {
            nft_id: self.nft_id,
            seller: self.seller,
            buyer,
            payment_type: self.payment_type,
            payment_schedule,
        }
    }
}
