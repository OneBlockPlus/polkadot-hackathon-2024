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
    use fhe::bfv::{BfvParametersBuilder, Ciphertext, Encoding, Plaintext, PublicKey, SecretKey};
    use fhe_traits::*;
    use frame_support::{
        dispatch::DispatchResult,
        pallet_prelude::*,
        storage::bounded_vec::BoundedVec,
        traits::{Get, Randomness},
    };
    use frame_system::pallet_prelude::*;
    use rand::{rngs::SmallRng, SeedableRng};
    use sp_std::prelude::*;

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
        /// Maximum size of a ciphertext in bytes.
        #[pallet::constant]
        type MaxCiphertextSize: Get<u32>;
        /// Maximum number of ciphertexts a user can store.
        #[pallet::constant]
        type MaxCiphertextsPerUser: Get<u32>;
        /// Size of the FHE key in bytes.
        #[pallet::constant]
        type FheKeySize: Get<u32>;
        /// Randomness source
        type Randomness: Randomness<Self::Hash, BlockNumberFor<Self>>;
    }

    /// A storage item for this pallet.
    ///
    /// In this template, we are declaring a storage item called `Something` that stores a single
    /// `u32` value. Learn more about runtime storage here: <https://docs.substrate.io/build/runtime-storage/>
    #[pallet::storage]
    pub type Something<T> = StorageValue<_, u32>;

    #[pallet::storage]
    #[pallet::getter(fn user_ciphertexts)]
    pub type UserCiphertexts<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        BoundedVec<
            (
                BoundedVec<u8, T::MaxCiphertextSize>,
                BoundedVec<u8, T::MaxCiphertextSize>,
            ),
            T::MaxCiphertextsPerUser,
        >,
        ValueQuery,
    >;

    #[pallet::storage]
    #[pallet::getter(fn fhe_keys)]
    pub type FheKeys<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        BoundedVec<
            (BoundedVec<u8, T::FheKeySize>, BoundedVec<u8, T::FheKeySize>),
            T::MaxCiphertextsPerUser,
        >,
        ValueQuery,
    >;

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

        /// User successfully created FHE keys.
        FheKeysCreated {
            /// The account who created the keys.
            who: T::AccountId,
        },

        /// User successfully encrypted numbers.
        NumbersEncrypted {
            /// The account who encrypted the numbers.
            who: T::AccountId,
            /// The first ciphertext.
            ciphertext_1: Vec<u8>,
            /// The second ciphertext.
            ciphertext_2: Vec<u8>,
        },

        /// User successfully decrypted the result.
        ResultDecrypted {
            /// The account who decrypted the result.
            who: T::AccountId,
            /// The decrypted result.
            result: Vec<i64>,
        },

        /// User successfully encrypted numbers using a key.
        NumbersEncryptedUsingKey {
            /// The account who encrypted the numbers.
            who: T::AccountId,
            /// The ciphertext.
            ciphertext: Vec<u8>,
        },
    }

    #[derive(Encode, Decode, Clone, RuntimeDebug, PartialEq, Eq, TypeInfo, MaxEncodedLen)]
    pub enum Operation {
        Add,
        Sub,
        Mul,
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
        /// There was an error in the FHE library.
        FheError,
        FailedToCreateParameters,
        EncryptionFailed,
        DecryptionFailed,
        EncodingFailed,

        /// Error when vector bound is not met.
        ErrorVectorBound,
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
        pub fn encrypt_numbers(
            origin: OriginFor<T>,
            number_1: u64,
            number_2: u64,
        ) -> DispatchResult {
            // Check that the extrinsic was signed and get the signer.
            let who = ensure_signed(origin)?;

            // Create BFV parameters with error handling
            let parameters = BfvParametersBuilder::new()
                .set_degree(2048)
                .set_moduli(&[0x3fffffff000001])
                .set_plaintext_modulus(1 << 10)
                .build_arc()
                .map_err(|_| Error::<T>::FailedToCreateParameters)?;

            // Build a random number generator with a random seed
            let mut rng = SmallRng::seed_from_u64(Self::generate_random_seed());

            // Generate keys
            let secret_key = SecretKey::random(&parameters, &mut rng);
            let public_key = PublicKey::new(&secret_key, &mut rng);

            // Encode plaintexts
            let plaintext_1 = Plaintext::try_encode(&[number_1], Encoding::poly(), &parameters)
                .map_err(|_| Error::<T>::EncodingFailed)?;
            let plaintext_2 = Plaintext::try_encode(&[number_2], Encoding::poly(), &parameters)
                .map_err(|_| Error::<T>::EncodingFailed)?;

            // Encrypt plaintexts
            let ciphertext_1: Ciphertext = secret_key
                .try_encrypt(&plaintext_1, &mut rng)
                .map_err(|_| Error::<T>::EncryptionFailed)?;
            let ciphertext_2: Ciphertext = public_key
                .try_encrypt(&plaintext_2, &mut rng)
                .map_err(|_| Error::<T>::EncryptionFailed)?;

            // Convert Vec<u8> to BoundedVec<u8, T::MaxCiphertextSize>
            let bounded_ciphertext_1: BoundedVec<u8, T::MaxCiphertextSize> =
                BoundedVec::try_from(ciphertext_1.to_bytes())
                    .map_err(|_| Error::<T>::ErrorVectorBound)?;
            let bounded_ciphertext_2: BoundedVec<u8, T::MaxCiphertextSize> =
                BoundedVec::try_from(ciphertext_2.to_bytes())
                    .map_err(|_| Error::<T>::ErrorVectorBound)?;

            // Convert the keys to bytes
            let secret_key_bytes: BoundedVec<u8, T::FheKeySize> =
                BoundedVec::try_from(secret_key.to_bytes())
                    .map_err(|_| Error::<T>::ErrorVectorBound)?;

            let public_key_bytes: BoundedVec<u8, T::FheKeySize> =
                BoundedVec::try_from(public_key.to_bytes())
                    .map_err(|_| Error::<T>::ErrorVectorBound)?;

            // Store the ciphertexts in storage
            UserCiphertexts::<T>::mutate(&who, |ciphertexts| {
                ciphertexts
                    .try_push((bounded_ciphertext_1.clone(), bounded_ciphertext_2.clone()))
                    .map_err(|_| Error::<T>::FheError)
            })?;

            FheKeys::<T>::mutate(&who, |keys| {
                keys.try_push((secret_key_bytes, public_key_bytes))
                    .map_err(|_| Error::<T>::FheError)
            })?;

            Self::deposit_event(Event::NumbersEncrypted {
                who,
                ciphertext_1: bounded_ciphertext_1.into(),
                ciphertext_2: bounded_ciphertext_2.into(),
            });

            // Return a successful `DispatchResult`
            Ok(())
        }

        #[pallet::call_index(1)]
        #[pallet::weight(T::WeightInfo::do_something())]
        pub fn decrypt_result(
            origin: OriginFor<T>,
            index: u32,           // Index of the ciphertext pair in storage
            operation: Operation, // Operation to perform
        ) -> DispatchResult {
            // Check that the extrinsic was signed and get the signer.
            let who = ensure_signed(origin)?;

            // Retrieve the ciphertexts from storage
            let ciphertexts = UserCiphertexts::<T>::get(&who);
            let (ciphertext_1_bytes, ciphertext_2_bytes) = ciphertexts
                .get(index as usize)
                .ok_or(Error::<T>::NoneValue)?;

            // Create BFV parameters with error handling
            let parameters = BfvParametersBuilder::new()
                .set_degree(2048)
                .set_moduli(&[0x3fffffff000001])
                .set_plaintext_modulus(1 << 10)
                .build_arc()
                .map_err(|_| Error::<T>::FailedToCreateParameters)?;

            // Generate secret key
            let fhe_keys = FheKeys::<T>::get(&who);
            let secret_key_bytes: &[u8] = fhe_keys
                .get(index as usize)
                .ok_or(Error::<T>::NoneValue)?
                .0
                .as_slice();

            let secret_key = SecretKey::from_bytes(secret_key_bytes, &parameters).unwrap();

            // Deserialize the ciphertext
            let ciphertext_1 = Ciphertext::from_bytes(ciphertext_1_bytes, &parameters)
                .map_err(|_| Error::<T>::EncryptionFailed)?;

            let ciphertext_2 = Ciphertext::from_bytes(ciphertext_2_bytes, &parameters)
                .map_err(|_| Error::<T>::EncryptionFailed)?;

            // Decrypt ciphertexts based on the mathematical operation
            let multiplied_ciphers = match operation {
                Operation::Add => &ciphertext_1 + &ciphertext_2,
                Operation::Sub => &ciphertext_1 - &ciphertext_2,
                Operation::Mul => &ciphertext_1 * &ciphertext_2,
            };
            // Decrypt the result
            let decrypted_plaintext = secret_key
                .try_decrypt(&multiplied_ciphers)
                .map_err(|_| Error::<T>::DecryptionFailed)?;

            // Decode the decrypted plaintext
            let decrypted_vector = Vec::<i64>::try_decode(&decrypted_plaintext, Encoding::poly())
                .map_err(|_| Error::<T>::EncodingFailed)?;

            // Emit event with the decrypted result
            Self::deposit_event(Event::ResultDecrypted {
                who,
                result: decrypted_vector,
            });

            // Return a successful `DispatchResult`
            Ok(())
        }

        #[pallet::call_index(2)]
        #[pallet::weight(T::WeightInfo::do_something())]
        pub fn decrypt_ciphertexts(
            origin: OriginFor<T>,
            cipher_text_1: Vec<u8>,
            cipher_text_2: Vec<u8>,
            index: u32,           // Index of the ciphertext pair in storage
            operation: Operation, // Operation to perform
        ) -> DispatchResult {
            // Check that the extrinsic was signed and get the signer.
            let who = ensure_signed(origin)?;

            // Create BFV parameters with error handling
            let parameters = BfvParametersBuilder::new()
                .set_degree(2048)
                .set_moduli(&[0x3fffffff000001])
                .set_plaintext_modulus(1 << 10)
                .build_arc()
                .map_err(|_| Error::<T>::FailedToCreateParameters)?;

            let ciphertext_1 = Ciphertext::from_bytes(&cipher_text_1, &parameters)
                .map_err(|_| Error::<T>::EncryptionFailed)?;

            let ciphertext_2 = Ciphertext::from_bytes(&cipher_text_2, &parameters)
                .map_err(|_| Error::<T>::EncryptionFailed)?;

            // Generate secret key
            let fhe_keys = FheKeys::<T>::get(&who);
            let secret_key_bytes: &[u8] = fhe_keys
                .get(index as usize)
                .ok_or(Error::<T>::NoneValue)?
                .0
                .as_slice();

            let secret_key = SecretKey::from_bytes(secret_key_bytes, &parameters).unwrap();

            // Decrypt ciphertexts based on the mathematical operation
            let multiplied_ciphers = match operation {
                Operation::Add => &ciphertext_1 + &ciphertext_2,
                Operation::Sub => &ciphertext_1 - &ciphertext_2,
                Operation::Mul => &ciphertext_1 * &ciphertext_2,
            };
            // Decrypt the result
            let decrypted_plaintext = secret_key
                .try_decrypt(&multiplied_ciphers)
                .map_err(|_| Error::<T>::DecryptionFailed)?;

            // Decode the decrypted plaintext
            let decrypted_vector = Vec::<i64>::try_decode(&decrypted_plaintext, Encoding::poly())
                .map_err(|_| Error::<T>::EncodingFailed)?;

            // Emit event with the decrypted result
            Self::deposit_event(Event::ResultDecrypted {
                who,
                result: decrypted_vector,
            });

            // Return a successful `DispatchResult`
            Ok(())
        }

        #[pallet::call_index(3)]
        #[pallet::weight(T::WeightInfo::do_something())]
        pub fn encrypt_numbers_using_key(
            origin: OriginFor<T>,
            number: u64,
            index: u32,
        ) -> DispatchResult {
            // Check that the extrinsic was signed and get the signer.
            let who = ensure_signed(origin)?;

            // Create BFV parameters with error handling
            let parameters = BfvParametersBuilder::new()
                .set_degree(2048)
                .set_moduli(&[0x3fffffff000001])
                .set_plaintext_modulus(1 << 10)
                .build_arc()
                .map_err(|_| Error::<T>::FailedToCreateParameters)?;

            let mut rng = SmallRng::seed_from_u64(1);

            // Generate secret key
            let fhe_keys = FheKeys::<T>::get(&who);
            let secret_key_bytes: &[u8] = fhe_keys
                .get(index as usize)
                .ok_or(Error::<T>::NoneValue)?
                .0
                .as_slice();

            let secret_key = SecretKey::from_bytes(secret_key_bytes, &parameters).unwrap();

            // Encode plaintexts
            let plaintext = Plaintext::try_encode(&[number], Encoding::poly(), &parameters)
                .map_err(|_| Error::<T>::EncodingFailed)?;

            // Encrypt plaintexts
            let ciphertext: Ciphertext = secret_key
                .try_encrypt(&plaintext, &mut rng)
                .map_err(|_| Error::<T>::EncryptionFailed)?;

            Self::deposit_event(Event::NumbersEncryptedUsingKey {
                who,
                ciphertext: ciphertext.to_bytes().into(),
            });

            // Return a successful `DispatchResult`
            Ok(())
        }
    }

    impl<T: Config> Pallet<T> {
        fn generate_random_seed() -> u64 {
            let (random_seed, _) = T::Randomness::random(&b"fhe-math"[..]);
            <u64>::decode(&mut random_seed.as_ref())
                .expect("random seed shall always be bigger than u64; qed")
        }
    }
}
