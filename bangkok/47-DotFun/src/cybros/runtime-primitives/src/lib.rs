// This file is part of Cybros.

// Copyright (C) Jun Jiang.
// SPDX-License-Identifier: GPL-3.0-or-later WITH Classpath-exception-2.0

// Cybros is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Cybros is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Cybros.  If not, see <http://www.gnu.org/licenses/>.

//! Low-level types used throughout the Substrate code.

#![allow(missing_docs)]
#![cfg_attr(not(feature = "std"), no_std)]

pub use constants::*;

pub mod types {
	use sp_core::H256;
	use sp_runtime::{
		traits::{AccountIdLookup, BlakeTwo256, IdentifyAccount, Verify},
		MultiSignature,
	};

	/// An index to a block.
	/// 32-bits will allow for 136 years of blocks assuming 1 block per second.
	pub type BlockNumber = u32;

	/// Alias to 512-bit hash when used in the context of a transaction signature on the chain.
	pub type Signature = MultiSignature;

	/// Some way of identifying an account on the chain. We intentionally make it equivalent
	/// to the public key of our transaction signing scheme.
	pub type AccountId = <<Signature as Verify>::Signer as IdentifyAccount>::AccountId;

	/// The type for looking up accounts. We don't expect more than 4 billion of them.
	pub type AccountIndex = u32;

	/// The lookup mechanism to get account ID from whatever is passed in dispatchers.
	pub type Lookup = AccountIdLookup<AccountId, ()>;

	/// Balance of an account.
	pub type Balance = u128;

	/// Type used for expressing timestamp.
	pub type Moment = u64;

	/// The type for storing how many extrinsics an account has signed.
	pub type Nonce = u32;

	/// A hash of some data used by the chain.
	pub type Hash = H256;

	/// The hashing algorithm used used by the chain.
	pub type Hashing = BlakeTwo256;
}

/// Opaque types. These are used by the CLI to instantiate machinery that don't need to know
/// the specifics of the runtime. They can then be made to be agnostic over specific formats
/// of data like extrinsics, allowing for them to continue syncing the network through upgrades
/// to even the core data structures.
pub mod opaque {
	use crate::types::BlockNumber;
	use sp_runtime::{generic, traits::BlakeTwo256};

	pub use sp_runtime::OpaqueExtrinsic as UncheckedExtrinsic;
	/// Opaque block header type.
	pub type Header = generic::Header<BlockNumber, BlakeTwo256>;
	/// Opaque block type.
	pub type Block = generic::Block<Header, UncheckedExtrinsic>;
	/// Opaque block identifier type.
	pub type BlockId = generic::BlockId<Block>;
}

pub mod constants {
	/// Money matters.
	pub mod currency {
		use crate::types::Balance;

		pub const MILLI_CENTS: Balance = 1_000_000;
		pub const CENTS: Balance = 1_000 * MILLI_CENTS;
		pub const DOLLARS: Balance = 1_000 * CENTS;

		/// Existential deposit.
		pub const EXISTENTIAL_DEPOSIT: u128 = CENTS;

		pub const fn deposit(items: u32, bytes: u32) -> Balance {
			items as Balance * 15 * CENTS + (bytes as Balance) * 6 * CENTS
		}
	}

	/// Time.
	pub mod time {
		use crate::types::{BlockNumber, Moment};

		/// Since BABE is probabilistic this is the average expected block time that
		/// we are targeting. Blocks will be produced at a minimum duration defined
		/// by `SLOT_DURATION`, but some slots will not be allocated to any
		/// authority and hence no block will be produced. We expect to have this
		/// block time on average following the defined slot duration and the value
		/// of `c` configured for BABE (where `1 - c` represents the probability of
		/// a slot being empty).
		/// This value is only used indirectly to define the unit constants below
		/// that are expressed in blocks. The rest of the code should use
		/// `SLOT_DURATION` instead (like the Timestamp pallet for calculating the
		/// minimum period).
		///
		/// If using BABE with secondary slots (default) then all of the slots will
		/// always be assigned, in which case `MILLI_SECS_PER_BLOCK` and
		/// `SLOT_DURATION` should have the same value.
		///
		/// <https://research.web3.foundation/en/latest/polkadot/block-production/Babe.html#-6.-practical-results>
		pub const MILLI_SECS_PER_BLOCK: Moment = 6000;
		pub const SECS_PER_BLOCK: Moment = MILLI_SECS_PER_BLOCK / 1000;

		// NOTE: Currently it is not possible to change the slot duration after the chain has
		// started.       Attempting to do so will brick block production.
		pub const SLOT_DURATION: Moment = MILLI_SECS_PER_BLOCK;

		// These time units are defined in number of blocks.
		pub const MINUTES: BlockNumber = 60 / (SECS_PER_BLOCK as BlockNumber);
		pub const HOURS: BlockNumber = MINUTES * 60;
		pub const DAYS: BlockNumber = HOURS * 24;
	}
}
