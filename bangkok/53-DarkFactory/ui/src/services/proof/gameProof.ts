export interface LayoutProof {
  rate: bigint;
  storage: bigint;
  a: [bigint, bigint];
  b: [[bigint, bigint], [bigint, bigint]];
  c: [bigint, bigint];
}

export async function getLayoutProof(
  layoutPlacements: bigint[],
): Promise<LayoutProof> {
  if (layoutPlacements.length !== 8 * 18)
    throw new Error(
      'Invalid layoutPlacements length, required 8*18=144 elements',
    );
  const { proof, publicSignals } = await window.snarkjs.groth16.fullProve(
    {
      layoutPlacements,
    },

    'circuits/LayoutEligibility.wasm',
    'circuits/LayoutEligibility_final.zkey',
  );

  const ep = await window.snarkjs.groth16.exportSolidityCallData(
    proof,
    publicSignals,
  );
  const eep = JSON.parse('[' + ep + ']');

  return {
    rate: eep[3][0],
    storage: eep[3][1],
    a: eep[0],
    b: eep[1],
    c: eep[2],
  };
}
