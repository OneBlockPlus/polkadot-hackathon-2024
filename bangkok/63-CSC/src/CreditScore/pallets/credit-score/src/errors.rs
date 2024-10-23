use frame_support::pallet_macros::pallet_section;

#[pallet_section]
mod errors {
	/// Errors that can be returned by this pallet.
	///
	/// Errors tell users that something went wrong so it's important that their naming is
	/// informative. Similar to events, error documentation is added to a node's metadata so it's
	/// equally important that they have helpful documentation associated with them.
	///
	/// This type of runtime error can be up to 4 bytes in size should you want to return additional
	/// information.
	#[pallet::error]
	pub enum Error<T> {
		/// The value retrieved was `None` as no value was previously set.
		NoneValue,
		/// There was an attempt to increment the value in storage over `u32::MAX`.
		StorageOverflow,
		InvalidStakingRate,
		NoExistPublisherOrScore,
		NoExistScore,
		NoExistUserAccount,
		NoExistScoreGrantPrecondition,
		InvalidClaimScoreProof,
		NotEnoughScoreForClaim,
		NoSelfInspire,
		NotEnoughScoreForInspire,
		AlreadyExistUserAccount,
		TooManyUserAccounts,
		NoExistScoreRedeemPrecondition,
		RedeemNotActive,
		RedeemNotStart,
		RedeemDeadline,
		RedeemTimesNotEnough,
		RedeemEntityConvertErr,
		InvalidRedeemType,
		NotEnoughStakingCredit,
		NotEnoughScoreForTransfer,
		NoExistOrderList,
		TooManyOrderList,
		NotEnoughScoreForRedeem,
		TooManyOrderItem,
	}
}
