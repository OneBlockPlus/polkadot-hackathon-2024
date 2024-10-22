use primitive_types::H256;
use sp_core::crypto::AccountId32;
use sp_runtime::{MultiAddress, MultiSignature};
use subxt::{
    config::{
        substrate::{BlakeTwo256, SubstrateHeader},
        DefaultExtrinsicParams, DefaultExtrinsicParamsBuilder,
    },
    Config,
};

/// Default set of commonly used types by Substrate runtimes.
// Note: We only use this at the type level, so it should be impossible to
// create an instance of it.
// The trait implementations exist just to make life easier,
// but shouldn't strictly be necessary since users can't instantiate this type.
#[derive(Clone, Copy, Eq, PartialEq, Ord, PartialOrd, Hash, Debug)]
pub enum SubstrateConfig {}

impl Config for SubstrateConfig {
    type Hash = H256;
    type AccountId = AccountId32;
    type Address = MultiAddress<Self::AccountId, u32>;
    type Signature = MultiSignature;
    type Hasher = BlakeTwo256;
    type Header = SubstrateHeader<u32, BlakeTwo256>;
    type ExtrinsicParams = SubstrateExtrinsicParams<Self>;
    type AssetId = u32;
}

/// A struct representing the signed extra and additional parameters required
/// to construct a transaction for the default substrate node.
pub type SubstrateExtrinsicParams<T> = DefaultExtrinsicParams<T>;

/// A builder which leads to [`SubstrateExtrinsicParams`] being constructed.
/// This is what you provide to methods like `sign_and_submit()`.
pub type SubstrateExtrinsicParamsBuilder<T> = DefaultExtrinsicParamsBuilder<T>;
