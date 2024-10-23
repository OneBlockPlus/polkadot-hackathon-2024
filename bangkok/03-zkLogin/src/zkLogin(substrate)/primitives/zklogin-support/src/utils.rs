use crate::{error::ZkAuthError, poseidon::poseidon_zk_login, zk_input::Bn254Fr, PubKey};
use num_bigint::BigUint;
use sp_std::{vec, vec::Vec};

/// Maps a stream of bigints to a single field element. First we convert the base from
/// inWidth to packWidth. Then we compute the poseidon hash of the "packed" input.
/// input is the input vector containing equal-width big ints. inWidth is the width of
/// each input element.
pub fn hash_to_field(
    input: &[BigUint],
    in_width: u16,
    pack_width: u8,
) -> Result<Bn254Fr, ZkAuthError> {
    let packed = convert_base(input, in_width, pack_width)?;
    poseidon_zk_login(packed)
}

fn div_ceil(dividend: usize, divisor: usize) -> Result<usize, ZkAuthError> {
    if divisor == 0 {
        // Handle division by zero as needed for your application.
        return Err(ZkAuthError::InvalidInput);
    }

    Ok(1 + ((dividend - 1) / divisor))
}

/// Helper function to pack field elements from big ints.
fn convert_base(
    in_arr: &[BigUint],
    in_width: u16,
    out_width: u8,
) -> Result<Vec<Bn254Fr>, ZkAuthError> {
    let bits = big_int_array_to_bits(in_arr, in_width as usize);
    let mut packed: Vec<Bn254Fr> = bits
        .rchunks(out_width as usize)
        .map(|chunk| Bn254Fr::from(BigUint::from_radix_be(chunk, 2).unwrap()))
        .collect();
    packed.reverse();
    match packed.len() != div_ceil(in_arr.len() * in_width as usize, out_width as usize).unwrap() {
        true => Err(ZkAuthError::InvalidInput),
        false => Ok(packed),
    }
}

/// Convert a big int array to a bit array with 0 paddings.
fn big_int_array_to_bits(arr: &[BigUint], int_size: usize) -> Vec<u8> {
    let mut bitarray: Vec<u8> = Vec::new();
    for num in arr {
        let val = num.to_radix_be(2);
        let extra_bits = if val.len() < int_size { int_size - val.len() } else { 0 };

        let mut padded = vec![0; extra_bits];
        padded.extend(val);
        bitarray.extend(padded)
    }
    bitarray
}

/// Split the pubkey into 2 slice
/// Note: eph_pk_bytes is a 32-bytes long fixed u8 array
/// No need to worry about the spill
pub fn split_to_two_frs(eph_pk_bytes: &PubKey) -> Result<(Bn254Fr, Bn254Fr), ZkAuthError> {
    // Split the bytes deterministically such that the first element contains the first 128
    // bits of the hash, and the second element contains the latter ones.
    let (first_half, second_half) = eph_pk_bytes.split_at(eph_pk_bytes.len() - 16);
    let first_bigint = BigUint::from_bytes_be(first_half);
    let second_bigint = BigUint::from_bytes_be(second_half);

    let eph_public_key_0 = Bn254Fr::from(first_bigint);
    let eph_public_key_1 = Bn254Fr::from(second_bigint);
    Ok((eph_public_key_0, eph_public_key_1))
}
