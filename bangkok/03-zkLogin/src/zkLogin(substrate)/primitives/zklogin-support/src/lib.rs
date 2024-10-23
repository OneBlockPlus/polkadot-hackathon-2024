//! # Supportive functions of Zklogin
//!
//! Mainly about `zklogin_verify`

#![cfg_attr(not(feature = "std"), no_std)]

use crate::{
    jwk::get_modulo,
    pvk::{prod_pvk, test_pvk},
    zk_input::Bn254Fr,
};
use ark_bn254::Bn254;
use ark_crypto_primitives::snark::SNARK;
use ark_groth16::{Groth16, Proof};
use base64ct::{Base64UrlUnpadded, Encoding};
use scale_codec::{Decode, Encode, MaxEncodedLen};
use scale_info::TypeInfo;
use sp_core::{crypto::AccountId32, U256};
use sp_runtime::{
    traits::{IdentifyAccount, Lazy, Verify},
    RuntimeDebug,
};

pub use error::{ZkAuthError, ZkAuthResult};
pub use jwk::{JWKProvider, JwkId};
pub use zk_input::ZkLoginInputs;

mod circom;
mod error;
mod jwk;
mod poseidon;
mod pvk;
#[cfg(feature = "std")]
pub mod test_helper;
#[cfg(test)]
mod tests;
mod utils;
mod zk_input;

pub const PACK_WIDTH: u8 = 248;
pub const EPH_PUB_KEY_LEN: usize = 32;

/// The Ephemeral Public Key should be [u8; 32]
pub type PubKey = [u8; EPH_PUB_KEY_LEN];

#[derive(Debug, Clone)]
pub enum ZkLoginEnv {
    /// Use the secure global verifying key derived from ceremony.
    Prod,
    /// Use the insecure global verifying key.
    #[allow(unused)]
    Test,
}

impl Default for ZkLoginEnv {
    fn default() -> Self {
        Self::Prod
    }
}

#[derive(Encode, Decode, MaxEncodedLen, TypeInfo, RuntimeDebug, Clone, PartialEq, Eq)]
pub struct Signature<S> {
    zk_material: ZkMaterial,
    sig: S,
}

impl<S> Signature<S> {
    pub fn new(
        source: JwkId,
        inputs: ZkLoginInputs,
        ephkey_expire_at: u32,
        eph_pubkey: [u8; 32],
        sig: S,
    ) -> Self {
        Self { zk_material: ZkMaterial::new(source, inputs, ephkey_expire_at, eph_pubkey), sig }
    }
}

impl<S> Verify for Signature<S>
where
    S: Verify,
    S::Signer: IdentifyAccount<AccountId = AccountId32>,
{
    type Signer = S::Signer;

    fn verify<L: Lazy<[u8]>>(
        &self,
        msg: L,
        signer: &<Self::Signer as IdentifyAccount>::AccountId,
    ) -> bool {
        if !self.sig.verify(msg, &AccountId32::from(self.zk_material.get_eph_pubkey())) {
            return false
        }

        // verify zk proof
        self.zk_material.verify_zk_login(signer).is_ok()
    }
}

/// The material that is used for zkproof verification
#[derive(Encode, Decode, MaxEncodedLen, TypeInfo, RuntimeDebug, Clone, PartialEq, Eq)]
pub struct ZkMaterial {
    /// (JwtProvider,kid) that is used to get the corresponding `n`, which
    /// will be used in zk proof verification
    source: JwkId,
    /// ZkProof
    inputs: ZkLoginInputs,
    /// When the ephemeral key is expired
    ephkey_expire_at: u32,
    /// The ephemeral public key, for more specific, the ephemeral key
    /// is used to sign the extrinsic
    eph_pubkey: PubKey,
}

impl ZkMaterial {
    pub fn new(
        source: JwkId,
        inputs: ZkLoginInputs,
        ephkey_expire_at: u32,
        eph_pubkey: [u8; 32],
    ) -> Self {
        Self { source, inputs, ephkey_expire_at, eph_pubkey }
    }

    pub fn get_eph_pubkey(&self) -> PubKey {
        return self.eph_pubkey;
    }

    pub fn get_ephkey_expire_at(&self) -> u32 {
        return self.ephkey_expire_at;
    }
    /// entry to handle zklogin-support proof verification
    pub fn verify_zk_login(&self, address_seed: &AccountId32) -> ZkAuthResult<()> {
        // Load the expected JWK.
        // now supports Google, Twitch, Facebook, Apple, Slack,
        let jwk = get_modulo(&self.source)?;

        // Decode modulus to bytes.
        let modulus =
            Base64UrlUnpadded::decode_vec(&jwk.n).map_err(|_| ZkAuthError::ModulusDecodeError)?;

        let address_seed_u256 = U256::from_big_endian(address_seed.as_ref());

        // Calculate all inputs hash and passed to the verification function.
        match verify_zklogin_proof_in_prod(
            &self.inputs.get_proof().as_arkworks()?,
            &[self.inputs.calculate_all_inputs_hash(
                address_seed_u256,
                &self.eph_pubkey,
                &modulus,
                self.ephkey_expire_at,
            )?],
        ) {
            Ok(true) => Ok(()),
            Ok(false) | Err(_) => Err(ZkAuthError::ProofVerifyingFailed),
        }
    }
}

/// Verify zklogin-support proof with pvk in production
fn verify_zklogin_proof_in_prod(
    proof: &Proof<Bn254>,
    public_inputs: &[Bn254Fr],
) -> Result<bool, ZkAuthError> {
    verify_zklogin_proof_with_fixed_vk(&ZkLoginEnv::Prod, proof, public_inputs)
}

/// Verify a proof against its public inputs using the fixed verifying key.
fn verify_zklogin_proof_with_fixed_vk(
    usage: &ZkLoginEnv,
    proof: &Proof<Bn254>,
    public_inputs: &[Bn254Fr],
) -> Result<bool, ZkAuthError> {
    let prod_pvk = prod_pvk();
    let test_pvk = test_pvk();
    let vk = match usage {
        ZkLoginEnv::Prod => &prod_pvk,
        ZkLoginEnv::Test => &test_pvk,
    };
    Groth16::<Bn254>::verify_with_processed_vk(vk, public_inputs, proof)
        .map_err(|e| ZkAuthError::GeneralError(e.into()))
}
