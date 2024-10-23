use std::marker::PhantomData;

use sov_modules_api::runtime::capabilities::{
    AuthenticationResult, Authenticator, AuthorizationData,
};
use sov_modules_api::{DaSpec, DispatchCall, GasMeter, PreExecWorkingSet, RawTx, Spec};

use crate::runtime::optimistic::TestRuntime;

/// Test authenticator.
pub struct TestAuth<S: Spec, Da: DaSpec> {
    _phantom: PhantomData<(S, Da)>,
}

impl<S: Spec, Da: DaSpec> Authenticator for TestAuth<S, Da> {
    type Spec = S;
    type DispatchCall = TestRuntime<S, Da>;
    type AuthorizationData = AuthorizationData<S>;

    fn authenticate<Meter: GasMeter<S::Gas>>(
        tx: &[u8],
        stake_meter: &mut PreExecWorkingSet<S, Meter>,
    ) -> AuthenticationResult<
        Self::Spec,
        <Self::DispatchCall as DispatchCall>::Decodable,
        Self::AuthorizationData,
    > {
        sov_modules_api::capabilities::authenticate::<Self::Spec, Self::DispatchCall, Meter>(
            tx,
            stake_meter,
        )
    }

    fn encode(tx: Vec<u8>) -> Result<RawTx, anyhow::Error> {
        Ok(RawTx { data: tx })
    }
}
