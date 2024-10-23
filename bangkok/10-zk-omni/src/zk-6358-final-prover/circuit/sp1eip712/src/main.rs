#![no_main]

sp1_zkvm::entrypoint!(main);

fn main() {
    // const LEN_BYTES: usize = 4;
    cfg_if::cfg_if! {
        if #[cfg(all(target_os = "zkvm", target_vendor = "succinct"))] {
            
            use ecdsa_core::{RecoveryId, Signature};
            use sp1_eip712_type::types::sp1_tx_types::SP1SignedOmniverseTx;
            use sp1eip712::eip::traits::EIP712ForSignedOmniTx;
            use pc_lib::crypto::{sp1_merkle_tree::calculate_merkle_root, sp1_mt_hasher::{MTKeccak256PC, MT_HASH_LEN}};

            let num_cases = sp1_zkvm::io::read::<usize>();
            let omni_signed_txs = (0..num_cases).map(|_| {
                sp1_zkvm::io::read::<SP1SignedOmniverseTx>()
            }).collect::<Vec<_>>();

            let content_len = MT_HASH_LEN + MT_HASH_LEN * omni_signed_txs.len();
            let mut commitment = Vec::with_capacity(content_len);
            commitment.extend_from_slice(&[0u8; MT_HASH_LEN]);

            let mut tx_leaves = Vec::with_capacity(omni_signed_txs.len());

            for omni_signed_tx in omni_signed_txs {
                let eip712_sgin_hash = omni_signed_tx.eip_712_hash();
                let tx_hash = omni_signed_tx.txid_hash();
                let pk_u8v = omni_signed_tx.full_pk_be();
                let sign_bytes = &omni_signed_tx.get_sig_be();

                let signature = Signature::<k256::Secp256k1>::from_slice(&sign_bytes[..64]).unwrap();
                let recovered_pk = ecdsa_core::VerifyingKey::recover_from_prehash_secp256k1(&eip712_sgin_hash, &signature, RecoveryId::from_byte(signature[64]).unwrap()).unwrap();
    
                assert_eq!(pk_u8v, recovered_pk.to_encoded_point(false).as_bytes(), "Invalid signature: pk unequal");
    
                tx_leaves.push(tx_hash);
                commitment.extend_from_slice(&tx_hash);
            }

            let txs_merkle_root = calculate_merkle_root::<MTKeccak256PC>(&tx_leaves);
            commitment[..MT_HASH_LEN].copy_from_slice(&txs_merkle_root);

            sp1_zkvm::io::commit_slice(&commitment);

        } else {
            unreachable!("only zkvm is valid");
        }
    }
}
