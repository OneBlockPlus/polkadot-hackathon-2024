#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Decode, Encode};
pub use pallet::*;

pub mod weights;
use scale_info::prelude::string::String;
pub use weights::*;
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
	#[pallet::getter(fn _user_ids)]
	pub type _user_ids<T> = StorageValue<_, u32>;

	/// Get the details of a users by its' id.
	#[pallet::storage]
	#[pallet::getter(fn user_by_id)]
	pub type UserById<T: Config> = StorageMap<_, Twox64Concat, u32, User,ValueQuery>;


	#[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        LoggedIn {
            userid: u32,
            success: bool,
        },

    }

	#[pallet::error]
	pub enum Error<T> {
		NoneValue,
		StorageOverflow,
		UserNotFound
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		#[pallet::call_index(0)]
		#[pallet::weight(T::WeightInfo::register_user())]
		pub fn register_user(
			origin: OriginFor<T>,
			full_name: String,
			email: String,
			password: String,
			img_ipfs: String,
		) -> DispatchResult {
			let mut new_id = 0;
			match <_user_ids<T>>::try_get() {
				Ok(old) => {
					new_id = old;
					<_user_ids<T>>::put(new_id + 1);
				},
				Err(_) => {
					<_user_ids<T>>::put(1);
				},
			}

			let new_user =  User::new(new_id,full_name,email,password,img_ipfs);

			UserById::<T>::insert(new_id, new_user);

			Ok(())
		}

		#[pallet::call_index(1)]
		#[pallet::weight(T::WeightInfo::login_user())]
			pub fn login_user(
			origin: OriginFor<T>,
			email: String,
			password: String
		) -> DispatchResult {


			let mut ids = 0;
			match <_user_ids<T>>::try_get() {
				Ok(old) => {
					ids = old;
				},
				Err(_) => {},
			}

			for i in 0..ids {
				let mut elm = User::new(0,String::from(""),String::from(""),String::from(""), String::from(""));
			match  UserById::<T>::try_get(i){
				Ok(old) => {
					 elm = old;
				},
				Err(_) => {}
			};

				if elm.email == email && elm.password == password{
					Self::deposit_event(Event::LoggedIn { userid: i, success:true });
					return Ok(()) ;
				}
			}

			Ok(())
		}
	}



}
