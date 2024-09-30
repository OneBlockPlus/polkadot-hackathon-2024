//! # Template Pallet
//!
//! A pallet with minimal functionality to help developers understand the essential components of
//! writing a FRAME pallet. It is typically used in beginner tutorials or in Substrate template
//! nodes as a starting point for creating a new pallet and **not meant to be used in production**.
//!
//! ## Overview
//!
//! This template pallet contains basic examples of:
//! - declaring a storage item that stores a single `u32` value
//! - declaring and using events
//! - declaring and using errors
//! - a dispatchable function that allows a user to set a new value to storage and emits an event
//!   upon success
//! - another dispatchable function that causes a custom error to be thrown
//!
//! Each pallet section is annotated with an attribute using the `#[pallet::...]` procedural macro.
//! This macro generates the necessary code for a pallet to be aggregated into a FRAME runtime.
//!
//! Learn more about FRAME macros [here](https://docs.substrate.io/reference/frame-macros/).
//!
//! ### Pallet Sections
//!
//! The pallet sections in this template are:
//!
//! - A **configuration trait** that defines the types and parameters which the pallet depends on
//!   (denoted by the `#[pallet::config]` attribute). See: [`Config`].
//! - A **means to store pallet-specific data** (denoted by the `#[pallet::storage]` attribute).
//!   See: [`storage_types`].
//! - A **declaration of the events** this pallet emits (denoted by the `#[pallet::event]`
//!   attribute). See: [`Event`].
//! - A **declaration of the errors** that this pallet can throw (denoted by the `#[pallet::error]`
//!   attribute). See: [`Error`].
//! - A **set of dispatchable functions** that define the pallet's functionality (denoted by the
//!   `#[pallet::call]` attribute). See: [`dispatchables`].
//!
//! Run `cargo doc --package pallet-template --open` to view this pallet's documentation.

// We make sure this pallet uses `no_std` for compiling to Wasm.
#![cfg_attr(not(feature = "std"), no_std)]

// Re-export pallet items so that they can be accessed from the crate namespace.
pub use pallet::*;

// FRAME pallets require their own "mock runtimes" to be able to run unit tests. This module
// contains a mock runtime specific for testing this pallet's functionality.
#[cfg(test)]
mod mock;

// This module contains the unit tests for this pallet.
// Learn about pallet unit testing here: https://docs.substrate.io/test/unit-testing/
#[cfg(test)]
mod tests;

// Every callable function or "dispatchable" a pallet exposes must have weight values that correctly
// estimate a dispatchable's execution time. The benchmarking module is used to calculate weights
// for each dispatchable and generates this pallet's weight.rs file. Learn more about benchmarking here: https://docs.substrate.io/test/benchmark/
#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;
pub mod weights;
pub use weights::*;

// All pallet logic is defined in its own module and must be annotated by the `pallet` attribute.
#[frame_support::pallet]
pub mod pallet {
	// Import various useful types required by all FRAME pallets.
	use super::*;
	use codec::MaxEncodedLen;
	use frame_support::{pallet_prelude::*, traits::BalanceStatus};
	use frame_system::pallet_prelude::*;
	use orml_traits::{arithmetic::Bounded, MultiCurrency, MultiReservableCurrency};
	use orml_utilities::with_transaction_result;
	use primitives::Swap;
	use scale_info::TypeInfo;
	use sp_runtime::traits::{AtLeast32BitUnsigned, One, Zero};

	#[derive(Encode, Decode, Clone, RuntimeDebug, Eq, PartialEq, TypeInfo, MaxEncodedLen)]
	pub struct Order<CurrencyId, Balance, AccountId> {
		pub base_currency_id: CurrencyId,
		pub base_amount: Balance,
		pub target_currency_id: CurrencyId,
		pub target_amount: Balance,
		pub owner: AccountId,
	}

	type BalanceOf<T> =
		<<T as Config>::Currency as MultiCurrency<<T as frame_system::Config>::AccountId>>::Balance;
	type CurrencyIdOf<T> = <<T as Config>::Currency as MultiCurrency<
		<T as frame_system::Config>::AccountId,
	>>::CurrencyId;
	type OrderOf<T> = Order<CurrencyIdOf<T>, BalanceOf<T>, <T as frame_system::Config>::AccountId>;

	// The `Pallet` struct serves as a placeholder to implement traits, methods and dispatchables
	// (`Call`s) in this pallet.
	#[pallet::pallet]
	pub struct Pallet<T>(_);

	/// The pallet's configuration trait.
	///
	/// All our types and constants a pallet depends on must be declared here.
	/// These types are defined generically and made concrete when the pallet is declared in the
	/// `runtime/src/lib.rs` file of your chain.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// The overarching runtime event type.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		/// A type representing the weights required by the dispatchables of this pallet.
		type WeightInfo: WeightInfo;

		type Currency: MultiReservableCurrency<Self::AccountId>;
	}

	/// A storage item for this pallet.
	///
	/// In this template, we are declaring a storage item called `Something` that stores a single
	/// `u32` value. Learn more about runtime storage here: <https://docs.substrate.io/build/runtime-storage/>
	#[pallet::storage]
	pub type Something<T> = StorageValue<_, u32>;

	#[pallet::storage]
	pub type NextOrderId<T> = StorageValue<_, u32, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn blacklist)]
	pub type Orders<T: Config> = StorageMap<_, Blake2_128Concat, u32, OrderOf<T>>;

	/// Events that functions in this pallet can emit.
	///
	/// Events are a simple means of indicating to the outside world (such as dApps, chain explorers
	/// or other users) that some notable update in the runtime has occurred. In a FRAME pallet, the
	/// documentation for each event field and its parameters is added to a node's metadata so it
	/// can be used by external interfaces or tools.
	///
	///	The `generate_deposit` macro generates a function on `Pallet` called `deposit_event` which
	/// will convert the event type of your pallet into `RuntimeEvent` (declared in the pallet's
	/// [`Config`] trait) and deposit it using [`frame_system::Pallet::deposit_event`].
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// A user has successfully set a new value.
		SomethingStored {
			/// The new value set.
			something: u32,
			/// The account who set the new value.
			who: T::AccountId,
		},
		OrderCreated {
			order_id: u32,
			order: OrderOf<T>,
		},
		OrderTaken {
			who: T::AccountId,
			order_id: u32,
			order: OrderOf<T>,
		},
		OrderCancelled {
			order_id: u32,
		},
	}

	/// Errors that can be returned by this pallet.
	///
	/// Errors tell users that something went wrong so it's important that their naming is
	/// informative. Similar to events, error documentation is added to a node's metadata so it's
	/// equally important that they have helpful documentation associated with them.
	///
	/// This type of runtime error can be up to 4 bytes in size should you want to return additional
	/// information.
	#[pallet::error]
	pub enum Error<T> {
		/// The value retrieved was `None` as no value was previously set.
		NoneValue,
		/// There was an attempt to increment the value in storage over `u32::MAX`.
		StorageOverflow,
		OrderIdOverflow,
		InvalidOrderId,
		InsufficientBalance,
		NotOwner,
	}

	/// The pallet's dispatchable functions ([`Call`]s).
	///
	/// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	/// These functions materialize as "extrinsics", which are often compared to transactions.
	/// They must always return a `DispatchResult` and be annotated with a weight and call index.
	///
	/// The [`call_index`] macro is used to explicitly
	/// define an index for calls in the [`Call`] enum. This is useful for pallets that may
	/// introduce new dispatchables over time. If the order of a dispatchable changes, its index
	/// will also change which will break backwards compatibility.
	///
	/// The [`weight`] macro is used to assign a weight to each call.
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// An example dispatchable that takes a single u32 value as a parameter, writes the value
		/// to storage and emits an event.
		///
		/// It checks that the _origin_ for this call is _Signed_ and returns a dispatch
		/// error if it isn't. Learn more about origins here: <https://docs.substrate.io/build/origins/>
		#[pallet::call_index(0)]
		#[pallet::weight(T::WeightInfo::do_something())]
		pub fn do_something(origin: OriginFor<T>, something: u32) -> DispatchResult {
			// Check that the extrinsic was signed and get the signer.
			let who = ensure_signed(origin)?;

			// Update storage.
			Something::<T>::put(something);

			// Emit an event.
			Self::deposit_event(Event::SomethingStored { something, who });

			// Return a successful `DispatchResult`
			Ok(())
		}

		/// An example dispatchable that may throw a custom error.
		///
		/// It checks that the caller is a signed origin and reads the current value from the
		/// `Something` storage item. If a current value exists, it is incremented by 1 and then
		/// written back to storage.
		///
		/// ## Errors
		///
		/// The function will return an error under the following conditions:
		///
		/// - If no value has been set ([`Error::NoneValue`])
		/// - If incrementing the value in storage causes an arithmetic overflow
		///   ([`Error::StorageOverflow`])
		#[pallet::call_index(1)]
		#[pallet::weight(T::WeightInfo::cause_error())]
		pub fn cause_error(origin: OriginFor<T>) -> DispatchResult {
			let _who = ensure_signed(origin)?;

			// Read a value from storage.
			match Something::<T>::get() {
				// Return an error if the value has not been set.
				None => Err(Error::<T>::NoneValue.into()),
				Some(old) => {
					// Increment the value read from storage. This will cause an error in the event
					// of overflow.
					let new = old.checked_add(1).ok_or(Error::<T>::StorageOverflow)?;
					// Update the value in storage with the incremented result.
					Something::<T>::put(new);
					Ok(())
				},
			}
		}

		#[pallet::call_index(2)]
		#[pallet::weight(0)]
		pub fn submit_order(
			origin: OriginFor<T>,
			base_currency_id: CurrencyIdOf<T>,
			base_amount: BalanceOf<T>,
			target_currency_id: CurrencyIdOf<T>,
			target_amount: BalanceOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			NextOrderId::<T>::try_mutate(|id| -> DispatchResult {
				let order_id = *id;

				let order = Order {
					base_currency_id,
					base_amount,
					target_currency_id,
					target_amount,
					owner: who.clone(),
				};

				*id = id.checked_add(One::one()).ok_or(Error::<T>::OrderIdOverflow)?;

				T::Currency::reserve(base_currency_id, &who, base_amount)?;

				Orders::<T>::insert(order_id, &order);

				Self::deposit_event(Event::OrderCreated { order_id, order });
				Ok(())
			})?;
			Ok(())
		}

		#[pallet::call_index(3)]
		#[pallet::weight(0)]
		pub fn take_order(origin: OriginFor<T>, order_id: u32) -> DispatchResult {
			let who = ensure_signed(origin)?;

			Orders::<T>::try_mutate_exists(order_id, |order| -> DispatchResult {
				let order = order.take().ok_or(Error::<T>::InvalidOrderId)?;

				with_transaction_result(|| {
					T::Currency::transfer(
						order.target_currency_id,
						&who,
						&order.owner,
						order.target_amount,
					)?;
					let val = T::Currency::repatriate_reserved(
						order.base_currency_id,
						&order.owner,
						&who,
						order.base_amount,
						BalanceStatus::Free,
					)?;
					ensure!(val.is_zero(), Error::<T>::InsufficientBalance);

					Self::deposit_event(Event::OrderTaken { who, order_id, order });

					Ok(())
				})
			})?;
			Ok(())
		}

		#[pallet::call_index(4)]
		#[pallet::weight(0)]
		pub fn cancel_order(origin: OriginFor<T>, order_id: u32) -> DispatchResult {
			let who = ensure_signed(origin)?;

			Orders::<T>::try_mutate_exists(order_id, |order| -> DispatchResult {
				let order = order.take().ok_or(Error::<T>::InvalidOrderId)?;

				ensure!(order.owner == who, Error::<T>::NotOwner);

				Self::deposit_event(Event::OrderCancelled { order_id });

				Ok(())
			})?;
			Ok(())
		}
	}

	impl<T: Config> Swap<BalanceOf<T>, T::AccountId> for Pallet<T> {
		fn get_target_amount(order_id: u32) -> BalanceOf<T> {
			let order = Orders::<T>::get(order_id);
			match order {
				Some(o) => o.target_amount,
				None => Default::default(),
			}
		}
		fn inter_take_order(
			taker: T::AccountId,
			order_id: u32,
			receiver: T::AccountId,
		) -> DispatchResult {
			Orders::<T>::try_mutate_exists(order_id, |order| -> DispatchResult {
				let order = order.take().ok_or(Error::<T>::InvalidOrderId)?;

				with_transaction_result(|| {
					T::Currency::transfer(
						order.target_currency_id,
						&taker,
						&order.owner,
						order.target_amount,
					)?;
					let val = T::Currency::repatriate_reserved(
						order.base_currency_id,
						&order.owner,
						&receiver,
						order.base_amount,
						BalanceStatus::Free,
					)?;
					ensure!(val.is_zero(), Error::<T>::InsufficientBalance);

					Self::deposit_event(Event::OrderTaken { who: taker, order_id, order });

					Ok(())
				})
			})?;
			Ok(())
		}
	}
}
