use scale_info::prelude::{vec, vec::Vec};

use crate::{
	utils::{keccak_256, BYTES_UNIT_LEN, HASH_LEN},
	Deploy, Input, Mint, Output, Transfer,
};

pub trait EIP712Hash {
	fn type_hash() -> [u8; HASH_LEN] {
		panic!("no need for type hash")
	}

	fn data_bytes(&self) -> Vec<u8>;

	fn data_hash(&self) -> [u8; HASH_LEN] {
		keccak_256(&self.data_bytes())
	}

	fn eip712_bytes(&self, domain_hash: &[u8; HASH_LEN]) -> Vec<u8> {
		let prefix = (b"\x19\x01").to_vec();
		[&prefix[..], domain_hash, &self.data_hash()].concat()
	}

	fn eip712_hash(&self, domain_hash: &[u8; HASH_LEN]) -> [u8; HASH_LEN] {
		keccak_256(&self.eip712_bytes(domain_hash))
	}
}

impl EIP712Hash for Input {
	fn type_hash() -> [u8; HASH_LEN] {
		[
			119, 84, 107, 54, 3, 160, 139, 205, 137, 18, 192, 2, 17, 139, 145, 206, 79, 30, 17,
			215, 149, 167, 0, 209, 0, 34, 102, 130, 225, 172, 138, 53,
		]
	}

	fn data_bytes(&self) -> Vec<u8> {
		let mut data_bytes = Self::type_hash().to_vec();
		data_bytes.append(&mut self.txid.to_vec());
		// index
		let index_bytes = self.index.to_be_bytes().to_vec();
		data_bytes
			.append(&mut [&vec![0; BYTES_UNIT_LEN - index_bytes.len()], &index_bytes[..]].concat());

		let amount_bytes = self.amount.to_be_bytes().to_vec();
		data_bytes.append(
			&mut [&vec![0; BYTES_UNIT_LEN - amount_bytes.len()], &amount_bytes[..]].concat(),
		);

		data_bytes.append(&mut self.address.to_vec());

		data_bytes
	}
}

impl EIP712Hash for Vec<Input> {
	fn data_bytes(&self) -> Vec<u8> {
		let mut data_bytes = Vec::new();
		for input in self {
			data_bytes.append(&mut input.data_hash().to_vec());
		}

		data_bytes
	}
}

impl EIP712Hash for Output {
	fn type_hash() -> [u8; HASH_LEN] {
		[
			69, 230, 189, 249, 100, 29, 81, 134, 15, 124, 243, 126, 55, 37, 82, 207, 128, 30, 120,
			162, 115, 136, 26, 187, 55, 232, 245, 171, 182, 105, 236, 166,
		]
	}

	fn data_bytes(&self) -> Vec<u8> {
		let mut data_bytes = Self::type_hash().to_vec();

		// amount
		let amount_bytes = self.amount.to_be_bytes().to_vec();
		data_bytes.append(
			&mut [&vec![0; BYTES_UNIT_LEN - amount_bytes.len()], &amount_bytes[..]].concat(),
		);
		// address
		data_bytes.append(&mut self.address.to_vec());
		data_bytes
	}
}

impl EIP712Hash for Vec<Output> {
	fn data_bytes(&self) -> Vec<u8> {
		let mut data_bytes = Vec::new();
		for output in self {
			data_bytes.append(&mut output.data_hash().to_vec());
		}
		data_bytes
	}
}

impl EIP712Hash for Deploy {
	fn type_hash() -> [u8; HASH_LEN] {
		[
			191, 73, 195, 218, 175, 155, 5, 93, 32, 55, 35, 41, 29, 55, 29, 201, 82, 209, 109, 123,
			31, 2, 65, 141, 198, 86, 74, 85, 132, 78, 201, 76,
		]
	}

	fn data_bytes(&self) -> Vec<u8> {
		let mut data_bytes = Self::type_hash().to_vec();

		// salt
		let mut salt = [0; BYTES_UNIT_LEN];
		salt[..self.metadata.salt.len()].copy_from_slice(&self.metadata.salt);
		data_bytes.append(&mut salt.to_vec());

		// name
		let name_hash = keccak_256(&self.metadata.name.as_bytes());
		data_bytes.append(&mut name_hash.to_vec());

		// deployer
		data_bytes.append(&mut self.metadata.deployer.to_vec());

		// mint amount
		let mint_amount_bytes = self.metadata.mint_amount.to_be_bytes().to_vec();
		data_bytes.append(
			&mut [&vec![0; BYTES_UNIT_LEN - mint_amount_bytes.len()], &mint_amount_bytes[..]]
				.concat(),
		);

		// price
		let price_bytes = self.metadata.price.to_be_bytes().to_vec();
		data_bytes
			.append(&mut [&vec![0; BYTES_UNIT_LEN - price_bytes.len()], &price_bytes[..]].concat());

		// total_supply
		let total_supply_bytes = self.metadata.total_supply.to_be_bytes().to_vec();
		data_bytes.append(
			&mut [&vec![0; BYTES_UNIT_LEN - total_supply_bytes.len()], &total_supply_bytes[..]]
				.concat(),
		);

		// fee inputs
		data_bytes.append(&mut self.fee_inputs.data_hash().to_vec());

		// fee outputs
		data_bytes.append(&mut self.fee_outputs.data_hash().to_vec());

		data_bytes
	}
}

impl EIP712Hash for Mint {
	fn type_hash() -> [u8; HASH_LEN] {
		[
			65, 248, 17, 248, 4, 254, 170, 184, 160, 96, 46, 26, 213, 54, 185, 120, 54, 63, 142,
			160, 150, 182, 62, 166, 175, 18, 168, 44, 71, 254, 251, 202,
		]
	}

	fn data_bytes(&self) -> Vec<u8> {
		let mut data_bytes = Self::type_hash().to_vec();

		// asset id
		data_bytes.append(&mut self.asset_id.to_vec());

		// outputs
		data_bytes.append(&mut self.outputs.data_hash().to_vec());

		// fee inputs
		data_bytes.append(&mut self.fee_inputs.data_hash().to_vec());

		// fee outputs
		data_bytes.append(&mut self.fee_outputs.data_hash().to_vec());

		data_bytes
	}
}

impl EIP712Hash for Transfer {
	fn type_hash() -> [u8; HASH_LEN] {
		[
			225, 13, 10, 205, 160, 64, 111, 241, 213, 202, 142, 72, 73, 146, 196, 250, 232, 135,
			196, 23, 101, 16, 141, 223, 54, 97, 115, 52, 42, 183, 194, 119,
		]
	}

	fn data_bytes(&self) -> Vec<u8> {
		let mut data_bytes = Self::type_hash().to_vec();

		// asset id
		data_bytes.append(&mut self.asset_id.to_vec());

		// inputs
		data_bytes.append(&mut self.inputs.data_hash().to_vec());

		// outputs
		data_bytes.append(&mut self.outputs.data_hash().to_vec());

		// fee inputs
		data_bytes.append(&mut self.fee_inputs.data_hash().to_vec());

		// fee outputs
		data_bytes.append(&mut self.fee_outputs.data_hash().to_vec());

		data_bytes
	}
}
