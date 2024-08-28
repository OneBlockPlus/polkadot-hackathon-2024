#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Decode, Encode};
pub use pallet::*;
use scale_info::prelude::string::ToString;
#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;
pub mod weights;
use scale_info::prelude::string::String;
pub use weights::*;
// pub mod rpc;
pub mod types;

#[frame_support::pallet]
pub mod pallet {

	use super::*;
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
	use types::*;

	#[pallet::pallet]
	#[pallet::without_storage_info]
	pub struct Pallet<T>(_);

	#[pallet::config]
	pub trait Config: frame_system::Config {
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		type WeightInfo: WeightInfo;
	}

	#[pallet::storage]
	#[pallet::getter(fn _event_ids)]
	pub type _event_ids<T> = StorageValue<_, u32>;

	/// Get the details of a events by its' id.
	#[pallet::storage]
	#[pallet::getter(fn event_by_id)]
	pub type EventById<T: Config> = StorageMap<_, Twox64Concat, u32, EventAuction>;

	#[pallet::storage]
	#[pallet::getter(fn _token_ids)]
	pub type _token_ids<T> = StorageValue<_, u32>;

	/// Get the details of a tokens by its' id.
	#[pallet::storage]
	#[pallet::getter(fn token_by_id)]
	pub type TokenById<T: Config> = StorageMap<_, Twox64Concat, u32, TokenAuction>;

	#[pallet::storage]
	#[pallet::getter(fn _donations_ids)]
	pub type _donations_ids<T> = StorageValue<_, u32>;

	/// Get the donations
	#[pallet::storage]
	#[pallet::getter(fn donation_by_id)]
	pub type DonationsById<T: Config> = StorageMap<_, Twox64Concat, u32, DONATION>;

	#[pallet::storage]
	#[pallet::getter(fn _bid_ids)]
	pub type _bid_ids<T> = StorageValue<_, u32>;

	/// Get the details of a bids by its' id.
	#[pallet::storage]
	#[pallet::getter(fn bid_by_id)]
	pub type BidById<T: Config> = StorageMap<_, Twox64Concat, u32, TokenBid>;




	#[pallet::storage]
	#[pallet::getter(fn _ticket_ids)]
	pub type _ticket_ids<T> = StorageValue<_, u32>;

	/// Get the details of a Ticket Holder by its' id.
	#[pallet::storage]
	#[pallet::getter(fn ticket_by_id)]
	pub type TicketById<T: Config> = StorageMap<_, Twox64Concat, u32, TicketHolders>;


	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		SomethingStored { something: u32, who: T::AccountId },
	}

	#[pallet::error]
	pub enum Error<T> {
		NoneValue,
		StorageOverflow,
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		#[pallet::call_index(0)]
		#[pallet::weight(T::WeightInfo::create_event())]
		pub fn create_event(
			origin: OriginFor<T>,
			_event_uri: String,
			_dao_id: u32,
			_user_id: u32,
		) -> DispatchResult {
			let mut new_id = 0;
			match <_event_ids<T>>::try_get() {
				Ok(old) => {
					new_id = old;
					<_event_ids<T>>::put(new_id + 1);
				},
				Err(_) => {
					<_event_ids<T>>::put(1);
				},
			}

			let new_event = &mut EventAuction {
				id: new_id,
				dao_id: _dao_id,
				user_id: _user_id,
				event_uri: _event_uri.clone(),
				event_wallet: _event_uri.clone(),
				participant: 0,
				status: String::from("started"),
			};

			EventById::<T>::insert(new_id, new_event);
			Ok(())
		}

		#[pallet::call_index(1)]
		#[pallet::weight(T::WeightInfo::claim_token())]
		pub fn claim_token(
			origin: OriginFor<T>,
			_dao_id: u32,
			_event_id: u32,
			_token_uri: String,
			_token_price: u64,
			_token_userid: u32,
			_token_wallet: String,
			_token_person: String,
			_highest_bid_date: String,
		) -> DispatchResult {
			let mut new_id = 0;
			match <_token_ids<T>>::try_get() {
				Ok(old) => {
					new_id = old;
					<_token_ids<T>>::put(new_id + 1);
				},
				Err(_) => {
					<_token_ids<T>>::put(1);
				},
			}

			let new_token = &mut TokenAuction {
				id: new_id,

				dao_id: _dao_id,
				event_id: _event_id,
				token_uri: _token_uri.clone(),
				token_wallet: _token_wallet.clone(),
				highest_amount: _token_price.clone(),
				token_owner: _token_userid.clone(),
				highest_bidder: _token_person.clone(),
				highest_bidder_userid: _token_userid.clone(),
				highest_bidder_wallet: _token_wallet.clone(),
				highest_bid_date: _highest_bid_date.clone(),
			};

			TokenById::<T>::insert(new_id, new_token);
			Ok(())
		}

		#[pallet::call_index(2)]
		#[pallet::weight(T::WeightInfo::add_donation())]
		pub fn add_donation(
			origin: OriginFor<T>,
			_event_id: u32,
			_doantion: u64,
			_userid: u32,
		) -> DispatchResult {
			let mut new_id = 0;
			match <_donations_ids<T>>::try_get() {
				Ok(old) => {
					new_id = old;
					<_donations_ids<T>>::put(new_id + 1);
				},
				Err(_) => {
					<_donations_ids<T>>::put(1);
				},
			}

			let new_donation = &mut DONATION {
				id: new_id,
				event_id: _event_id,
				userid: _userid.clone(),
				donation: _doantion,
			};

			DonationsById::<T>::insert(new_id, new_donation);

			Ok(())
		}

		#[pallet::call_index(3)]
		#[pallet::weight(T::WeightInfo::bid_token())]
		pub fn bid_token(
			origin: OriginFor<T>,
			_amount: u64,
			_nft_id: u32,
			_event_id: u32,
			_dao_id: u32,
			_date: String,
			_bidder: String,
			_wallet_address: String,
			_bidder_userid: u32,
		) -> DispatchResult {
			let mut new_id = 0;
			match <_bid_ids<T>>::try_get() {
				Ok(old) => {
					new_id = old;
					<_bid_ids<T>>::put(new_id + 1);
				},
				Err(_) => {
					<_bid_ids<T>>::put(1);
				},
			}

			let new_bid = &mut TokenBid {
				id: new_id,
				nft_id: _nft_id.clone(),
				event_id: _event_id.clone(),
				dao_id: _dao_id.clone(),
				date: _date.clone(),
				bidder: _bidder.clone(),
				wallet_address: _wallet_address.clone(),
				bidder_userid: _bidder_userid.clone(),
				bid_amount:_amount.clone()
			};

			BidById::<T>::insert(new_id, new_bid);


			if TokenById::<T>::contains_key(_nft_id.clone()){
				let old_token:&mut TokenAuction = &mut  TokenAuction{ id: 0, event_id:0, dao_id: 0, token_owner:0,token_uri: "".to_string(), token_wallet: "".to_string(), highest_amount: 0, highest_bidder: "".to_string(), highest_bidder_userid: 0, highest_bidder_wallet: "".to_string(), highest_bid_date: "".to_string() };

				match <TokenById<T>>::try_get(_nft_id.clone()){
					Ok(old)=>{
						*old_token = old;
					}
					Err(_)=>{}
				}
				old_token.highest_amount = _amount.clone();
				old_token.highest_bidder = _bidder.clone();
				old_token.highest_bidder_userid = _bidder_userid.clone();
				old_token.highest_bidder_wallet = _wallet_address.clone();
				old_token.highest_bid_date = _date.clone();


				TokenById::<T>::set(_nft_id.clone(), Some(old_token.clone()));
			}


			Ok(())
		}


		#[pallet::call_index(4)]
		#[pallet::weight(T::WeightInfo::distribute_nfts())]
		pub fn distribute_nfts(
			origin: OriginFor<T>,
			_event_id: u32,

		) -> DispatchResult {

			if EventById::<T>::contains_key(_event_id.clone()){
				let old_event:&mut EventAuction = &mut  EventAuction{
					id: 0,
					dao_id: 0,
					user_id: 0,
					event_uri: String::from(""),
					event_wallet: String::from(""),
					participant: 0,
					status: String::from(""),
				};

				match <EventById<T>>::try_get(_event_id.clone()){
					Ok(old)=>{
						*old_event = old;
					}
					Err(_)=>{}
				}
				old_event.status = String::from("ended");
				EventById::<T>::set(_event_id.clone(), Some(old_event.clone()));

				let mut token_ids = 0;
				match <_token_ids<T>>::try_get() {
					Ok(old) => {
						token_ids = old;
					},
					Err(_) => {},
				}


				for _nft_id in 0..=token_ids{
					if TokenById::<T>::contains_key(_nft_id.clone()){
						let old_token:&mut TokenAuction = &mut  TokenAuction{ id: 0, event_id:0, dao_id: 0, token_owner:0,token_uri: "".to_string(), token_wallet: "".to_string(), highest_amount: 0, highest_bidder: "".to_string(), highest_bidder_userid: 0, highest_bidder_wallet: "".to_string(), highest_bid_date: "".to_string() };

						match <TokenById<T>>::try_get(_nft_id.clone()){
							Ok(old)=>{
								*old_token = old;
							}
							Err(_)=>{}
						}
						if  old_token.event_id == _nft_id{
							old_token.token_owner = old_token.highest_bidder_userid.clone();
						}


						TokenById::<T>::set(_nft_id.clone(), Some(old_token.clone()));

					}
				}

			}


			Ok(())
		}



		#[pallet::call_index(5)]
		#[pallet::weight(T::WeightInfo::buy_ticket())]
		pub fn buy_ticket(
			origin: OriginFor<T>,
			_user_id: u32,
			_event_id: u32,
			_dao_id: u32,
			_date: String
		) -> DispatchResult {
			let mut new_id = 0;
			match <_ticket_ids<T>>::try_get() {
				Ok(old) => {
					new_id = old;
					<_ticket_ids<T>>::put(new_id + 1);
				},
				Err(_) => {
					<_ticket_ids<T>>::put(1);
				},
			}

			let new_ticket_holder = &mut TicketHolders {
				id: new_id,
				event_id: _event_id.clone(),
				dao_id: _dao_id.clone(),
				date: _date.clone(),
				user_id: _user_id.clone()
			};

			TicketById::<T>::insert(new_id, new_ticket_holder);


			if EventById::<T>::contains_key(_event_id.clone()){
				let old_event:&mut EventAuction = &mut  EventAuction{
					id: 0,
					dao_id: 0,
					user_id: 0,
					event_uri: String::from(""),
					event_wallet: String::from(""),
					participant: 0,
					status: String::from(""),
				};
				match <EventById<T>>::try_get(_event_id.clone()){
					Ok(old)=>{
						*old_event = old;
					}
					Err(_)=>{}
				}
				old_event.participant = old_event.participant + 1;


				EventById::<T>::set(_event_id.clone(), Some(old_event.clone()));
			}


			Ok(())
		}



	}
}
