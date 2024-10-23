use crate::{
    jwk::{JWKProvider, JwkId},
    test_helper::{get_raw_data, get_zklogin_inputs},
    ZkMaterial,
};
use sp_core::{bounded::BoundedVec, ConstU32};

#[test]
fn verify_zklogin() {
    let (address_seed, input_data, max_epoch, eph_pubkey_bytes) = get_raw_data();
    let input = get_zklogin_inputs(input_data);

    let google_kid = "1f40f0a8ef3d880978dc82f25c3ec317c6a5b781";
    let google_jwk_id = JwkId::new(
        JWKProvider::Google,
        BoundedVec::<u8, ConstU32<256>>::truncate_from(google_kid.as_bytes().to_vec()),
    );

    let zk_material = ZkMaterial::new(google_jwk_id, input, max_epoch, eph_pubkey_bytes);
    let zklogin_result = zk_material.verify_zk_login(&address_seed);

    assert!(zklogin_result.is_ok());
}
