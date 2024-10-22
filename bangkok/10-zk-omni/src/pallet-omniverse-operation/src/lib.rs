//! # Omniverse operation Pallet
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
extern crate alloc;
use frame_support::pallet;
pub use pallet::*;
// FRAME pallets require their own "mock runtimes" to be able to run unit tests. This module
// contains a mock runtime specific for testing this pallet's functionality.
#[cfg(test)]
mod mock;

// This module contains the unit tests for this pallet.
// Learn about pallet unit testing here: https://docs.substrate.io/test/unit-testing/
#[cfg(test)]
mod tests;

pub mod types;
pub use types::*;
pub mod eip712;
pub mod error;
pub mod utils;
pub use eip712::*;
// Every callable function or "dispatchable" a pallet exposes must have weight values that correctly
// estimate a dispatchable's execution time. The benchmarking module is used to calculate weights
// for each dispatchable and generates this pallet's weight.rs file. Learn more about benchmarking here: https://docs.substrate.io/test/benchmark/
#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;
pub mod weights;
pub use weights::*;

// All pallet logic is defined in its own module and must be annotated by the `pallet` attribute.
#[pallet]
pub mod pallet {
	// Import various useful types required by all FRAME pallets.
	use super::*;
	use frame_support::pallet_prelude::*;
	// use frame_support::traits::GenesisBuild;
	use frame_system::pallet_prelude::*;
	use pallet_assets::traits::OmniverseToken;
	use scale_info::prelude::{string::String, vec::Vec};
	use utils::keccak_256;

	// The `Pallet` struct serves as a placeholder to implement traits, methods and dispatchables
	// (`Call`s) in this pallet.
	#[pallet::pallet]
	pub struct Pallet<T>(PhantomData<T>);

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
		type StringLimit: Get<u32>;

		type OmniverseToken: OmniverseToken;
	}

	#[pallet::genesis_config]
	// #[derive(Default)]
	pub struct GenesisConfig<T: Config> {
		pub _phantom: PhantomData<T>,
		pub eip712: EIP712Domain,
		pub fee: FeeParameters,
		pub asset: AssetParameters,
		pub system: SystemParameters,
		pub genesis_account_info: Vec<GenesisAccountInfo>,
	}

	impl<T: Config> Default for GenesisConfig<T> {
		fn default() -> Self {
			Self {
				_phantom: Default::default(),
				eip712: Default::default(),
				fee: Default::default(),
				asset: Default::default(),
				system: Default::default(),
				genesis_account_info: Default::default(),
			}
		}
	}

	#[pallet::genesis_build]
	impl<T: Config> BuildGenesisConfig for GenesisConfig<T> {
		fn build(&self) {
			NetworkParameters::<T>::set(StorageNetworkParameters {
				eip712: StorageEIP712Domain {
					name: self
						.eip712
						.name
						.as_bytes()
						.to_vec()
						.try_into()
						.expect("EIP712 domain name is too long"),
					version: self
						.eip712
						.version
						.as_bytes()
						.to_vec()
						.try_into()
						.expect("EIP712 domain version is too long"),
					chain_id: self.eip712.chain_id,
					verifying_contract: self
						.eip712
						.verifying_contract
						.as_bytes()
						.to_vec()
						.try_into()
						.expect("EIP712 domain verifying contract is too long"),
					domain_hash: self.eip712.domain_hash,
				},
				fee: StorageFeeConfig {
					asset_id: self.fee.asset_id,
					receiver: self.fee.receiver,
					amount: self.fee.amount,
				},
				asset: StorageAssetConfig {
					name_size: self.asset.name_size,
					decimals: self.asset.decimals,
					price: self.asset.price,
				},
				system: StorageSystemConfig { max_tx_utxo: self.system.max_tx_utxo },
			});

			// Create fee token
			Tokens::<T>::insert(
				&self.fee.asset_id,
				TokenDetail {
					metadata: StorageMetadata {
						salt: [0; 8],
						name: BoundedVec::try_from("OMNI".as_bytes().to_vec()).unwrap(),
						deployer: [0; 32],
						mint_amount: 0,
						price: 0,
						total_supply: 0,
					},
					current_supply: 0,
				},
			);
			T::OmniverseToken::create_token(
				&self.fee.asset_id,
				String::from("OMNI"),
				self.asset.decimals,
			)
			.unwrap();
			let mut supply = 0u128;
			for (i, value) in self.genesis_account_info.iter().enumerate() {
				UTXOSet::<T>::insert(
					(self.fee.asset_id, i as u64),
					UTXO {
						address: value.address,
						asset_id: self.fee.asset_id,
						txid: [0; 32],
						index: i as u64,
						amount: value.amount,
					},
				);
				supply += value.amount;
				Balance::<T>::set(&(self.fee.asset_id, value.address), value.amount);
				T::OmniverseToken::update_balance(&self.fee.asset_id, &value.address, value.amount)
					.unwrap();
			}
			Tokens::<T>::mutate(&self.fee.asset_id, |v| {
				v.metadata.total_supply = supply;
				v.current_supply = supply;
			});
			T::OmniverseToken::update_supply(&self.fee.asset_id, supply).unwrap();
		}
	}

	impl<T: Config> Pallet<T> {
		pub(super) fn check_utxo(asset_id: [u8; 32], input: &Input) -> Result<(), DispatchError> {
			// check contains utxo and utxo belongs to omni-tx signer
			match UTXOSet::<T>::try_get((input.txid, input.index)) {
				Ok(stored_utxo) => {
					if stored_utxo.address != input.address {
						return Err(Error::<T>::NotUTXOOwner.into());
					}
					if stored_utxo.asset_id != asset_id {
						return Err(Error::<T>::MissmatchAssetId.into());
					}
				},
				Err(_) => {
					return Err(Error::<T>::UTXONotExist.into());
				},
			}
			Ok(())
		}

		pub(super) fn check_fee(
			fee_inputs: &Vec<Input>,
			fee_outputs: &Vec<Output>,
		) -> Result<u128, DispatchError> {
			let fee = NetworkParameters::<T>::get().fee;
			let mut total_fee_input = 0u128;
			for spend in fee_inputs.iter() {
				Self::check_utxo(fee.asset_id, spend)?;
				UTXOSet::<T>::remove(&(spend.txid, spend.index));
				total_fee_input += spend.amount;
			}
			let mut total_fee_output = 0u128;
			let mut paid_for_fee = 0u128;
			for utxo in fee_outputs.iter() {
				if utxo.address == fee.receiver {
					paid_for_fee = utxo.amount;
				}
				total_fee_output += utxo.amount;
			}
			if paid_for_fee < fee.amount {
				return Err(Error::<T>::NotPaidForFee.into());
			}
			if total_fee_input != total_fee_output {
				return Err(Error::<T>::IncorrectAmount.into());
			}
			return Ok(total_fee_input);
		}

		pub(super) fn generate_utxo(
			asset_id: [u8; 32],
			txid: [u8; 32],
			outputs: &Vec<Output>,
			start_index: u64,
		) -> Result<(), DispatchError> {
			for (i, output) in outputs.iter().enumerate() {
				if output.amount == 0 {
					return Err(Error::<T>::OutputAmountShouldNotBeZero.into());
				}
				let index = i as u64 + start_index;
				UTXOSet::<T>::insert(
					&(txid, i as u64 + start_index),
					UTXO { asset_id, txid, index, address: output.address, amount: output.amount },
				);
				let amount = Balance::<T>::mutate(&(asset_id, output.address), |v| {
					*v += output.amount;
					*v
				});
				T::OmniverseToken::update_balance(&asset_id, &output.address, amount)?;
			}
			Ok(())
		}
	}

	/// A storage item for this pallet.
	///
	/// In this template, we are declaring a storage item called `Something` that stores a single
	/// `u32` value. Learn more about runtime storage here: <https://docs.substrate.io/build/runtime-storage/>
	#[pallet::storage]
	pub type Something<T> = StorageValue<_, u32>;

	#[pallet::storage]
	#[pallet::getter(fn tokens)]
	/// Details of an asset.
	/// key: (asset_id)
	pub(super) type Tokens<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		[u8; 32],
		TokenDetail<BoundedVec<u8, T::StringLimit>>,
		ValueQuery,
	>;

	#[pallet::storage]
	#[pallet::getter(fn utxo)]
	/// Details of an utxo.
	/// key: (pre_txid, pre_index)
	pub(super) type UTXOSet<T: Config> = StorageMap<_, Blake2_128Concat, ([u8; 32], u64), UTXO>;

	#[pallet::storage]
	#[pallet::getter(fn balance)]
	/// The balance of `asset_id`
	/// key: (asset_id, omni_address)
	pub(super) type Balance<T: Config> =
		StorageMap<_, Blake2_128Concat, ([u8; 32], [u8; 32]), u128, ValueQuery>;

	// #[pallet::storage]
	// #[pallet::getter(fn eip712_domain)]
	// pub(super) type Domain<T: Config> =
	// 	StorageValue<_, StorageEIP712Domain<BoundedVec<u8, T::StringLimit>>, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn network_parameters)]
	pub(super) type NetworkParameters<T: Config> =
		StorageValue<_, StorageNetworkParameters<BoundedVec<u8, T::StringLimit>>, ValueQuery>;

	#[pallet::storage]
	pub type Txid<T: Config> = StorageMap<_, Blake2_128Concat, [u8; 32], bool, ValueQuery>;

	#[pallet::type_value]
	pub fn GetDefaultValue() -> u128 {
		0
	}

	#[pallet::storage]
	#[pallet::getter(fn tx_number)]
	pub type TxNumber<T: Config> = StorageValue<_, u128, ValueQuery, GetDefaultValue>;
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
		/// A user has successfully set a new value.
		Deploy {
			/// The new value set.
			asset_id: [u8; 32],
			// /// The account who set the new value.
			metadata: DeployMetadata,
		},
		Mint {
			asset_id: [u8; 32],
			receipts: Vec<Output>,
		},
		Transfer {
			asset_id: [u8; 32],
			fee_receipts: Vec<Output>,
			receipts: Vec<Output>,
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

		VerifiySignatureFailed,
		ExeceedMaxTxUTXOs,

		NotUTXOOwner,
		UTXONotExist,
		MissmatchAssetId,
		IncorrectSpendFeeToken,
		IncorrectAmount,
		NotPaidForFee,
		OutputAmountShouldNotBeZero,

		MintOutputsIsEmpty,
		AssetNotExist,
		ExceedMaximumSupply,
		MismatchMintAmount,

		MintPriceMismatch,
		TokenNameTooLong,
		TokenAlreadyDeployed,
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
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn submit_tx(origin: OriginFor<T>, tx: OmniverseTransaction) -> DispatchResult {
			ensure_signed(origin)?;
			let network_parameters = NetworkParameters::<T>::get();
			let omni_address = match tx.verify_signature(&network_parameters.eip712.domain_hash) {
				Err(_) => return Err(Error::<T>::VerifiySignatureFailed.into()),
				Ok(address) => address,
			};
			let mut fee_asset_balance =
				Balance::<T>::get(&(network_parameters.fee.asset_id, omni_address));
			let txid = keccak_256(&tx.to_bytes());
			match tx.clone() {
				OmniverseTransaction::Transfer(tx) => {
					if (tx.inputs.len()
						+ tx.outputs.len() + tx.fee_inputs.len()
						+ tx.fee_outputs.len()) as u128
						> network_parameters.system.max_tx_utxo
					{
						return Err(Error::<T>::ExeceedMaxTxUTXOs.into());
					}
					if tx.asset_id == network_parameters.fee.asset_id {
						if tx.inputs.len() == 0 && tx.outputs.len() == 0 {
							let mut total_input_amount = 0u128;
							for spend in tx.fee_inputs.iter() {
								// check contains utxo and utxo belongs to omni-tx signer
								Self::check_utxo(network_parameters.fee.asset_id, spend)?;
								total_input_amount += spend.amount;
								fee_asset_balance -= spend.amount;
							}

							let mut total_output_amount = 0u128;
							let mut paid_for_fee = false;
							for utxo in tx.fee_outputs.iter() {
								total_output_amount += utxo.amount;
								if utxo.address == network_parameters.fee.receiver
									&& utxo.amount == network_parameters.fee.amount
								{
									paid_for_fee = true;
								}
							}
							if total_input_amount != total_output_amount {
								return Err(Error::<T>::IncorrectAmount.into());
							}
							if !paid_for_fee {
								return Err(Error::<T>::NotPaidForFee.into());
							}
						} else {
							return Err(Error::<T>::IncorrectSpendFeeToken.into());
						}
					} else {
						let mut omni_asset_balance =
							Balance::<T>::get(&(tx.asset_id, omni_address));
						let total_spend_fee = Self::check_fee(&tx.fee_inputs, &tx.fee_outputs)?;
						fee_asset_balance -= total_spend_fee;
						let mut total_input_amount = 0u128;
						for spend in tx.inputs.iter() {
							Self::check_utxo(tx.asset_id, spend)?;
							total_input_amount += spend.amount;
							omni_asset_balance -= spend.amount;
							UTXOSet::<T>::remove(&(spend.txid, spend.index));
						}

						let mut total_output_amount = 0u128;
						for output in tx.outputs.iter() {
							total_output_amount += output.amount;
						}

						if total_input_amount != total_output_amount {
							return Err(Error::<T>::IncorrectAmount.into());
						}
						Balance::<T>::mutate(&(tx.asset_id, omni_address), |v| {
							*v = omni_asset_balance
						});
						Self::generate_utxo(tx.asset_id, txid, &tx.outputs, 0)?;
					}
					Balance::<T>::mutate(&(network_parameters.fee.asset_id, omni_address), |v| {
						*v = fee_asset_balance
					});
					Self::generate_utxo(
						network_parameters.fee.asset_id,
						txid,
						&tx.fee_outputs,
						tx.outputs.len() as u64,
					)?;
					Self::deposit_event(Event::Transfer {
						asset_id: tx.asset_id,
						fee_receipts: tx.fee_outputs,
						receipts: tx.outputs,
					});
				},
				OmniverseTransaction::Mint(tx) => {
					if tx.outputs.is_empty() {
						return Err(Error::<T>::MintOutputsIsEmpty.into());
					}
					if (tx.outputs.len() + tx.fee_inputs.len() + tx.fee_outputs.len()) as u128
						> network_parameters.system.max_tx_utxo
					{
						return Err(Error::<T>::ExeceedMaxTxUTXOs.into());
					}
					let total_spend_fee = Self::check_fee(&tx.fee_inputs, &tx.fee_outputs)?;
					let token = match Tokens::<T>::try_get(&tx.asset_id) {
						Ok(token) => token,
						Err(_) => return Err(Error::<T>::AssetNotExist.into()),
					};
					let mut current_supply = token.current_supply;
					for output in tx.outputs.iter() {
						current_supply += output.amount;
						if current_supply > token.metadata.total_supply {
							return Err(Error::<T>::ExceedMaximumSupply.into());
						}

						if output.amount != token.metadata.mint_amount {
							return Err(Error::<T>::MismatchMintAmount.into());
						}
					}
					fee_asset_balance -= total_spend_fee;
					Balance::<T>::mutate(&(network_parameters.fee.asset_id, omni_address), |v| {
						*v = fee_asset_balance
					});

					Self::generate_utxo(tx.asset_id, txid, &tx.outputs, 0)?;
					Self::generate_utxo(
						network_parameters.fee.asset_id,
						txid,
						&tx.fee_outputs,
						tx.outputs.len() as u64,
					)?;

					Tokens::<T>::mutate(&tx.asset_id, |v| v.current_supply = current_supply);
					T::OmniverseToken::update_supply(&tx.asset_id, current_supply)?;
					Self::deposit_event(Event::Mint {
						asset_id: tx.asset_id,
						receipts: tx.outputs,
					});
				},
				OmniverseTransaction::Deploy(tx) => {
					if (tx.fee_inputs.len() + tx.fee_outputs.len()) as u128
						> network_parameters.system.max_tx_utxo
					{
						return Err(Error::<T>::ExeceedMaxTxUTXOs.into());
					}

					if tx.metadata.price != network_parameters.asset.price {
						return Err(Error::<T>::MintPriceMismatch.into());
					}

					if tx.metadata.name.as_bytes().len() as u128
						> network_parameters.asset.name_size
					{
						return Err(Error::<T>::TokenNameTooLong.into());
					}
					let asset_id = tx.get_asset_id();
					if Tokens::<T>::contains_key(&asset_id) {
						return Err(Error::<T>::TokenAlreadyDeployed.into());
					}

					let total_spend_fee = Self::check_fee(&tx.fee_inputs, &tx.fee_outputs)?;
					fee_asset_balance -= total_spend_fee;
					Balance::<T>::mutate(&(network_parameters.fee.asset_id, omni_address), |v| {
						*v = fee_asset_balance
					});
					Self::generate_utxo(network_parameters.fee.asset_id, txid, &tx.fee_outputs, 0)?;

					Tokens::<T>::insert(
						&asset_id,
						TokenDetail {
							metadata: StorageMetadata {
								salt: tx.metadata.salt,
								name: BoundedVec::try_from(tx.metadata.name.as_bytes().to_vec())
									.map_err(|_| Error::<T>::TokenNameTooLong)?,
								deployer: tx.metadata.deployer,
								mint_amount: tx.metadata.mint_amount,
								price: network_parameters.asset.price,
								total_supply: tx.metadata.total_supply,
							},
							current_supply: 0,
						},
					);
					T::OmniverseToken::create_token(
						&asset_id,
						tx.metadata.name.clone(),
						network_parameters.asset.decimals,
					)?;
					Self::deposit_event(Event::Deploy { asset_id, metadata: tx.metadata });
				},
			}
			TxNumber::<T>::mutate(|number| *number += 1);
			Txid::<T>::insert(&txid, true);
			Ok(())
		}

		#[pallet::call_index(3)]
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn update_eip712_domain(origin: OriginFor<T>, eip712: EIP712Domain) -> DispatchResult {
			ensure_root(origin)?;

			NetworkParameters::<T>::mutate(|v| {
				v.eip712 = StorageEIP712Domain {
					name: eip712
						.name
						.as_bytes()
						.to_vec()
						.try_into()
						.expect("EIP712 domain name is too long"),
					version: eip712
						.version
						.as_bytes()
						.to_vec()
						.try_into()
						.expect("EIP712 domain version is too long"),
					chain_id: eip712.chain_id,
					verifying_contract: eip712
						.verifying_contract
						.as_bytes()
						.to_vec()
						.try_into()
						.expect("EIP712 domain verifying contract is too long"),
					domain_hash: eip712.domain_hash,
				}
			});
			Ok(())
		}

		#[pallet::call_index(4)]
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn update_fee_config(origin: OriginFor<T>, fee: FeeParameters) -> DispatchResult {
			ensure_root(origin)?;

			NetworkParameters::<T>::mutate(|v| {
				v.fee = StorageFeeConfig {
					asset_id: fee.asset_id,
					receiver: fee.receiver,
					amount: fee.amount,
				}
			});
			Ok(())
		}

		#[pallet::call_index(5)]
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn update_asset_config(origin: OriginFor<T>, asset: AssetParameters) -> DispatchResult {
			ensure_root(origin)?;

			NetworkParameters::<T>::mutate(|v| {
				v.asset = StorageAssetConfig {
					name_size: asset.name_size,
					decimals: asset.decimals,
					price: asset.price,
				}
			});
			Ok(())
		}

		#[pallet::call_index(6)]
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn update_system_config(
			origin: OriginFor<T>,
			system: SystemParameters,
		) -> DispatchResult {
			ensure_root(origin)?;

			NetworkParameters::<T>::mutate(|v| {
				v.system = StorageSystemConfig { max_tx_utxo: system.max_tx_utxo }
			});
			Ok(())
		}

		#[pallet::call_index(7)]
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn submit_batch_txs(
			origin: OriginFor<T>,
			txs: Vec<OmniverseTransaction>,
		) -> DispatchResult {
			for tx in txs {
				Self::submit_tx(origin.clone(), tx)?;
			}
			Ok(())
		}
	}
}
