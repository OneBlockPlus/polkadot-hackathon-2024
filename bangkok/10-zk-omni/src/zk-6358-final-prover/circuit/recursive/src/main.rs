//! A simple program that aggregates the proofs of multiple programs proven with the zkVM.

#![no_main]
sp1_zkvm::entrypoint!(main);

use pc_lib::crypto::sp1_merkle_tree::calculate_merkle_root;
use pc_lib::crypto::sp1_mt_hasher::MTKeccak256PC;
use pc_lib::crypto::sp1_mt_hasher::MT_HASH_LEN;
use sha2::Digest;
use sha2::Sha256;

pub fn words_to_bytes_le(words: &[u32; 8]) -> [u8; 32] {
    let mut bytes = [0u8; 32];
    for i in 0..8 {
        let word_bytes = words[i].to_le_bytes();
        bytes[i * 4..(i + 1) * 4].copy_from_slice(&word_bytes);
    }
    bytes
}

/// Encode a list of vkeys and committed values into a single byte array. In the future this could
/// be a merkle tree or some other commitment scheme.
///
/// ( vkeys.len() || vkeys || committed_values[0].len as u32 || committed_values[0] || ... )
pub fn commit_proof_pairs(vkeys: &[[u32; 8]], committed_values: &[Vec<u8>]) -> Vec<u8> {
    assert_eq!(vkeys.len(), committed_values.len());
    let mut res = Vec::with_capacity(
        4 + vkeys.len() * 32
            + committed_values.len() * 4
            + committed_values
                .iter()
                .map(|vals| vals.len())
                .sum::<usize>(),
    );

    // Note we use big endian because abi.encodePacked in solidity does also
    res.extend_from_slice(&(vkeys.len() as u32).to_be_bytes());
    for vkey in vkeys.iter() {
        res.extend_from_slice(&words_to_bytes_le(vkey));
    }
    for vals in committed_values.iter() {
        res.extend_from_slice(&(vals.len() as u32).to_be_bytes());
        res.extend_from_slice(vals);
    }

    res
}

///////////////////////////////////////////////////////////////
/// public values of each sig-proof
/// - local root: [u8; 32]
/// - local txid-bytes: 32 * n
/// outputs: 
/// - root: 32
/// - txids: 32 * N
pub fn main() {
    // Read the verification keys.
    let vkeys = sp1_zkvm::io::read::<Vec<[u32; 8]>>();

    // Read the public values.
    let public_values = sp1_zkvm::io::read::<Vec<Vec<u8>>>();

    // leaves for local root
    let mut pv_leaves: Vec<[u8; MT_HASH_LEN]> = Vec::with_capacity(public_values.len());
    // tx-exec-bytes
    let mut commiment = Vec::with_capacity(MT_HASH_LEN + public_values.iter().map(|pv| {
        pv.len() - MT_HASH_LEN
    }).sum::<usize>());

    commiment.extend_from_slice(&[0u8; MT_HASH_LEN]);

    // Verify the proofs.
    assert_eq!(vkeys.len(), public_values.len());
    for i in 0..vkeys.len() {
        let vkey = &vkeys[i];
        let pv = &public_values[i];
        let public_values_digest = Sha256::digest(pv);
        sp1_zkvm::lib::verify::verify_sp1_proof(vkey, &public_values_digest.into());

        // fullfill values
        pv_leaves.push(pv[..MT_HASH_LEN].try_into().unwrap());
        commiment.extend_from_slice(&pv[MT_HASH_LEN..]);
    }

    let root_hash = calculate_merkle_root::<MTKeccak256PC>(&pv_leaves);
    commiment[..MT_HASH_LEN].copy_from_slice(&root_hash);

    sp1_zkvm::io::commit_slice(&commiment);
}
