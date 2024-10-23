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
use sp_core::U256;

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

pub mod common;
pub mod deserialization;
pub mod verify;

use frame_support::storage::bounded_vec::BoundedVec;
pub use pallet::*;
use sp_std::vec::Vec;

type PublicInputsDef<T> = BoundedVec<u8, <T as Config>::MaxPublicInputsLength>;
type ProofDef<T> = BoundedVec<u8, <T as Config>::MaxProofLength>;
type VerificationKeyDef<T> = BoundedVec<u8, <T as Config>::MaxVerificationKeyLength>;

// All pallet logic is defined in its own module and must be annotated by the `pallet` attribute.
#[frame_support::pallet]
pub mod pallet {
	// Import various useful types required by all FRAME pallets.
	use super::*;
	use crate::{
		common::prepare_verification_key,
		deserialization::{Proof, VKey},
		verify::{
			prepare_public_inputs, verify, G1UncompressedBytes, G2UncompressedBytes, GProof,
			VerificationKey, SUPPORTED_CURVE, SUPPORTED_PROTOCOL,
		},
	};
	use frame_support::{pallet_prelude::*, traits::UnixTime};
	use frame_system::pallet_prelude::*;
	use primitives::Otp;
	use scale_info::prelude::string::String;
	use sp_std::vec;

	//const STORAGE_VERSION: StorageVersion = StorageVersion::new(1);

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

		#[pallet::constant]
		type MaxPublicInputsLength: Get<u32>;

		/// The maximum length of the proof.
		#[pallet::constant]
		type MaxProofLength: Get<u32>;

		/// The maximum length of the verification key.
		#[pallet::constant]
		type MaxVerificationKeyLength: Get<u32>;

		type TimeProvider: UnixTime;
	}

	#[pallet::storage]
	#[pallet::getter(fn roots)]
	pub type Roots<T: Config> = StorageMap<_, Blake2_128Concat, U256, bool>;

	#[pallet::storage]
	#[pallet::getter(fn user_roots)]
	pub type UserRoots<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, U256>;

	#[pallet::storage]
	#[pallet::getter(fn user_last_timestamp)]
	pub type UserLastTimestamp<T: Config> =
		StorageMap<_, Blake2_128Concat, T::AccountId, u128, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn merkle_vec)]
	pub type MerkleVec<T> = StorageValue<_, BoundedVec<U256, ConstU32<{ u32::MAX }>>, ValueQuery>;

	/// Storing a public input.
	#[pallet::storage]
	pub type PublicInputStorage<T: Config> = StorageValue<_, PublicInputsDef<T>, ValueQuery>;

	/// Storing a verification key.
	#[pallet::storage]
	pub type VerificationKeyStorage<T: Config> = StorageValue<_, VerificationKeyDef<T>, ValueQuery>;

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
		VerificationSetupCompleted,
		OtpCommitmentSeted,
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
		/// Public inputs mismatch
		PublicInputsMismatch,
		/// Public inputs vector is to long.
		TooLongPublicInputs,
		/// The verification key is to long.
		TooLongVerificationKey,
		/// The proof is too long.
		TooLongProof,
		/// The proof is too short.
		ProofIsEmpty,
		/// Verification key, not set.
		VerificationKeyIsNotSet,
		/// Malformed key
		MalformedVerificationKey,
		/// Malformed proof
		MalformedProof,
		/// Malformed public inputs
		MalformedPublicInputs,
		/// Curve is not supported
		NotSupportedCurve,
		/// Protocol is not supported
		NotSupportedProtocol,
		/// There was error during proof verification
		ProofVerificationError,
		/// There was false during proof verification
		ProofVerificationFalse,
		/// Proof creation error
		ProofCreationError,
		/// Verification Key creation error
		VerificationKeyCreationError,
		/// Max merkle len
		MaxMerkleLen,
		/// Commitment has been submitted
		CommitmentHasBeanSubmitted,
		/// The note has been already spent
		NoteHasBeanSpent,
		/// Can not find merkel root
		CanNotFindMerkelRoot,
		/// Not merkel root owner
		NotMerkelRootOwner,
		/// timestampe must be larger than last
		TimestampMustBeLargerThanLast,
		/// timestampe must be larger than chain
		TimestampMustBeLargerThanChain,
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
		#[pallet::call_index(0)]
		#[pallet::weight(0)]
		pub fn setup_verification(_origin: OriginFor<T>, vec_vk: Vec<u8>) -> DispatchResult {
			let _vk = store_verification_key::<T>(vec_vk)?;
			Self::deposit_event(Event::<T>::VerificationSetupCompleted);
			Ok(())
		}

		#[pallet::call_index(1)]
		#[pallet::weight(0)]
		pub fn set_otp_commitment(origin: OriginFor<T>, root: Vec<u8>) -> DispatchResult {
			// Check that the extrinsic was signed and get the signer.
			let who = ensure_signed(origin)?;

			let r = U256::from_dec_str(&String::from_utf8(root).unwrap()).unwrap();

			ensure!(!Roots::<T>::contains_key(r), Error::<T>::CommitmentHasBeanSubmitted);

			UserRoots::<T>::insert(who.clone(), r);

			Self::deposit_event(Event::<T>::OtpCommitmentSeted);

			Ok(())
		}
	}

	fn get_verification_key<T: Config>() -> Result<VerificationKey, sp_runtime::DispatchError> {
		let vk = VerificationKeyStorage::<T>::get();

		ensure!(!vk.is_empty(), Error::<T>::VerificationKeyIsNotSet);
		let deserialized_vk = VKey::from_json_u8_slice(vk.as_slice())
			.map_err(|_| Error::<T>::MalformedVerificationKey)?;
		let vk = prepare_verification_key(deserialized_vk)
			.map_err(|_| Error::<T>::VerificationKeyCreationError)?;
		Ok(vk)
	}

	fn store_verification_key<T: Config>(
		vec_vk: Vec<u8>,
	) -> Result<VKey, sp_runtime::DispatchError> {
		let vk: VerificationKeyDef<T> = vec_vk.try_into().map_err(|e| {
			log::info!("@@@ store_verification_key err: {:?}", e);
			Error::<T>::TooLongVerificationKey
		})?;
		let deserialized_vk = VKey::from_json_u8_slice(vk.as_slice())
			.map_err(|_| Error::<T>::MalformedVerificationKey)?;
		ensure!(deserialized_vk.curve == SUPPORTED_CURVE.as_bytes(), Error::<T>::NotSupportedCurve);
		ensure!(
			deserialized_vk.protocol == SUPPORTED_PROTOCOL.as_bytes(),
			Error::<T>::NotSupportedProtocol
		);

		VerificationKeyStorage::<T>::put(vk);
		Ok(deserialized_vk)
	}

	fn parse_proof<T: Config>(vec_proof: Vec<u8>) -> Result<GProof, sp_runtime::DispatchError> {
		log::info!("before check in parse_proof try_into");
		let proof: ProofDef<T> = vec_proof.try_into().map_err(|_| Error::<T>::TooLongProof)?;

		log::info!("before check in parse_proof deserialized_proof MalformedProof");
		let deserialized_proof =
			Proof::from_json_u8_slice(proof.as_slice()).map_err(|_| Error::<T>::MalformedProof)?;
		ensure!(
			deserialized_proof.curve == SUPPORTED_CURVE.as_bytes(),
			Error::<T>::NotSupportedCurve
		);
		ensure!(
			deserialized_proof.protocol == SUPPORTED_PROTOCOL.as_bytes(),
			Error::<T>::NotSupportedProtocol
		);

		log::info!("before check in from_uncompressed");
		let proof = GProof::from_uncompressed(
			&G1UncompressedBytes::new(deserialized_proof.a[0], deserialized_proof.a[1]),
			&G2UncompressedBytes::new(
				deserialized_proof.b[0][0],
				deserialized_proof.b[0][1],
				deserialized_proof.b[1][0],
				deserialized_proof.b[1][1],
			),
			&G1UncompressedBytes::new(deserialized_proof.c[0], deserialized_proof.c[1]),
		)
		.map_err(|_| Error::<T>::ProofCreationError)?;

		Ok(proof)
	}

	impl<T: Config> Otp<T::AccountId> for Pallet<T> {
		//Only checks that time in the proof is larger than lastUsedTime, i.e. behaves like HOTP
		fn naive_approval(
			owner: T::AccountId,
			proof: Vec<u8>,
			root: Vec<u8>,
			timestamp: u128,
		) -> DispatchResult {
			log::info!("before check in get_verification_key");
			let vk = get_verification_key::<T>()?;

			log::info!("before check in parse_proof");
			let proof = parse_proof::<T>(proof)?;

			log::info!("before U256::from_dec_str(&root);");
			let root = U256::from_dec_str(&String::from_utf8(root).unwrap()).unwrap();

			log::info!("before UserLastTimestamp::<T>::get(owner);;");
			let user_last_timestamp = UserLastTimestamp::<T>::get(owner);
			log::info!("before timestamp > user_last_timestamp");
			ensure!(timestamp > user_last_timestamp, Error::<T>::TimestampMustBeLargerThanLast);

			let timestamp = U256::from(timestamp);
			let public_inputs = vec![root, timestamp];
			log::info!("before public_inputs {:?}", public_inputs);
			let public_inputs = prepare_public_inputs(public_inputs);

			log::info!("before verify");
			match verify(vk, proof, public_inputs) {
				Ok(true) => {
					log::info!("verify OK");
					//Ok(())
				},
				Ok(false) => {
					log::info!("verify false");
					//Self::deposit_event(Event::<T>::VerificationFailed);
					return Err(Error::<T>::ProofVerificationFalse.into())
				},
				Err(e) => {
					log::info!("verify error {:?}", e);
					return Err(Error::<T>::ProofVerificationError.into())
				},
			};

			Ok(())
		}

		//Uses block timestamp to validate time, TOTP
		fn block_time_approval(
			owner: T::AccountId,
			proof: Vec<u8>,
			root: Vec<u8>,
			timestamp: u128,
		) -> DispatchResult {
			let vk = get_verification_key::<T>()?;
			let proof = parse_proof::<T>(proof)?;

			let root = U256::from_dec_str(&String::from_utf8(root).unwrap()).unwrap();

			let user_last_timestamp = UserLastTimestamp::<T>::get(owner);
			ensure!(timestamp > user_last_timestamp, Error::<T>::TimestampMustBeLargerThanLast);

			let timestamp_now = T::TimeProvider::now();
			let block_time = timestamp_now.as_millis();
			ensure!(timestamp > block_time, Error::<T>::TimestampMustBeLargerThanChain);

			let timestamp = U256::from(timestamp);
			let public_inputs = vec![root, timestamp];
			let public_inputs = prepare_public_inputs(public_inputs);

			match verify(vk, proof, public_inputs) {
				Ok(true) => {
					//Ok(())
				},
				Ok(false) => {
					//Self::deposit_event(Event::<T>::VerificationFailed);
					return Err(Error::<T>::ProofVerificationFalse.into())
				},
				Err(e) => {
					log::info!("verify error {:?}", e);

					return Err(Error::<T>::ProofVerificationError.into())
				},
			};

			Ok(())
		}
	}
}
