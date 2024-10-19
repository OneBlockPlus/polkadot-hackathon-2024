
use zk_6358::{prelude::ZK6358GoldilocksField, utils6358::{
    deploy_tx::DeployTransaction, mint_tx::MintTransaction, transaction::{TransactionInput, TransactionOutput}, tx_eip_712::{EIP712DataHashing, EIP712_DOMAIN_HASH}, type_utils::ZK6358DataHashing, utxo::HASH_LEN
}};

use tiny_keccak::{Hasher, Keccak};

///////////////////////////////////////////////////////////////////////
/// sp1
pub fn sp1_raw_bytes_keccak256_hash(input: &[u8]) -> [u8; HASH_LEN] {
    let mut hasher = Keccak::v256();
    hasher.update(&input);
    let mut output = [0u8; HASH_LEN];
    hasher.finalize(&mut output);
    output
}

///////////////////////////////////////////////////////////////////////
// data

// use the `EIP712_DOMAIN_HASH` in `zk-6358`
// pub const EIP712_DOMAIN_HASH: [u8; HASH_LEN] = [155, 31, 74, 110, 223, 92, 237, 247, 93, 153, 248, 164, 58, 122, 143, 141, 24, 237, 186, 65, 16, 147, 52, 93, 140, 150, 92, 47, 136, 159, 27, 23];

pub const BYTES_UNIT_LEN: usize = 32;

pub fn le_bytes_to_be_bytes_n<const N: usize>(le_bytes: &Vec<u8>) -> [u8; N] {
    debug_assert!(le_bytes.len() < N);
    let mut be_bytes_n = le_bytes.to_vec();
    be_bytes_n.reverse();
    be_bytes_n = [&vec![0; N - le_bytes.len()], &be_bytes_n[..]].concat();
    be_bytes_n.try_into().unwrap()
}

pub trait SP1EIP712DataHashing {
    // fn type_hash() -> [u8; HASH_LEN];
    fn data_bytes(&self) -> Vec<u8>;

    fn data_hash(&self) -> [u8; HASH_LEN] {
        sp1_raw_bytes_keccak256_hash(&self.data_bytes())
    }

    fn eip_712_bytes(&self) -> Vec<u8> {
        let prefix = (b"\x19\x01").to_vec();
        [&prefix[..], &EIP712_DOMAIN_HASH, &self.data_hash()].concat()
    }

    fn eip_712_hash(&self) -> [u8; HASH_LEN] {
        sp1_raw_bytes_keccak256_hash(&self.eip_712_bytes())
    }

    fn eip_712_signature_hash(&self) -> [u8; HASH_LEN] {
        let mut eip_712_signature_hash = self.eip_712_hash();
        eip_712_signature_hash.reverse();
        eip_712_signature_hash
    }
}

pub trait SP1TxIdHashing: ZK6358DataHashing<ZK6358GoldilocksField> {
    fn txid_hashing(&self) -> [u8; HASH_LEN];
}

// TransactionInput
impl SP1EIP712DataHashing for TransactionInput {
    // fn type_hash() -> [u8; HASH_LEN] {
    //     [
    //         119, 84, 107, 54, 3, 160, 139, 205, 137, 18, 192, 2, 17, 139, 145, 206, 79, 30, 17,
    //         215, 149, 167, 0, 209, 0, 34, 102, 130, 225, 172, 138, 53,
    //     ]
    // }

    fn data_bytes(&self) -> Vec<u8> {
        let mut data_bytes = Self::type_hash().to_vec();

        data_bytes.append(&mut self.pre_txid.to_vec());

        let index_be = le_bytes_to_be_bytes_n::<BYTES_UNIT_LEN>(&self.pre_index_le.to_vec());
        data_bytes.append(&mut index_be.to_vec());

        let amount_be = le_bytes_to_be_bytes_n::<BYTES_UNIT_LEN>(&self.amount_le.to_vec());
        data_bytes.append(&mut amount_be.to_vec());

        // address
        data_bytes.append(&mut self.address.to_vec());

        data_bytes
    }

    // fn data_hash(&self) -> [u8; HASH_LEN] {
    //     raw_bytes_keccak256_hash(&self.data_bytes())
    // }
}

// TxOutputTarget
impl SP1EIP712DataHashing for TransactionOutput {
    // fn type_hash() -> [u8; HASH_LEN] {
    //     [
    //         69, 230, 189, 249, 100, 29, 81, 134, 15, 124, 243, 126, 55, 37, 82, 207, 128, 30, 120,
    //         162, 115, 136, 26, 187, 55, 232, 245, 171, 182, 105, 236, 166,
    //     ]
    // }

    fn data_bytes(&self) -> Vec<u8> {
        let mut data_bytes = Self::type_hash().to_vec();

        let amount_be = le_bytes_to_be_bytes_n::<BYTES_UNIT_LEN>(&self.amount_le.to_vec());
        data_bytes.append(&mut amount_be.to_vec());

        // address
        data_bytes.append(&mut self.address.to_vec());

        data_bytes
    }
}

// inputs and outputs
impl SP1EIP712DataHashing for Vec<TransactionInput> {
    // fn type_hash() -> [u8; HASH_LEN] {
    //     panic!("`GasFeeTransaction` needs no type")
    // }

    fn data_bytes(&self) -> Vec<u8> {
        let mut data_bytes = Vec::new();

        self.iter().for_each(|tx_input| {
            // data_bytes.append(&mut tx_input.data_hash().to_vec());
            data_bytes.append(&mut SP1EIP712DataHashing::data_hash(tx_input).to_vec());
        });

        data_bytes
    }
}

impl SP1EIP712DataHashing for Vec<TransactionOutput> {
    // fn type_hash() -> [u8; HASH_LEN] {
    //     panic!("`GasFeeTransaction` needs no type")
    // }

    fn data_bytes(&self) -> Vec<u8> {
        let mut data_bytes = Vec::new();

        self.iter().for_each(|tx_output| {
            // data_bytes.append(&mut tx_output.data_hash().to_vec());
            data_bytes.append(&mut SP1EIP712DataHashing::data_hash(tx_output).to_vec());
        });

        data_bytes
    }
}

// deploy
impl SP1EIP712DataHashing for DeployTransaction {
    // fn type_hash() -> [u8; HASH_LEN] {
    //     [
    //         87, 77, 50, 27, 163, 92, 214, 116, 160, 111, 168, 75, 75, 147, 217, 141, 104, 231, 20,
    //         57, 63, 132, 190, 90, 112, 200, 137, 196, 152, 105, 73, 22,
    //     ]
    // }

    fn data_bytes(&self) -> Vec<u8> {
        let mut data_bytes = Self::type_hash().to_vec();

        // salt
        let mut salt = [0u8; BYTES_UNIT_LEN];
        salt[..self.salt.len()].copy_from_slice(&self.salt);
        data_bytes.append(&mut salt.to_vec());

        // name
        let name_hash = sp1_raw_bytes_keccak256_hash(&self.name[..self.get_name_len()]);
        data_bytes.append(&mut name_hash.to_vec());

        // deployer
        data_bytes.append(&mut self.base_asset_data.deployer.to_vec());

        // limit
        let per_limit_be = le_bytes_to_be_bytes_n::<BYTES_UNIT_LEN>(&self.base_asset_data.per_mint_le.to_vec());
        data_bytes.append(&mut per_limit_be.to_vec());

        // price
        let per_limit_price_be = le_bytes_to_be_bytes_n::<BYTES_UNIT_LEN>(&self.base_asset_data.per_mint_price_le.to_vec());
        data_bytes.append(&mut per_limit_price_be.to_vec());

        // total supply
        let total_supply_be = le_bytes_to_be_bytes_n::<BYTES_UNIT_LEN>(&self.base_asset_data.total_supply_le.to_vec());
        data_bytes.append(&mut total_supply_be.to_vec());

        // gas inputs
        // data_bytes.append(&mut self.gas_fee_tx.fee_inputs.data_hash().to_vec());
        data_bytes.append(&mut SP1EIP712DataHashing::data_hash(&self.gas_fee_tx.fee_inputs).to_vec());

        // gas outputs
        // data_bytes.append(&mut self.gas_fee_tx.fee_outputs.data_hash().to_vec());
        data_bytes.append(&mut SP1EIP712DataHashing::data_hash(&self.gas_fee_tx.fee_outputs).to_vec());

        data_bytes
    }
}

impl SP1TxIdHashing for DeployTransaction {
    fn txid_hashing(&self) -> [u8; HASH_LEN] {
        let raw_bytes = <DeployTransaction as ZK6358DataHashing<ZK6358GoldilocksField>>::to_bytes(self);
        sp1_raw_bytes_keccak256_hash(&raw_bytes)
    }
}

// mint
impl SP1EIP712DataHashing for MintTransaction {
    // fn type_hash() -> [u8; HASH_LEN] {
    //     [65, 248, 17, 248, 4, 254, 170, 184, 160, 96, 46, 26, 213, 54, 185, 120, 54, 63, 142, 160, 150, 182, 62, 166, 175, 18, 168, 44, 71, 254, 251, 202]
    // }

    fn data_bytes(&self) -> Vec<u8> {
        let mut data_bytes = Self::type_hash().to_vec();

        // asset id
        data_bytes.append(&mut self.asset_id.to_vec());

        // outputs
        // data_bytes.append(&mut self.outputs.data_hash().to_vec());
        data_bytes.append(&mut SP1EIP712DataHashing::data_hash(&self.outputs).to_vec());

        // gas inputs
        // data_bytes.append(&mut self.gas_fee_tx.fee_inputs.data_hash().to_vec());
        data_bytes.append(&mut SP1EIP712DataHashing::data_hash(&self.gas_fee_tx.fee_inputs).to_vec());

        // gas outputs
        // data_bytes.append(&mut self.gas_fee_tx.fee_outputs.data_hash().to_vec());
        data_bytes.append(&mut SP1EIP712DataHashing::data_hash(&self.gas_fee_tx.fee_outputs).to_vec());

        data_bytes
    }
}

impl SP1TxIdHashing for MintTransaction {
    fn txid_hashing(&self) -> [u8; HASH_LEN] {
        let raw_bytes = <MintTransaction as ZK6358DataHashing<ZK6358GoldilocksField>>::to_bytes(self);
        sp1_raw_bytes_keccak256_hash(&raw_bytes)
    }
}

///////////////////////////////////////////////////////
/// test
#[cfg(test)]
pub mod tests {
    use std::ops::AddAssign;

    use rand::{rngs::OsRng, Rng};
    use zk_6358::{prelude::ZK6358GoldilocksField, utils6358::{deploy_tx::{BaseAsset, DeployTransaction}, transaction::{generate_rand_input, generate_rand_output, GasFeeTransaction, TransactionInput, TransactionOutput}, type_utils::ZK6358DataHashing, utxo::{AMOUNT_LEN, USER_ADDRESS_LEN}}};
    use itertools::Itertools;
    use crate::eip::sp1_tx_eip_712::sp1_raw_bytes_keccak256_hash;

    use super::SP1EIP712DataHashing;
    use num::{BigUint, Zero, FromPrimitive};

    pub fn p_test_generate_rand_balanced_inputs_outputs(
        x_le_bytes: [u8; USER_ADDRESS_LEN],
    ) -> (Vec<TransactionInput>, Vec<TransactionOutput>) {
        let i_num = 4usize;
        let inputs = (0..i_num)
            .map(|_| {
                let mut input = generate_rand_input();
                input.address = x_le_bytes.clone();
                input
            })
            .collect_vec();

        let mut output_total = BigUint::zero();
        let outputs = (0..i_num * 2)
            .map(|i: usize| {
                let mut ouput = generate_rand_output();
                if i < i_num {
                    let amount = BigUint::from_usize(i).unwrap();
                    let mut amount_le = amount.to_bytes_le();
                    amount_le.resize(AMOUNT_LEN, 0);
                    ouput.amount_le = amount_le.try_into().unwrap();
                } else {
                    ouput.amount_le = inputs[i - i_num].amount_le;
                }

                output_total.add_assign(BigUint::from_bytes_le(&ouput.amount_le));

                ouput
            })
            .collect_vec();

        let mut input_total = BigUint::zero();
        let inputs = inputs
            .iter()
            .enumerate()
            .map(|(i, input_0)| {
                let mut input = input_0.clone();
                let mut amount = BigUint::from_bytes_le(&input.amount_le);
                amount.add_assign(i);
                let mut amount_le = amount.to_bytes_le();
                amount_le.resize(AMOUNT_LEN, 0);
                input.amount_le = amount_le.try_into().unwrap();

                input_total.add_assign(BigUint::from_bytes_le(&input.amount_le));

                input
            })
            .collect_vec();

        assert_eq!(input_total, output_total);

        (inputs, outputs)
    }
    
    pub fn generate_test_tx_deploy(x_le_bytes: [u8; USER_ADDRESS_LEN]) -> DeployTransaction {
        let (inputs, outputs) = p_test_generate_rand_balanced_inputs_outputs(x_le_bytes);

        DeployTransaction {
            salt: OsRng.gen(),
            // name_str_len: 24,
            name: OsRng.gen(),
            base_asset_data: BaseAsset {
                deployer: OsRng.gen(),
                total_supply_le: OsRng.gen(),
                per_mint_le: OsRng.gen(),
                per_mint_price_le: OsRng.gen(),
            },
            gas_fee_tx: GasFeeTransaction {
                fee_inputs: inputs,
                fee_outputs: outputs,
            },
        }
    }

    #[test]
    fn test_different_hashing() {
        let deploy_tx = generate_test_tx_deploy([0; USER_ADDRESS_LEN]);

        let eip712_hash = <DeployTransaction as zk_6358::utils6358::tx_eip_712::EIP712DataHashing>::eip_712_signature_hash(&deploy_tx);
        let sp1_eip712_hash = <DeployTransaction as SP1EIP712DataHashing>::eip_712_signature_hash(&deploy_tx);

        let p2_keccak = <DeployTransaction as ZK6358DataHashing<ZK6358GoldilocksField>>::hash_keccak256(&deploy_tx);
        let sp1_keccak = sp1_raw_bytes_keccak256_hash(&<DeployTransaction as ZK6358DataHashing<ZK6358GoldilocksField>>::to_bytes(&deploy_tx));

        assert_eq!(eip712_hash, sp1_eip712_hash);
        assert_eq!(p2_keccak, sp1_keccak);
    }
}
