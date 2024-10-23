#![cfg_attr(not(feature = "std"), no_std)]

pub use self::pallet::*;

#[frame_support::pallet(dev_mode)]
pub mod pallet {
    use frame_support::sp_runtime::traits::{AtLeast32BitUnsigned, One, Saturating};
    use frame_support::traits::ExistenceRequirement;
    use frame_support::{pallet_prelude::*, traits::Currency, traits::Hooks};
    use frame_system::pallet_prelude::*;
    use scale_info::prelude::format;
    use scale_info::prelude::string::String;
    use sp_std::prelude::*;

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        type Currency: Currency<Self::AccountId>;
        /// The type used to identify licenses
        type LicenseId: Member
            + Parameter
            + MaxEncodedLen
            + Copy
            + Default
            + From<u32>
            + AtLeast32BitUnsigned
            + One
            + TypeInfo;
        #[pallet::constant]
        type MaxNameLength: Get<u32>;
        #[pallet::constant]
        type MaxDescriptionLength: Get<u32>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);
    type BalanceOf<T> =
        <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

    #[pallet::storage]
    #[pallet::getter(fn nfts)]
    pub type Nfts<T: Config> = StorageMap<_, Blake2_128Concat, u32, NFT<T>>;

    #[pallet::storage]
    #[pallet::getter(fn next_nft_id)]
    pub type NextNftId<T: Config> = StorageValue<_, u32, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn next_license_id)]
    pub type NextLicenseId<T: Config> = StorageValue<_, T::LicenseId, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn licenses)]
    pub type Licenses<T: Config> = StorageMap<_, Blake2_128Concat, T::LicenseId, License<T>>;

    #[pallet::storage]
    #[pallet::getter(fn license_ownership)]
    pub type LicenseOwnership<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        u32, // NFT ID
        Blake2_128Concat,
        T::AccountId, // Licensee
        T::LicenseId, // License ID
    >;

    #[pallet::storage]
    #[pallet::getter(fn escrow)]
    pub type Escrow<T: Config> = StorageMap<_, Blake2_128Concat, u32, (T::AccountId, BalanceOf<T>)>;

    #[pallet::storage]
    pub type EscrowedNfts<T: Config> = StorageMap<_, Blake2_128Concat, u32, T::AccountId>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        NftMinted {
            owner: T::AccountId,
            nft_id: u32,
        },
        NftEscrowed {
            nft_id: u32,
            owner: T::AccountId,
            price: BalanceOf<T>,
        },

        LicenseExpired {
            license_id: T::LicenseId,
            nft_id: u32,
            licensee: T::AccountId,
        },

        PeriodicPaymentFailed {
            license_id: T::LicenseId,
            nft_id: u32,
            licensee: T::AccountId,
            amount: BalanceOf<T>,
        },
        LicenseOffered {
            nft_id: u32,
            license_id: T::LicenseId,
            licensor: T::AccountId,
        },
        LicenseAccepted {
            nft_id: u32,
            license_id: T::LicenseId,
            licensee: T::AccountId,
        },
        LicenseRevoked {
            license_id: T::LicenseId,
            nft_id: u32,
            licensee: Option<T::AccountId>,
            reason: RevokeReason,
        },
        PeriodicPaymentProcessed {
            license_id: T::LicenseId,
            nft_id: u32,
            payer: T::AccountId,
            licensor: T::AccountId,
            amount: BalanceOf<T>,
        },
        LicenseCompleted {
            license_id: T::LicenseId,
            nft_id: u32,
            licensee: T::AccountId,
        },
    }

    #[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen, Debug)]
    pub enum RevokeReason {
        Expired,
        Violation,
        MutualAgreement,
        PaymentFailure,
        Other,
    }
    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    pub enum LicenseStatus {
        Offered,
        Active,
        Completed,
        Expired,
    }

    #[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen)]
    #[cfg_attr(feature = "std", derive(Debug))]
    pub enum PaymentType<Balance, BlockNumber> {
        OneTime(Balance),
        Periodic {
            amount_per_payment: Balance,
            total_payments: u32,
            frequency: BlockNumber,
        },
    }

    #[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen)]
    #[cfg_attr(feature = "std", derive(Debug))]
    pub struct PaymentSchedule<BlockNumber> {
        start_block: BlockNumber,
        next_payment_block: BlockNumber,
        payments_made: u32,
        payments_due: u32,
    }

    #[pallet::error]
    pub enum Error<T> {
        NameTooLong,
        DescriptionTooLong,
        FilingDateTooLong,
        JurisdictionTooLong,
        NftNotFound,
        NotNftOwner,
        NftAlreadyEscrowed,
        LicenseNotFound,
        LicenseNotOffered,
        LicenseOwnershipNotFound,
        AlreadyLicensed,
        NotLicenseOwner,
        LicenseNotRevocable,
        NftInEscrow,
        ActiveLicensesExist,
        ExclusiveLicenseExists,
        PaymentFailed,
        LicenseeNotFound,
        LicenseNotActive,
        NotLicensee,
    }

    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    #[scale_info(skip_type_params(T))]
    pub struct NFT<T: Config> {
        pub id: u32, // Add this line
        pub owner: T::AccountId,
        pub name: BoundedVec<u8, T::MaxNameLength>,
        pub description: BoundedVec<u8, T::MaxDescriptionLength>,
        pub filing_date: BoundedVec<u8, T::MaxNameLength>,
        pub jurisdiction: BoundedVec<u8, T::MaxNameLength>,
    }

    // Update the License struct
    #[derive(Clone, Encode, Decode, PartialEq, TypeInfo, MaxEncodedLen)]
    #[scale_info(skip_type_params(T))]
    pub struct License<T: Config> {
        pub nft_id: u32,
        pub licensor: T::AccountId,
        pub licensee: Option<T::AccountId>,
        pub price: BalanceOf<T>,
        pub is_purchase: bool,
        pub duration: Option<BlockNumberFor<T>>,
        pub start_block: Option<BlockNumberFor<T>>,
        pub payment_type: PaymentType<BalanceOf<T>, BlockNumberFor<T>>,
        pub payment_schedule: Option<PaymentSchedule<BlockNumberFor<T>>>,
        pub is_exclusive: bool,
        pub status: LicenseStatus,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(10_000)]
        #[pallet::call_index(0)]
        pub fn mint_nft(
            origin: OriginFor<T>,
            name: String,
            description: String,
            filing_date: String,
            jurisdiction: String,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let bounded_name: BoundedVec<u8, T::MaxNameLength> = name
                .as_bytes()
                .to_vec()
                .try_into()
                .map_err(|_| Error::<T>::NameTooLong)?;

            let bounded_description: BoundedVec<u8, T::MaxDescriptionLength> = description
                .as_bytes()
                .to_vec()
                .try_into()
                .map_err(|_| Error::<T>::DescriptionTooLong)?;

            let current_block = <frame_system::Pallet<T>>::block_number();
            let filing_date_with_block = format!("{} (Block: {:?})", filing_date, current_block);
            let bounded_filing_date: BoundedVec<u8, T::MaxNameLength> = filing_date_with_block
                .as_bytes()
                .to_vec()
                .try_into()
                .map_err(|_| Error::<T>::FilingDateTooLong)?;

            let bounded_jurisdiction: BoundedVec<u8, T::MaxNameLength> = jurisdiction
                .as_bytes()
                .to_vec()
                .try_into()
                .map_err(|_| Error::<T>::JurisdictionTooLong)?;

            let id = Self::next_nft_id();
            NextNftId::<T>::put(id.saturating_add(1));

            let nft = NFT {
                id,
                owner: who.clone(),
                name: bounded_name.clone(),
                description: bounded_description,
                filing_date: bounded_filing_date,
                jurisdiction: bounded_jurisdiction,
            };

            Nfts::<T>::insert(id, nft);

            Self::deposit_event(Event::NftMinted {
                owner: who,
                nft_id: id,
            });

            Ok(())
        }

        #[pallet::weight(10_000)]
        #[pallet::call_index(1)]
        pub fn escrow_nft(
            origin: OriginFor<T>,
            nft_id: u32,
            price: BalanceOf<T>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let nft = Nfts::<T>::get(nft_id).ok_or(Error::<T>::NftNotFound)?;
            ensure!(nft.owner == who, Error::<T>::NotNftOwner);
            ensure!(
                !Escrow::<T>::contains_key(nft_id),
                Error::<T>::NftAlreadyEscrowed
            );

            Escrow::<T>::insert(nft_id, (who.clone(), price));

            Self::deposit_event(Event::NftEscrowed {
                nft_id,
                owner: who,
                price,
            });

            Ok(())
        }

        #[pallet::weight(10_000)]
        #[pallet::call_index(2)]
        pub fn create_license(
            origin: OriginFor<T>,
            nft_id: u32,
            price: BalanceOf<T>,
            is_purchase: bool,
            duration: Option<BlockNumberFor<T>>,
            payment_type: PaymentType<BalanceOf<T>, BlockNumberFor<T>>,
            is_exclusive: bool,
        ) -> DispatchResult {
            let licensor = ensure_signed(origin)?;
            ensure!(Nfts::<T>::contains_key(nft_id), Error::<T>::NftNotFound);
            ensure!(
                Nfts::<T>::get(nft_id).unwrap().owner == licensor,
                Error::<T>::NotNftOwner
            );

            // Check if there's an escrow for this NFT
            ensure!(!Escrow::<T>::contains_key(nft_id), Error::<T>::NftInEscrow);

            // Check for existing licenses
            let existing_licenses: Vec<_> = LicenseOwnership::<T>::iter_prefix(nft_id).collect();

            if is_exclusive {
                // Ensure no active licenses exist for exclusive license creation
                ensure!(
                    existing_licenses.is_empty(),
                    Error::<T>::ActiveLicensesExist
                );
            } else {
                // For non-exclusive licenses, check if an exclusive license already exists
                for (_, license_id) in existing_licenses {
                    if let Some(license) = Licenses::<T>::get(license_id) {
                        if license.is_exclusive && license.status == LicenseStatus::Active {
                            return Err(Error::<T>::ExclusiveLicenseExists.into());
                        }
                    }
                }
            }

            let license = License {
                nft_id,
                licensor: licensor.clone(),
                licensee: None,
                price,
                is_purchase,
                duration,
                start_block: None,
                payment_type,
                payment_schedule: None,
                is_exclusive,
                status: LicenseStatus::Offered,
            };

            let license_id = Self::next_license_id();
            Licenses::<T>::insert(license_id, license);
            NextLicenseId::<T>::mutate(|id| *id = id.saturating_add(T::LicenseId::one()));

            Self::deposit_event(Event::LicenseOffered {
                nft_id,
                license_id,
                licensor,
            });
            Ok(())
        }

        #[pallet::weight(10_000)]
        #[pallet::call_index(3)]
        pub fn accept_license(origin: OriginFor<T>, license_id: T::LicenseId) -> DispatchResult {
            let licensee = ensure_signed(origin)?;
            Licenses::<T>::try_mutate(license_id, |maybe_license| -> DispatchResult {
                let license = maybe_license.as_mut().ok_or(Error::<T>::LicenseNotFound)?;
                ensure!(
                    license.status == LicenseStatus::Offered,
                    Error::<T>::LicenseNotOffered
                );
                ensure!(
                    !LicenseOwnership::<T>::contains_key(license.nft_id, &licensee),
                    Error::<T>::AlreadyLicensed
                );

                let nft = Nfts::<T>::get(license.nft_id).ok_or(Error::<T>::NftNotFound)?;
                ensure!(nft.owner == license.licensor, Error::<T>::NotNftOwner);

                // Escrow the NFT
                EscrowedNfts::<T>::insert(license.nft_id, nft.owner.clone());

                let current_block = <frame_system::Pallet<T>>::block_number();

                match &license.payment_type {
                    PaymentType::OneTime(amount) => {
                        // Process one-time payment immediately
                        T::Currency::transfer(
                            &licensee,
                            &license.licensor,
                            *amount,
                            ExistenceRequirement::KeepAlive,
                        )?;
                        license.status = LicenseStatus::Completed;
                    }
                    PaymentType::Periodic { frequency, .. } => {
                        // Create payment schedule for periodic payments
                        license.payment_schedule = Some(PaymentSchedule {
                            start_block: current_block,
                            next_payment_block: current_block + *frequency,
                            payments_made: 0,
                            payments_due: 0,
                        });
                        license.status = LicenseStatus::Active;
                    }
                }

                license.licensee = Some(licensee.clone());
                LicenseOwnership::<T>::insert(license.nft_id, &licensee, license_id);

                Self::deposit_event(Event::LicenseAccepted {
                    license_id,
                    nft_id: license.nft_id,
                    licensee,
                });
                Ok(())
            })
        }

        #[pallet::weight(10_000)]
        #[pallet::call_index(4)]
        pub fn revoke_license(
            origin: OriginFor<T>,
            license_id: T::LicenseId,
            reason: RevokeReason,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            Licenses::<T>::try_mutate(license_id, |maybe_license| -> DispatchResult {
                let license = maybe_license.as_mut().ok_or(Error::<T>::LicenseNotFound)?;

                ensure!(license.licensor == who, Error::<T>::NotLicenseOwner);

                // Check if the license is revocable
                ensure!(
                    license.status == LicenseStatus::Offered
                        || (license.status == LicenseStatus::Active
                            && Self::no_payments_made(license)),
                    Error::<T>::LicenseNotRevocable
                );

                // If there's a licensee, remove the license ownership
                if let Some(licensee) = &license.licensee {
                    LicenseOwnership::<T>::remove(license.nft_id, licensee);
                }

                Self::deposit_event(Event::LicenseRevoked {
                    license_id,
                    nft_id: license.nft_id,
                    licensee: license.licensee.clone(),
                    reason: reason.clone(),
                });

                // Remove the license
                *maybe_license = None;

                Ok(())
            })
        }

        #[pallet::weight(10_000)]
        #[pallet::call_index(5)]
        pub fn make_periodic_payment(
            origin: OriginFor<T>,
            license_id: T::LicenseId,
        ) -> DispatchResult {
            let payer = ensure_signed(origin)?;
            Licenses::<T>::try_mutate(license_id, |maybe_license| -> DispatchResult {
                let license = maybe_license.as_mut().ok_or(Error::<T>::LicenseNotFound)?;
                ensure!(
                    license.status == LicenseStatus::Active,
                    Error::<T>::LicenseNotActive
                );

                if let (
                    PaymentType::Periodic {
                        amount_per_payment,
                        total_payments,
                        ..
                    },
                    Some(schedule),
                ) = (&license.payment_type, &mut license.payment_schedule)
                {
                    T::Currency::transfer(
                        &payer,
                        &license.licensor,
                        *amount_per_payment,
                        ExistenceRequirement::KeepAlive,
                    )?;

                    schedule.payments_made += 1;
                    if schedule.payments_due > 0 {
                        schedule.payments_due -= 1;
                    }

                    Self::deposit_event(Event::PeriodicPaymentProcessed {
                        license_id,
                        nft_id: license.nft_id,
                        payer: payer.clone(),
                        licensor: license.licensor.clone(),
                        amount: *amount_per_payment,
                    });

                    if schedule.payments_made == *total_payments {
                        license.status = LicenseStatus::Completed;
                        Self::deposit_event(Event::LicenseCompleted {
                            license_id,
                            nft_id: license.nft_id,
                            licensee: license.licensee.clone().unwrap(),
                        });
                    }
                }

                Ok(())
            })
        }
    }

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
        fn on_initialize(n: BlockNumberFor<T>) -> Weight {
            let mut weight = T::DbWeight::get().reads(1);

            for (license_id, license) in Licenses::<T>::iter() {
                if license.status == LicenseStatus::Active {
                    weight =
                        weight.saturating_add(Self::process_active_license(license_id, license, n));
                }
            }

            weight
        }
    }

    impl<T: Config> Pallet<T> {
        fn process_active_license(
            license_id: T::LicenseId,
            mut license: License<T>,
            n: BlockNumberFor<T>,
        ) -> Weight {
            let mut weight = T::DbWeight::get().reads(1);

            // Check for expiration
            if Self::check_license_expiration(&license) {
                if let Some(licensee) = license.licensee.clone() {
                    return weight
                        .saturating_add(Self::expire_license(license_id, &license, licensee));
                }
            }

            // Check for completed payments
            if Self::check_payments_completed(&license) {
                return weight.saturating_add(Self::complete_license(
                    license_id,
                    &license,
                    license.is_purchase,
                ));
            }

            // Process periodic payment if due
            if let PaymentType::Periodic { .. } = license.payment_type {
                if let Some(schedule) = &license.payment_schedule {
                    if n >= schedule.next_payment_block {
                        match Self::attempt_periodic_payment(license_id, &mut license) {
                            Ok(_) => {
                                weight =
                                    weight.saturating_add(T::DbWeight::get().reads_writes(1, 1));
                                // Update the license in storage
                                Licenses::<T>::insert(license_id, license);
                            }
                            Err(_) => {
                                // Payment failed, cancel the license
                                weight = weight
                                    .saturating_add(Self::cancel_license(license_id, &license));
                            }
                        }
                    }
                }
            }

            weight
        }

        pub(crate) fn check_license_expiration(license: &License<T>) -> bool {
            if let Some(duration) = license.duration {
                let block_number = <frame_system::Pallet<T>>::block_number();
                let start_block = license.start_block.unwrap_or_default();
                block_number >= start_block + duration
            } else {
                // If there's no duration set, the license doesn't expire
                false
            }
        }

        pub(crate) fn check_payments_completed(license: &License<T>) -> bool {
            match &license.payment_type {
                PaymentType::OneTime(_) => false, // One-time payments are handled separately
                PaymentType::Periodic { total_payments, .. } => {
                    if let Some(schedule) = &license.payment_schedule {
                        schedule.payments_made == *total_payments
                    } else {
                        false
                    }
                }
            }
        }

        pub(crate) fn complete_license(
            license_id: T::LicenseId,
            license: &License<T>,
            is_purchase: bool,
        ) -> Weight {
            let mut weight = T::DbWeight::get().reads_writes(2, 2);

            if is_purchase {
                // Transfer NFT to buyer
                if let Some(licensee) = &license.licensee {
                    Nfts::<T>::mutate(license.nft_id, |maybe_nft| {
                        if let Some(nft) = maybe_nft {
                            nft.owner = licensee.clone();
                        }
                    });
                    weight = weight.saturating_add(T::DbWeight::get().writes(1));
                }
            } else {
                // Return NFT to licensor if it was escrowed
                if EscrowedNfts::<T>::contains_key(license.nft_id) {
                    EscrowedNfts::<T>::remove(license.nft_id);
                    Nfts::<T>::mutate(license.nft_id, |maybe_nft| {
                        if let Some(nft) = maybe_nft {
                            nft.owner = license.licensor.clone();
                        }
                    });
                    weight = weight.saturating_add(T::DbWeight::get().writes(2));
                }
            }

            // Remove from EscrowedNfts if it was there
            if EscrowedNfts::<T>::contains_key(license.nft_id) {
                EscrowedNfts::<T>::remove(license.nft_id);
                weight = weight.saturating_add(T::DbWeight::get().writes(1));
            }

            // Update license status
            Licenses::<T>::mutate(license_id, |maybe_license| {
                if let Some(l) = maybe_license {
                    l.status = LicenseStatus::Completed;
                }
            });

            // Remove license ownership
            if let Some(licensee) = &license.licensee {
                LicenseOwnership::<T>::remove(license.nft_id, licensee);
                weight = weight.saturating_add(T::DbWeight::get().writes(1));
            }

            Self::deposit_event(Event::LicenseCompleted {
                license_id,
                nft_id: license.nft_id,
                licensee: license.licensee.clone().unwrap(),
            });

            weight
        }

        pub(crate) fn expire_license(
            license_id: T::LicenseId,
            license: &License<T>,
            licensee: T::AccountId,
        ) -> Weight {
            let weight = T::DbWeight::get().reads_writes(3, 3);

            // Transfer NFT back to licensor if it was escrowed
            if EscrowedNfts::<T>::contains_key(license.nft_id) {
                EscrowedNfts::<T>::remove(license.nft_id);
                Nfts::<T>::mutate(license.nft_id, |maybe_nft| {
                    if let Some(nft) = maybe_nft {
                        nft.owner = license.licensor.clone();
                    }
                });
            }

            // Remove the license and ownership
            Licenses::<T>::remove(license_id);
            LicenseOwnership::<T>::remove(license.nft_id, &licensee);

            Self::deposit_event(Event::LicenseExpired {
                license_id,
                nft_id: license.nft_id,
                licensee,
            });

            weight
        }

        pub(crate) fn cancel_license(license_id: T::LicenseId, license: &License<T>) -> Weight {
            let mut weight = T::DbWeight::get().reads_writes(3, 3);

            // Remove the license
            Licenses::<T>::remove(license_id);

            // Remove license ownership
            if let Some(licensee) = &license.licensee {
                LicenseOwnership::<T>::remove(license.nft_id, licensee);
            }

            // Return NFT to licensor if it was escrowed
            if EscrowedNfts::<T>::contains_key(license.nft_id) {
                EscrowedNfts::<T>::remove(license.nft_id);
                Nfts::<T>::mutate(license.nft_id, |maybe_nft| {
                    if let Some(nft) = maybe_nft {
                        nft.owner = license.licensor.clone();
                    }
                });
                weight = weight.saturating_add(T::DbWeight::get().writes(1));
            }

            Self::deposit_event(Event::LicenseRevoked {
                license_id,
                nft_id: license.nft_id,
                licensee: Some(license.licensee.clone().unwrap()),
                reason: RevokeReason::PaymentFailure,
            });

            weight
        }
        pub(crate) fn no_payments_made(license: &License<T>) -> bool {
            match &license.payment_type {
                PaymentType::OneTime(_) => true,
                PaymentType::Periodic { .. } => license
                    .payment_schedule
                    .as_ref()
                    .map_or(true, |schedule| schedule.payments_made == 0),
            }
        }

        pub(crate) fn attempt_periodic_payment(
            license_id: T::LicenseId,
            license: &mut License<T>,
        ) -> DispatchResult {
            let (amount_per_payment, total_payments, frequency) = match &license.payment_type {
                PaymentType::Periodic {
                    amount_per_payment,
                    total_payments,
                    frequency,
                } => (*amount_per_payment, *total_payments, *frequency),
                _ => return Err(Error::<T>::PaymentFailed.into()),
            };

            let schedule = license
                .payment_schedule
                .as_mut()
                .ok_or(Error::<T>::PaymentFailed)?;
            let licensee = license
                .licensee
                .as_ref()
                .ok_or(Error::<T>::LicenseeNotFound)?;
            let licensor = license.licensor.clone();
            let nft_id = license.nft_id;

            T::Currency::transfer(
                licensee,
                &licensor,
                amount_per_payment,
                ExistenceRequirement::KeepAlive,
            )
            .map_err(|_| {
                Self::deposit_event(Event::PeriodicPaymentFailed {
                    license_id,
                    nft_id,
                    licensee: licensee.clone(),
                    amount: amount_per_payment,
                });
                Error::<T>::PaymentFailed
            })?;

            // Update schedule and other logic...
            schedule.payments_made += 1;
            schedule.payments_due = schedule.payments_due.saturating_sub(1);
            schedule.next_payment_block += frequency;

            Self::deposit_event(Event::PeriodicPaymentProcessed {
                license_id,
                nft_id,
                payer: licensee.clone(),
                licensor,
                amount: amount_per_payment,
            });

            if schedule.payments_made == total_payments {
                license.status = LicenseStatus::Completed;
                Self::deposit_event(Event::LicenseCompleted {
                    license_id,
                    nft_id,
                    licensee: licensee.clone(),
                });
            }

            Ok(())
        }
    }
}

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

