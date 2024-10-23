use borsh::{BorshDeserialize, BorshSerialize};
use sov_rollup_interface::da::DaSpec;

pub mod address;
pub mod block;
pub mod hash;
pub mod header;
pub mod transaction;

use crate::validity_condition::{CyferioValidityCond, CyferioValidityCondChecker};

#[derive(
    Default,
    serde::Serialize,
    serde::Deserialize,
    BorshSerialize,
    BorshDeserialize,
    Debug,
    PartialEq,
    Eq,
    Clone,
)]
pub struct CyferioDaLayerSpec;

impl DaSpec for CyferioDaLayerSpec {
    type SlotHash = hash::CyferioHash;
    type BlockHeader = header::CyferioHeader;
    type BlobTransaction = transaction::CyferioBlobTransaction;
    type Address = address::CyferioAddress;
    type ValidityCondition = CyferioValidityCond;

    #[cfg(feature = "native")]
    type Checker = CyferioValidityCondChecker<CyferioValidityCond>;

    type InclusionMultiProof = [u8; 32];
    type CompletenessProof = ();
    type ChainParams = ();
}
