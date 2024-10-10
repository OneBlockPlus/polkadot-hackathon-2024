#![allow(clippy::from_over_into)]
use bstringify::bstringify;
use core::ops::Range;
use num_enum::{IntoPrimitive, TryFromPrimitive};
use scale_codec::{Decode, Encode, MaxEncodedLen};
use scale_info::TypeInfo;
use sp_core::U256;
use sp_runtime::RuntimeDebug;
use sp_std::prelude::*;

use serde::{Deserialize, Serialize};

pub type ForeignAssetId = u16;
pub type LocalAssetId = u32;
pub type TokenId = u8;

pub const H160_POSITION_CURRENCY_ID_TYPE: usize = 9;
pub const H160_POSITION_TOKEN: usize = 19;
pub const H160_POSITION_FOREIGN_ASSET: Range<usize> = 18..20;

macro_rules! create_currency_id {
  ($(#[$meta:meta])*
$vis:vis enum TokenSymbol {
      $($(#[$vmeta:meta])* $symbol:ident($name:expr, $deci:literal) = $val:literal,)*
  }) => {
  $(#[$meta])*
  $vis enum TokenSymbol {
    $($(#[$vmeta])* $symbol = $val,)*
  }

  impl TryFrom<u8> for TokenSymbol {
    type Error = ();

    fn try_from(v: u8) -> Result<Self, Self::Error> {
      match v {
        $($val => Ok(TokenSymbol::$symbol),)*
        _ => Err(()),
      }
    }
  }

  impl Into<u8> for TokenSymbol {
    fn into(self) -> u8 {
      match self {
        $(TokenSymbol::$symbol => ($val),)*
      }
    }
  }

  impl TryFrom<Vec<u8>> for CurrencyId {
    type Error = ();
    fn try_from(v: Vec<u8>) -> Result<CurrencyId, ()> {
      match v.as_slice() {
        $(bstringify!($symbol) => Ok(CurrencyId::Token(TokenSymbol::$symbol)),)*
        _ => Err(()),
      }
    }
  }

  impl TokenInfo for CurrencyId {
    fn currency_id(&self) -> Option<u8> {
      match self {
        $(CurrencyId::Token(TokenSymbol::$symbol) => Some($val),)*
        _ => None,
      }
    }
    fn name(&self) -> Option<&str> {
      match self {
        $(CurrencyId::Token(TokenSymbol::$symbol) => Some($name),)*
        _ => None,
      }
    }
    fn symbol(&self) -> Option<&str> {
      match self {
        $(CurrencyId::Token(TokenSymbol::$symbol) => Some(stringify!($symbol)),)*
        _ => None,
      }
    }
    fn decimals(&self) -> Option<u8> {
      match self {
        $(CurrencyId::Token(TokenSymbol::$symbol) => Some($deci),)*
        _ => None,
      }
    }
  }

  $(pub const $symbol: CurrencyId = CurrencyId::Token(TokenSymbol::$symbol);)*

  impl TokenSymbol {
    pub fn get_info() -> Vec<(&'static str, u32)> {
      vec![
        $((stringify!($symbol), $deci),)*
      ]
    }
  }
}
}

create_currency_id! {
	// Represent a Token symbol with 8 bit
	#[derive(Encode, Decode, Eq, PartialEq, Copy, Clone, RuntimeDebug, PartialOrd, Ord, TypeInfo, MaxEncodedLen, Serialize, Deserialize)]
	#[repr(u8)]
	pub enum TokenSymbol {
			DOT("Polkadot", 10) = 1,
			USDT("USDT", 12) = 2,
			BTC("Bitcoin", 12) = 4,
	}
}

impl Default for TokenSymbol {
	fn default() -> Self {
		Self::DOT
	}
}

pub trait TokenInfo {
	fn currency_id(&self) -> Option<u8>;
	fn name(&self) -> Option<&str>;
	fn symbol(&self) -> Option<&str>;
	fn decimals(&self) -> Option<u8>;
}

#[derive(
	Encode,
	Decode,
	Eq,
	PartialEq,
	Copy,
	Clone,
	RuntimeDebug,
	PartialOrd,
	Ord,
	TypeInfo,
	MaxEncodedLen,
	Serialize,
	Deserialize,
)]
#[serde(rename_all = "camelCase")]
pub enum CurrencyId {
	Token(TokenSymbol),
	ForeignAsset(ForeignAssetId),
	LocalAsset(LocalAssetId),
	VToken(TokenSymbol),
}

impl Default for CurrencyId {
	fn default() -> Self {
		Self::Token(Default::default())
	}
}

impl CurrencyId {
	pub fn is_token_currency_id(&self) -> bool {
		matches!(self, CurrencyId::Token(_))
	}

	pub fn is_foreign_asset_currency_id(&self) -> bool {
		matches!(self, CurrencyId::ForeignAsset(_))
	}

	pub fn is_local_asset_currency_id(&self) -> bool {
		matches!(self, CurrencyId::LocalAsset(_))
	}

	pub fn is_vtoken_currency_id(&self) -> bool {
		matches!(self, CurrencyId::VToken(_))
	}
}

/// H160 CurrencyId Type enum
#[derive(
	Encode,
	Decode,
	Eq,
	PartialEq,
	Copy,
	Clone,
	RuntimeDebug,
	PartialOrd,
	Ord,
	TryFromPrimitive,
	IntoPrimitive,
	TypeInfo,
)]
#[repr(u8)]
pub enum CurrencyIdType {
	Token = 1, // 0 is prefix of precompile and predeploy
	ForeignAsset,
	LocalAsset,
}
