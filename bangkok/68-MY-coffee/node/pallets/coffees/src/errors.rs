use frame_support::pallet_macros::pallet_section;

#[pallet_section]
mod errors {
    #[pallet::error]
    pub enum Error<T> {
        InvalidCoffeeId,
        NotOwner,
        SameParentId,
        CoffeeNotExist,
        CoffeeAlreadyOnSale,
        TooManyBidOnOneBlock,
        BidForSelf,
        CoffeeNotOnSale,
        CoffeeBidLessThanTheSumOfLastPriceAndMinimumBidIncrement,
        CoffeeBidLessThanOrMinimumBidAmount,
        NotEnoughBalanceForBidAndStaking,
        NextCoffeeIdOverflow,
        NotEnoughBalanceForStaking,
        TransferToSelf,
        BlockSpanTooSmall,
    }
}