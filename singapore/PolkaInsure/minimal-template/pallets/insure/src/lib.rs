#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;
pub use frame::prelude::*;

#[frame::pallet]
pub mod pallet {
	pub use super::*;

	use frame::traits::fungible::{self};

	pub type BalanceOf<T> = <<T as Config>::NativeBalance as fungible::Inspect<
		<T as frame_system::Config>::AccountId,
	>>::Balance;

	#[pallet::config]
	pub trait Config: frame_system::Config {
		
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

		/// Type to access the Balances Pallet.
		type NativeBalance: fungible::Inspect<Self::AccountId>
			+ fungible::Mutate<Self::AccountId>
			+ fungible::hold::Inspect<Self::AccountId>
			+ fungible::hold::Mutate<Self::AccountId>
			+ fungible::freeze::Inspect<Self::AccountId>;

			#[pallet::constant]
			type InitialScore: Get<u32>;

			#[pallet::constant]
			type PenaltyScore: Get<u32>;

			#[pallet::constant]
			type SelfPenaltyScore: Get<u32>;

	}

	#[pallet::pallet]
	pub struct Pallet<T>(_);

	#[pallet::storage]
	pub type RatingMap<T: Config> = StorageMap<Hasher = Blake2_128Concat, Key = T::AccountId, Value = u32>;

	#[pallet::storage]
	pub type FundInsurers<T: Config> = StorageMap<Hasher = Blake2_128Concat, Key = (u32, T::AccountId), Value = bool>; // (fund#, account#) -> bool

	#[pallet::storage]
	pub type FundInsurees<T: Config> = StorageMap<Hasher = Blake2_128Concat, Key = (u32, T::AccountId), Value = bool>; // (fund#, account#) -> bool

	#[pallet::storage]
	pub type FundAmount<T: Config> = StorageMap<Hasher = Blake2_128Concat, Key = u32, Value = BalanceOf<T>>;

	#[pallet::storage]
	pub type FundInfo<T: Config> = StorageMap<Hasher = Blake2_128Concat, Key = u32, Value = (BalanceOf<T>, BalanceOf<T>, u32, T::AccountId)>; // (premium, claim amount, threshold number of votes, fund address)

	#[pallet::storage]
	pub type NextFundId<T: Config> = StorageValue<_, u32>;

	#[pallet::storage]
	pub type ClaimInfo<T: Config> = StorageMap<Hasher = Blake2_128Concat, Key = u32, Value = (u32, u32, u32, u32, T::AccountId, bool)>; // (ay, nay, voter count, fund id, insuree fund address, claimed yet)

	#[pallet::storage]
	pub type NextClaimId<T: Config> = StorageValue<_, u32>;

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		Penalised {
			other_id: T::AccountId,
			other_new_score: u32,
			self_id: T::AccountId,
			self_new_score: u32,
		},
		RetrievedScore {
			account: T::AccountId,
			score: u32,	
		},
		CreatedFund {
			fund_id: u32,
			premium: BalanceOf<T>,
			claim_amount: BalanceOf<T>,
			threshold: u32,
			fund_address: T::AccountId,
		},
		InsurerJoinedFund {
			fund_id: u32,
			insurer_id: T::AccountId,
		},
		InsureeJoinedFund {
			fund_id: u32,
			insuree_id: T::AccountId,
		},
		InsurerWithdraw {
			fund_id: u32,
			insurer_id: T::AccountId,
		},
		InsureeMakesClaim {
			fund_id: u32,
			insuree_id: T::AccountId,
		},
		VoteClaim {
			claim_id: u32,
			voter_id: T::AccountId,
			vote_approval: bool,
		},
		ClaimApproved {
			claim_id: u32,
			insuree_id: T::AccountId,
		},
	}

	#[pallet::error]
	pub enum Error<T> {
		InsufficientScore,
		TransferFailed,
		InsurerNotInFund,
		InsureeNotInFund,
		InsufficientFunds,
		AlreadyClaimed,
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {

		#[pallet::weight(Weight::default())]
		#[pallet::call_index(0)]
		pub fn penalise_score(origin: OriginFor<T>, account: T::AccountId) -> DispatchResult {
			let _who = ensure_signed(origin)?;

			let score = RatingMap::<T>::get(&account).unwrap_or(T::InitialScore::get());
			let new_score = score - T::PenaltyScore::get();
			ensure!(new_score > 0, Error::<T>::InsufficientScore);

			let my_score = RatingMap::<T>::get(&account).unwrap_or(T::InitialScore::get());
			let my_new_score = my_score - T::SelfPenaltyScore::get();
			ensure!(my_new_score > 0, Error::<T>::InsufficientScore);

			RatingMap::<T>::insert(&account, new_score);
			RatingMap::<T>::insert(&_who, my_new_score);

			Self::deposit_event(Event::Penalised {
				other_id: account,
				other_new_score: new_score,
				self_id: _who,
				self_new_score: my_new_score,
			});

			Ok(())
		}

		#[pallet::weight(Weight::default())]
		#[pallet::call_index(1)]
		pub fn create_fund(origin: OriginFor<T>, premium: BalanceOf<T>, claim_amount: BalanceOf<T>, threshold: u32, fund_address: T::AccountId) -> DispatchResult {
			let _who = ensure_signed(origin)?;

			let fund_id = NextFundId::<T>::get();
			match fund_id {
				Some(f) => { 
					NextFundId::<T>::put(f + 1);
					FundInfo::<T>::insert(f, (premium, claim_amount, threshold, fund_address.clone()));
					Self::deposit_event(Event::CreatedFund {
						fund_id: f,
						premium: premium,
						claim_amount: claim_amount,
						threshold: threshold,
						fund_address: fund_address,
					});
				},
				None => { 
					NextFundId::<T>::put(1);
					FundInfo::<T>::insert(1, (premium, claim_amount, threshold, fund_address.clone()));
					Self::deposit_event(Event::CreatedFund {
						fund_id: 1,
						premium: premium,
						claim_amount: claim_amount,
						threshold: threshold,
						fund_address: fund_address,
					});
				},
			}

			Ok(())
		}

		#[pallet::weight(Weight::default())]
		#[pallet::call_index(2)]
		pub fn insurer_join_fund(origin: OriginFor<T>, fund_id: u32) -> DispatchResult {
			use sp_runtime::traits::Zero;
			use frame::traits::ExistenceRequirement;

			let _who = ensure_signed(origin)?;

			let fund = FundInfo::<T>::get(fund_id).unwrap();
			let (_, claim_amount, _, fund_address) = fund; // for simplicity assume they can join with claim amount
			let fund_amount = FundAmount::<T>::get(fund_id).unwrap_or(BalanceOf::<T>::zero());
			let new_fund_amount = fund_amount + claim_amount;
			FundAmount::<T>::insert(fund_id, new_fund_amount);
			FundInsurers::<T>::insert((fund_id, _who), true);
			BalanceOf::<T>::transfer(&_who, &fund_address, claim_amount, ExistenceRequirement::KeepAlive)
				.ok_or(Error::<T>::TransferFailed);

			Self::deposit_event(Event::InsurerJoinedFund {
				fund_id: fund_id,
				insurer_id: _who,
			});

			Ok(())
		}

		#[pallet::weight(Weight::default())]
		#[pallet::call_index(3)]
		pub fn insuree_join_fund(origin: OriginFor<T>, fund_id: u32) -> DispatchResult {
			use sp_runtime::traits::Zero;
			use frame::traits::ExistenceRequirement;

			let _who = ensure_signed(origin)?;

			let fund = FundInfo::<T>::get(fund_id).unwrap();
			let (premium, _, _, fund_address) = fund;
			let fund_amount = FundAmount::<T>::get(fund_id).unwrap_or(BalanceOf::<T>::zero());
			let new_fund_amount = fund_amount + premium;
			FundAmount::<T>::insert(fund_id, new_fund_amount);
			FundInsurees::<T>::insert((fund_id, _who), true);
			BalanceOf::<T>::transfer(&_who, &fund_address, premium, ExistenceRequirement::KeepAlive)
				.ok_or(Error::<T>::TransferFailed);

			Self::deposit_event(Event::InsureeJoinedFund {
				fund_id: fund_id,
				insuree_id: _who,
			});

			Ok(())
		}

		#[pallet::weight(Weight::default())]
		#[pallet::call_index(4)]
		pub fn insurer_withdraw(origin: OriginFor<T>, fund_id: u32) -> DispatchResult {
			use sp_runtime::traits::Zero;
			use frame::traits::ExistenceRequirement;

			let _who = ensure_signed(origin)?;

			ensure!(FundInsurers::<T>::get((fund_id, _who)).unwrap_or(false) == true, Error::<T>::InsurerNotInFund);

			let fund = FundInfo::<T>::get(fund_id).unwrap();
			let (_, claim_amount, _, fund_address) = fund;
			let fund_amount = FundAmount::<T>::get(fund_id).unwrap_or(BalanceOf::<T>::zero());
			let new_fund_amount = fund_amount - claim_amount;
			FundAmount::<T>::insert(fund_id, new_fund_amount);
			FundInsurers::<T>::insert((fund_id, _who), false);
			BalanceOf::<T>::transfer(&fund_address, &_who, claim_amount, ExistenceRequirement::KeepAlive)
				.ok_or(Error::<T>::TransferFailed);

			Self::deposit_event(Event::InsurerWithdraw {
				fund_id: fund_id,
				insurer_id: _who,
			});

			Ok(())
		}

		#[pallet::weight(Weight::default())]
		#[pallet::call_index(5)]
		pub fn insuree_makes_claim(origin: OriginFor<T>, fund_id: u32) -> DispatchResult {
			use sp_runtime::traits::Zero;
			let _who = ensure_signed(origin)?;

			ensure!(FundInsurees::<T>::get((fund_id, _who.clone())).unwrap_or(false) == true, Error::<T>::InsureeNotInFund);

			let fund = FundInfo::<T>::get(fund_id).unwrap();
			let (_, claim_amount, _, _) = fund;
			let fund_amount = FundAmount::<T>::get(fund_id).unwrap_or(BalanceOf::<T>::zero());
			ensure!(fund_amount >= claim_amount, Error::<T>::InsufficientFunds);
		
			// create claim request
			let claim_id = NextClaimId::<T>::get();
			let score = RatingMap::<T>::get(&_who).unwrap_or(T::InitialScore::get());
			match claim_id {
				Some(c) => { 
					NextClaimId::<T>::put(c + 1);
					ClaimInfo::<T>::insert(c, (score, 0, 1, fund_id, _who.clone(), false));
				},
				None => { 
					NextClaimId::<T>::put(1);
					ClaimInfo::<T>::insert(1, (score, 0, 1, fund_id, _who.clone(), false));
				},
			}

			Self::deposit_event(Event::InsureeMakesClaim {
				fund_id: fund_id,
				insuree_id: _who,
			});

			Ok(())
		}

		#[pallet::weight(Weight::default())]
		#[pallet::call_index(6)]
		pub fn vote_claim_approval(origin: OriginFor<T>, claim_id: u32, vote: bool) -> DispatchResult {
			let _who = ensure_signed(origin)?;

			let claim = ClaimInfo::<T>::get(claim_id).unwrap();
			let (ay, nay, voter_count, fund_id, insuree_fund_address, claimed_yet) = claim;
			ensure!(claimed_yet == false, Error::<T>::AlreadyClaimed);

			let score = RatingMap::<T>::get(&_who).unwrap_or(T::InitialScore::get());
			let new_voter_count = voter_count + 1;
			
			let fund = FundInfo::<T>::get(fund_id).unwrap();
			let (_, claim_amount, threshold, fund_address) = fund;

			let new_ay = ay;
			let new_nay = nay;
			if vote {
				new_ay = ay + score;
			} else {
				new_nay = nay + score;
			}

			if new_voter_count >= threshold && new_ay >= new_nay {
				use sp_runtime::traits::Zero;
				use frame::traits::ExistenceRequirement;

				let fund_amount = FundAmount::<T>::get(fund_id).unwrap_or(BalanceOf::<T>::zero());
				let new_fund_amount = fund_amount - claim_amount;
				ensure!(new_fund_amount >= BalanceOf::<T>::zero(), Error::<T>::InsufficientFunds);
				BalanceOf::<T>::transfer(&fund_address, &insuree_fund_address, claim_amount, ExistenceRequirement::KeepAlive)
					.ok_or(Error::<T>::TransferFailed);

				FundAmount::<T>::insert(fund_id, new_fund_amount);
				ClaimInfo::<T>::insert(claim_id, (new_ay, new_nay, new_voter_count, fund_id, insuree_fund_address, true));
				Self::deposit_event(Event::VoteClaim {
					claim_id: claim_id,
					voter_id: _who,
					vote_approval: vote,
				});
				Self::deposit_event(Event::ClaimApproved {
					claim_id: claim_id,
					insuree_id: insuree_fund_address,
				});
			} else {
				ClaimInfo::<T>::insert(claim_id, (new_ay, new_nay, new_voter_count, fund_id, insuree_fund_address, false));
				Self::deposit_event(Event::VoteClaim {
					claim_id: claim_id,
					voter_id: _who,
					vote_approval: vote,
				});
			}

			Ok(())
		}
	}
}
