#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Encode, Decode};
pub use pallet::*;

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
	#[pallet::getter(fn _goal_ids)]
	pub type _goal_ids<T> = StorageValue<_, u32>;

	/// Get the details of a goal by its' id.
	#[pallet::storage]
	#[pallet::getter(fn goal_by_id)]
	pub type GoalById<T: Config> = StorageMap<_, Twox64Concat, u32, GOAL>;

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
		#[pallet::weight(T::WeightInfo::create_goal())]
		pub fn create_goal(
			origin: OriginFor<T>,
			_goal_uri: String,
			_dao_id: u32,
			_user_id: u32,
			_feed: String,
		) -> DispatchResult {

			let mut new_id = 0;
			match <_goal_ids<T>>::try_get(){
				Ok(old)=>{
					new_id = old;
					<_goal_ids<T>>::put(new_id + 1);
				}
				Err(_)=>{<_goal_ids<T>>::put(1);}
			}

			let new_goal = &mut  GOAL {
				id: new_id,
				dao_id: _dao_id,
				goal_uri: _goal_uri
			} ;

			GoalById::<T>::insert(new_id, new_goal);

			Ok(())
		}



	}
}
