use frame_support::pallet_macros::pallet_section;

#[pallet_section]
mod config {
    #[pallet::config]
    pub trait Config: CreateSignedTransaction<Call<Self>> + frame_system::Config {
        // The identifier type for an offchain worker.
        type AuthorityId: AppCrypto<Self::Public, Self::Signature>;
        // The overarching runtime event type.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        // A type representing the weights required by the dispatchables of this pallet.
        type WeightInfo: WeightInfo;
        // 隨機數生成
        type Randomness: Randomness<Self::Hash, BlockNumberFor<Self>>;
        // 貨幣
        type Currency: Currency<Self::AccountId> + ReservableCurrency<Self::AccountId>;
        
        #[pallet::constant]
        type StakeAmount: Get<BalanceOf<Self>>;

        #[pallet::constant]
        type MinBidAmount: Get<BalanceOf<Self>>;

        #[pallet::constant]
        type MinBidIncrement: Get<BalanceOf<Self>>;

        #[pallet::constant]
        type MinBidBlockSpan: Get<BlockNumberFor<Self>>;

        #[pallet::constant]
        type MaxCoffeesBidPerBlock: Get<u32>;

        // Configuration parameters
        /// To avoid sending too many transactions, we only attempt to send one
        /// every `GRACE_PERIOD` blocks. We use Local Storage to coordinate
        /// sending between distinct runs of this offchain worker.
        #[pallet::constant]
        type GracePeriod: Get<BlockNumberFor<Self>>;

        /// Number of blocks of cooldown after unsigned transaction is included.
        ///
        /// This ensures that we only accept unsigned transactions once, every `UnsignedInterval`
        /// blocks.
        #[pallet::constant]
        type UnsignedInterval: Get<BlockNumberFor<Self>>;

        // unsigned transactions.
        #[pallet::constant]
        type UnsignedPriority: Get<TransactionPriority>;

        // 價格上限
        #[pallet::constant]
        type MaxPrices: Get<u32>;
    }
}