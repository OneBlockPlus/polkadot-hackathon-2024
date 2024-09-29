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
pub mod merkle_tree;
pub mod mimc;
pub mod verify;

use frame_support::{
	storage::bounded_vec::BoundedVec,
	traits::{Currency, ExistenceRequirement::AllowDeath, ReservableCurrency},
};
pub use pallet::*;
use sp_std::vec::Vec;

type PublicInputsDef<T> = BoundedVec<u8, <T as Config>::MaxPublicInputsLength>;
type ProofDef<T> = BoundedVec<u8, <T as Config>::MaxProofLength>;
type VerificationKeyDef<T> = BoundedVec<u8, <T as Config>::MaxVerificationKeyLength>;
pub type BalanceOf<T> =
	<<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

// All pallet logic is defined in its own module and must be annotated by the `pallet` attribute.
#[frame_support::pallet]
pub mod pallet {
	// Import various useful types required by all FRAME pallets.
	use super::*;
	use crate::{
		common::prepare_verification_key,
		deserialization::{deserialize_public_inputs, Proof, VKey},
		merkle_tree::MerkleTree,
		verify::{
			prepare_public_inputs, verify, G1UncompressedBytes, G2UncompressedBytes, GProof,
			VerificationKey, SUPPORTED_CURVE, SUPPORTED_PROTOCOL,
		},
	};
	use frame_support::{pallet_prelude::*, PalletId};
	use frame_system::pallet_prelude::*;
	use primitives::{Otp, Swap};
	use sp_runtime::traits::AccountIdConversion;
	use sp_std::vec;

	const STORAGE_VERSION: StorageVersion = StorageVersion::new(1);

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

		#[pallet::constant]
		type PalletId: Get<PalletId>;

		/// The currency mechanism.
		type Currency: ReservableCurrency<Self::AccountId>;

		#[pallet::constant]
		type MixerBalance: Get<BalanceOf<Self>>;

		type SwapApi: Swap<BalanceOf<Self>, Self::AccountId>;

		type OtpApi: Otp<Self::AccountId>;
	}

	#[pallet::storage]
	#[pallet::getter(fn roots)]
	pub type Roots<T: Config> = StorageMap<_, Blake2_128Concat, U256, bool>;

	#[pallet::storage]
	#[pallet::getter(fn nullifier_hashes)]
	pub type NullifierHashes<T: Config> = StorageMap<_, Blake2_128Concat, U256, bool>;

	#[pallet::storage]
	#[pallet::getter(fn commitments)]
	pub type Commitments<T: Config> = StorageMap<_, Blake2_128Concat, U256, bool>;

	#[pallet::storage]
	#[pallet::getter(fn merkle_vec)]
	pub type MerkleVec<T> = StorageValue<_, BoundedVec<U256, ConstU32<{ u32::MAX }>>, ValueQuery>;

	/// Storing a public input.
	#[pallet::storage]
	pub type PublicInputStorage<T: Config> = StorageValue<_, PublicInputsDef<T>, ValueQuery>;

	/// Storing a verification key.
	#[pallet::storage]
	pub type VerificationKeyStorage<T: Config> = StorageValue<_, VerificationKeyDef<T>, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn blacklist)]
	pub type BlackList<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, bool>;

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
		/// Invalid withdraw proof
		InvalidWithdrawProof,
		/// Blacklist rejected
		BlacklistRejected,
		/// Amount must be equ
		AmountMustBeEqu,
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
		pub fn setup_verification(origin: OriginFor<T>, vec_vk: Vec<u8>) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let vk = store_verification_key::<T>(vec_vk)?;
			//ensure!(vk.public_inputs_len == inputs.len() as u8,
			// Error::<T>::PublicInputsMismatch);
			Self::deposit_event(Event::<T>::VerificationSetupCompleted);
			Ok(())
		}

		#[pallet::call_index(1)]
		#[pallet::weight(0)]
		pub fn deposit(origin: OriginFor<T>, commitment: Vec<u8>) -> DispatchResult {
			// Check that the extrinsic was signed and get the signer.
			let who = ensure_signed(origin)?;

			ensure!(!BlackList::<T>::contains_key(who.clone()), Error::<T>::BlacklistRejected);

			let c = U256::from_big_endian(&commitment);

			ensure!(!Commitments::<T>::contains_key(c), Error::<T>::CommitmentHasBeanSubmitted);

			MerkleVec::<T>::try_mutate(|merkle_vec| -> DispatchResult {
				let _ = merkle_vec.try_push(c);
				Ok(())
			})?;

			let merkle_vec = MerkleVec::<T>::get();
			let len = merkle_vec.len();

			for x in &merkle_vec {
				Commitments::<T>::insert(x, true);
			}

			Commitments::<T>::insert(c, true);
			let mut mt = MerkleTree::default();
			let (leaf, index) = mt.insert(U256::from_big_endian(&commitment)).unwrap();

			let root = mt.get_root();
			Roots::<T>::insert(root, true);

			T::Currency::transfer(&who, &account_id::<T>(), T::MixerBalance::get(), AllowDeath)?;

			Ok(())
		}

		#[pallet::call_index(2)]
		#[pallet::weight(0)]
		pub fn deposit_with_naive_otp(
			origin: OriginFor<T>,
			commitment: Vec<u8>,
			otp_proof: Vec<u8>,
			otp_root: Vec<u8>,
			timestamp: u128,
		) -> DispatchResult {
			// Check that the extrinsic was signed and get the signer.
			let who = ensure_signed(origin)?;

			ensure!(!BlackList::<T>::contains_key(who.clone()), Error::<T>::BlacklistRejected);

			T::OtpApi::naive_approval(who.clone(), otp_proof, otp_root, timestamp)?;

			let c = U256::from_big_endian(&commitment);

			ensure!(!Commitments::<T>::contains_key(c), Error::<T>::CommitmentHasBeanSubmitted);

			MerkleVec::<T>::try_mutate(|merkle_vec| -> DispatchResult {
				let _ = merkle_vec.try_push(c);
				Ok(())
			})?;

			let merkle_vec = MerkleVec::<T>::get();
			let len = merkle_vec.len();

			for x in &merkle_vec {
				Commitments::<T>::insert(x, true);
			}

			Commitments::<T>::insert(c, true);
			let mut mt = MerkleTree::default();
			let (leaf, index) = mt.insert(U256::from_big_endian(&commitment)).unwrap();

			let root = mt.get_root();
			Roots::<T>::insert(root, true);

			T::Currency::transfer(&who, &account_id::<T>(), T::MixerBalance::get(), AllowDeath)?;

			Ok(())
		}

		#[pallet::call_index(3)]
		#[pallet::weight(0)]
		pub fn deposit_with_block_time_otp(
			origin: OriginFor<T>,
			commitment: Vec<u8>,
			otp_proof: Vec<u8>,
			otp_root: Vec<u8>,
			timestamp: u128,
		) -> DispatchResult {
			// Check that the extrinsic was signed and get the signer.
			let who = ensure_signed(origin)?;

			ensure!(!BlackList::<T>::contains_key(who.clone()), Error::<T>::BlacklistRejected);

			T::OtpApi::block_time_approval(who.clone(), otp_proof, otp_root, timestamp)?;

			let c = U256::from_big_endian(&commitment);

			ensure!(!Commitments::<T>::contains_key(c), Error::<T>::CommitmentHasBeanSubmitted);

			MerkleVec::<T>::try_mutate(|merkle_vec| -> DispatchResult {
				let _ = merkle_vec.try_push(c);
				Ok(())
			})?;

			let merkle_vec = MerkleVec::<T>::get();
			let len = merkle_vec.len();

			for x in &merkle_vec {
				Commitments::<T>::insert(x, true);
			}

			Commitments::<T>::insert(c, true);
			let mut mt = MerkleTree::default();
			let (leaf, index) = mt.insert(U256::from_big_endian(&commitment)).unwrap();

			let root = mt.get_root();
			Roots::<T>::insert(root, true);

			T::Currency::transfer(&who, &account_id::<T>(), T::MixerBalance::get(), AllowDeath)?;

			Ok(())
		}

		#[pallet::call_index(4)]
		#[pallet::weight(0)]
		pub fn withdraw(
			origin: OriginFor<T>,
			proof: Vec<u8>,
			root: Vec<u8>,
			nullifier_hash: Vec<u8>,
			receiver: T::AccountId,
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;

			ensure!(!BlackList::<T>::contains_key(sender.clone()), Error::<T>::BlacklistRejected);
			ensure!(!BlackList::<T>::contains_key(receiver.clone()), Error::<T>::BlacklistRejected);

			let nullifier_hash = U256::from_big_endian(&nullifier_hash);
			ensure!(
				!NullifierHashes::<T>::contains_key(nullifier_hash),
				Error::<T>::NoteHasBeanSpent
			);

			let root = U256::from_big_endian(&root);
			ensure!(Roots::<T>::contains_key(root), Error::<T>::CanNotFindMerkelRoot);

			let proof = parse_proof::<T>(proof)?;
			let vk = get_verification_key::<T>()?;
			let public_inputs = vec![root, nullifier_hash];
			let public_inputs = prepare_public_inputs(public_inputs);

			match verify(vk, proof, public_inputs) {
				Ok(true) => {
					//Self::deposit_event(Event::<T>::VerificationSuccess { who: sender });
					NullifierHashes::<T>::insert(nullifier_hash, true);
					T::Currency::transfer(
						&account_id::<T>(),
						&receiver,
						T::MixerBalance::get(),
						AllowDeath,
					)?;
					//Ok(())
				},
				Ok(false) => {
					//Self::deposit_event(Event::<T>::VerificationFailed);
					return Err(Error::<T>::ProofVerificationFalse.into())
				},
				Err(e) => return Err(Error::<T>::ProofVerificationError.into()),
			};

			Ok(())
		}

		#[pallet::call_index(5)]
		#[pallet::weight(0)]
		pub fn swap(
			origin: OriginFor<T>,
			proof: Vec<u8>,
			root: Vec<u8>,
			nullifier_hash: Vec<u8>,
			order_id: u32,
			receiver: T::AccountId,
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;

			ensure!(!BlackList::<T>::contains_key(sender.clone()), Error::<T>::BlacklistRejected);
			ensure!(!BlackList::<T>::contains_key(receiver.clone()), Error::<T>::BlacklistRejected);

			let nullifier_hash = U256::from_big_endian(&nullifier_hash);
			ensure!(
				!NullifierHashes::<T>::contains_key(nullifier_hash),
				Error::<T>::NoteHasBeanSpent
			);

			let root = U256::from_big_endian(&root);
			ensure!(Roots::<T>::contains_key(root), Error::<T>::CanNotFindMerkelRoot);

			let proof = parse_proof::<T>(proof)?;
			let vk = get_verification_key::<T>()?;
			let inputs = get_public_inputs::<T>()?;

			let inputs = prepare_public_inputs(inputs);
			match verify(vk, proof, inputs) {
				Ok(true) => {
					//Self::deposit_event(Event::<T>::VerificationSuccess { who: sender });
					NullifierHashes::<T>::insert(nullifier_hash, true);

					let amount = T::SwapApi::get_target_amount(order_id);

					ensure!(amount == T::MixerBalance::get(), Error::<T>::AmountMustBeEqu);

					T::SwapApi::inter_take_order(account_id::<T>(), order_id, receiver)?;
				},
				Ok(false) => {
					//Self::deposit_event(Event::<T>::VerificationFailed);
					return Err(Error::<T>::ProofVerificationFalse.into())
				},
				Err(e) => return Err(Error::<T>::ProofVerificationError.into()),
			};

			Ok(())
		}

		#[pallet::call_index(6)]
		#[pallet::weight(0)]
		pub fn add_black_list(origin: OriginFor<T>, acc: T::AccountId) -> DispatchResult {
			let who = ensure_signed(origin)?;

			BlackList::<T>::insert(acc, true);

			Self::deposit_event(Event::<T>::VerificationSetupCompleted);
			Ok(())
		}
	}

	fn get_public_inputs<T: Config>() -> Result<Vec<sp_core::U256>, sp_runtime::DispatchError> {
		let public_inputs = PublicInputStorage::<T>::get();
		let deserialized_public_inputs = deserialize_public_inputs(public_inputs.as_slice())
			.map_err(|_| Error::<T>::MalformedPublicInputs)?;
		Ok(deserialized_public_inputs)
	}

	fn store_public_inputs<T: Config>(
		pub_input: Vec<u8>,
	) -> Result<Vec<U256>, sp_runtime::DispatchError> {
		let public_inputs: PublicInputsDef<T> =
			pub_input.try_into().map_err(|_| Error::<T>::TooLongPublicInputs)?;
		let deserialized_public_inputs = deserialize_public_inputs(public_inputs.as_slice())
			.map_err(|_| Error::<T>::MalformedPublicInputs)?;

		PublicInputStorage::<T>::put(public_inputs);
		Ok(deserialized_public_inputs)
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
			//println!("@@@ store_verification_key err: {:?}", e);
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
		let proof: ProofDef<T> = vec_proof.try_into().map_err(|_| Error::<T>::TooLongProof)?;
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

	pub fn account_id<T: Config>() -> <T as frame_system::Config>::AccountId {
		<T as Config>::PalletId::get().into_account_truncating()
	}
}
