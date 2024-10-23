#![cfg_attr(not(feature = "std"), no_std)]

#![allow(warnings)]

/// Edit this file to define custom logic or remove it if it is not needed.
/// Learn more about FRAME and the core library of Substrate FRAME pallets:
/// <https://docs.substrate.io/reference/frame-pallets/>
pub use pallet::*;

pub mod types;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;


use frame_support::pallet_prelude::DispatchResult;
use sp_runtime::Vec;

use sp_runtime::traits::{SaturatedConversion, AccountIdConversion, CheckedAdd, CheckedMul};
use frame_support::traits::{Currency, ReservableCurrency, WithdrawReasons, ExistenceRequirement, fungible};
use frame_support::traits::fungible::Mutate;
use frame_support::PalletId;
use frame_support::traits::tokens::Preservation::Expendable;
use frame_support::ensure;

use sp_core::blake2_128;

use frame_support::traits::Randomness;

pub use types::*;

type AccountIdOf<T> = <T as frame_system::Config>::AccountId;

pub type BalanceOf<T> = <<T as Config>::NativeBalance as fungible::Inspect<<T as frame_system::Config>::AccountId>>::Balance;

use frame_support::traits::Get;

use frame_support::BoundedVec;

use frame_support::pallet_prelude::*;
use frame_system::pallet_prelude::*;



#[frame_support::pallet(dev_mode)]
pub mod pallet {
	use super::*;
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;

	#[pallet::pallet]
	pub struct Pallet<T>(_);

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config //+ pallet_balances::Config
	{
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

		type NativeBalance: fungible::Inspect<Self::AccountId>
			+ fungible::Mutate<Self::AccountId>
			+ fungible::hold::Inspect<Self::AccountId>
			+ fungible::hold::Mutate<Self::AccountId>
			+ fungible::freeze::Inspect<Self::AccountId>
			+ fungible::freeze::Mutate<Self::AccountId>;

		/// Maximum number of participants in a single ROSCA
		#[pallet::constant]
		type MaxParticipants: Get<u32>;

		#[pallet::constant]
		type MaxInvitedParticipants: Get<u32>;

		#[pallet::constant]
		type PalletId: Get<PalletId>;

		#[pallet::constant]
		type StringLimit: Get<u32>;
	}

	/// The next Rosca id
	#[pallet::storage]
	#[pallet::getter(fn next_rosca_id)]
	pub(super) type NextRoscaId<T> = StorageValue<_, u32, ValueQuery>;

	/// Currently active Rosca.
	#[pallet::storage]
	#[pallet::getter(fn active_roscas)]
	pub(super) type ActiveRoscas<T> = StorageMap<_, Blake2_128Concat, u32, RoscaDetails<T>, OptionQuery>;

	/// Completed Rosca
	#[pallet::storage]
	#[pallet::getter(fn completed_roscas)]
	pub(super) type CompletedRoscas<T> = StorageMap<_, Blake2_128Concat, u32, (), OptionQuery>;


	// Mapping of Rosca Id and AccountId returning their prestart position index. This index could become inaccurate once the Rosca starts if 
	// the Rosca starts with less than the max of participants. Once the Rosca is active this Map should be used for membership checks only.
	#[pallet::storage]
	#[pallet::getter(fn participants)]
	pub(super) type RoscaParticipants<T> = StorageDoubleMap<_, Blake2_128Concat, u32, Blake2_128Concat, AccountIdOf<T>, u32, OptionQuery>;

	// Invited participants. Includes the rosca creator
	#[pallet::storage]
	#[pallet::getter(fn invited_preverified_participants)]
	pub(super) type RoscaInvitedPreverifiedParticipants<T> = StorageDoubleMap<_, Blake2_128Concat, u32, Blake2_128Concat, AccountIdOf<T>, (), OptionQuery>;

	// Number of participants in the Rosca
	#[pallet::storage]
	#[pallet::getter(fn participants_count)]
	pub(super) type RoscaParticipantsCount<T> = StorageMap<_, Blake2_128Concat, u32, u32, OptionQuery>;


	// Mapping of RoscaId and AccountID to the total security deposit one has in the Rosca fund.
	#[pallet::storage]
	#[pallet::getter(fn security_deposit)]
	pub(super) type RoscaSecurityDeposits<T> = StorageDoubleMap<_, Blake2_128Concat, u32, Blake2_128Concat, AccountIdOf<T>, u32, OptionQuery>;

	// The claim order of participants for an unstarted Rosca.
	#[pallet::storage]
	#[pallet::getter(fn pending_rosca_participants_order)]
	pub(super) type PendingRoscaParticipantsOrder<T> = StorageMap<_, Blake2_128Concat, u32, BoundedVec<Option<AccountIdOf<T>>, <T as pallet::Config>::MaxParticipants>, OptionQuery>;

	// The claim order of participants for a started Rosca.
	#[pallet::storage]
	#[pallet::getter(fn active_rosca_participants_order)]
	pub(super) type ActiveRoscaParticipantsOrder<T> = StorageMap<_, Blake2_128Concat, u32, BoundedVec<AccountIdOf<T>, <T as pallet::Config>::MaxParticipants>, OptionQuery>;

	// Rosca that have been proposed but not yet started
	#[pallet::storage]
	#[pallet::getter(fn rosca_details)]
	pub(super) type PendingRoscaDetails<T> = StorageMap<_, Blake2_128Concat, u32, RoscaDetails<T>, OptionQuery>;

	// The cut off block for the current period. Payments must be made before this block starts in order to count for a current period
	#[pallet::storage]
	#[pallet::getter(fn next_pay_by_block)]
	pub(super) type NextPayByBlock<T> = StorageMap<_, Blake2_128Concat, u32, BlockNumberFor<T>, OptionQuery>;


	// The cut off block for the last cycle of the Rosca.
	#[pallet::storage]
	#[pallet::getter(fn final_pay_by_block)]
	pub(super) type FinalPayByBlock<T> = StorageMap<_, Blake2_128Concat, u32, BlockNumberFor<T>, OptionQuery>;


	// The account of the currently eligible recipient of the pot
	#[pallet::storage]
	#[pallet::getter(fn eligible_claimant)]
	pub(super) type EligibleClaimant<T> = StorageMap<_, Blake2_128Concat, u32, AccountIdOf<T>, OptionQuery>;

	// The account address for a given Rosca.
	#[pallet::storage]
	#[pallet::getter(fn rosca_account)]
	pub type RoscaAccounts<T: Config> = StorageMap<_, Blake2_128Concat, u32, T::AccountId, OptionQuery>;

	// Double Map of rosca_id, participant => true/false for current Rosca cycle. 
	#[pallet::storage]
	#[pallet::getter(fn current_contributors)]
	pub type CurrentContributors<T: Config> = StorageDoubleMap<_, Blake2_128Concat, u32, Blake2_128Concat, AccountIdOf<T>, (), OptionQuery>;

	// Current number of contributions for this round for a given rosca id
	#[pallet::storage]
	#[pallet::getter(fn current_contribution_count)]
	pub type CurrentContribtionCount<T: Config> = StorageMap<_, Blake2_128Concat, u32, u32, ValueQuery>;

	// Counter for number of defaults by a participant
	#[pallet::storage]
	#[pallet::getter(fn default_count)]
	pub type DefaultCount<T: Config> = StorageDoubleMap<_, Blake2_128Concat, u32, Blake2_128Concat, AccountIdOf<T>, u32, ValueQuery>;



	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// A Rosca Created
		// RoscaCreated { rosca_id: u32, contribution_amount: BalanceOf<T>, contribution_frequency: BlockNumberFor<T> },
		// ParticipantDefaulted {
		// 	rosca_id: u32,
		// 	participant: AccountIdOf<T>,
		// },
		// ContributionMade {
		// 	rosca_id: u32,
		// 	contributor: AccountIdOf<T>,
		// 	recipient: AccountIdOf<T>,
		// 	amount: BalanceOf<T>,
		// },
		RoscaStarted {
			rosca_id: u32,
		},
		RoscaComplete {
			rosca_id: u32,
		},
	}
	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		ConversionError,
		ArithmeticOverflow,
		ArithmeticUnderflow,
		MultiplyError,
		DivisionError,
		ArithmeticError,
		StartByBlockMustBeFuture,
		TooManyProposedParticipants,
		PositionTooLarge,
		RoscaNotFound,
		PositionAlreadyFilled,
		AlreadyJoined,
		RoscaAlreadyActive,
		SecurityDepositNotFound,
		AllPositionsFilled,
		RoscaParticipantsNotFound,
		NotAParticipant,
		ParticipantThresholdNotMet,
		RoscaParticipantCountNotFound,
		NoClaimant,
		RoscaNotActive,
		CantContributeToSelf,
		NoEligbleClaimant,
		AlreadyContributed,
		NoNextPayByBlock,
		FinalPayBlockNotFound,
		FinalPayByBlockMustBePast,
		RoscaNotCompleted,
		CantContributeBeyondFinalPayBy,
		RoscaAlreadyCompleted,
		NotInvited,
		CantInviteSelf,
		ThresholdTooHigh
	}


	#[pallet::call]
	impl<T: Config> Pallet<T> {
		#[pallet::call_index(0)]
		pub fn create_rosca(origin: OriginFor<T>, random_order: bool, invited_pre_verified_participants: BoundedVec<AccountIdOf<T>, T::MaxInvitedParticipants>, minimum_participant_threshold: u32, contribution_amount: u32, contribution_frequency: BlockNumberFor<T>, start_by_block: BlockNumberFor<T>, position: Option<u32>, name: BoundedVec<u8, <T as Config>::StringLimit>) -> DispatchResult {
			let signer = ensure_signed(origin)?;
			ensure!(T::MaxInvitedParticipants::get() < T::MaxParticipants::get(), Error::<T>::ArithmeticError);
			ensure!(!invited_pre_verified_participants.contains(&signer), Error::<T>::CantInviteSelf);
			let mut invited_pre_verified_participants = invited_pre_verified_participants.into_inner();
			invited_pre_verified_participants.sort();
			invited_pre_verified_participants.dedup();


			let current_block = <frame_system::Pallet<T>>::block_number();
			let position = position.unwrap_or(0);
			let number_of_participants = invited_pre_verified_participants.len().checked_add(1).ok_or(Error::<T>::ArithmeticOverflow)? as u32;
			ensure!(minimum_participant_threshold <= number_of_participants, Error::<T>::ThresholdTooHigh);
			ensure!(position < T::MaxParticipants::get(), Error::<T>::PositionTooLarge);
			ensure!(current_block < start_by_block, Error::<T>::StartByBlockMustBeFuture);
			

			let new_rosca_id = Self::next_rosca_id();
			let new_rosca_account_id = Self::rosca_account_id(new_rosca_id);


			let mut rosca_participants: Vec<Option<AccountIdOf<T>>> = Vec::new();
			rosca_participants.resize(number_of_participants as usize, None);
			rosca_participants[position as usize] = Some(signer.clone());

			RoscaInvitedPreverifiedParticipants::<T>::insert(new_rosca_id, &signer, ());
			for invited_participant in invited_pre_verified_participants.iter() {
				RoscaInvitedPreverifiedParticipants::<T>::insert(new_rosca_id, invited_participant, ());
			}

			let rosca_participants: BoundedVec<Option<AccountIdOf<T>>, T::MaxParticipants> = BoundedVec::try_from(rosca_participants).map_err(|_| Error::<T>::TooManyProposedParticipants)?;
			
			PendingRoscaParticipantsOrder::<T>::insert(new_rosca_id, rosca_participants);
			RoscaParticipants::<T>::insert(new_rosca_id, &signer, position);
			RoscaParticipantsCount::<T>::insert(new_rosca_id, 1);

			PendingRoscaDetails::<T>::insert(new_rosca_id, RoscaDetails {
				random_order,
				number_of_participants,
				minimum_participant_threshold,
				contribution_amount,
				contribution_frequency,
				start_by_block,
				name
			});

			<NextRoscaId<T>>::put(new_rosca_id + 1);

			Ok(())

		}

		#[pallet::call_index(1)]
		pub fn join_rosca(origin: OriginFor<T>, rosca_id: u32, position: Option<u32>) -> DispatchResult {

			let signer = ensure_signed(origin)?;
			ensure!(Self::participants(rosca_id, &signer).is_none(), Error::<T>::AlreadyJoined);
			ensure!(Self::invited_preverified_participants(rosca_id, &signer).is_some(), Error::<T>::NotInvited);
			let pending_rosca = Self::rosca_details(rosca_id).ok_or(Error::<T>::RoscaNotFound)?;
			let current_block = <frame_system::Pallet<T>>::block_number();
			ensure!(current_block < pending_rosca.start_by_block, Error::<T>::StartByBlockMustBeFuture);
			
			let mut pending_rosca_order = Self::pending_rosca_participants_order(rosca_id).ok_or(Error::<T>::RoscaNotFound)?;
			
			let mut participant_position: u32;

			if let Some(position_index) = position {
				let current_position: &mut Option<AccountIdOf<T>> = pending_rosca_order.get_mut(position_index as usize).ok_or(Error::<T>::PositionTooLarge)?;
				ensure!(current_position.is_none(), Error::<T>::PositionAlreadyFilled);
				*current_position = Some(signer.clone());
				participant_position = position_index as u32;
			} else {

				let position_index = pending_rosca_order.iter().position(|participant| participant.is_none()).ok_or(Error::<T>::AllPositionsFilled)?;
				pending_rosca_order[position_index] = Some(signer.clone());
				participant_position = position_index as u32;

			}

			let rosca_account_id = Self::rosca_account_id(rosca_id);

			PendingRoscaParticipantsOrder::<T>::insert(rosca_id, pending_rosca_order);
			RoscaParticipants::<T>::insert(rosca_id, &signer, participant_position);

			let mut current_participant_count = Self::participants_count(rosca_id).ok_or(Error::<T>::RoscaParticipantCountNotFound)?;
			current_participant_count = current_participant_count.checked_add(1).ok_or(Error::<T>::ArithmeticOverflow)?;

			RoscaParticipantsCount::<T>::insert(rosca_id, current_participant_count);

			Ok(())
		}

		#[pallet::call_index(2)]
		pub fn leave_rosca(origin: OriginFor<T>, rosca_id: u32) -> DispatchResult {

			let signer = ensure_signed(origin)?;
			ensure!(Self::active_roscas(rosca_id).is_none(), Error::<T>::RoscaAlreadyActive);
			let participant_index = Self::participants(rosca_id, &signer).ok_or(Error::<T>::NotAParticipant)?;
			let pending_rosca = Self::rosca_details(rosca_id).ok_or(Error::<T>::RoscaNotFound)?;
			let current_block = <frame_system::Pallet<T>>::block_number();

			let rosca_account_id = Self::rosca_account_id(rosca_id);

			let mut participants_order = Self::pending_rosca_participants_order(rosca_id).ok_or(Error::<T>::RoscaParticipantsNotFound)?;
			participants_order[participant_index as usize] = None;

			RoscaParticipants::<T>::remove(rosca_id, &signer);
			PendingRoscaParticipantsOrder::<T>::insert(rosca_id, participants_order);
			let mut current_participant_count = Self::participants_count(rosca_id).ok_or(Error::<T>::RoscaParticipantCountNotFound)?;
			current_participant_count = current_participant_count.checked_sub(1).ok_or(Error::<T>::ArithmeticUnderflow)?;

			RoscaParticipantsCount::<T>::insert(rosca_id, current_participant_count);

			Ok(())
		}

		#[pallet::call_index(3)]
		pub fn start_rosca(origin: OriginFor<T>, rosca_id: u32) -> DispatchResult {

			let signer = ensure_signed(origin)?;
			ensure!(Self::active_roscas(rosca_id).is_none(), Error::<T>::RoscaAlreadyActive);
			let participant_index = Self::participants(rosca_id, &signer).ok_or(Error::<T>::NotAParticipant)?;
			let pending_rosca = Self::rosca_details(rosca_id).ok_or(Error::<T>::RoscaNotFound)?;
			let mut pending_rosca_order = Self::pending_rosca_participants_order(rosca_id).ok_or(Error::<T>::RoscaParticipantsNotFound)?;
			let current_block = <frame_system::Pallet<T>>::block_number();
			ensure!(current_block < pending_rosca.start_by_block, Error::<T>::StartByBlockMustBeFuture);
			let current_pending_participant_count = Self::participants_count(rosca_id).ok_or(Error::<T>::RoscaParticipantCountNotFound)?;
			ensure!(current_pending_participant_count >= pending_rosca.minimum_participant_threshold, Error::<T>::ParticipantThresholdNotMet);


			let mut order = pending_rosca_order.clone().into_inner();
			order.reverse();
			
			let filtered_order: Vec<AccountIdOf<T>> = order.into_iter().filter_map(|p| p).collect(); 
			let mut active_rosca_order: BoundedVec<AccountIdOf<T>, T::MaxParticipants> = BoundedVec::try_from(filtered_order).map_err(|_| Error::<T>::TooManyProposedParticipants)?;

			if pending_rosca.random_order {
				Self::shuffle_participants(&mut active_rosca_order);		
			}

			let first_eligible_claimant = &active_rosca_order[active_rosca_order.len() - 1 as usize];
			EligibleClaimant::<T>::insert(rosca_id, first_eligible_claimant);

			active_rosca_order.try_rotate_right(1).map_err(|_| Error::<T>::ArithmeticError)?;

			ActiveRoscaParticipantsOrder::<T>::insert(rosca_id, active_rosca_order);

			let next_pay_by_block = current_block.checked_add(&pending_rosca.contribution_frequency).ok_or(Error::<T>::ArithmeticOverflow)?;
			let mut final_pay_by_block: BlockNumberFor<T> = next_pay_by_block;
			for _ in 1..current_pending_participant_count {
				final_pay_by_block = final_pay_by_block.checked_add(&pending_rosca.contribution_frequency).ok_or(Error::<T>::ArithmeticOverflow)?;
			}

			NextPayByBlock::<T>::insert(rosca_id, next_pay_by_block);
			FinalPayByBlock::<T>::insert(rosca_id, final_pay_by_block);

			ActiveRoscas::<T>::insert(rosca_id, pending_rosca);	
			PendingRoscaDetails::<T>::remove(rosca_id);
			
			Self::deposit_event(Event::<T>::RoscaStarted {
				rosca_id,
			});

			Ok(())

		}

		#[pallet::call_index(4)]
		pub fn contribute_to_rosca(origin: OriginFor<T>, rosca_id: u32) -> DispatchResult {

			let signer = ensure_signed(origin)?;
			ensure!(Self::participants(rosca_id, &signer).is_some(), Error::<T>::NotAParticipant);
			ensure!(Self::completed_roscas(rosca_id).is_none(), Error::<T>::RoscaAlreadyCompleted);
			let rosca = Self::active_roscas(rosca_id).ok_or(Error::<T>::RoscaNotActive)?;
			let mut eligible_claimant = Self::eligible_claimant(rosca_id).ok_or(Error::<T>::NoEligbleClaimant)?;
			
			ensure!(eligible_claimant != signer, Error::<T>::CantContributeToSelf);
			ensure!(Self::current_contributors(rosca_id, &signer).is_none(), Error::<T>::AlreadyContributed);
			let current_block = frame_system::Pallet::<T>::block_number();
			let final_pay_by_block = Self::final_pay_by_block(rosca_id).ok_or(Error::<T>::FinalPayBlockNotFound)?;
			let mut next_pay_by_block = Self::next_pay_by_block(rosca_id).ok_or(Error::<T>::NoNextPayByBlock)?;

			let mut active_rosca_participants_order = Self::active_rosca_participants_order(rosca_id).ok_or(Error::<T>::RoscaParticipantsNotFound)?;

			let rosca_account_id = Self::rosca_account_id(rosca_id);


			// current_block = 39, next_pay_by_block = 11, final_pay_by_block = 41
			while current_block >= next_pay_by_block {

				for participant in active_rosca_participants_order.iter() {
					if *participant == eligible_claimant {
						continue
					}
					if Self::current_contributors(rosca_id, participant).is_none() {
						// They might be defaulter and get their security deposit to see if they have a buffer.
						let mut participant_deposit = Self::security_deposit(rosca_id, participant).unwrap_or(0);
						let mut defaulter = false;
						if participant_deposit < rosca.contribution_amount {
							defaulter = true;
							if participant_deposit > 0 {
								T::NativeBalance::transfer(&rosca_account_id, &eligible_claimant.clone(), participant_deposit.into(), Expendable)?;
								RoscaSecurityDeposits::<T>::insert(rosca_id, participant, 0);
							}
						} else {
							// transfer the amount
							T::NativeBalance::transfer(&rosca_account_id, &eligible_claimant.clone(), rosca.contribution_amount.into(), Expendable)?;
							let deposit_remaining_after_transfer = participant_deposit.checked_sub(rosca.contribution_amount).unwrap_or(0);
							RoscaSecurityDeposits::<T>::insert(rosca_id, participant, &deposit_remaining_after_transfer);
						}

						
						if defaulter {
							// They are a defaulter and we should increment their default count
							DefaultCount::<T>::mutate(rosca_id, &participant, |count| *count = count.saturating_add(1));
						}  // Else they had a buffer deposit and therefore not a defaulter just forgetful. 
					}
				}

				next_pay_by_block = next_pay_by_block.checked_add(&rosca.contribution_frequency).ok_or(Error::<T>::ArithmeticOverflow)?;

				if next_pay_by_block > final_pay_by_block {
					// return early since everything has been processed and current_block > final_pay_block
					CompletedRoscas::<T>::insert(rosca_id, ());
					ActiveRoscas::<T>::remove(rosca_id);
					Self::deposit_event(Event::<T>::RoscaComplete {
						rosca_id,
					});
					return Ok(());
				}

				NextPayByBlock::<T>::insert(rosca_id, next_pay_by_block);
				eligible_claimant = active_rosca_participants_order[active_rosca_participants_order.len() - 1 as usize].clone();
				EligibleClaimant::<T>::insert(rosca_id, eligible_claimant.clone());
				active_rosca_participants_order.try_rotate_right(1).map_err(|_| Error::<T>::ArithmeticError)?;
				ActiveRoscaParticipantsOrder::<T>::insert(rosca_id, active_rosca_participants_order.clone());
				// Clear contributions count and contributors
				CurrentContributors::<T>::clear_prefix(rosca_id, (active_rosca_participants_order.len() - 1) as u32, None);
				CurrentContribtionCount::<T>::insert(rosca_id, 0);
				
			}

			// If we are here we must have caught up to the current round


			T::NativeBalance::transfer(&signer, &eligible_claimant, rosca.contribution_amount.into(), Expendable)?;
			CurrentContributors::<T>::insert(rosca_id, &signer, ());
			let current_contribution_count = Self::current_contribution_count(rosca_id).checked_add(1).ok_or(Error::<T>::ArithmeticOverflow)?;
			CurrentContribtionCount::<T>::insert(rosca_id, current_contribution_count);


			if current_contribution_count == (active_rosca_participants_order.len() - 1) as u32 {
				// This means it's the final contribution for the round so we can progress

				next_pay_by_block = next_pay_by_block.checked_add(&rosca.contribution_frequency).ok_or(Error::<T>::ArithmeticOverflow)?;

				if next_pay_by_block > final_pay_by_block {
					// Mean it was the final contribution of the final round
					CompletedRoscas::<T>::insert(rosca_id, ());
					ActiveRoscas::<T>::remove(rosca_id);
					Self::deposit_event(Event::<T>::RoscaComplete {
						rosca_id,
					});
					return Ok(());
				}

				NextPayByBlock::<T>::insert(rosca_id, next_pay_by_block);
				eligible_claimant = active_rosca_participants_order[active_rosca_participants_order.len() - 1 as usize].clone();
				EligibleClaimant::<T>::insert(rosca_id, &eligible_claimant);
				active_rosca_participants_order.try_rotate_right(1).map_err(|_| Error::<T>::ArithmeticError)?;
				ActiveRoscaParticipantsOrder::<T>::insert(rosca_id, active_rosca_participants_order.clone());
				CurrentContributors::<T>::clear_prefix(rosca_id, (active_rosca_participants_order.len() - 1) as u32, None);
				CurrentContribtionCount::<T>::insert(rosca_id, 0);

			}

			
			Ok(())
		}


		#[pallet::call_index(5)]
		pub fn manually_end_rosca(origin: OriginFor<T>, rosca_id: u32) -> DispatchResult {
			let signer = ensure_signed(origin)?;
			let current_block = frame_system::Pallet::<T>::block_number();
			let rosca = Self::active_roscas(rosca_id).ok_or(Error::<T>::RoscaNotActive)?;
			let mut eligible_claimant = Self::eligible_claimant(rosca_id).ok_or(Error::<T>::NoEligbleClaimant)?;
			let final_pay_by_block = Self::final_pay_by_block(rosca_id).ok_or(Error::<T>::FinalPayBlockNotFound)?;
			ensure!(current_block > final_pay_by_block, Error::<T>::FinalPayByBlockMustBePast);
			let mut next_pay_by_block = Self::next_pay_by_block(rosca_id).ok_or(Error::<T>::NoNextPayByBlock)?;
			let mut active_rosca_participants_order = Self::active_rosca_participants_order(rosca_id).ok_or(Error::<T>::RoscaParticipantsNotFound)?;

			let rosca_account_id = Self::rosca_account_id(rosca_id);

			while next_pay_by_block <= final_pay_by_block {

				for participant in active_rosca_participants_order.iter() {
					if *participant == eligible_claimant {
						continue
					}
					if Self::current_contributors(rosca_id, participant).is_none() {
						// They might be defaulter and get their security deposit to see if they have a buffer.
						let mut participant_deposit = Self::security_deposit(rosca_id, participant).unwrap_or(0);
						let mut defaulter = false;
						if participant_deposit < rosca.contribution_amount {
							defaulter = true;
							if participant_deposit > 0 {
								T::NativeBalance::transfer(&rosca_account_id, &eligible_claimant.clone(), participant_deposit.into(), Expendable)?;
								RoscaSecurityDeposits::<T>::insert(rosca_id, participant, 0);
							}
						} else {
							// transfer the amount
							T::NativeBalance::transfer(&rosca_account_id, &eligible_claimant.clone(), rosca.contribution_amount.into(), Expendable)?;
							let deposit_remaining_after_transfer = participant_deposit.checked_sub(rosca.contribution_amount).unwrap_or(0);
							RoscaSecurityDeposits::<T>::insert(rosca_id, participant, &deposit_remaining_after_transfer);
						}

						
						if defaulter {
							// They are a defaulter and we should increment their default count
							DefaultCount::<T>::mutate(rosca_id, &participant, |count| *count = count.saturating_add(1));
						}  // Else they had a buffer deposit and therefore not a defaulter just forgetful. 
					}
				}

				next_pay_by_block = next_pay_by_block.checked_add(&rosca.contribution_frequency).ok_or(Error::<T>::ArithmeticOverflow)?;
				eligible_claimant = active_rosca_participants_order[active_rosca_participants_order.len() - 1 as usize].clone();
				EligibleClaimant::<T>::insert(rosca_id, eligible_claimant.clone());
				active_rosca_participants_order.try_rotate_right(1).map_err(|_| Error::<T>::ArithmeticError)?;
			}

			ensure!(next_pay_by_block == final_pay_by_block.checked_add(&rosca.contribution_frequency).ok_or(Error::<T>::ArithmeticOverflow)?, Error::<T>::ArithmeticError);

			CompletedRoscas::<T>::insert(rosca_id, ());
			ActiveRoscas::<T>::remove(rosca_id);

			// End the Rosca 
			Self::deposit_event(Event::<T>::RoscaComplete {
				rosca_id,
			});

			Ok(())
		}

		#[pallet::call_index(6)]
		pub fn claim_security_deposit(origin: OriginFor<T>, rosca_id: u32) -> DispatchResult {
			let signer = ensure_signed(origin)?;
			let current_block = frame_system::Pallet::<T>::block_number();
			let final_pay_by_block = Self::final_pay_by_block(rosca_id).ok_or(Error::<T>::FinalPayBlockNotFound)?;
			ensure!(current_block > final_pay_by_block, Error::<T>::FinalPayByBlockMustBePast);
			ensure!(Self::completed_roscas(rosca_id).is_some(), Error::<T>::RoscaNotCompleted);
			let mut participant_deposit = Self::security_deposit(rosca_id, &signer).ok_or(Error::<T>::SecurityDepositNotFound)?;
			let rosca_account_id = Self::rosca_account_id(rosca_id);
			T::NativeBalance::transfer(&rosca_account_id, &signer, participant_deposit.into(), Expendable)?;
			RoscaSecurityDeposits::<T>::remove(rosca_id, &signer);
			Ok(())
		}

		#[pallet::call_index(7)]
		pub fn add_to_security_deposit(origin: OriginFor<T>, rosca_id: u32, amount: u32) -> DispatchResult {
			let signer = ensure_signed(origin)?;
			ensure!(Self::participants(rosca_id, &signer).is_some(), Error::<T>::NotAParticipant);
			ensure!(Self::completed_roscas(rosca_id).is_none(), Error::<T>::RoscaAlreadyCompleted);
			let rosca_account_id = Self::rosca_account_id(rosca_id);
			T::NativeBalance::transfer(&signer, &rosca_account_id, amount.into(), Expendable)?;

			let mut participant_deposit = Self::security_deposit(rosca_id, &signer).unwrap_or(0);
			let new_deposit_balance = participant_deposit.checked_add(amount).ok_or(Error::<T>::ArithmeticOverflow)?;
			RoscaSecurityDeposits::<T>::insert(rosca_id, &signer, new_deposit_balance);
			Ok(())
		}
	}
}

impl<T: Config> Pallet<T> {
	pub fn rosca_account_id(rosca_id: u32) -> T::AccountId {
		T::PalletId::get().into_sub_account_truncating(rosca_id)
	}

	pub fn shuffle_participants(participants: &mut BoundedVec<AccountIdOf<T>, T::MaxParticipants>) {
		// Fisher-Yates Shuffle
		let current_block = <frame_system::Pallet<T>>::block_number();
		let block_hash = <frame_system::Pallet<T>>::block_hash(current_block);
		let truncated_seed = blake2_128(block_hash.as_ref()); // Truncate to 16 bytes for the shuffle
		
		let mut rng_seed = truncated_seed;
		// let mut rng_seed = &[0x02; 16];

		let mut available_indices: Vec<usize> = (0..participants.len()).collect(); // change this
		let mut shuffled_indices = Vec::with_capacity(participants.len()); // Use bounded vec?

		while !available_indices.is_empty() {

			let mut rng_seed = &blake2_128(&rng_seed[..]);


			let random_index = (rng_seed[0] as usize) % available_indices.len();
			let selected_index = available_indices[random_index];


			shuffled_indices.push(selected_index);
			available_indices.remove(random_index);
		}

		let mut shuffled_participants = participants.clone();
		for (i, &new_idx) in shuffled_indices.iter().enumerate() { 
			shuffled_participants[i] = participants[new_idx].clone();
		}

		*participants = shuffled_participants;
	}

	
}
