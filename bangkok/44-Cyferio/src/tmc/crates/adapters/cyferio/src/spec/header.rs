use super::hash::CyferioHash;
use serde::{Deserialize, Serialize};
use sov_rollup_interface::da::BlockHeaderTrait;
use subxt::config::substrate::Digest;
use subxt_core::config::substrate::BlakeTwo256;
use subxt_core::config::substrate::SubstrateHeader;
use subxt::config::substrate::H256;

const KATE_START_TIME: i64 = 1686066440;
const KATE_SECONDS_PER_BLOCK: i64 = 20;

#[subxt::subxt(runtime_metadata_path = "./src/metadata.scale")]
pub mod substrate {}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct Header {
    pub number: u32,
    pub parent_hash: CyferioHash,
    pub state_root: CyferioHash,
    pub extrinsics_root: CyferioHash,
    pub digest: Digest,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct CyferioHeader {
    pub hash: CyferioHash,

    pub header: Header,
}

impl CyferioHeader {
    pub fn new(
        hash: CyferioHash,
        number: u32,
        parent_hash: CyferioHash,
        state_root: CyferioHash,
        extrinsics_root: CyferioHash,
        digest: Digest,
    ) -> Self {
        let header = Header {
            number,
            parent_hash,
            state_root,
            extrinsics_root,
            digest,
        };
        Self {
            hash, // You might want to compute this based on the header
            header,
        }
    }
}

impl BlockHeaderTrait for CyferioHeader {
    type Hash = CyferioHash;

    fn prev_hash(&self) -> Self::Hash {
        self.header.parent_hash
    }

    fn hash(&self) -> Self::Hash {
        self.hash.clone()
    }

    fn height(&self) -> u64 {
        self.header.number as u64
    }

    fn time(&self) -> sov_rollup_interface::da::Time {
        sov_rollup_interface::da::Time::from_secs(
            KATE_SECONDS_PER_BLOCK
                .saturating_mul(self.header.number as i64)
                .saturating_add(KATE_START_TIME),
        )
    }
}

impl Default for CyferioHeader {
    fn default() -> Self {
        Self {
            hash: CyferioHash::default(),
            header: Header {
                number: 0,
                parent_hash: CyferioHash::default(),
                state_root: CyferioHash::default(),
                extrinsics_root: CyferioHash::default(),
                digest: Digest::default(),
            },
        }
    }
}

#[cfg(feature = "native")]
impl From<(&SubstrateHeader<u32, BlakeTwo256>, H256)> for CyferioHeader {
    fn from((header, hash): (&SubstrateHeader<u32, BlakeTwo256>, H256)) -> Self {
        CyferioHeader::new(
            CyferioHash::from(hash),
            header.number,
            CyferioHash::from(header.parent_hash),
            CyferioHash::from(header.state_root),
            CyferioHash::from(header.extrinsics_root),
            header.digest.clone(),
        )
    }
}


// #[cfg(feature = "native")]
// impl From<(&SubstrateHeader<u32, BlakeTwo256>, Option<H256>)> for CyferioHeader {
//     fn from((header, hash): (&SubstrateHeader<u32, BlakeTwo256>, Option<H256>)) -> Self {
//         CyferioHeader::new(
//             hash.map(CyferioHash::from).unwrap_or_default(),
//             header.number,
//             CyferioHash::from(header.parent_hash),
//             CyferioHash::from(header.state_root),
//             CyferioHash::from(header.extrinsics_root),
//             header.digest.clone(),
//         )
//     }
// }