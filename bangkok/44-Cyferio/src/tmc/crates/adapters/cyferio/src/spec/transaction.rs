use bytes::Bytes;
use serde::{Deserialize, Serialize};
use sov_rollup_interface::da::{BlobReaderTrait, CountedBufReader};

use super::address::CyferioAddress;
use super::hash::CyferioHash;

#[derive(Serialize, Deserialize, Clone, PartialEq, Debug)]
pub struct CyferioBlobTransaction {
    blob: CountedBufReader<Bytes>,
    hash: CyferioHash,
    sender: CyferioAddress,
}

impl BlobReaderTrait for CyferioBlobTransaction {
    type Address = CyferioAddress;
    type BlobHash = CyferioHash;

    fn sender(&self) -> CyferioAddress {
        self.sender.clone()
    }

    fn hash(&self) -> CyferioHash {
        self.hash
    }

    fn verified_data(&self) -> &[u8] {
        self.blob.accumulator()
    }

    fn total_len(&self) -> usize {
        self.blob.total_len()
    }

    #[cfg(feature = "native")]
    fn advance(&mut self, num_bytes: usize) -> &[u8] {
        self.blob.advance(num_bytes);
        self.verified_data()
    }
}

impl From<Vec<u8>> for CyferioBlobTransaction {
    fn from(bytes: Vec<u8>) -> Self {
        CyferioBlobTransaction {
            blob: CountedBufReader::new(Bytes::from(bytes)),
            hash: CyferioHash::default(),
            sender: CyferioAddress::default(),
        }
    }
}
