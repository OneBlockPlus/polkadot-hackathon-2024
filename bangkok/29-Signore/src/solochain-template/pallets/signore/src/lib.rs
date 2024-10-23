#![cfg_attr(not(feature = "std"), no_std)]

// Re-export pallet items so that they can be accessed from the crate namespace.
// pub mod pallet;
pub use pallet::*;

// FRAME pallets require their own "mock runtimes" to be able to run unit tests. This module
// contains a mock runtime specific for testing this pallet's functionality.
// #[cfg(test)]
// mod mock;

// This module contains the unit tests for this pallet.
// Learn about pallet unit testing here: https://docs.substrate.io/test/unit-testing/
	// #[cfg(test)]
	// mod tests;

// Every callable function or "dispatchable" a pallet exposes must have weight values that correctly
// estimate a dispatchable's execution time. The benchmarking module is used to calculate weights
// for each dispatchable and generates this pallet's weight.rs file. Learn more about benchmarking here: https://docs.substrate.io/test/benchmark/
// #[cfg(feature = "runtime-benchmarks")]
// mod benchmarking;
// pub mod weights;
// pub use weights::*;

use frame_support::{
	dispatch::{DispatchInfo, GetDispatchInfo, PostDispatchInfo},
	pallet_prelude::{
		ValidateUnsigned, DispatchResult, TransactionSource, Get,
		TransactionPriority, ValidTransaction, Weight, InvalidTransaction, TransactionValidity,
		IsType, Encode, Decode,
	},
	traits::{OriginTrait, Contains},
	Parameter, PalletId,
};
use pallet_transaction_payment::OnChargeTransaction;
use frame_system::{
	ensure_none, RawOrigin,
	pallet_prelude::OriginFor,
};
use sp_runtime::{
	traits::{Dispatchable, AccountIdConversion},
	SaturatedConversion,
};
use sp_std::prelude::Box;

type SubstrateSignature = sp_core::sr25519::Signature;
type SubstratePublic = sp_core::sr25519::Public;

type PaymentBalanceOf<T> = <<T as pallet_transaction_payment::Config>::OnChargeTransaction as OnChargeTransaction<T>>::Balance;
// type BalanceOf<T> = <<T as pallet_transaction_payment::Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;
type AccountOf<T> = <T as frame_system::Config>::AccountId;

// All pallet logic is defined in its own module and must be annotated by the `pallet` attribute.
#[frame_support::pallet]
pub mod pallet {
	// Import various useful types required by all FRAME pallets.
	use super::*;

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
	pub trait Config: frame_system::Config + pallet_transaction_payment::Config {
		/// The overarching runtime event type.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		/// A type representing the weights required by the dispatchables of this pallet.
		// type WeightInfo: WeightInfo;
		type RuntimeCall: Parameter
			+ Dispatchable<
				RuntimeOrigin = Self::RuntimeOrigin,
				Info = DispatchInfo,
				PostInfo = PostDispatchInfo,
			> 
			+ GetDispatchInfo
			+ codec::Decode
			+ codec::Encode
			+ scale_info::TypeInfo
			+ IsType<<Self as frame_system::Config>::RuntimeCall>;
		
		type CallFilter: Contains<<Self as frame_system::Config>::RuntimeCall>;

		type Agent: Get<PalletId>;
	}

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
		ProxyCall {
			who: AccountOf<T>,
			success: bool,
		}
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
		/// Error in paying gas fee.
		PaymentGasError,
	}

	#[pallet::validate_unsigned]
	impl<T: Config> ValidateUnsigned for Pallet<T>
	where
		<T as frame_system::Config>::RuntimeCall: 
			Dispatchable<Info = DispatchInfo, PostInfo = PostDispatchInfo>,
	{
		type Call = Call<T>;

		fn validate_unsigned(
			_source: TransactionSource,
			unsigned_call: &Self::Call,
		) -> TransactionValidity {
			let Call::proxy_send {
				ref who,
				ref sig,
				ref call,
			} = unsigned_call
			else {
				return Err(InvalidTransaction::Call.into());
			};

			let call_data = <T as Config>::RuntimeCall::encode(call);

			let who_encode: [u8; 32] = match who.encode().try_into() {
				Ok(value) => value,
				Err(_) =>return Err(InvalidTransaction::Call.into()),
			};

			let puk = SubstratePublic::from_raw(who_encode); 

			if !sp_io::crypto::sr25519_verify(&sig, &call_data, &puk) {
				return Err(InvalidTransaction::Call.into());
			}

			// Calculate priority
			// Cheat from `get_priority` in frame/transaction-payment/src/lib.rs
			use frame_support::traits::Defensive;
			use sp_runtime::{SaturatedConversion, Saturating};

			let len = call.encoded_size();
			let info = call.get_dispatch_info();
			// Calculate how many such extrinsics we could fit into an empty block and take the
			// limiting factor.
			let max_block_weight = <T as frame_system::Config>::BlockWeights::get().max_block;
			let max_block_length =
				*<T as frame_system::Config>::BlockLength::get().max.get(info.class) as u64;

			// bounded_weight is used as a divisor later so we keep it non-zero.
			let bounded_weight = info.weight.max(Weight::from_parts(1, 1)).min(max_block_weight);
			let bounded_length = (len as u64).max(1).min(max_block_length);

			// returns the scarce resource, i.e. the one that is limiting the number of
			// transactions.
			let max_tx_per_block_weight = max_block_weight
				.checked_div_per_component(&bounded_weight)
				.defensive_proof("bounded_weight is non-zero; qed")
				.unwrap_or(1);
			let max_tx_per_block_length = max_block_length / bounded_length;
			// Given our current knowledge this value is going to be in a reasonable range - i.e.
			// less than 10^9 (2^30), so multiplying by the `tip` value is unlikely to overflow the
			// balance type. We still use saturating ops obviously, but the point is to end up with
			// some `priority` distribution instead of having all transactions saturate the
			// priority.
			let max_tx_per_block = max_tx_per_block_length
				.min(max_tx_per_block_weight)
				.saturated_into::<PaymentBalanceOf<T>>();

			let max_reward = |val: PaymentBalanceOf<T>| val.saturating_mul(max_tx_per_block);

			// Finish the validation
			let valid_transaction_builder = ValidTransaction::with_tag_prefix("Signore")
				.priority(max_reward(1u64.saturated_into()).saturated_into::<TransactionPriority>())
				.and_provides((who, 1).encode())
				.longevity(5)
				.propagate(true)
				.build();
			valid_transaction_builder
		}
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
	impl<T: Config> Pallet<T>
	where
		<T as frame_system::Config>::RuntimeCall: 
			Dispatchable<Info = DispatchInfo, PostInfo = PostDispatchInfo>,
	{
		/// An example dispatchable that takes a single u32 value as a parameter, writes the value
		/// to storage and emits an event.
		///
		/// It checks that the _origin_ for this call is _Signed_ and returns a dispatch
		/// error if it isn't. Learn more about origins here: <https://docs.substrate.io/build/origins/>
		#[pallet::call_index(0)]
		#[pallet::weight(0)]
		pub fn proxy_send(
			origin: OriginFor<T>,
			who: AccountOf<T>,
			#[allow(unused_variables)] sig: SubstrateSignature,
			call: Box<<T as Config>::RuntimeCall>,
		) -> DispatchResult {
			// Check that the extrinsic was signed and get the signer.
			// ensure_signed(origin)?;
			ensure_none(origin)?;

			let len = call.encoded_size();
			let info = call.get_dispatch_info();

			let payer = T::Agent::get().into_account_truncating();

			let fee =
				pallet_transaction_payment::Pallet::<T>::compute_fee(len as u32, &info, 0u32.saturated_into());

			let already_withdrawn =
			<<T as pallet_transaction_payment::Config>::OnChargeTransaction as OnChargeTransaction<T>>::withdraw_fee(
					&payer,
					&(*call).clone().into(),
					&info,
					fee,
					0u32.saturated_into(),
				)
				.map_err(|_err| Error::<T>::PaymentGasError)?;

			let mut origin: T::RuntimeOrigin = RawOrigin::Signed(who.clone()).into();
			origin.add_filter(T::CallFilter::contains);

			let call_result = call.dispatch(origin);
			let post_info = match call_result {
				Ok(post_info) => post_info,
				Err(error_and_info) => {
					Self::deposit_event(Event::<T>::ProxyCall {
						who: who.clone(),
						success: false,
					});
					error_and_info.post_info
				},
			};

			let actual_fee = pallet_transaction_payment::Pallet::<T>::compute_actual_fee(
				len as u32, &info, &post_info, 0u32.saturated_into(),
			);
			// frame/transaction-payment/src/payment.rs
			<<T as pallet_transaction_payment::Config>::OnChargeTransaction as OnChargeTransaction<T>>::correct_and_deposit_fee(
				&payer,
				&info,
				&post_info,
				actual_fee,
				0u32.saturated_into(),
				already_withdrawn,
			)
			.map_err(|_err| Error::<T>::PaymentGasError)?;

			Self::deposit_event(Event::<T>::ProxyCall {
				who,
				success: true,
			});

			// Return a successful `DispatchResult`
			Ok(())
		}
	}
}
