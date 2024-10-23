use plonky2::{plonk::{circuit_data::{CommonCircuitData, VerifierCircuitData, VerifierOnlyCircuitData}, config::{GenericConfig, GenericHashOut, PoseidonGoldilocksConfig}, proof::ProofWithPublicInputs}, util::serialization::DefaultGateSerializer};

pub fn verify_plonky2_proof() {
    const D: usize = 2;
    type C = PoseidonGoldilocksConfig;
    type F = <C as GenericConfig<D>>::F;

    let ppis = sp1_zkvm::io::read::<ProofWithPublicInputs<F, C, D>>();
    let vod = sp1_zkvm::io::read::<VerifierOnlyCircuitData<C, D>>();
    let ccd_bytes = sp1_zkvm::io::read_vec();

    let gate_serializer = DefaultGateSerializer;
    let common = CommonCircuitData::<F, D>::from_bytes(ccd_bytes.clone(), &gate_serializer).unwrap();

    // sp1_zkvm::io::commit(&ppis.public_inputs);
    let mut pv_bytes = Vec::with_capacity(ppis.public_inputs.len() * 8);
    for pv in &ppis.public_inputs {
        pv_bytes.extend_from_slice(&pv.0.to_le_bytes());
    }

    let vd = VerifierCircuitData {
        verifier_only: vod,
        common
    };

    // substitute with your `circuit digest`
    let expected_circuit_digest = [00u8; 32];
    assert_eq!(vd.verifier_only.circuit_digest.to_bytes(), expected_circuit_digest, "unexpected circuit");

    // println!("circuit digest: {:?}", vd.verifier_only.circuit_digest.to_bytes());

    vd.verify(ppis).unwrap();

    sp1_zkvm::io::commit_slice(&pv_bytes);
}