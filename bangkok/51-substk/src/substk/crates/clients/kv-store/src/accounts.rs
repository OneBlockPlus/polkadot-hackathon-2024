use codec::{Decode, Encode};
use serde::{Deserialize, Serialize};
use sp_core::{crypto::Ss58Codec, ed25519};

pub type AccountId = MultiAddress;

/// A multi-format address wrapper for on-chain accounts.
#[derive(Debug, Encode, Decode, PartialEq, Eq, Clone, Hash)]
pub enum MultiAddress {
    /// It's a 32 byte representation.
    Address32([u8; 32]),
    /// It's a 20 byte representation.
    Address20([u8; 20]),
    // /// It's a domain for an account.
    // Domain(Domain),
}

impl From<[u8; 32]> for MultiAddress {
    fn from(value: [u8; 32]) -> Self {
        Self::Address32(value)
    }
}

impl From<[u8; 20]> for MultiAddress {
    fn from(value: [u8; 20]) -> Self {
        Self::Address20(value)
    }
}

impl TryFrom<&[u8]> for MultiAddress {
    type Error = ();

    fn try_from(value: &[u8]) -> Result<Self, Self::Error> {
        match value.len() {
            32 => {
                let mut v = [0; 32];
                v.copy_from_slice(value);
                Ok(Self::Address32(v))
            }
            20 => {
                let mut v = [0; 20];
                v.copy_from_slice(value);
                Ok(Self::Address20(v))
            }
            _ => Err(()),
        }
    }
}

impl TryFrom<&str> for MultiAddress {
    type Error = ();

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let key = ed25519::Public::from_ss58check(value).map_err(|_| ())?;
        Ok(Self::from(key.0))
    }
}

// impl From<Domain> for MultiAddress {
//     fn from(value: Domain) -> Self {
//         Self::Domain(value)
//     }
// }

/// An alias name for account, used for routes.
#[derive(Debug, Encode, Decode, PartialEq, Eq, Clone, Hash, Serialize, Deserialize)]
pub struct Domain(String);

impl Domain {
    pub fn new(s: impl ToString) -> Option<Self> {
        let s = s.to_string();
        if s.as_bytes().len() > 16 || s.as_bytes().len() < 4 {
            return None;
        }
        for b in s.as_bytes().iter() {
            if !b.is_ascii_alphabetic() && !b.is_ascii_digit() {
                return None;
            }
        }

        Some(Self(s))
    }

    pub fn to_string(&self) -> String {
        self.0.clone()
    }
}

impl std::fmt::Display for MultiAddress {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        use sp_core::hexdisplay::HexDisplay;
        match self {
            Self::Address32(inner) => {
                write!(f, "MultiAddress::Address32({})", HexDisplay::from(inner))
            }
            Self::Address20(inner) => {
                write!(f, "MultiAddress::Address20({})", HexDisplay::from(inner))
            } // Self::Domain(inner) => {
              //     write!(f, "MultiAddress::Domain({})", inner.0)
              // }
        }
    }
}
