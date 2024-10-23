use sp1_eip712_type::types::sp1_tx_types::SP1SignedOmniverseTx;
use zk_6358::utils6358::utxo::HASH_LEN;

use super::sp1_tx_eip_712::{SP1EIP712DataHashing, SP1TxIdHashing};

pub trait EIP712ForSignedOmniTx {
    fn eip_712_hash(&self) -> [u8; HASH_LEN];
    fn eip_712_signature_hash(&self) -> [u8; HASH_LEN];
    fn txid_hash(&self) -> [u8; HASH_LEN];
}

impl EIP712ForSignedOmniTx for SP1SignedOmniverseTx {
    fn eip_712_hash(&self) -> [u8; HASH_LEN] {
        match self {
            SP1SignedOmniverseTx::OmniDeployTx(signed_deploy_tx) => {
                signed_deploy_tx.borrow_deploy_tx().eip_712_hash()
            }
            SP1SignedOmniverseTx::OmniMintTx(signed_mint_tx) => signed_mint_tx.borrow_mint_tx().eip_712_hash(),
            SP1SignedOmniverseTx::OmniSpendTx(signed_spend_tx) => signed_spend_tx.borrow_spend_tx().eip_712_hash(),
            _ => {
                panic!("invalid transaction")
            }
        }
    }

    fn eip_712_signature_hash(&self) -> [u8; HASH_LEN] {
        match self {
            SP1SignedOmniverseTx::OmniDeployTx(signed_deploy_tx) => {
                signed_deploy_tx.borrow_deploy_tx().eip_712_signature_hash()
            }
            SP1SignedOmniverseTx::OmniMintTx(signed_mint_tx) => signed_mint_tx.borrow_mint_tx().eip_712_signature_hash(),
            SP1SignedOmniverseTx::OmniSpendTx(signed_spend_tx) => signed_spend_tx.borrow_spend_tx().eip_712_signature_hash(),
            _ => {
                panic!("invalid transaction")
            }
        }
    }

    fn txid_hash(&self) -> [u8; HASH_LEN] {
        match self {
            SP1SignedOmniverseTx::OmniDeployTx(signed_deploy_tx) => {
                signed_deploy_tx.borrow_deploy_tx().txid_hashing()
            }
            SP1SignedOmniverseTx::OmniMintTx(signed_mint_tx) => signed_mint_tx.borrow_mint_tx().txid_hashing(),
            SP1SignedOmniverseTx::OmniSpendTx(signed_spend_tx) => signed_spend_tx.borrow_spend_tx().txid_hashing(),
            _ => {
                panic!("invalid transaction")
            }
        }
    }
}