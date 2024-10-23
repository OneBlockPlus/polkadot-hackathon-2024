use borsh::{BorshDeserialize, BorshSerialize};
use core::fmt;
use sov_rollup_interface::da::BlockHashTrait;
use sp_core::H256;

#[derive(
    Clone,
    Copy,
    PartialEq,
    Eq,
    Hash,
    serde::Serialize,
    serde::Deserialize,
    derive_more::From,
    derive_more::Into,
    Debug,
    Default, // 添加 Default 派生
)]
pub struct CyferioHash(pub H256);

impl BorshSerialize for CyferioHash {
    fn serialize<W: std::io::Write>(&self, writer: &mut W) -> std::io::Result<()> {
        writer.write_all(self.0.as_ref())
    }
}

impl BorshDeserialize for CyferioHash {
    fn deserialize(buf: &mut &[u8]) -> std::io::Result<Self> {
        if buf.len() < 32 {
            return Err(std::io::Error::new(
                std::io::ErrorKind::UnexpectedEof,
                "Not enough bytes",
            ));
        }
        let mut arr = [0u8; 32];
        arr.copy_from_slice(&buf[..32]);
        *buf = &buf[32..];
        Ok(CyferioHash(H256::from(arr)))
    }

    fn deserialize_reader<R: std::io::Read>(reader: &mut R) -> std::io::Result<Self> {
        let mut arr = [0u8; 32];
        reader.read_exact(&mut arr)?;
        Ok(CyferioHash(H256::from(arr)))
    }
}

impl BlockHashTrait for CyferioHash {}

impl AsRef<[u8]> for CyferioHash {
    fn as_ref(&self) -> &[u8] {
        self.0.as_ref()
    }
}

impl fmt::Display for CyferioHash {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", hex::encode(self.0))
    }
}

impl From<[u8; 32]> for CyferioHash {
    fn from(bytes: [u8; 32]) -> Self {
        CyferioHash(H256::from(bytes))
    }
}

impl From<CyferioHash> for [u8; 32] {
    fn from(hash: CyferioHash) -> Self {
        hash.0.into()
    }
}

impl CyferioHash {
    pub fn inner(&self) -> &[u8; 32] {
        self.0.as_fixed_bytes()
    }
}

impl From<Option<H256>> for CyferioHash {
    fn from(opt_hash: Option<H256>) -> Self {
        opt_hash.map(CyferioHash).unwrap_or_default()
    }
}
