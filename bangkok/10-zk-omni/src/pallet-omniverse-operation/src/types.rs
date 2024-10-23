use super::*;
use eip712::EIP712Hash;
use error::VerifyError;
use frame_support::pallet_prelude::*;
use scale_info::prelude::{cmp, string::String, vec::Vec};
use secp256k1::{ecdsa, All, Message, Parity, PublicKey, Secp256k1, XOnlyPublicKey};
use serde::{Deserialize, Serialize};
use utils::keccak_256;

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo)]
pub enum OmniverseTransaction {
	Deploy(Deploy),
	Mint(Mint),
	Transfer(Transfer),
}

impl OmniverseTransaction {
	pub fn eip712_hash(&self, eip712_domain_hash: &[u8; 32]) -> [u8; 32] {
		match self {
			OmniverseTransaction::Deploy(tx) => tx.eip712_hash(&eip712_domain_hash),
			OmniverseTransaction::Mint(tx) => tx.eip712_hash(&eip712_domain_hash),
			OmniverseTransaction::Transfer(tx) => tx.eip712_hash(&eip712_domain_hash),
		}
	}

	pub fn to_bytes(&self) -> Vec<u8> {
		match self {
			OmniverseTransaction::Deploy(tx) => tx.to_bytes(),
			OmniverseTransaction::Mint(tx) => tx.to_bytes(),
			OmniverseTransaction::Transfer(tx) => tx.to_bytes(),
		}
	}

	pub fn verify_signature(&self, eip712_domain: &[u8; 32]) -> Result<[u8; 32], VerifyError> {
		let (fee_inputs, signature) = match self {
			OmniverseTransaction::Deploy(tx) => (&tx.fee_inputs, &tx.signature),
			OmniverseTransaction::Mint(tx) => (&tx.fee_inputs, &tx.signature),
			OmniverseTransaction::Transfer(tx) => (&tx.fee_inputs, &tx.signature),
		};

		let omni_address = match fee_inputs.first() {
			Some(input) => input.address,
			None => return Err(VerifyError::NoFeeInputs),
		};
		let secp: Secp256k1<All> = Secp256k1::new();
		let hash = self.eip712_hash(eip712_domain);

		// verify ecdsa
		let message = Message::from_digest(hash);
		let x_pub = XOnlyPublicKey::from_slice(&omni_address)
			.map_err(|_| VerifyError::IncorrectPublicKey)?;

		let mut pk = PublicKey::from_x_only_public_key(x_pub, Parity::Even);
		if signature[64] != 27 && signature[64] != 28 {
			return Err(VerifyError::IncorrectRecorverID);
		}
		let sig = ecdsa::Signature::from_compact(&signature[..64])
			.map_err(|_| VerifyError::IncorrectSignature)?;
		if secp.verify_ecdsa(&message, &sig, &pk).is_err() {
			pk = PublicKey::from_x_only_public_key(x_pub, Parity::Odd);
			secp.verify_ecdsa(&message, &sig, &pk)
				.map_err(|_| VerifyError::IncorrectSignature)?;
		}
		Ok(omni_address)
	}
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo)]
pub struct Deploy {
	pub metadata: DeployMetadata,
	pub signature: [u8; 65],
	pub fee_inputs: Vec<Input>,
	pub fee_outputs: Vec<Output>,
}

impl Deploy {
	pub fn to_bytes(&self) -> Vec<u8> {
		let name_bytes = self.metadata.name.as_bytes();
		let mut result = [0u8; 24];
		let copy_len = cmp::min(name_bytes.len(), result.len());
		result[..copy_len].copy_from_slice(&name_bytes[..copy_len]);

		let mut bytes = [
			self.metadata.salt.as_ref().to_vec(),
			result.to_vec(),
			self.metadata.deployer.as_ref().to_vec(),
			self.metadata.total_supply.to_le_bytes().to_vec(),
			self.metadata.mint_amount.to_le_bytes().to_vec(),
			self.metadata.price.to_le_bytes().to_vec(),
		]
		.concat();
		for fee_input in self.fee_inputs.iter() {
			bytes.append(&mut fee_input.to_bytes());
		}
		for fee_output in self.fee_outputs.iter() {
			bytes.append(&mut fee_output.to_bytes());
		}
		bytes
	}

	pub fn get_asset_id(&self) -> [u8; 32] {
		let name_bytes = self.metadata.name.as_bytes();
		let mut result = [0u8; 24];
		let copy_len = cmp::min(name_bytes.len(), result.len());
		result[..copy_len].copy_from_slice(&name_bytes[..copy_len]);
		let asset_id_bytes = [
			self.metadata.salt.as_ref().to_vec(),
			result.to_vec(),
			self.metadata.deployer.as_ref().to_vec(),
		]
		.concat();

		keccak_256(&asset_id_bytes)
	}
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo)]
pub struct DeployMetadata {
	pub salt: [u8; 8], // 8 bytes
	pub name: String,  // 24 bytes
	pub deployer: [u8; 32],
	// mint amount of tokens per mint
	pub mint_amount: u128,
	// the price per mint
	pub price: u128,
	pub total_supply: u128,
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo)]
pub struct Mint {
	pub asset_id: [u8; 32],
	pub signature: [u8; 65],
	pub outputs: Vec<Output>,
	pub fee_inputs: Vec<Input>,
	pub fee_outputs: Vec<Output>,
}

impl Mint {
	pub fn to_bytes(&self) -> Vec<u8> {
		let mut bytes = self.asset_id.as_ref().to_vec();
		for output in self.outputs.iter() {
			bytes.append(&mut output.to_bytes());
		}
		for fee_input in self.fee_inputs.iter() {
			bytes.append(&mut fee_input.to_bytes());
		}
		for fee_output in self.fee_outputs.iter() {
			bytes.append(&mut fee_output.to_bytes());
		}
		bytes
	}
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo)]
pub struct Transfer {
	pub asset_id: [u8; 32],
	pub signature: [u8; 65],
	pub inputs: Vec<Input>,
	pub outputs: Vec<Output>,
	pub fee_inputs: Vec<Input>,
	pub fee_outputs: Vec<Output>,
}

impl Transfer {
	pub fn to_bytes(&self) -> Vec<u8> {
		let mut bytes = Vec::new();
		bytes.append(&mut self.asset_id.as_ref().to_vec());
		for input in self.inputs.iter() {
			bytes.append(&mut input.to_bytes());
		}
		for output in self.outputs.iter() {
			bytes.append(&mut output.to_bytes());
		}
		for fee_input in self.fee_inputs.iter() {
			bytes.append(&mut fee_input.to_bytes());
		}
		for fee_output in self.fee_outputs.iter() {
			bytes.append(&mut fee_output.to_bytes());
		}
		bytes
	}
}

#[derive(Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub struct StorageMetadata<BoundedString> {
	pub salt: [u8; 8],       // 8 bytes
	pub name: BoundedString, // 24 bytes
	pub deployer: [u8; 32],
	// mint amount of tokens per mint
	pub mint_amount: u128,
	// the price per mint
	pub price: u128,
	pub total_supply: u128,
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub struct Input {
	pub txid: [u8; 32],
	pub index: u64,
	pub amount: u128,
	pub address: [u8; 32],
}

impl Input {
	pub fn to_bytes(&self) -> Vec<u8> {
		[
			self.txid.as_ref().to_vec(),
			self.index.to_le_bytes().to_vec(),
			self.address.as_ref().to_vec(),
			self.amount.to_le_bytes().to_vec(),
		]
		.concat()
	}
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub struct Output {
	pub address: [u8; 32],
	pub amount: u128,
}

impl Output {
	pub fn to_bytes(&self) -> Vec<u8> {
		[self.address.as_ref().to_vec(), self.amount.to_le_bytes().to_vec()].concat()
	}
}

#[derive(
	Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, TypeInfo, Serialize, Deserialize,
)]
pub struct GenesisAccountInfo {
	pub address: [u8; 32],
	pub amount: u128,
}

#[derive(
	Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, TypeInfo, Serialize, Deserialize,
)]
pub struct EIP712Domain {
	pub name: String,
	pub version: String,
	pub chain_id: u128,
	pub verifying_contract: String,
	pub domain_hash: [u8; 32],
}

#[derive(
	Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, TypeInfo, Serialize, Deserialize,
)]
pub struct FeeParameters {
	pub asset_id: [u8; 32],
	pub receiver: [u8; 32],
	pub amount: u128,
}

#[derive(
	Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, TypeInfo, Serialize, Deserialize,
)]
pub struct AssetParameters {
	pub name_size: u128,
	pub decimals: u8,
	pub price: u128,
}

#[derive(
	Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, TypeInfo, Serialize, Deserialize,
)]
pub struct SystemParameters {
	pub max_tx_utxo: u128,
}

#[derive(Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub struct TokenDetail<BoundedString> {
	pub metadata: StorageMetadata<BoundedString>,
	pub current_supply: u128,
}

#[derive(Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub struct UTXO {
	pub address: [u8; 32],
	pub asset_id: [u8; 32],
	pub txid: [u8; 32],
	pub index: u64,
	pub amount: u128,
}

#[derive(Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub struct StorageEIP712Domain<BoundedString> {
	pub name: BoundedString,
	pub version: BoundedString,
	pub chain_id: u128,
	pub verifying_contract: BoundedString,
	pub domain_hash: [u8; 32],
}

#[derive(Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub struct StorageFeeConfig {
	pub asset_id: [u8; 32],
	pub receiver: [u8; 32],
	pub amount: u128,
}

#[derive(Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub struct StorageAssetConfig {
	pub name_size: u128,
	pub decimals: u8,
	pub price: u128,
}

#[derive(Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub struct StorageSystemConfig {
	pub max_tx_utxo: u128,
}

#[derive(Clone, Encode, Decode, Default, Eq, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub struct StorageNetworkParameters<BoundedString> {
	pub eip712: StorageEIP712Domain<BoundedString>,
	pub fee: StorageFeeConfig,
	pub asset: StorageAssetConfig,
	pub system: StorageSystemConfig,
}
