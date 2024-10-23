// Copyright (C) Use Ink (UK) Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use core::array::TryFromSliceError;
use core::fmt;
use derive_more::From;
#[cfg(feature = "std")]
use ink::storage::traits::StorageLayout;
#[cfg(feature = "std")]
use ink_metadata::layout::{Layout, LayoutKey, LeafLayout};
use scale::{
    Decode,
    Encode,
    MaxEncodedLen,
};
#[cfg(feature = "std")]
use {
    scale_decode::DecodeAsType,
    scale_encode::EncodeAsType,
    scale_info::TypeInfo,
};

/// The default environment `AccountId` type.
///
/// # Note
///
/// This is a mirror of the `AccountId` type used in the default configuration
/// of PALLET contracts.
#[derive(
    Debug,
    Copy,
    Clone,
    PartialEq,
    Eq,
    Ord,
    PartialOrd,
    Hash,
    Decode,
    Encode,
    MaxEncodedLen,
    From,
)]
#[cfg_attr(feature = "std", derive(TypeInfo, DecodeAsType, EncodeAsType))]
pub struct AccountId(pub [u8; 20]);

impl fmt::Display for AccountId {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "0x")?;
        for byte in &self.0 {
            write!(f, "{:02x}", byte)?;
        }
        Ok(())
    }
}

impl AsRef<[u8; 20]> for AccountId {
    #[inline]
    fn as_ref(&self) -> &[u8; 20] {
        &self.0
    }
}

impl AsMut<[u8; 20]> for AccountId {
    #[inline]
    fn as_mut(&mut self) -> &mut [u8; 20] {
        &mut self.0
    }
}

impl AsRef<[u8]> for AccountId {
    #[inline]
    fn as_ref(&self) -> &[u8] {
        &self.0[..]
    }
}

impl AsMut<[u8]> for AccountId {
    #[inline]
    fn as_mut(&mut self) -> &mut [u8] {
        &mut self.0[..]
    }
}

impl<'a> TryFrom<&'a [u8]> for AccountId {
    type Error = TryFromSliceError;

    fn try_from(bytes: &'a [u8]) -> Result<Self, TryFromSliceError> {
        let address = <[u8; 20]>::try_from(bytes)?;
        Ok(Self(address))
    }
}

#[cfg(feature = "std")]
impl StorageLayout for AccountId {
    fn layout(key: &u32) -> Layout {
        Layout::Leaf(LeafLayout::from_key::<AccountId>(LayoutKey::from(key)))
    }
}

/// The default environment `Hash` type.
///
/// # Note
///
/// This is a mirror of the `Hash` type used in the default configuration
/// of PALLET contracts.
#[derive(
    Debug,
    Copy,
    Clone,
    PartialEq,
    Eq,
    Ord,
    PartialOrd,
    Hash,
    Decode,
    Encode,
    MaxEncodedLen,
    From,
    Default,
)]
#[cfg_attr(feature = "std", derive(TypeInfo, DecodeAsType, EncodeAsType))]
pub struct Hash([u8; 20]);

impl<'a> TryFrom<&'a [u8]> for Hash {
    type Error = TryFromSliceError;

    fn try_from(bytes: &'a [u8]) -> Result<Self, TryFromSliceError> {
        let hash = <[u8; 20]>::try_from(bytes)?;
        Ok(Self(hash))
    }
}

impl AsRef<[u8]> for Hash {
    fn as_ref(&self) -> &[u8] {
        &self.0[..]
    }
}

impl AsMut<[u8]> for Hash {
    fn as_mut(&mut self) -> &mut [u8] {
        &mut self.0[..]
    }
}

impl From<Hash> for [u8; 20] {
    fn from(hash: Hash) -> Self {
        hash.0
    }
}

/// The equivalent of `Zero` for hashes.
///
/// A hash that consists only of 0 bits is clear.
pub trait Clear {
    /// The clear hash.
    const CLEAR_HASH: Self;

    /// Returns `true` if the hash is clear.
    fn is_clear(&self) -> bool;
}

impl Clear for [u8; 20] {
    const CLEAR_HASH: Self = [0x00; 20];

    fn is_clear(&self) -> bool {
        self == &Self::CLEAR_HASH
    }
}

impl Clear for Hash {
    const CLEAR_HASH: Self = Self(<[u8; 20] as Clear>::CLEAR_HASH);

    fn is_clear(&self) -> bool {
        <[u8; 20] as Clear>::is_clear(&self.0)
    }
}