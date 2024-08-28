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
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		SomethingStored { something: u32, who: T::AccountId },
	}

	#[pallet::storage]
	#[pallet::getter(fn _feeds_ids)]
	pub type _feeds_ids<T> = StorageValue<_, u32>;

	/// Get the details of a feeds by its' id.
	#[pallet::storage]
	#[pallet::getter(fn feed_by_id)]
	pub type FeedById<T: Config> = StorageMap<_, Twox64Concat, u32, FEED>;

	
	
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		#[pallet::call_index(0)]
		#[pallet::weight(T::WeightInfo::add_Feed())]
		pub fn add_Feed(
			origin: OriginFor<T>,
			feed_text: String,
			feed_type: String,
			_now:u64
		) -> DispatchResult {

			let mut new_id = 0;
			match <_feeds_ids<T>>::try_get(){
				Ok(old)=>{
					new_id = old;
					<_feeds_ids<T>>::put(new_id + 1);
				}
				Err(_)=>{<_feeds_ids<T>>::put(1);}
			}

		
			let new_feed = &mut  FEED {
				feed_id: new_id,
				date: _now,
				feed_type: feed_type,
				data:  feed_text
			} ;

			FeedById::<T>::insert(new_id, new_feed);
			Ok(())
		}
	}
}
