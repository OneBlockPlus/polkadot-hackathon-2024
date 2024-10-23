use frame_support::pallet_macros::pallet_section;

#[pallet_section]
mod events {
    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        CoffeeCreated {
            creator: T::AccountId,
            coffee_id: u32,
            data: [u8; 16],
        },
        CoffeeTransferred {
            from: T::AccountId,
            to: T::AccountId,
            coffee_id: u32,
        },
        CoffeeOnSale {
            owner: T::AccountId,
            coffee_id: u32,
            until_block: BlockNumberFor<T>,
        },
        CoffeeBid {
            bidder: T::AccountId,
            coffee_id: u32,
            price: BalanceOf<T>,
        },
        CoffeeTransferredAfterBidKnockedDown {
            from: T::AccountId,
            to: T::AccountId,
            coffee_id: u32,
            price: BalanceOf<T>,
            usd_price: Option<BalanceOf<T>>, // Units 10^-10 usd cents duo to dot price ignore Balance decimal 12
        },
        /// Event generated when new price is accepted to contribute to the average.
        NewPrice {
            price: u32,
            maybe_who: Option<T::AccountId>,
        },
    }
}