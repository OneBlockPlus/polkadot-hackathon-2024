#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;
    use sp_runtime::{traits::{Zero, AtLeast32BitUnsigned, CheckedAdd, CheckedSub}, ArithmeticError};
    use frame_support::traits::fungibles;
    use scale_info::TypeInfo;
    use sp_runtime::Saturating;
    
    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        type OrderId: Member + Parameter + MaxEncodedLen + Copy + AtLeast32BitUnsigned + Default;
        type PairId: Member + Parameter + MaxEncodedLen + Copy;
        type Balance: Member + Parameter + MaxEncodedLen + AtLeast32BitUnsigned + Zero + CheckedAdd + CheckedSub + Copy + Ord;
        type Fungibles: fungibles::Inspect<Self::AccountId, Balance = Self::Balance, AssetId = Self::PairId>
            + fungibles::Mutate<Self::AccountId>;
        #[pallet::constant]
        type MaxOrdersPerPrice: Get<u32>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::storage]
    pub type Orders<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::PairId,
        Blake2_128Concat,
        T::OrderId,
        Order<T>,
        OptionQuery
    >;

    #[pallet::storage]
    pub type Orderbook<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::PairId,
        Blake2_128Concat,
        (OrderSide, T::Balance),
        BoundedVec<T::OrderId, T::MaxOrdersPerPrice>,
        ValueQuery
    >;

    #[pallet::storage]
    pub type NextOrderId<T: Config> = StorageValue<_, T::OrderId, ValueQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        LimitOrderCreated { order_id: T::OrderId, who: T::AccountId, pair_id: T::PairId, side: OrderSide, price: T::Balance, amount: T::Balance },
        OrderCancelled { order_id: T::OrderId },
        MarketOrderExecuted { who: T::AccountId, pair_id: T::PairId, side: OrderSide, amount: T::Balance, price: T::Balance },
    }

    #[pallet::error]
    pub enum Error<T> {
        OrderNotFound,
        InvalidPrice,
        InvalidAmount,
        InsufficientBalance,
        OrderbookFull,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(10_000)]
        pub fn create_limit_order(
            origin: OriginFor<T>,
            pair_id: T::PairId,
            side: OrderSide,
            price: T::Balance,
            amount: T::Balance
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(!price.is_zero(), Error::<T>::InvalidPrice);
            ensure!(!amount.is_zero(), Error::<T>::InvalidAmount);

            let order_id = Self::get_next_order_id();
            let order = Order { creator: who.clone(), pair_id, side, price, amount, filled: Zero::zero() };

            Orders::<T>::insert(pair_id, order_id, order);
            Self::add_to_orderbook(pair_id, side, price, order_id)?;

            Self::deposit_event(Event::LimitOrderCreated { order_id, who, pair_id, side, price, amount });
            Ok(())
        }

        #[pallet::weight(10_000)]
        pub fn cancel_order(
            origin: OriginFor<T>,
            pair_id: T::PairId,
            order_id: T::OrderId
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            Orders::<T>::try_mutate_exists(pair_id, order_id, |maybe_order| {
                let order = maybe_order.as_mut().ok_or(Error::<T>::OrderNotFound)?;
                ensure!(order.creator == who, Error::<T>::OrderNotFound);

                Self::remove_from_orderbook(pair_id, order.side, order.price, order_id)?;
                *maybe_order = None;

                Self::deposit_event(Event::OrderCancelled { order_id });
                Ok(())
            })
        }

        #[pallet::weight(10_000)]
        pub fn execute_market_order(
            origin: OriginFor<T>,
            pair_id: T::PairId,
            side: OrderSide,
            amount: T::Balance
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(!amount.is_zero(), Error::<T>::InvalidAmount);

            let mut remaining = amount;
            let opposite_side = match side {
                OrderSide::Buy => OrderSide::Sell,
                OrderSide::Sell => OrderSide::Buy,
            };

            while !remaining.is_zero() {
                if let Some((price, _)) = Self::get_best_price(pair_id, opposite_side) {
                    let orders = Orderbook::<T>::get(pair_id, (opposite_side, price));
                    for &order_id in orders.iter() {
                        if remaining.is_zero() { break; }
                        if let Some(mut order) = Orders::<T>::get(pair_id, order_id) {
                            let fillable = order.amount.saturating_sub(order.filled);
                            let fill_amount = remaining.min(fillable);

                            // Execute trade logic here (omitted for brevity)

                            order.filled += fill_amount;
                            Orders::<T>::insert(pair_id, order_id, order.clone());
                            remaining -= fill_amount;

                            Self::deposit_event(Event::MarketOrderExecuted { 
                                who: who.clone(), 
                                pair_id, 
                                side, 
                                amount: fill_amount, 
                                price 
                            });

                            if order.filled == order.amount {
                                Self::remove_from_orderbook(pair_id, opposite_side, price, order_id)?;
                            }
                        }
                    }
                } else {
                    break;
                }
            }

            Ok(())
        }
    }

    impl<T: Config> Pallet<T> {
        fn get_next_order_id() -> T::OrderId {
            NextOrderId::<T>::mutate(|id| {
                let current_id = *id;
                *id = id.saturating_add(T::OrderId::from(1u32));
                current_id
            })
        }

        fn add_to_orderbook(pair_id: T::PairId, side: OrderSide, price: T::Balance, order_id: T::OrderId) -> DispatchResult {
            Ok(Orderbook::<T>::try_mutate(pair_id, (side, price), |orders| {
                orders.try_push(order_id).map_err(|_| Error::<T>::OrderbookFull)
            })?)
        }

        fn remove_from_orderbook(pair_id: T::PairId, side: OrderSide, price: T::Balance, order_id: T::OrderId) -> DispatchResult {
            Orderbook::<T>::mutate(pair_id, (side, price), |orders| {
                if let Some(index) = orders.iter().position(|&id| id == order_id) {
                    orders.remove(index);
                }
            });
            Ok(())
        }

        fn get_best_price(pair_id: T::PairId, side: OrderSide) -> Option<(T::Balance, BoundedVec<T::OrderId, T::MaxOrdersPerPrice>)> {
            Orderbook::<T>::iter_prefix(pair_id)
                .filter(|((stored_side, _), _)| *stored_side == side)
                .next()
                .map(|((_, price), orders)| (price, orders))
        }
    }

    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct Order<T: Config> {
        pub creator: T::AccountId,
        pub pair_id: T::PairId,
        pub side: OrderSide,
        pub price: T::Balance,
        pub amount: T::Balance,
        pub filled: T::Balance,
    }

    #[derive(Encode, Decode, Clone, Copy, PartialEq, Eq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
    pub enum OrderSide {
        Buy,
        Sell,
    }
}
