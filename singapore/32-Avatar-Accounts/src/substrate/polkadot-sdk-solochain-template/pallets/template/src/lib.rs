#![cfg_attr(not(feature = "std"), no_std)]
pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;
pub mod weights;
pub use weights::*;

use codec::{Decode, Encode, MaxEncodedLen};
use frame_support::{
	dispatch::{extract_actual_weight, GetDispatchInfo, PostDispatchInfo},
	traits::{IsSubType, OriginTrait, UnfilteredDispatchable}
};
use frame_support::sp_runtime::traits::{BadOrigin, Dispatchable, TrailingZeroInput, Verify, BlakeTwo256, One};
use sp_core::{H160, H256, U256, crypto::AccountId32, Hasher, ecdsa, ecdsa::Signature as EthSignature, ecdsa::Pair as Pair, ByteArray};
use sp_io::hashing::keccak_256;
use sp_io::hashing::blake2_256;
use sp_io::crypto::secp256k1_ecdsa_recover;

pub const MAX_POSSIBLE_ALLOCATION: u32 = 33554432;

// All pallet logic is defined in its own module and must be annotated by the `pallet` attribute.
#[frame_support::pallet]
pub mod pallet {
	use super::*;
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
  use frame_support::DefaultNoBound;
  use core::mem;
  use frame_support::sp_runtime::Vec;
  
	#[pallet::pallet]
	pub struct Pallet<T>(_);

	#[pallet::config]
	pub trait Config: frame_system::Config {

		/// The overarching event type.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

		/// The overarching call type.
		type RuntimeCall: Parameter
			+ Dispatchable<RuntimeOrigin = Self::RuntimeOrigin, PostInfo = PostDispatchInfo>
			+ GetDispatchInfo
			+ From<frame_system::Call<Self>>
			+ UnfilteredDispatchable<RuntimeOrigin = Self::RuntimeOrigin>
			+ IsSubType<Call<Self>>
			+ IsType<<Self as frame_system::Config>::RuntimeCall>;

		/// Weight information for extrinsics in this pallet.
		type WeightInfo: WeightInfo;

    type EthereumAddress: Member + Parameter + Default + Copy + From<H160> + Into<H160> + MaxEncodedLen;
    type EthereumSignature: From<EthSignature> + Member + Parameter + Default;
	}

	#[pallet::storage]
	pub type Something<T> = StorageValue<_, u32>;

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
		/// Batch of dispatches did not complete fully. Index of first failing dispatch given, as
		/// well as the error.
		BatchInterrupted { index: u32, error: DispatchError },
		/// Batch of dispatches completed fully with no error.
		BatchCompleted,
		/// Batch of dispatches completed but has errors.
		BatchCompletedWithErrors,
		/// A single item within a Batch of dispatches has completed with no error.
		ItemCompleted,
		/// A single item within a Batch of dispatches has completed with error.
		ItemFailed { error: DispatchError },
		/// A call was dispatched.
		DispatchedAs { result: DispatchResult },

    UserSubstrateAddress { address: T::AccountId },

    MsgHash { msg_hash: [u8; 32] }
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

		TooManyCalls,

    InvalidSignature,
    InvalidNonce,
	}

  const CALL_ALIGN: u32 = 1024;


  #[pallet::storage]
  pub type Nonces<T: Config> = StorageMap<_, Blake2_128Concat, T::EthereumAddress, T::Nonce, ValueQuery>;
  

	#[pallet::extra_constants]
	impl<T: Config> Pallet<T> {
		/// The limit on the number of batched calls.
		fn batched_calls_limit() -> u32 {
			let allocator_limit = MAX_POSSIBLE_ALLOCATION;
			let call_size = ((mem::size_of::<<T as Config>::RuntimeCall>() as u32 +
				CALL_ALIGN - 1) / CALL_ALIGN) *
				CALL_ALIGN;
			// The margin to take into account vec doubling capacity.
			let margin_factor = 3;

			allocator_limit / margin_factor / call_size
		}
	}

  impl<T: Config> Pallet<T> {
    // Helper function to generate a keyless account
    fn generate_keyless_account(evm_address: &T::EthereumAddress) -> T::AccountId {
      let mut data = b"evm:".to_vec();
      data.extend_from_slice(&evm_address.encode());
      let hash = BlakeTwo256::hash(&data);
      
      // Convert the hash to AccountId
      T::AccountId::decode(&mut hash.as_ref())
          .expect("32 bytes can always be decoded to AccountId")
    }

    fn encode_packed(value: &[u8]) -> Vec<u8> {
      // For a string, we need to hash its UTF-8 encoding
        keccak_256(value).to_vec()
    }

    fn hash_domain() -> [u8; 32] {
        // Construct and hash the domain separator
        let domain_type_hash = keccak_256(b"EIP712Domain(uint256 chainId)");
        // let chain_id: U256 = 84532;
        let encoded_chain_id = U256::from(84532).encode();
        
        keccak_256(&[
            &domain_type_hash[..],
            &keccak_256(&encoded_chain_id)[..],
        ].concat())
    }

    fn get_final_hash(calls_hash: &[u8; 32]) -> [u8; 32] {
       // Construct the domain separator
       let domain_separator = Self::hash_domain();

       // Hash the type
       let type_hash = keccak_256(b"Swamp(string calls_hash)");

       // Hash the message
       let message_hash = &calls_hash;

       log::info!(target: "verify_signature", "message hash V:{:?}", message_hash.clone());

       // Construct the struct hash
       let struct_hash = keccak_256(&[
           &type_hash[..],
           &message_hash[..],
       ].concat());


      log::info!(target: "verify_signature", "domain_separator V:{:?}", domain_separator.clone());

      log::info!(target: "verify_signature", "struct_hash Hash V:{:?}", struct_hash.clone());
       // Construct the final hash
       let final_hash = keccak_256(&[
           b"\x19\x01",
           &domain_separator[..],
           &struct_hash[..],
       ].concat());

       final_hash
    }

    fn recover_signer(calls_hash: &[u8; 32], signature_g: &[u8; 65]) -> Option<H160> {
      let mut evm_addr = H160::default();
      log::info!(target: "verify_signature", "Calls Hash V:{:?}", calls_hash.clone());
      let final_hash = Self::get_final_hash(calls_hash);

      log::info!(target: "verify_signature", "Final Hash V:{:?}", final_hash.clone());


      let public_key = secp256k1_ecdsa_recover(&signature_g, &final_hash)
          .map_err(|_| Error::<T>::InvalidSignature).ok()?;


      evm_addr.0.copy_from_slice(&keccak_256(&public_key)[12..]);

      Some(evm_addr)
    }

    // Helper function to verify the Ethereum signature
    fn verify_signature(message_hash: &[u8; 32], signature: &[u8; 65], expected_address: &T::EthereumAddress) -> bool {
      if let Some(recovered_address) = Self::recover_signer(message_hash, signature) {
        log::info!(target: "verify_signature", "Recovered EVM Address: {:?}", recovered_address.clone());
          recovered_address != (*expected_address).into()
      } else {
          false
      }
    }
  }

  #[pallet::call]
	impl<T: Config> Pallet<T> {
		/// An example dispatchable that takes a singles value as a parameter, writes the value to
		/// storage and emits an event. This function must be dispatched by a signed extrinsic.
		#[pallet::call_index(0)]
		#[pallet::weight({
			let dispatch_infos = calls.iter().map(|call| call.get_dispatch_info()).collect::<Vec<_>>();
			let dispatch_weight = dispatch_infos.iter()
				.map(|di| di.weight)
				.fold(Weight::zero(), |total: Weight, weight: Weight| total.saturating_add(weight))
				.saturating_add(T::WeightInfo::batch(calls.len() as u32));
			let dispatch_class = {
				let all_operational = dispatch_infos.iter()
					.map(|di| di.class)
					.all(|class| class == DispatchClass::Operational);
				if all_operational {
					DispatchClass::Operational
				} else {
					DispatchClass::Normal
				}
			};
			(dispatch_weight, dispatch_class)
		})]
		pub fn exec_txs(origin: OriginFor<T>, 
        evm_address: T::EthereumAddress, 
        signature: [u8; 65],
        calls: Vec<<T as Config>::RuntimeCall>) -> DispatchResultWithPostInfo {

          log::info!(target: "whoos", "whos");
			let who = ensure_signed(origin.clone())?;

			let calls_len = calls.len();
			ensure!(calls_len <= Self::batched_calls_limit() as usize, Error::<T>::TooManyCalls);

      // Verify nonce for user transaction.
      let current_nonce = Nonces::<T>::get(&evm_address);

      // Create hash of the calls
      let encoded_calls = calls.encode();
      let call_hash = keccak_256(&encoded_calls);

      // Prepare the message to be signed (prefix + call_hash + nonce)
      // let mut message = b"\x19Ethereum Signed Message:\n32".to_vec();
      // message.extend_from_slice(&call_hash);
      // message.extend_from_slice(&current_nonce.encode());
      // let message_hash = keccak_256(&message);

      // Self::deposit_event(Event::MsgHash {
      //   msg_hash: message_hash.clone()
      // });

      // Verify the signature
      ensure!(
        Self::verify_signature(&call_hash, &signature, &evm_address),
        Error::<T>::InvalidSignature
      );
      // ensure!(
      //   Self::verify_signature(&message_hash, &signature, &evm_address),
      //   Error::<T>::InvalidSignature
      // );
  
      // Increment the nonce
      Nonces::<T>::insert(&evm_address, current_nonce + T::Nonce::one());

      // Generate a keyless account
      let substrate_address = Self::generate_keyless_account(&evm_address);

      Self::deposit_event(Event::UserSubstrateAddress {
        address: substrate_address.clone()
      });
      
			// Track the actual weight of each of the batch calls.
			let mut weight = Weight::zero();
			for (index, call) in calls.into_iter().enumerate() {
				let info = call.get_dispatch_info();
				// If origin is root, don't apply any dispatch filters; root can call anything.
        let user_origin: OriginFor<T> = frame_system::RawOrigin::Signed(substrate_address.clone()).into();

				let result = call.dispatch_bypass_filter(user_origin.clone());


				// Add the weight of this call.
				weight = weight.saturating_add(extract_actual_weight(&result, &info));
				if let Err(e) = result {
					Self::deposit_event(Event::BatchInterrupted {
						index: index as u32,
						error: e.error,
					});
					// Take the weight of this function itself into account.
					let base_weight = T::WeightInfo::batch(index.saturating_add(1) as u32);
					// Return the actual used weight + base_weight of this call.
					return Ok(Some(base_weight + weight).into())
				}
				Self::deposit_event(Event::ItemCompleted);
			}

			Self::deposit_event(Event::BatchCompleted);
			let base_weight = T::WeightInfo::batch(calls_len as u32);

			Ok(Some(base_weight + weight).into())
      
		}

		/// An example dispatchable that takes a single u32 value as a parameter, writes the value
		/// to storage and emits an event.
		///
		/// It checks that the _origin_ for this call is _Signed_ and returns a dispatch
		/// error if it isn't. Learn more about origins here: <https://docs.substrate.io/build/origins/>
		#[pallet::call_index(1)]
		#[pallet::weight(10)]
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

		#[pallet::call_index(2)]
		#[pallet::weight(10)]
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
	}
}
