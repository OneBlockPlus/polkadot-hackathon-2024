//! # Attestations Pallet V0.2.0 BETA "Attached Contracts"
//!
//! A pallet with attestations functionality to help developers integrate attestations to their projects.

// We make sure this pallet uses `no_std` for compiling to Wasm.
#![cfg_attr(not(feature = "std"), no_std)]

pub mod schema;
pub use crate::schema::SIZE_STRINGS;

// Re-export pallet items so that they can be accessed from the crate namespace.
pub use pallet::*;


// FRAME pallets require their own "mock runtimes" to be able to run unit tests. This module
// contains a mock runtime specific for testing this pallet's functionality.
#[cfg(test)]
mod mock;

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
	use frame_support::pallet_prelude::*;
	use frame_support::traits::Currency;
	use frame_system::pallet_prelude::*;
	use crate::schema::{Schema, Attestation}; 
	use scale_info::prelude::vec::Vec;
	use pallet_contracts::CollectEvents;
	use frame_support::traits::fungible;
	
	

	// Define BalanceOf
	// pub type BalanceOf<T> = <<T as Config>::NativeBalance as fungible::Inspect<<T as frame_system::Config>::AccountId>>::Balance; 
	pub type BalanceOf<T> = <<T as pallet_contracts::Config>::Currency as fungible::Inspect<<T as frame_system::Config>::AccountId>>::Balance; // Define BalanceOf


	// The `Pallet` struct serves as a placeholder to implement traits, methods and dispatchables
	// (`Call`s) in this pallet.
	#[pallet::pallet]
	#[pallet::without_storage_info]
	pub struct Pallet<T>(_);

	/// The pallet's configuration trait.
	#[pallet::config]
	pub trait Config: frame_system::Config + pallet_contracts::Config {
		/// The overarching runtime event type.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		/// A type representing the weights required by the dispatchables of this pallet.
		type WeightInfo: WeightInfo;

		// The native balance type.
		// type NativeBalance: fungible::Inspect<Self::AccountId>;
	}

	// Storage item for this pallet.
	//
	// In this pallet, we are declaring two storage items called `Scehmas` and `Attestations`
	// to store the corresponding data, and two counters for unique ID management.

	/// Schema storage for the pallet.
	#[pallet::storage]
    #[pallet::getter(fn schema)]
    pub type Schemas<T: Config> = StorageMap<_, Blake2_128Concat, u32, Schema>;

	/// Attestation storage for the pallet.
    #[pallet::storage]
    #[pallet::getter(fn attestation)]
	pub type Attestations<T: Config> = StorageMap<_, Blake2_128Concat, u32, Attestation>;

	/// Schema ID counter for unique ID management.
	#[pallet::storage]
	#[pallet::getter(fn next_schema_id)]
	pub type NextSchemaId<T> = StorageValue<_, u32, ValueQuery>;

	/// Attestation ID counter for unique ID management.
	#[pallet::storage]
	#[pallet::getter(fn next_attestation_id)]
	pub type NextAttestationId<T> = StorageValue<_, u32, ValueQuery>;

	/// Events that functions in this pallet can emit.
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event emitted when a schema is inserted. The parameters are the ID of the schema and the account that created it.
		SchemaInserted { schema_id: u32, who: T::AccountId },
		/// Event emitted when an attestation is inserted. The parameters are the ID of the attestation and the account that created it.
		AttestationInserted { attestation_id: u32, who: T::AccountId },
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
		/// There was an attempt to insert an attestation with an invalid schema id.
		SchemaNotFound,
		/// The issuer's account ID is longer than the allowed account id length.
		AccountIdTooLong,
		/// The block number conversion failed.
		BlockNumberConversionFailed,
		/// The contract call failed.
		ContractCallFailed,
	}

	/// The pallet's dispatchable functions ([`Call`]s).
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// Function which inserts a schema into the pallet storage.
		#[pallet::call_index(0)]
		#[pallet::weight(<T as pallet::Config>::WeightInfo::insert_schema())]
        pub fn insert_schema(origin: OriginFor<T>, schema: Schema) -> DispatchResult {
            let who = ensure_signed(origin)?;

			// Check if the counter is already initialized, if not set it to 1
			if NextSchemaId::<T>::get() == 0 {
				NextSchemaId::<T>::put(1);
			}

			// Get the next unique schema ID
			let schema_id = NextSchemaId::<T>::get();

			// Update the schema with the new ID
			let mut new_schema = schema;
			new_schema.id = schema_id;

			// Encode the issuer's account ID into a Vec<u8>
			let account_id_as_bytes = who.encode();

			// Convert the Vec<u8> to BoundedVec<u8, ConstU32<SIZE_STRINGS>>
			let issuer: BoundedVec<u8, ConstU32<SIZE_STRINGS>> = account_id_as_bytes.try_into()
				.map_err(|_| Error::<T>::AccountIdTooLong)?;
			
			// Update the schema with the new issuer
			new_schema.issuer = issuer;

            // Insert or update the schema in the storage map
            Schemas::<T>::insert(schema_id, new_schema);

			// Increment the ID for the next schema
			NextSchemaId::<T>::put(schema_id + 1);

			// Emit the SchemaInserted event
			Self::deposit_event(Event::SchemaInserted { schema_id, who });

            Ok(())
        }

		/// Function which inserts an attestation into the pallet storage.
		///
		/// Requires at least one schema to be previously inserted.
		#[pallet::call_index(1)]
        #[pallet::weight(<T as pallet::Config>::WeightInfo::insert_attestation())]
        pub fn insert_attestation(origin: OriginFor<T>, attestation: Attestation,) -> DispatchResult {
            let who = ensure_signed(origin)?;

			// Check if the counter is already initialized, if not set it to 1
			if NextAttestationId::<T>::get() == 0 {
				NextAttestationId::<T>::put(1);
			}

			// Validate that the schemaID exists in the Schemas storage
			ensure!(
				Schemas::<T>::contains_key(attestation.schema_id),
				Error::<T>::SchemaNotFound
			);

			// Get the schema
			let schema = Schemas::<T>::get(attestation.schema_id).ok_or(Error::<T>::SchemaNotFound)?;

			// Get the next unique attestation ID
			let attestation_id = NextAttestationId::<T>::get();

			// Retrieve the current block number
			let current_block_number = <frame_system::Pallet<T>>::block_number();

			// Convert the block number to u32
			let current_block_number_u32: u32 = current_block_number.try_into().map_err(|_| Error::<T>::BlockNumberConversionFailed)?;

			// Update the attestation with the new ID and block number
			let mut new_attestation = attestation;
			new_attestation.id = attestation_id;
			new_attestation.block_number = current_block_number_u32;

			// Encode the issuer's account ID into a Vec<u8>
			let account_id_as_bytes = who.encode();

			// Convert the Vec<u8> to BoundedVec<u8, ConstU32<SIZE_STRINGS>>
			let issuer: BoundedVec<u8, ConstU32<SIZE_STRINGS>> = account_id_as_bytes.try_into()
				.map_err(|_| Error::<T>::AccountIdTooLong)?;
			
			// Update the attestation with the new issuer
			new_attestation.issuer = issuer;

			///Function to call Attached Contracts 
			// Check if resolverContract is not empty
			if !schema.resolver_contract.is_empty() {
				
			// Convert resolver_contract to T::AccountId
			let resolver_contract_account_id: T::AccountId = T::AccountId::decode(&mut &schema.resolver_contract[..])
			.map_err(|_| Error::<T>::AccountIdTooLong)?;

			// Define the contract address and selector
			let contract_address: T::AccountId = resolver_contract_account_id;
			let mut selector: Vec<u8> = [0x2f, 0x86, 0x5b, 0xd9].into(); // Flipper Function selector from the contract json file 
				
			// Amount to transfer to the message. Not gonna transfer anything here, so we'll
			// leave this as `0`.
			let value: BalanceOf<T> = Default::default();

			
			//Gas limit calculation based on extrinsic weight and other parameters
			let gas_limit: Weight = Weight::from_parts(139987, 3670016).saturating_add(T::DbWeight::get().writes(1_u64));// Convert to Weight
			let debug = pallet_contracts::DebugInfo::Skip; // Provide correct type
			let collect_events = pallet_contracts::CollectEvents::UnsafeCollect; // Provide correct type

			// Prepare the arguments for the contract call if needed
			//let args: Vec<u8> = new_attestation.encode(); // Encode the attestation as arguments

			// Create the data to be sent to the contract
			let mut data = Vec::new();
				data.append(&mut selector);
				//data.append(&mut message_arg);	

			// Call the contract
			let call_result =  pallet_contracts::Pallet::<T>::bare_call(
				who.clone(),
				contract_address,
				0u32.into(), // Value to transfer
				gas_limit, // Gas limit
				None, // Storage deposit limit
				data, // Data
				debug, // Debug
				collect_events, // Collect events
				pallet_contracts::Determinism::Enforced, // Determinism
			).result?;
	
		}
	

            // Insert the attestation in the storage map
            Attestations::<T>::insert(attestation_id, new_attestation);

			// Increment the ID for the next attestation
			NextAttestationId::<T>::put(attestation_id + 1);

			// Emit the AttestationInserted event
			Self::deposit_event(Event::AttestationInserted { attestation_id, who });

            Ok(())
        }
	}
}



