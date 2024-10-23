use zk_6358::{prelude::ZK6358GoldilocksField, utils6358::{transaction::SpendTransaction, type_utils::ZK6358DataHashing, utxo::HASH_LEN}};
use zk_6358::utils6358::tx_eip_712::EIP712DataHashing;

use super::sp1_tx_eip_712::{sp1_raw_bytes_keccak256_hash, SP1EIP712DataHashing, SP1TxIdHashing};


impl SP1EIP712DataHashing for SpendTransaction {
    // fn type_hash() -> [u8; zk_6358::utils6358::utxo::HASH_LEN] {
    //     [225, 13, 10, 205, 160, 64, 111, 241, 213, 202, 142, 72, 73, 146, 196, 250, 232, 135, 196, 23, 101, 16, 141, 223, 54, 97, 115, 52, 42, 183, 194, 119]
    // }

    fn data_bytes(&self) -> Vec<u8> {
        let mut data_bytes = Self::type_hash().to_vec();

        // asset id
        data_bytes.append(&mut self.asset_id.to_vec());

        // inputs
        // data_bytes.append(&mut self.inputs.data_hash().to_vec());
        data_bytes.append(&mut SP1EIP712DataHashing::data_hash(&self.inputs).to_vec());

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

impl SP1TxIdHashing for SpendTransaction {
    fn txid_hashing(&self) -> [u8; HASH_LEN] {
        let raw_bytes = <SpendTransaction as ZK6358DataHashing<ZK6358GoldilocksField>>::to_bytes(self);
        sp1_raw_bytes_keccak256_hash(&raw_bytes)
    }
}
