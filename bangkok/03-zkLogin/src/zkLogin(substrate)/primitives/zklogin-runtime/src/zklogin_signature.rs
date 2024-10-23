use scale_codec::{Decode, Encode, MaxEncodedLen};
use scale_info::TypeInfo;
use sp_runtime::{
    traits::{IdentifyAccount, Lazy, Verify},
    AccountId32, RuntimeDebug,
};

use zklogin_support::Signature as ZkSignature;

/// Wrapped MultiSignature that is compatible with Substrate
#[derive(Eq, PartialEq, Clone, Encode, Decode, MaxEncodedLen, RuntimeDebug, TypeInfo)]
pub enum ZkMultiSignature<S> {
    /// The MultiSignature that is original in substrate
    Origin(S),
    /// The Signature that designed for zkLogin
    Zk(ZkSignature<S>),
}

impl<S> Verify for ZkMultiSignature<S>
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
        match self {
            ZkMultiSignature::Origin(s) => s.verify(msg, signer),
            ZkMultiSignature::Zk(zk_sig) => zk_sig.verify(msg, signer),
        }
    }
}
