use core::fmt;
use core::str::FromStr;
use serde::{Deserialize, Serialize};
use std::hash::Hash;
use subxt::utils::{AccountId32, MultiAddress};

#[derive(Serialize, Deserialize, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct CyferioAddress([u8; 32]);

impl sov_rollup_interface::BasicAddress for CyferioAddress {}

impl From<AccountId32> for CyferioAddress {
    fn from(account_id: AccountId32) -> Self {
        Self(*account_id.as_ref())
    }
}

impl From<CyferioAddress> for AccountId32 {
    fn from(address: CyferioAddress) -> Self {
        AccountId32::from(address.0)
    }
}

impl FromStr for CyferioAddress {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let account_id =
            AccountId32::from_str(s).map_err(|e| anyhow::anyhow!("Invalid address: {}", e))?;
        Ok(Self::from(account_id))
    }
}

impl AsRef<[u8]> for CyferioAddress {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl fmt::Display for CyferioAddress {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", AccountId32::from(self.0))
    }
}

impl TryFrom<&[u8]> for CyferioAddress {
    type Error = anyhow::Error;

    fn try_from(bytes: &[u8]) -> Result<Self, Self::Error> {
        bytes.try_into().map(Self).map_err(|_| {
            anyhow::anyhow!(
                "Invalid address length: expected 32 bytes, got {}",
                bytes.len()
            )
        })
    }
}

impl From<MultiAddress<AccountId32, ()>> for CyferioAddress {
    fn from(multi_address: MultiAddress<AccountId32, ()>) -> Self {
        match multi_address {
            MultiAddress::Id(account_id) => Self::from(account_id),
            _ => panic!("Unsupported MultiAddress variant"),
        }
    }
}

impl From<[u8; 32]> for CyferioAddress {
    fn from(bytes: [u8; 32]) -> Self {
        Self(bytes)
    }
}

impl Default for CyferioAddress {
    fn default() -> Self {
        Self([0u8; 32])
    }
}
