use anyhow::Result;

use log::Level;
use plonky2::{
    field::extension::Extendable, 
    hash::hash_types::RichField, 
    plonk::{circuit_data::CircuitConfig, config::{AlgebraicHasher, GenericConfig, Hasher}}, util::timing::TimingTree
};
use plonky2_ecdsa::gadgets::recursive_proof::ProofTuple;
use zk_6358_prover::{circuit::{parallel_runtime::{half_parallel_circuit_data_prove, ParallelRuntimeCircuitEnv}, state_prover::ZK6358StateProverEnv, zk6358_recursive_proof::zk_6358_chunked_state_recursive_proof}, types::signed_tx_types::SignedOmniverseTx};


////////////////////////////////////////////////////////////////////////////////////////////////////
/// only state prover circuit runtime for cooperation with `sp1` signature proof
pub trait OnlyStateProverCircuitRT<H: Hasher<F> + Send + Sync, F: RichField + Extendable<D>, const D: usize> {
    const CHUNK_SIZE: usize;

    fn state_only_crt_prove<C: GenericConfig<D, F = F>>(
        &mut self,
        batched_somtx_vec: &[SignedOmniverseTx],
    ) -> impl core::future::Future<Output = Result<ProofTuple<F, C, D>>>
    where
        <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>;
}

/////////////////////////////////
/// implementation for `ZK6358StateProverEnv`
impl<H: Hasher<F> + Send + Sync, F: RichField + Extendable<D>, const D: usize> OnlyStateProverCircuitRT<H, F, D> for ZK6358StateProverEnv<H, F, D> {
    const CHUNK_SIZE: usize = 4;

    async fn state_only_crt_prove<C: GenericConfig<D, F = F>>(
        &mut self,
        batched_somtx_vec: &[SignedOmniverseTx],
    ) -> Result<ProofTuple<F, C, D>>
    where
        <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F> {
        // build `ParallelProverCircuitData`
        let timing = TimingTree::new("parallel initializing state circuit", Level::Info);
        let parallel_state_cd_vec = self.build_chunked_state_transfer_data::<C>(batched_somtx_vec, Self::CHUNK_SIZE).await;
        timing.print();

        let timing = TimingTree::new("parallel building and proving state circuit", Level::Info);
        // let chunked_state_proofs = parallel_circuit_data_prove::<F, C, D>(parallel_state_cd_vec);
        let chunked_state_proofs = half_parallel_circuit_data_prove::<F, C, D>(parallel_state_cd_vec);
        timing.print();

        let config = CircuitConfig::standard_recursion_config();

        // to be parallized
        let state_proof =
            zk_6358_chunked_state_recursive_proof(&chunked_state_proofs, &config.clone(), None)
                .unwrap();

        Ok(state_proof)
    }
}
