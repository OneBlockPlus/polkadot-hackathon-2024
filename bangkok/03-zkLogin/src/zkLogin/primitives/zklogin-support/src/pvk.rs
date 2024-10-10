use crate::circom::{g1_affine_from_str_projective, g2_affine_from_str_projective};
use ark_bn254::Bn254;
use ark_groth16::{PreparedVerifyingKey, VerifyingKey};
use sp_core::U256;
use sp_std::vec::Vec;

/// The prepared verifying key for production env.
pub(crate) fn prod_pvk() -> PreparedVerifyingKey<Bn254> {
    // Convert the Circom G1/G2/GT to arkworks G1/G2/GT
    let vk_alpha_1 = g1_affine_from_str_projective(&[
        U256::from_dec_str(
            "21529901943976716921335152104180790524318946701278905588288070441048877064089",
        )
        .unwrap(),
        U256::from_dec_str(
            "7775817982019986089115946956794180159548389285968353014325286374017358010641",
        )
        .unwrap(),
        U256::one(), // BigUint::one()
    ])
    .unwrap();
    let vk_beta_2 = g2_affine_from_str_projective(&[
        [
            U256::from_dec_str(
                "6600437987682835329040464538375790690815756241121776438004683031791078085074",
            )
            .unwrap(),
            U256::from_dec_str(
                "16207344858883952201936462217289725998755030546200154201671892670464461194903",
            )
            .unwrap(),
        ],
        [
            U256::from_dec_str(
                "17943105074568074607580970189766801116106680981075272363121544016828311544390",
            )
            .unwrap(),
            U256::from_dec_str(
                "18339640667362802607939727433487930605412455701857832124655129852540230493587",
            )
            .unwrap(),
        ],
        [U256::one(), U256::zero()],
    ])
    .unwrap();
    let vk_gamma_2 = g2_affine_from_str_projective(&[
        [
            U256::from_dec_str(
                "10857046999023057135944570762232829481370756359578518086990519993285655852781",
            )
            .unwrap(),
            U256::from_dec_str(
                "11559732032986387107991004021392285783925812861821192530917403151452391805634",
            )
            .unwrap(),
        ],
        [
            U256::from_dec_str(
                "8495653923123431417604973247489272438418190587263600148770280649306958101930",
            )
            .unwrap(),
            U256::from_dec_str(
                "4082367875863433681332203403145435568316851327593401208105741076214120093531",
            )
            .unwrap(),
        ],
        [U256::one(), U256::zero()],
    ])
    .unwrap();
    let vk_delta_2 = g2_affine_from_str_projective(&[
        [
            U256::from_dec_str(
                "19260309516619721648285279557078789954438346514188902804737557357941293711874",
            )
            .unwrap(),
            U256::from_dec_str(
                "2480422554560175324649200374556411861037961022026590718777465211464278308900",
            )
            .unwrap(),
        ],
        [
            U256::from_dec_str(
                "14489104692423540990601374549557603533921811847080812036788172274404299703364",
            )
            .unwrap(),
            U256::from_dec_str(
                "12564378633583954025611992187142343628816140907276948128970903673042690269191",
            )
            .unwrap(),
        ],
        [U256::one(), U256::zero()],
    ])
    .unwrap();

    // Create a vector of G1Affine elements from the IC
    let mut vk_gamma_abc_g1 = Vec::new();
    for e in [
        [
            U256::from_dec_str(
                "1607694606386445293170795095076356565829000940041894770459712091642365695804",
            )
            .unwrap(),
            U256::from_dec_str(
                "18066827569413962196795937356879694709963206118612267170825707780758040578649",
            )
            .unwrap(),
            U256::one(),
        ],
        [
            U256::from_dec_str(
                "20653794344898475822834426774542692225449366952113790098812854265588083247207",
            )
            .unwrap(),
            U256::from_dec_str(
                "3296759704176575765409730962060698204792513807296274014163938591826372646699",
            )
            .unwrap(),
            U256::one(),
        ],
    ] {
        let g1 = g1_affine_from_str_projective(&e).unwrap();
        vk_gamma_abc_g1.push(g1);
    }

    let vk = VerifyingKey {
        alpha_g1: vk_alpha_1,
        beta_g2: vk_beta_2,
        gamma_g2: vk_gamma_2,
        delta_g2: vk_delta_2,
        gamma_abc_g1: vk_gamma_abc_g1,
    };

    // Convert the verifying key into the prepared form.
    PreparedVerifyingKey::from(vk)
}

/// The prepared verifying key for testing.
pub(crate) fn test_pvk() -> PreparedVerifyingKey<Bn254> {
    // Convert the Circom G1/G2/GT to arkworks G1/G2/GT
    let vk_alpha_1 = g1_affine_from_str_projective(&[
        U256::from_dec_str(
            "21529901943976716921335152104180790524318946701278905588288070441048877064089",
        )
        .unwrap(),
        U256::from_dec_str(
            "7775817982019986089115946956794180159548389285968353014325286374017358010641",
        )
        .unwrap(),
        U256::one(),
    ])
    .unwrap();
    let vk_beta_2 = g2_affine_from_str_projective(&[
        [
            U256::from_dec_str(
                "6600437987682835329040464538375790690815756241121776438004683031791078085074",
            )
            .unwrap(),
            U256::from_dec_str(
                "16207344858883952201936462217289725998755030546200154201671892670464461194903",
            )
            .unwrap(),
        ],
        [
            U256::from_dec_str(
                "17943105074568074607580970189766801116106680981075272363121544016828311544390",
            )
            .unwrap(),
            U256::from_dec_str(
                "18339640667362802607939727433487930605412455701857832124655129852540230493587",
            )
            .unwrap(),
        ],
        [U256::one(), U256::zero()],
    ])
    .unwrap();
    let vk_gamma_2 = g2_affine_from_str_projective(&[
        [
            U256::from_dec_str(
                "10857046999023057135944570762232829481370756359578518086990519993285655852781",
            )
            .unwrap(),
            U256::from_dec_str(
                "11559732032986387107991004021392285783925812861821192530917403151452391805634",
            )
            .unwrap(),
        ],
        [
            U256::from_dec_str(
                "8495653923123431417604973247489272438418190587263600148770280649306958101930",
            )
            .unwrap(),
            U256::from_dec_str(
                "4082367875863433681332203403145435568316851327593401208105741076214120093531",
            )
            .unwrap(),
        ],
        [U256::one(), U256::zero()],
    ])
    .unwrap();
    let vk_delta_2 = g2_affine_from_str_projective(&[
        [
            U256::from_dec_str(
                "19260309516619721648285279557078789954438346514188902804737557357941293711874",
            )
            .unwrap(),
            U256::from_dec_str(
                "2480422554560175324649200374556411861037961022026590718777465211464278308900",
            )
            .unwrap(),
        ],
        [
            U256::from_dec_str(
                "14489104692423540990601374549557603533921811847080812036788172274404299703364",
            )
            .unwrap(),
            U256::from_dec_str(
                "12564378633583954025611992187142343628816140907276948128970903673042690269191",
            )
            .unwrap(),
        ],
        [U256::one(), U256::zero()],
    ])
    .unwrap();

    // Create a vector of G1Affine elements from the IC
    let mut vk_gamma_abc_g1 = Vec::new();
    for e in [
        [
            U256::from_dec_str(
                "1607694606386445293170795095076356565829000940041894770459712091642365695804",
            )
            .unwrap(),
            U256::from_dec_str(
                "18066827569413962196795937356879694709963206118612267170825707780758040578649",
            )
            .unwrap(),
            U256::from_dec_str("1").unwrap(),
        ],
        [
            U256::from_dec_str(
                "20653794344898475822834426774542692225449366952113790098812854265588083247207",
            )
            .unwrap(),
            U256::from_dec_str(
                "3296759704176575765409730962060698204792513807296274014163938591826372646699",
            )
            .unwrap(),
            U256::from_dec_str("1").unwrap(),
        ],
    ] {
        let g1 = g1_affine_from_str_projective(&e).unwrap();
        vk_gamma_abc_g1.push(g1);
    }

    let vk = VerifyingKey {
        alpha_g1: vk_alpha_1,
        beta_g2: vk_beta_2,
        gamma_g2: vk_gamma_2,
        delta_g2: vk_delta_2,
        gamma_abc_g1: vk_gamma_abc_g1,
    };

    // Convert the verifying key into the prepared form.
    PreparedVerifyingKey::from(vk)
}
