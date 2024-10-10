use crate::error::{ZkAuthError, ZkAuthResult};
use ark_bn254::Fr;
use poseidon_ark::Poseidon;
use sp_std::vec::Vec;

/// The degree of the Merkle tree used to hash multiple elements.
pub const MERKLE_TREE_DEGREE: usize = 16;

pub(crate) fn poseidon_zk_login(inputs: Vec<Fr>) -> ZkAuthResult<Fr> {
    if inputs.is_empty() || inputs.len() > 32 {
        return Err(ZkAuthError::InputLengthWrong(inputs.len()));
    }
    poseidon_merkle_tree(inputs)
}

/// Calculate the poseidon hash of the field element inputs. If the input length is <= 16, calculate
/// H(inputs), otherwise chunk the inputs into groups of 16, hash them and input the results recursively.
pub fn poseidon_merkle_tree(inputs: Vec<Fr>) -> Result<Fr, ZkAuthError> {
    let poseidon = Poseidon::new();
    if inputs.len() <= MERKLE_TREE_DEGREE {
        poseidon
            .hash(inputs.clone())
            .map_err(|_| ZkAuthError::InputLengthWrong(inputs.len()))
    } else {
        poseidon_merkle_tree(
            inputs
                .chunks(MERKLE_TREE_DEGREE)
                .map(|chunk| {
                    poseidon
                        .hash(chunk.to_vec())
                        .map_err(|_| ZkAuthError::InputLengthWrong(inputs.len()))
                })
                .collect::<ZkAuthResult<Vec<_>>>()?,
        )
    }
}
