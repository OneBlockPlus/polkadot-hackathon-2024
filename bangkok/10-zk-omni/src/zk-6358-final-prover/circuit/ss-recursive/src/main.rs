use pc_lib::crypto::sp1_mt_hasher::MT_HASH_LEN;
use sha2::Digest;
use sha2::Sha256;

pub fn main() {
    // Read the verification keys.
    let vkeys = sp1_zkvm::io::read::<Vec<[u32; 8]>>();

    // substitute to your own circuit verifiier key
    let expected_vkey_state = [0u32; 8];
    let expected_vkey_sign = [0u32; 8];
    assert_eq!(vkeys[0], expected_vkey_state, "Invalid p2-state-proof circuit");
    assert_eq!(vkeys[1], expected_vkey_sign, "Invalid sp1-signature-proof circuit");
    
    let public_values = sp1_zkvm::io::read::<Vec<Vec<u8>>>();
    let pre_state_roots = &public_values[0][..2 * MT_HASH_LEN];
    let state_total_len = public_values[0].len();
    let state_txids = &public_values[0][2 * MT_HASH_LEN..state_total_len - 2 * MT_HASH_LEN];
    let after_state_roots = &public_values[0][state_total_len - 2 * MT_HASH_LEN..];

    let tx_root = &public_values[1][..MT_HASH_LEN];
    let sig_txids = &public_values[1][MT_HASH_LEN..];

    assert_eq!(sig_txids, state_txids, "tx-exec-records not the same");

    assert_eq!(vkeys.len(), public_values.len());
    for i in 0..vkeys.len() {
        let vkey = &vkeys[i];
        let pv = &public_values[i];
        let pv_digest = Sha256::digest(pv);
        sp1_zkvm::lib::verify::verify_sp1_proof(vkey, &pv_digest.into());
    }

    let mut commitment = [0u8; 160];
    commitment[0..64].copy_from_slice(pre_state_roots);
    commitment[64..128].copy_from_slice(after_state_roots);
    commitment[128..].copy_from_slice(tx_root);

    sp1_zkvm::io::commit_slice(&commitment);
}