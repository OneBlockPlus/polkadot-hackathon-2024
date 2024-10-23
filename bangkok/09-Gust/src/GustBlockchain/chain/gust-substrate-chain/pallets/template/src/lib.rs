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

use scale_info::prelude::vec::Vec;
use frame_support::pallet_prelude::TypeInfo;
use scale_info::TypeInfo;
use frame_support::pallet_prelude::*;
use frame_system::pallet;
use sp_io::hashing::blake2_256;
use sp_runtime::traits::{Dispatchable, TrailingZeroInput, Zero};
use sp_std::prelude::*;

#[derive(Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum Value {
    Integer(i64),
    Boolean(bool),
    String(Vec<u8>),
}

#[derive(Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum Instruction {
    Set(Vec<u8>, Value),              // Set a variable
    Get(Vec<u8>),                     // Get a variable
    Add(Vec<u8>, Vec<u8>, Vec<u8>),   // Add two values and store the result
    Sub(Vec<u8>, Vec<u8>, Vec<u8>),   // Subtract two values and store the result
    Mul(Vec<u8>, Vec<u8>, Vec<u8>),   // Multiply two values and store the result
    Div(Vec<u8>, Vec<u8>, Vec<u8>),   // Divide two values and store the result
    Eq(Vec<u8>, Vec<u8>, Vec<u8>),    // Compare equality
    Lt(Vec<u8>, Vec<u8>, Vec<u8>),    // Less than comparison
    And(Vec<u8>, Vec<u8>, Vec<u8>),   // Logical AND
    Or(Vec<u8>, Vec<u8>, Vec<u8>),    // Logical OR
    Not(Vec<u8>, Vec<u8>),            // Logical NOT
    If(Vec<u8>, Vec<Instruction>, Vec<Instruction>), // Conditional execution
    While(Vec<u8>, Vec<Instruction>), // While loop
    Print(Vec<u8>),                   // Print a value (for debugging)
}

// All pallet logic is defined in its own module and must be annotated by the `pallet` attribute.
#[frame_support::pallet]
pub mod pallet {
	// Import various useful types required by all FRAME pallets.
	use super::*;
	// use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
	use frame_support::{
		dispatch::{GetDispatchInfo, RawOrigin},
		pallet_prelude::*,
		traits::{fungible, fungible::MutateHold, tokens::Precision, fungible::InspectHold},
	};
	use frame_support::DefaultNoBound;
	use frame_system::pallet_prelude::*;
	use frame_system::pallet;
	use sp_io::hashing::blake2_256;
	use sp_runtime::traits::{Dispatchable, TrailingZeroInput, Zero};
	use sp_std::prelude::*;

	pub type BalanceOf<T> = <<T as Config>::NativeBalance as fungible::Inspect<
		<T as frame_system::Config>::AccountId,
	>>::Balance;

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
	pub trait Config: frame_system::Config + pallet_sudo::Config{
		/// The overarching runtime event type.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		/// A type representing the weights required by the dispatchables of this pallet.
		type WeightInfo: WeightInfo;
	}

	/// A storage items for this pallet.
	#[pallet::storage]
	#[pallet::getter(fn relayer_nodes)]
	/// Storage for the relayer nodes (accounts that can relay transactions)
	pub type RelayerNodes<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, bool, ValueQuery>;

	#[pallet::storage]
    #[pallet::getter(fn user_accounts)]
    /// Storage for mapping End user accounts to a unique string identifier
    pub type UserAccounts<T: Config> = StorageMap<_, Blake2_128Concat, Vec<u8>, T::AccountId, OptionQuery>;

	#[pallet::storage]
	#[pallet::getter(fn tokens)]
	/// Storage map to hold balances of each user for each token (user_id -> token_id -> balance)
	pub type Tokens<T: Config> = StorageDoubleMap<_, Blake2_128Concat, Vec<u8>, Blake2_128Concat, Vec<u8>, u128, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn token_metadata)]
	/// Storage map to hold metadata for each token (token_id -> metadata)
	pub type TokenMetadata<T: Config> = StorageMap<_, Blake2_128Concat, Vec<u8>, (Vec<u8>, Vec<u8>, T::AccountId), OptionQuery>; // (name, symbol, owner)

	#[pallet::storage]
    pub type Contracts<T> = StorageMap<_, Blake2_128Concat, T::AccountId, Vec<Instruction>, ValueQuery>;

    #[pallet::storage]
    pub type Memory<T> = StorageDoubleMap<_, Blake2_128Concat, T::AccountId, Blake2_128Concat, Vec<u8>, Value, ValueQuery>;

	/// Events that functions in this pallet can emit.
	#[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// A new relayer node was added by Sudo.
        RelayerNodeAdded(T::AccountId),
        /// A new relayer node was removed by Sudo.
        RelayerNodeRemoved(T::AccountId),
        /// A new user account was registered.
        UserRegistered(Vec<u8>, T::AccountId),
		/// Created new native token
		TokenCreated(Vec<u8>, Vec<u8>, Vec<u8>, T::AccountId), // token_id, name, symbol, creator
		/// Transfer token
    	TokenTransferred(Vec<u8>, Vec<u8>, u128), // from_user_id, to_user_id, amount
		/// Deploy contract
		ContractDeployed(T::AccountId),
		/// Execute contract
        ContractExecuted(T::AccountId),
		/// Set variable to storage
        VariableSet(T::AccountId, Vec<u8>, Value),
		/// Emit contract event
        PrintOutput(T::AccountId, Vec<u8>),

    }

	/// Errors that can be returned by this pallet.
	#[pallet::error]
    pub enum Error<T> {
        /// The caller is not a valid relayer node.
        NotRelayerNode,
        /// The user account string is already registered.
        UserAlreadyExists,
        /// The caller is not the Sudo account.
        NotSudo,
		/// Native token exists
		TokenAlreadyExists,
		/// Token Could not be found
		TokenNotFound,
		/// Lower balance
		InsufficientBalance,
		/// Not allowed
		Unauthorized,
		/// Division Error
		DivisionByZero,
		/// Incompatible type
        TypeMismatch,
		/// Storage var not found
        VariableNotFound,
    }

	/// The pallet's dispatchable functions ([`Call`]s).
	#[pallet::call]
	impl<T: Config> Pallet<T> {

		#[pallet::call_index(0)]
		/// Sudo can add new relayer accounts
		#[pallet::weight(10_000)]
		pub fn add_relayer_node(origin: OriginFor<T>, relayer: T::AccountId) -> DispatchResult {
			// Ensure the caller is Sudo
			let sudo_origin = T::SudoOrigin::ensure_origin(origin)?;
			RelayerNodes::<T>::insert(&relayer, true);
			Self::deposit_event(Event::RelayerNodeAdded(relayer));
			Ok(())
		}

		#[pallet::call_index(1)]
		#[pallet::weight(10_000)]
        pub fn remove_relayer_node(origin: OriginFor<T>, relayer: T::AccountId) -> DispatchResult {
            // Ensure the caller is Sudo
            let sudo_origin = T::SudoOrigin::ensure_origin(origin)?;
            RelayerNodes::<T>::remove(&relayer);
            Self::deposit_event(Event::RelayerNodeRemoved(relayer));
            Ok(())
        }

		#[pallet::call_index(2)]
		#[pallet::weight(10_000)]
        pub fn register_user(origin: OriginFor<T>, user_id: Vec<u8>) -> DispatchResult {
            let relayer = ensure_signed(origin)?;
            // Ensure caller is a valid relayer node
            ensure!(RelayerNodes::<T>::contains_key(&relayer), Error::<T>::NotRelayerNode);
            // Ensure the user_id is not already registered
            ensure!(!UserAccounts::<T>::contains_key(&user_id), Error::<T>::UserAlreadyExists);
            // Generate a new account for the user (for simplicity, using relayer's account here, replace with actual logic)
            let user_account = Self::create_user_account();
            // Insert the user account into storage
            UserAccounts::<T>::insert(user_id.clone(), user_account.clone());
            // Emit event
            Self::deposit_event(Event::UserRegistered(user_id, user_account));
            Ok(())
        }

		/// Allows a user to create a new fungible token
		#[pallet::call_index(3)]
		#[pallet::weight(10_000)]
		pub fn create_token(
			origin: OriginFor<T>,
			user_id: Vec<u8>,     // User creating the token (End user)
			token_id: Vec<u8>,    // Unique token ID
			name: Vec<u8>,        // Name of the token
			symbol: Vec<u8>,      // Symbol of the token
			initial_supply: u128  // Initial supply for the token
		) -> DispatchResult {
			let relayer = ensure_signed(origin)?;
			// Ensure caller is a valid relayer node
			ensure!(RelayerNodes::<T>::contains_key(&relayer), Error::<T>::NotRelayerNode);
			// Ensure the user_id is registered
			let user_account = UserAccounts::<T>::get(&user_id).ok_or(Error::<T>::Unauthorized)?;
			// Ensure token doesn't already exist
			ensure!(!TokenMetadata::<T>::contains_key(&token_id), Error::<T>::TokenAlreadyExists);
			// Store token metadata
			TokenMetadata::<T>::insert(&token_id, (name.clone(), symbol.clone(), user_account.clone()));
			// Set the initial supply for the user
			Tokens::<T>::insert(&user_id, &token_id, initial_supply);
			// Emit event
			Self::deposit_event(Event::TokenCreated(token_id, name, symbol, user_account));
			Ok(())
		}
	
		/// Allows a user to transfer tokens to another user
		#[pallet::call_index(4)]
		#[pallet::weight(10_000)]
		pub fn transfer_token(
			origin: OriginFor<T>,
			from_user_id: Vec<u8>,   // Sender's user_id
			to_user_id: Vec<u8>,     // Receiver's user_id
			token_id: Vec<u8>,       // Token being transferred
			amount: u128             // Amount of tokens to transfer
		) -> DispatchResult {
			let relayer = ensure_signed(origin)?;
			// Ensure caller is a valid relayer node
			ensure!(RelayerNodes::<T>::contains_key(&relayer), Error::<T>::NotRelayerNode);
			// Ensure the from_user and to_user are registered
			let from_user_account = UserAccounts::<T>::get(&from_user_id).ok_or(Error::<T>::Unauthorized)?;
			let to_user_account = UserAccounts::<T>::get(&to_user_id).ok_or(Error::<T>::Unauthorized)?;
			// Check if the from_user has enough balance
			let from_balance = Tokens::<T>::get(&from_user_id, &token_id);
			ensure!(from_balance >= amount, Error::<T>::InsufficientBalance);
			// Deduct from sender's balance and add to receiver's balance
			Tokens::<T>::insert(&from_user_id, &token_id, from_balance - amount);
			let to_balance = Tokens::<T>::get(&to_user_id, &token_id);
			Tokens::<T>::insert(&to_user_id, &token_id, to_balance + amount);
			// Emit event
			Self::deposit_event(Event::TokenTransferred(from_user_id, to_user_id, amount));
			Ok(())
		}

		#[pallet::call_index(5)]
		#[pallet::weight(10_000)]
        pub fn deploy_contract(origin: OriginFor<T>, contract: Vec<Instruction>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Contracts::<T>::insert(&who, contract);
            Self::deposit_event(Event::ContractDeployed(who));
            Ok(())
        }

		#[pallet::call_index(6)]
        #[pallet::weight(10_000)]
        pub fn execute_contract(origin: OriginFor<T>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let contract = Contracts::<T>::get(&who);
            self.execute_instructions(&who, &contract)?;
            Self::deposit_event(Event::ContractExecuted(who));
            Ok(())
        }

		#[pallet::call_index(7)]
        #[pallet::weight(10_000)]
        pub fn execute_step(origin: OriginFor<T>, instruction_index: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let contract = Contracts::<T>::get(&who);
            if let Some(instruction) = contract.get(instruction_index as usize) {
                self.execute_instruction(&who, instruction)?;
            }

            Ok(())
        }
	}

	impl<T: Config> Pallet<T> {
		/// Derive a unique account id using a seed value.
		pub fn create_user_account(relayer: T::Account, user_id: Vec<u8>) -> T::AccountId {
			let entropy = (relayer, user_id).using_encoded(blake2_256);
			Decode::decode(&mut TrailingZeroInput::new(entropy.as_ref()))
				.expect("infinite length input; no invalid inputs for type; qed")
		}

		fn execute_instructions(who: &T::AccountId, instructions: &[Instruction]) -> DispatchResult {
            for instruction in instructions {
                self.execute_instruction(who, instruction)?;
            }
            Ok(())
        }

        fn execute_instruction(who: &T::AccountId, instruction: &Instruction) -> DispatchResult {
            match instruction {
                Instruction::Set(var, value) => {
                    Memory::<T>::insert(who, var, value.clone());
                    Self::deposit_event(Event::VariableSet(who.clone(), var.clone(), value.clone()));
                },
                Instruction::Get(var) => {
                    Memory::<T>::get(who, var);
                },
                Instruction::Add(var1, var2, result) => {
                    let v1 = Memory::<T>::get(who, var1);
                    let v2 = Memory::<T>::get(who, var2);
                    if let (Value::Integer(i1), Value::Integer(i2)) = (&v1, &v2) {
                        Memory::<T>::insert(who, result, Value::Integer(i1.saturating_add(*i2)));
                    } else {
                        return Err(Error::<T>::TypeMismatch.into());
                    }
                },
                // Implement other arithmetic operations similarly...
                Instruction::If(cond_var, true_branch, false_branch) => {
                    let condition = Memory::<T>::get(who, cond_var);
                    if let Value::Boolean(cond) = condition {
                        if cond {
                            self.execute_instructions(who, true_branch)?;
                        } else {
                            self.execute_instructions(who, false_branch)?;
                        }
                    } else {
                        return Err(Error::<T>::TypeMismatch.into());
                    }
                },
                Instruction::While(cond_var, body) => {
                    while let Value::Boolean(true) = Memory::<T>::get(who, cond_var) {
                        self.execute_instructions(who, body)?;
                    }
                },
                Instruction::Print(var) => {
                    let value = Memory::<T>::get(who, var);
                    Self::deposit_event(Event::PrintOutput(who.clone(), var.clone()));
                },
                // Implement other instructions...
            }
            Ok(())
        }
	}
}
