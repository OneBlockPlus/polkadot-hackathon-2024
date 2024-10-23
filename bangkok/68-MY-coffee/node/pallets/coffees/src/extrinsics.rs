use frame_support::pallet_macros::pallet_section;

/// Define all extrinsics for the pallet.
#[pallet_section]
mod dispatches {
    #[pallet::call]
    impl<T: Config> Pallet<T> {

        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::create())]
        pub fn create(origin: OriginFor<T>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let value = Self::random_value(&who);
            Self::mint_coffee(&who, value)?;
            Ok(())
        }

        #[pallet::call_index(1)]
        #[pallet::weight(T::WeightInfo::breed())]
        pub fn breed(origin: OriginFor<T>, coffee_id_1: u32, coffee_id_2: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(coffee_id_1 != coffee_id_2, Error::<T>::SameParentId);
            let (Coffee { dna: coffee_1, .. }, Coffee { dna: coffee_2, .. }) = (
                Self::coffees(coffee_id_1).ok_or(Error::<T>::CoffeeNotExist)?,
                Self::coffees(coffee_id_2).ok_or(Error::<T>::CoffeeNotExist)?,
            );
            ensure!(
                Self::coffee_owner(coffee_id_1).as_ref() == Some(&who),
                Error::<T>::NotOwner
            );
            ensure!(
                Self::coffee_owner(coffee_id_2).as_ref() == Some(&who),
                Error::<T>::NotOwner
            );
            let value = Self::breed_coffee(&who, coffee_1, coffee_2);
            Self::mint_coffee(&who, value)?;
            Ok(())
        }

        #[pallet::call_index(2)]
        #[pallet::weight(T::WeightInfo::transfer())]
        pub fn transfer(origin: OriginFor<T>, to: T::AccountId, coffee_id: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(
                !CoffeesBid::<T>::contains_key(coffee_id),
                Error::<T>::CoffeeAlreadyOnSale
            );
            Self::transfer_coffee(who, to, coffee_id)?;
            Ok(())
        }
        #[pallet::call_index(3)]
        #[pallet::weight(T::WeightInfo::sale())]
        pub fn sale(
            origin: OriginFor<T>,
            coffee_id: u32,
            until_block: BlockNumberFor<T>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(
                Self::coffee_owner(coffee_id).as_ref() == Some(&who),
                Error::<T>::NotOwner
            );
            ensure!(
                !CoffeesBid::<T>::contains_key(coffee_id),
                Error::<T>::CoffeeAlreadyOnSale
            );
            ensure!(
                until_block >= <system::Pallet<T>>::block_number() + T::MinBidBlockSpan::get(),
                Error::<T>::BlockSpanTooSmall
            );

            CoffeesOnSale::<T>::try_append(&until_block, coffee_id)
                .map_err(|_| Error::<T>::TooManyBidOnOneBlock)?;
            CoffeesBid::<T>::insert(coffee_id, Option::<(T::AccountId, BalanceOf<T>)>::default());
            Self::deposit_event(Event::CoffeeOnSale {
                owner: who,
                coffee_id,
                until_block,
            });

            Ok(())
        }

        #[pallet::call_index(4)]
        #[pallet::weight(T::WeightInfo::bid())]
        pub fn bid(origin: OriginFor<T>, coffee_id: u32, price: BalanceOf<T>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(
                Some(&who) != Self::coffee_owner(coffee_id).as_ref(),
                Error::<T>::BidForSelf
            );
            let last_bid =
                CoffeesBid::<T>::try_get(coffee_id).map_err(|_| Error::<T>::CoffeeNotOnSale)?;
            let stake_amount = T::StakeAmount::get();
            if let Some((last_bidder, last_price)) = last_bid {
                ensure!(
                    price >= last_price + T::MinBidIncrement::get(),
                    Error::<T>::CoffeeBidLessThanTheSumOfLastPriceAndMinimumBidIncrement
                );
                T::Currency::unreserve(&last_bidder, last_price + stake_amount);
            } else {
                ensure!(
                    price >= T::MinBidAmount::get(),
                    Error::<T>::CoffeeBidLessThanOrMinimumBidAmount
                );
            }

            T::Currency::reserve(&who, price + stake_amount)
                .map_err(|_| Error::<T>::NotEnoughBalanceForBidAndStaking)?;
            CoffeesBid::<T>::insert(coffee_id, Some((who.clone(), price)));
            Self::deposit_event(Event::CoffeeBid {
                bidder: who,
                coffee_id,
                price,
            });
            Ok(())
        }

        #[pallet::call_index(5)]
        #[pallet::weight({0})]
        pub fn submit_price(origin: OriginFor<T>, price: u32) -> DispatchResultWithPostInfo {
            // Retrieve sender of the transaction.
            let who = ensure_signed(origin)?;
            // Add the price to the on-chain list.
            Self::add_price(Some(who), price);
            Ok(().into())
        }

        #[pallet::call_index(6)]
        #[pallet::weight({0})]
        pub fn submit_price_unsigned(
            origin: OriginFor<T>,
            _block_number: BlockNumberFor<T>,
            price: u32,
        ) -> DispatchResultWithPostInfo {
            // This ensures that the function can only be called via unsigned transaction.
            ensure_none(origin)?;
            // Add the price to the on-chain list, but mark it as coming from an empty address.
            Self::add_price(None, price);
            // now increment the block number at which we expect next unsigned transaction.
            let current_block = <system::Pallet<T>>::block_number();
            <NextUnsignedAt<T>>::put(current_block + T::UnsignedInterval::get());
            Ok(().into())
        }

        #[pallet::call_index(7)]
        #[pallet::weight({0})]
        pub fn submit_price_unsigned_with_signed_payload(
            origin: OriginFor<T>,
            price_payload: PricePayload<T::Public, BlockNumberFor<T>>,
            _signature: T::Signature,
        ) -> DispatchResultWithPostInfo {
            // This ensures that the function can only be called via unsigned transaction.
            ensure_none(origin)?;
            // Add the price to the on-chain list, but mark it as coming from an empty address.
            Self::add_price(None, price_payload.price);
            // now increment the block number at which we expect next unsigned transaction.
            let current_block = <system::Pallet<T>>::block_number();
            <NextUnsignedAt<T>>::put(current_block + T::UnsignedInterval::get());
            Ok(().into())
        }

    }
}
