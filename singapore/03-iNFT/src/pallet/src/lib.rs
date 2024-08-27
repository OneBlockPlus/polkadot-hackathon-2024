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

//! # Anchor Pallet
//! Anchor is an On-chain Linked List system base on substrate. 
//! On another hand, Anchor can alse be treated as Name Service or On-chain Key-value Storage.
//!
//! ## Overview
//! There are two main parts storage and market of Anchor pallet. 
//! 1.Storage part: set_anchor.
//! 2.Market part: sell_anchor,unsell_anchor,buy_anchor.
//! 3.Addtional part: divert_anchor,drop_anchor.
//!
//! ### Terminology
//! - Anchor: The unique key which store data on chain.
//! - Raw : 4M bytes max string storage, UTF8 support.
//! - Protocol: 256 bytes max string, customize protocol.
//! - Pre: block number linked to previous anchor storage.
//! 
//! ## Interface
//! * set_anchor, one method to update and init storage.
//! * sell_anchor, sell anchor freely or to target account
//! * unsell_anchor, revoke selling status
//! * buy_anchor, buy a selling anchor
//! * divert_anchor, divert anchor to target account
//! * drop_anchor, drop anchor to an unaccessable account
//! 

// Ensure we're `no_std` when compiling for Wasm.
#![cfg_attr(not(feature = "std"), no_std)]

use frame_support::{
	dispatch::{DispatchResult},
	traits::{Currency,ExistenceRequirement},
	weights::Weight,
};
use frame_system::ensure_signed;
use sp_runtime::{
	traits::{SaturatedConversion,StaticLookup},
	Vec,
};
use hex;


pub use pallet::*;


// mod benchmarking;

#[cfg(test)]
mod tests;

pub mod weights;
pub use weights::*;

#[frame_support::pallet]
pub mod pallet {
	use super::*;
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;

	#[pallet::config]
	pub trait Config: frame_system::Config {
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		type WeightInfo: WeightInfo;
		type Currency: Currency<Self::AccountId>;
	}

	pub(crate) const STORAGE_VERSION: StorageVersion = StorageVersion::new(1);
	
	#[pallet::pallet]
	#[pallet::storage_version(STORAGE_VERSION)]
	#[pallet::without_storage_info]
	pub struct Pallet<T>(_);
	
	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
		fn on_initialize(_n: BlockNumberFor<T>) -> Weight {
			Weight::zero()
		}
		fn on_finalize(_n: BlockNumberFor<T>) {}
		fn offchain_worker(_n: BlockNumberFor<T>) {}
	}

	#[pallet::error]
	pub enum Error<T> {
		///Anchor name max length.
		KeyMaxLimited,

		///Anchor last words max length.
		LastWordsMaxLimited,

		///Anchor raw data max limit.
		Base64MaxLimited,

		///Anchor protocola max length
		ProtocolMaxLimited,

		///Pre number errror
		PreAnchorFailed,

		///Anchor sell value error.
		PriceValueLimited,

		///Anchor exists already, can not be created.
		AnchorExistsAlready,

		///Anchor do not exist, can not change status.
		AnchorNotExists,

		///unknown anchor owner data in storage.
		UnexceptDataError,

		///Anchor do not belong to the account
		AnchorNotBelogToAccount,

		///Anchor is not in the sell list.
		AnchorNotInSellList,

		///Not enough balance
		InsufficientBalance,

		///Transfer error.
		TransferFailed,

		///User can not buy the anchor owned by himself
		CanNotBuyYourOwnAnchor,

		///Anchor was set to sell to target buyer
		OnlySellToTargetBuyer,
	}


	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// An anchor is set to selling status.
		AnchorToSell(Vec<u8>,T::AccountId,u64,T::AccountId),	//(name,owner, price , target)

		
		/// An anchor is bought, the owner changed.
		AnchorBought(Vec<u8>,T::AccountId,u64,T::AccountId),	//(name,buyer, price , from)

		/// An anchor is divertted, the owner changed.
		AnchorDiverted(Vec<u8>,T::AccountId,T::AccountId),		//(name, from , to)

		/// An anchor is dropped, the owner is set to blackhole account.
		AnchorDropped(Vec<u8>,T::AccountId,Vec<u8>,T::AccountId),	//(name,owner, message left to bridge, blackhole account)
	}

	/// Hashmap to record anchor status, Anchor => ( Owner, last block )
	#[pallet::storage]
	#[pallet::getter(fn owner)]
	pub(super) type AnchorOwner<T: Config> = StorageMap<_, Twox64Concat, Vec<u8>, (T::AccountId,BlockNumberFor<T>)>;

	/// Selling anchor status, Anchor => ( Owner, Price, Target customer )
	#[pallet::storage]
	#[pallet::getter(fn selling)]
	pub(super) type SellList<T: Config> = StorageMap<_, Twox64Concat, Vec<u8>, (T::AccountId, u64,T::AccountId)>;

	//limitation of anchor parameters
	const NAME_MAX_LENGTH:u32=40;
	const RAW_MAX_LENGTH:u32=4*1024*1024;
	const PROTOCOL_MAX_LENGTH:u32=256;
	const LAST_WORDS_LENGTH:u32=200;
	const PRICE_MIN_VALUE:u32=0;

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// set a new anchor or update an exist anchor
		#[pallet::call_index(0)]
		#[pallet::weight(
			<T as pallet::Config>::WeightInfo::set_anchor((raw.len()).saturated_into())
		)]
		pub fn set_anchor(
			origin: OriginFor<T>,
			key: Vec<u8>,
			raw: Vec<u8>,
			protocol: Vec<u8>,
			pre:BlockNumberFor<T>
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;
			//0.check is on sell

			//1.param check
			ensure!(key.len() < NAME_MAX_LENGTH.try_into().unwrap(), Error::<T>::KeyMaxLimited);				//1.1.check key length, <40
			ensure!(raw.len() < RAW_MAX_LENGTH.try_into().unwrap(), Error::<T>::Base64MaxLimited);	//1.2.check raw(base64) length，<4M
			ensure!(protocol.len() < PROTOCOL_MAX_LENGTH.try_into().unwrap(), Error::<T>::ProtocolMaxLimited);	//1.3.check protocal length, <256

			//1.1.convert key to lowcase
			let mut nkey:Vec<u8>;
			nkey=key.clone().as_mut_slice().to_vec();
			nkey.make_ascii_lowercase();

			let data = <AnchorOwner<T>>::get(&nkey); 		//check anchor status
			let current_block_number = <frame_system::Pallet<T>>::block_number();

			//2.check anchor to determine add or update
			if data.is_none() {
				let val:u64=0;
				let zero :BlockNumberFor<T> = val.saturated_into();
				ensure!(pre == zero, Error::<T>::PreAnchorFailed);

				//2.1.create new anchor
				<AnchorOwner<T>>::insert(nkey, (&sender,current_block_number));
				
			}else{
				//2.2.update exists anchor
				let owner=data.ok_or(Error::<T>::AnchorNotExists)?;
				ensure!(sender == owner.0, Error::<T>::AnchorNotBelogToAccount);
				ensure!(pre == owner.1, Error::<T>::PreAnchorFailed);

				<AnchorOwner<T>>::try_mutate(&nkey, |status| -> DispatchResult {
					let d = status.as_mut().ok_or(Error::<T>::UnexceptDataError)?;
					d.1 = current_block_number;
					Ok(())
				})?;
			}

			Ok(())
		}

		/// Set anchor to sell status and added to sell list
		#[pallet::call_index(1)]
		#[pallet::weight(
			<T as pallet::Config>::WeightInfo::set_sell()
		)]
		pub fn sell_anchor(
			origin: OriginFor<T>, 
			key: Vec<u8>, 
			price: u64, 
			target:<T::Lookup as StaticLookup>::Source		//select from exist accounts.
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;
			let target = T::Lookup::lookup(target)?;

			//1.param check		
			ensure!(key.len() < NAME_MAX_LENGTH.try_into().unwrap(), Error::<T>::KeyMaxLimited); 	//1.1.check key length, <40
			ensure!(price > PRICE_MIN_VALUE.try_into().unwrap(), Error::<T>::PriceValueLimited); 

			//1.1.lowercase fix
			let mut nkey:Vec<u8>;
			nkey=key.clone().as_mut_slice().to_vec();
			nkey.make_ascii_lowercase();

			//2.check owner
			let owner=<AnchorOwner<T>>::get(&nkey).ok_or(Error::<T>::AnchorNotExists)?;
			ensure!(sender==owner.0, <Error<T>>::AnchorNotBelogToAccount);

			//4.put in sell list
			<SellList<T>>::insert(nkey, (&sender, price, &target)); 			
			Self::deposit_event(Event::AnchorToSell(key,sender,price,target));
			Ok(())
		}

		/// buy an anchor on-sell.
		#[pallet::call_index(2)]
		#[pallet::weight(
			<T as pallet::Config >::WeightInfo::buy_anchor()
		)]
		pub fn buy_anchor(
			origin: OriginFor<T>, 
			key: Vec<u8>
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;
			ensure!(key.len() < NAME_MAX_LENGTH.try_into().unwrap(), Error::<T>::KeyMaxLimited);

			//lowercase check
			let mut nkey:Vec<u8>;
			nkey=key.clone().as_mut_slice().to_vec();
			nkey.make_ascii_lowercase();
			
			let anchor=<SellList<T>>::get(&key).ok_or(Error::<T>::AnchorNotInSellList)?;

			//0.check anchor sell status
			//0.1.confirm the anchor is not owned by sender
			ensure!(sender != anchor.0, <Error<T>>::CanNotBuyYourOwnAnchor);

			//0.2.check the anchor sell target
			if anchor.0 != anchor.2 {
				ensure!(sender == anchor.2, <Error<T>>::OnlySellToTargetBuyer);
			}

			//0.3.check anchor owner
			let _owner=<AnchorOwner<T>>::get(&nkey).ok_or(Error::<T>::AnchorNotExists)?;

			//1.transfer specail amout to seller
			let amount= anchor.1;
			let to = anchor.0;

			//1.1.check balance
			ensure!(T::Currency::free_balance(&sender) >= amount.saturated_into(), Error::<T>::InsufficientBalance);

			//1.2.do transfer
			let res=T::Currency::transfer(
				&sender,		//transfer from
				&to,			//transfer to
				amount.saturated_into(),		//transfer amount
				ExistenceRequirement::AllowDeath
			);
			ensure!(res.is_ok(), Error::<T>::TransferFailed);

			//2.change the owner of anchor 
			<AnchorOwner<T>>::try_mutate(&nkey, |status| -> DispatchResult {
				let d = status.as_mut().ok_or(Error::<T>::UnexceptDataError)?;
				d.0 = sender.clone();

				//3.remove the anchor from sell list
				<SellList<T>>::remove(&nkey);

				//4.event trigger
				Self::deposit_event(Event::AnchorBought(key,sender,amount,to));

				Ok(())
			})?;
			Ok(())
		}

		/// Revoke anchor from selling status
		#[pallet::call_index(3)]
		#[pallet::weight(
			<T as pallet::Config>::WeightInfo::set_unsell()
		)]
		pub fn unsell_anchor(
			origin: OriginFor<T>, 
			key: Vec<u8>, 
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;
			
			//1.param check
			//1.1.check key length, <40
			ensure!(key.len() < NAME_MAX_LENGTH.try_into().unwrap(), Error::<T>::KeyMaxLimited);

			//1.2.lowercase check
			let mut nkey:Vec<u8>;
			nkey=key.clone().as_mut_slice().to_vec();
			nkey.make_ascii_lowercase();

			//1.3.check sell list
			<SellList<T>>::get(&key).ok_or(Error::<T>::AnchorNotInSellList)?;

			//2.check owner
			let owner=<AnchorOwner<T>>::get(&nkey).ok_or(Error::<T>::AnchorNotExists)?;
			ensure!(sender==owner.0, <Error<T>>::AnchorNotBelogToAccount);

			//3.remove from sell list		
			<SellList<T>>::remove(nkey);
			Ok(())
		}

		/// Divert anchor to target account
		#[pallet::call_index(4)]
		#[pallet::weight(
			<T as pallet::Config>::WeightInfo::divert_anchor()
		)]
		pub fn divert_anchor(
			origin: OriginFor<T>, 
			key: Vec<u8>,
			target:<T::Lookup as StaticLookup>::Source
		) -> DispatchResult {

			let sender = ensure_signed(origin)?;
			let target = T::Lookup::lookup(target)?;

			//1.param check		
			ensure!(key.len() < NAME_MAX_LENGTH.try_into().unwrap(), Error::<T>::KeyMaxLimited); 	//1.1.check key length, <40

			//1.1.lowercase fix
			let mut nkey:Vec<u8>;
			nkey=key.clone().as_mut_slice().to_vec();
			nkey.make_ascii_lowercase();

			//2.check owner
			let owner=<AnchorOwner<T>>::get(&nkey).ok_or(Error::<T>::AnchorNotExists)?;
			ensure!(sender==owner.0, <Error<T>>::AnchorNotBelogToAccount);

			//2.change the owner of anchor 
			<AnchorOwner<T>>::try_mutate(&nkey, |status| -> DispatchResult {
				let d = status.as_mut().ok_or(Error::<T>::UnexceptDataError)?;
				d.0 = target.clone();		//set new owner
				Self::deposit_event(Event::AnchorDiverted(key,sender,target));
				Ok(())
			})?;

			Ok(())
		}

		/// Drop anchor to target account
		#[pallet::call_index(5)]
		#[pallet::weight(
			<T as pallet::Config>::WeightInfo::drop_anchor()
		)]
		pub fn drop_anchor(
			origin: OriginFor<T>, 
			key: Vec<u8>,
			message:Vec<u8>				//this is for the bridge information
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;

			//1.param check		
			ensure!(key.len() < NAME_MAX_LENGTH.try_into().unwrap(), Error::<T>::KeyMaxLimited); 	//1.1.check key length, <40
			ensure!(message.len() < LAST_WORDS_LENGTH.try_into().unwrap(), Error::<T>::LastWordsMaxLimited);	//1.2.check last words length, <40

			//1.1.lowercase fix
			let mut nkey:Vec<u8>;
			nkey=key.clone().as_mut_slice().to_vec();
			nkey.make_ascii_lowercase();

			//2.check owner
			let owner=<AnchorOwner<T>>::get(&nkey).ok_or(Error::<T>::AnchorNotExists)?;
			ensure!(sender==owner.0, <Error<T>>::AnchorNotBelogToAccount);

			<AnchorOwner<T>>::try_mutate(&nkey, |status| -> DispatchResult {
				let d = status.as_mut().ok_or(Error::<T>::UnexceptDataError)?;

				let invalid_account = "444444444444444444444444444444444444444444444444";
				let mut account_id_bytes = hex::decode(invalid_account).expect("Hex decode should not fail");
				account_id_bytes.resize(32, 0);
				let account_id: T::AccountId = T::AccountId::decode(&mut &account_id_bytes[..]).expect("Failed to decode into T::AccountId");
				d.0 = account_id.clone();
				Self::deposit_event(Event::AnchorDropped(key,sender,message,account_id));
				Ok(())
			})?;

			Ok(())
		}
	}
}
