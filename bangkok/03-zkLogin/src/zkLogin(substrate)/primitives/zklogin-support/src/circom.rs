use crate::error::{ZkAuthError, ZkAuthResult};
use ark_bn254::{Fq, Fq2, G1Affine, G1Projective, G2Affine, G2Projective};
use ark_ff::{BigInt, PrimeField};
use sp_core::U256;

/// A G1 point in BN254 serialized as a vector of three strings which is the canonical decimal
/// representation of the projective coordinates in Fq.
pub type CircomG1 = [U256; 3];

/// A G2 point in BN254 serialized as a vector of three vectors each being a vector of two strings
/// which are the canonical decimal representation of the coefficients of the projective coordinates
/// in Fq2.
pub type CircomG2 = [[U256; 2]; 3];

/// Deserialize a G1 projective point in BN254 serialized as a vector of three strings into an affine
/// G1 point in arkworks format. Return an error if the input is not a vector of three strings or if
/// any of the strings cannot be parsed as a field element.
pub(crate) fn g1_affine_from_str_projective(s: &CircomG1) -> ZkAuthResult<G1Affine> {
    Ok(G1Projective::new_unchecked(
        Fq::from_bigint(BigInt(s[0].0)).ok_or(ZkAuthError::FqParseError)?,
        Fq::from_bigint(BigInt(s[1].0)).ok_or(ZkAuthError::FqParseError)?,
        Fq::from_bigint(BigInt(s[2].0)).ok_or(ZkAuthError::FqParseError)?,
    )
    .into())
}

/// Deserialize a G2 projective point from the BN254 construction serialized as a vector of three
/// vectors each being a vector of two strings into an affine G2 point in arkworks format. Return an
/// error if the input is not a vector of the right format or if any of the strings cannot be parsed
/// as a field element.
pub(crate) fn g2_affine_from_str_projective(s: &CircomG2) -> ZkAuthResult<G2Affine> {
    Ok(G2Projective::new_unchecked(
        Fq2::new(
            Fq::from_bigint(BigInt(s[0][0].0)).ok_or(ZkAuthError::FqParseError)?,
            Fq::from_bigint(BigInt(s[0][1].0)).ok_or(ZkAuthError::FqParseError)?,
        ),
        Fq2::new(
            Fq::from_bigint(BigInt(s[1][0].0)).ok_or(ZkAuthError::FqParseError)?,
            Fq::from_bigint(BigInt(s[1][1].0)).ok_or(ZkAuthError::FqParseError)?,
        ),
        Fq2::new(
            Fq::from_bigint(BigInt(s[2][0].0)).ok_or(ZkAuthError::FqParseError)?,
            Fq::from_bigint(BigInt(s[2][1].0)).ok_or(ZkAuthError::FqParseError)?,
        ),
    )
    .into())
}
