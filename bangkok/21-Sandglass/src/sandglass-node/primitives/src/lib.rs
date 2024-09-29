#![cfg_attr(not(feature = "std"), no_std)]

use sp_runtime::DispatchResult;
use sp_std::vec::Vec;
pub mod currency;

/// Signed version of Balance
pub type Amount = i128;

pub type Balance = u128;

pub trait Swap<Balance, AccountId> {
	fn get_target_amount(order_id: u32) -> Balance;

	fn inter_take_order(taker: AccountId, order_id: u32, receiver: AccountId) -> DispatchResult;
}

pub trait Otp<AccountId> {
	//Only checks that time in the proof is larger than lastUsedTime, i.e. behaves like HOTP
	fn naive_approval(
		owner: AccountId,
		proof: Vec<u8>,
		root: Vec<u8>,
		timestamp: u128,
	) -> DispatchResult;

	//Uses block timestamp to validate time, TOTP
	fn block_time_approval(
		owner: AccountId,
		proof: Vec<u8>,
		root: Vec<u8>,
		timestamp: u128,
	) -> DispatchResult;
}
