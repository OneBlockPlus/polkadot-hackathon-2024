use super::header::CyferioHeader;
use super::transaction::CyferioBlobTransaction;
use crate::validity_condition::CyferioValidityCond;
use serde::{Deserialize, Serialize};
use sov_rollup_interface::da::{DaProof, RelevantBlobs, RelevantProofs};
use sov_rollup_interface::services::da::SlotData;

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct CyferioBlock {
    pub header: CyferioHeader,
    pub transactions: Vec<CyferioBlobTransaction>,
    pub validity_cond: CyferioValidityCond,
    pub batch_blobs: Vec<CyferioBlobTransaction>,
    pub proof_blobs: Vec<CyferioBlobTransaction>,
}

impl CyferioBlock {
    pub fn as_relevant_blobs(&self) -> RelevantBlobs<CyferioBlobTransaction> {
        RelevantBlobs {
            proof_blobs: self.proof_blobs.clone(),
            batch_blobs: self.batch_blobs.clone(),
        }
    }

    pub fn get_relevant_proofs(&self) -> RelevantProofs<[u8; 32], ()> {
        RelevantProofs {
            batch: DaProof {
                inclusion_proof: Default::default(),
                completeness_proof: Default::default(),
            },
            proof: DaProof {
                inclusion_proof: Default::default(),
                completeness_proof: Default::default(),
            },
        }
    }

    pub fn new(header: CyferioHeader, transactions: Vec<CyferioBlobTransaction>) -> Self {
        Self {
            header,
            transactions,
            validity_cond: Default::default(),
            batch_blobs: Vec::new(),
            proof_blobs: Vec::new(),
        }
    }
}

impl SlotData for CyferioBlock {
    type BlockHeader = CyferioHeader;
    type Cond = CyferioValidityCond;

    fn hash(&self) -> [u8; 32] {
        *self.header.hash.inner()
    }

    fn header(&self) -> &Self::BlockHeader {
        &self.header
    }

    fn validity_condition(&self) -> CyferioValidityCond {
        self.validity_cond.clone()
    }
}

impl Default for CyferioBlock {
    fn default() -> Self {
        Self {
            header: Default::default(),
            transactions: Vec::new(),
            validity_cond: Default::default(),
            batch_blobs: Vec::new(),
            proof_blobs: Vec::new(),
        }
    }
}
