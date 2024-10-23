//! The stf-rollup supports `sov-module` authenticator. To support other authentication schemes,
//! you can check out how we support `EVM` authenticator here:
//! https://github.com/cyferio-labs/sovereign-sdk-wip/blob/146d5c2c5fa07ab7bb59ba6b2e64690ac9b63830/examples/demo-rollup/stf/src/authentication.rs#L29-L32
use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use std::marker::PhantomData;

use crate::runtime::{Runtime, RuntimeCall};

use sov_modules_api::capabilities::{
    AuthenticationResult, AuthorizationData, UnregisteredAuthenticationError,
};
use sov_modules_api::runtime::capabilities::{
    AuthenticationError, Authenticator, FatalError, RuntimeAuthenticator,
};
use sov_modules_api::{
    DaSpec, DispatchCall, GasMeter, PreExecWorkingSet, RawTx, Spec, UnlimitedGasMeter,
};
use sov_sequencer_registry::SequencerStakeMeter;

impl<S: Spec, Da: DaSpec> RuntimeAuthenticator<S> for Runtime<S, Da> {
    type Decodable = <Self as DispatchCall>::Decodable;

    type SequencerStakeMeter = SequencerStakeMeter<S::Gas>;

    type AuthorizationData = AuthorizationData<S>;

    #[cfg_attr(all(target_os = "zkvm", feature = "bench"), cycle_tracker)]
    fn authenticate(
        &self,
        raw_tx: &RawTx,
        pre_exec_ws: &mut PreExecWorkingSet<S, Self::SequencerStakeMeter>,
    ) -> AuthenticationResult<S, Self::Decodable, Self::AuthorizationData> {
        let auth = Auth::try_from_slice(raw_tx.data.as_slice()).map_err(|e| {
            AuthenticationError::FatalError(FatalError::DeserializationFailed(e.to_string()))
        })?;

        match auth {
            Auth::Mod(tx) => ModAuth::<S, Da>::authenticate(&tx, pre_exec_ws),
            // Leaving the line below as an example to support different authentication schemes:
            // Auth::Evm(tx) => EvmAuth::<S, Da>::authenticate(&tx, sequencer_stake_meter),
        }
    }

    fn authenticate_unregistered(
        &self,
        raw_tx: &RawTx,
        pre_exec_ws: &mut PreExecWorkingSet<S, UnlimitedGasMeter<S::Gas>>,
    ) -> AuthenticationResult<
        S,
        Self::Decodable,
        Self::AuthorizationData,
        UnregisteredAuthenticationError,
    > {
        let (tx_and_raw_hash, auth_data, runtime_call) =
            sov_modules_api::capabilities::authenticate::<
                S,
                Runtime<S, Da>,
                UnlimitedGasMeter<S::Gas>,
            >(&raw_tx.data, pre_exec_ws)?;

        match &runtime_call {
            RuntimeCall::sequencer_registry(sov_sequencer_registry::CallMessage::Register {
                ..
            }) => Ok((tx_and_raw_hash, auth_data, runtime_call)),
            _ => Err(UnregisteredAuthenticationError::RuntimeCall)?,
        }
    }
}

#[derive(Debug, PartialEq, Clone, BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
enum Auth {
    Mod(Vec<u8>),
    // Leaving the line below as an example to support different authentication schemes:
    // Evm(Vec<u8>),
}

pub struct ModAuth<S: Spec, Da: DaSpec> {
    _phantom: PhantomData<(S, Da)>,
}

impl<S: Spec, Da: DaSpec> Authenticator for ModAuth<S, Da> {
    type Spec = S;
    type DispatchCall = Runtime<S, Da>;
    type AuthorizationData = AuthorizationData<S>;

    fn authenticate<Meter: GasMeter<S::Gas>>(
        tx: &[u8],
        pre_exec_working_set: &mut PreExecWorkingSet<S, Meter>,
    ) -> AuthenticationResult<
        Self::Spec,
        <Self::DispatchCall as DispatchCall>::Decodable,
        Self::AuthorizationData,
    > {
        sov_modules_api::capabilities::authenticate::<Self::Spec, Self::DispatchCall, Meter>(
            tx,
            pre_exec_working_set,
        )
    }

    fn encode(tx: Vec<u8>) -> Result<RawTx, anyhow::Error> {
        let data = borsh::to_vec(&Auth::Mod(tx))?;
        Ok(RawTx { data })
    }
}
