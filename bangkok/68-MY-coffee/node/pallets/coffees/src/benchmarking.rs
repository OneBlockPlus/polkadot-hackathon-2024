//! Benchmarking setup for pallet-coffees
#![cfg(feature = "runtime-benchmarks")]
use super::*;
#[allow(unused)]
use crate::Pallet as PalletCoffees;
use frame_benchmarking::v2::*;
use frame_support::traits::{Currency, Get, ReservableCurrency};
use frame_support::{assert_ok, pallet_prelude::*};
use frame_system::{pallet_prelude::BlockNumberFor, RawOrigin};
use sp_std::vec;

fn create_funded_user<T: Config>(
    string: &'static str,
    n: u32,
    balance_factor: u32,
) -> T::AccountId {
    let user = account(string, n, 0);
    let balance = T::Currency::minimum_balance() * balance_factor.into();
    let _ = T::Currency::make_free_balance_be(&user, balance);
    user
}
fn assert_has_event<T: Config>(generic_event: <T as Config>::RuntimeEvent) {
    frame_system::Pallet::<T>::assert_has_event(generic_event.into());
}
#[benchmarks]
mod benchmarks {
    use super::*;

    #[benchmark]
    fn create() {
        let (creator, coffee_id) = (whitelisted_caller::<T::AccountId>(), 1);
        T::Currency::make_free_balance_be(&creator, 3000u32.into());
        let origin_reserved_balance = <T as Config>::Currency::reserved_balance(&creator);
        let origin_free_balance = <T as Config>::Currency::free_balance(&creator);

        #[extrinsic_call]
        create(RawOrigin::Signed(creator.clone()));

        assert_eq!(NextCoffeeId::<T>::get(), coffee_id);
        assert!(Coffees::<T>::get(coffee_id).is_some());
        assert_eq!(CoffeeOwner::<T>::get(coffee_id).as_ref(), Some(&creator));
        assert_eq!(
            <T as Config>::Currency::reserved_balance(&creator),
            origin_reserved_balance + <T as Config>::StakeAmount::get()
        );
        assert_eq!(
            <T as Config>::Currency::free_balance(&creator),
            origin_free_balance - <T as Config>::StakeAmount::get()
        );
        assert_has_event::<T>(
            Event::<T>::CoffeeCreated {
                creator,
                coffee_id,
                data: Coffees::<T>::get(coffee_id).unwrap().dna.clone(),
            }
            .into(),
        );
    }

    #[benchmark]
    fn breed() {
        let (creator, coffee_id_1, coffee_id_2, coffee_id) =
            (whitelisted_caller::<T::AccountId>(), 1, 2, 3);
        T::Currency::make_free_balance_be(&creator, 30000u32.into());

        assert_ok!(Pallet::<T>::create(
            RawOrigin::Signed(creator.clone()).into()
        ));

        assert_ok!(Pallet::<T>::create(
            RawOrigin::Signed(creator.clone()).into()
        ));
        let origin_reserved_balance = <T as Config>::Currency::reserved_balance(&creator);
        let origin_free_balance = <T as Config>::Currency::free_balance(&creator);

        #[extrinsic_call]
        breed(RawOrigin::Signed(creator.clone()), coffee_id_1, coffee_id_2);

        assert_eq!(NextCoffeeId::<T>::get(), coffee_id);
        assert_eq!(
            <T as Config>::Currency::reserved_balance(&creator),
            origin_reserved_balance + <T as Config>::StakeAmount::get()
        );
        assert_eq!(
            <T as Config>::Currency::free_balance(&creator),
            origin_free_balance - <T as Config>::StakeAmount::get()
        );
        assert_has_event::<T>(
            Event::<T>::CoffeeCreated {
                creator,
                coffee_id,
                data: Coffees::<T>::get(coffee_id).unwrap().dna.clone(),
            }
            .into(),
        );
    }

    #[benchmark]
    fn transfer() {
        let (from, to, coffee_id) = (
            whitelisted_caller::<T::AccountId>(),
            create_funded_user::<T>("to", 0, 1000),
            1,
        );
        T::Currency::make_free_balance_be(&from, 3000u32.into());

        assert_ok!(Pallet::<T>::create(RawOrigin::Signed(from.clone()).into()));

        let origin_reserved_balance_of_from = <T as Config>::Currency::reserved_balance(&from);
        let origin_reserved_balance_of_to = <T as Config>::Currency::reserved_balance(&to);
        let origin_free_balance_of_from = <T as Config>::Currency::free_balance(&from);
        let origin_free_balance_of_to = <T as Config>::Currency::free_balance(&to);
        #[extrinsic_call]
        transfer(RawOrigin::Signed(from.clone()), to.clone(), coffee_id);

        assert_eq!(CoffeeOwner::<T>::get(coffee_id).as_ref(), Some(&to));
        let stake_amount = <T as Config>::StakeAmount::get();
        assert_eq!(
            <T as Config>::Currency::reserved_balance(&from),
            origin_reserved_balance_of_from - stake_amount
        );
        assert_eq!(
            <T as Config>::Currency::reserved_balance(&to),
            origin_reserved_balance_of_to + stake_amount
        );
        assert_eq!(
            <T as Config>::Currency::free_balance(&from),
            origin_free_balance_of_from + stake_amount
        );
        assert_eq!(
            <T as Config>::Currency::free_balance(&to),
            origin_free_balance_of_to - stake_amount
        );
        assert_has_event::<T>(Event::<T>::CoffeeTransferred { from, to, coffee_id }.into());
    }

    #[benchmark]
    fn sale() {
        let new_block: BlockNumberFor<T> = 11u32.into();
        let (owner, coffee_id, until_block) = (whitelisted_caller::<T::AccountId>(), 1, new_block);
        T::Currency::make_free_balance_be(&owner, 3000u32.into());

        assert_ok!(Pallet::<T>::create(RawOrigin::Signed(owner.clone()).into()));
        #[extrinsic_call]
        sale(RawOrigin::Signed(owner.clone()), coffee_id, until_block);

        assert_eq!(
            CoffeesOnSale::<T>::get(&until_block),
            BoundedVec::<u32, <T as Config>::MaxCoffeesBidPerBlock>::try_from(vec![coffee_id])
                .unwrap()
        );
        assert!(CoffeesBid::<T>::contains_key(&coffee_id));
        assert_has_event::<T>(
            Event::<T>::CoffeeOnSale {
                owner,
                coffee_id,
                until_block,
            }
            .into(),
        );
    }

    #[benchmark]
    fn bid() {
        let new_block: BlockNumberFor<T> = 11u32.into();
        let balance_price: BalanceOf<T> = 500u32.into();
        let (owner, bidder, coffee_id, price, until_block) = (
            whitelisted_caller::<T::AccountId>(),
            create_funded_user::<T>("bidder", 0, 1000),
            1,
            balance_price,
            new_block,
        );
        T::Currency::make_free_balance_be(&owner, 3000u32.into());

        assert_ok!(Pallet::<T>::create(RawOrigin::Signed(owner.clone()).into()));
        assert_ok!(Pallet::<T>::sale(
            RawOrigin::Signed(owner.clone()).into(),
            coffee_id,
            until_block
        ));
        let origin_reserved_balance = <T as Config>::Currency::reserved_balance(&bidder);
        let origin_free_balance = <T as Config>::Currency::free_balance(&bidder);

        #[extrinsic_call]
        bid(RawOrigin::Signed(bidder.clone()), coffee_id, price);

        assert_eq!(
            CoffeesBid::<T>::get(coffee_id),
            Some((bidder.clone(), price))
        );

        let stake_amount = <T as Config>::StakeAmount::get();

        assert_eq!(
            <T as Config>::Currency::reserved_balance(&bidder),
            origin_reserved_balance + price + stake_amount
        );
        assert_eq!(
            <T as Config>::Currency::free_balance(&bidder),
            origin_free_balance - price - stake_amount
        );
        assert_has_event::<T>(
            Event::<T>::CoffeeBid {
                bidder: bidder.clone(),
                coffee_id,
                price,
            }
            .into(),
        );
    }

    #[benchmark]
    fn bid_knocked_down() {
        let new_block: BlockNumberFor<T> = 10u32.into();
        let balance_price: BalanceOf<T> = 500u32.into();
        use frame_support::sp_runtime::{traits::One, Saturating};
        let (owner, bidder, coffee_id, price, until_block) = (
            whitelisted_caller::<T::AccountId>(),
            create_funded_user::<T>("bidder", 0, 1000),
            1,
            balance_price,
            frame_system::Pallet::<T>::block_number().saturating_add(new_block),
        );
        T::Currency::make_free_balance_be(&owner, 3000u32.into());

        assert_ok!(Pallet::<T>::create(RawOrigin::Signed(owner.clone()).into()));
        assert_ok!(Pallet::<T>::sale(
            RawOrigin::Signed(owner.clone()).into(),
            coffee_id,
            until_block
        ));
        frame_system::Pallet::<T>::set_block_number(
            frame_system::Pallet::<T>::block_number().saturating_add(One::one()),
        );
        let origin_reserved_balance = <T as Config>::Currency::reserved_balance(&bidder);
        let origin_free_balance = <T as Config>::Currency::free_balance(&bidder);

        #[extrinsic_call]
        bid(RawOrigin::Signed(bidder.clone()), coffee_id, price);

        assert_eq!(
            CoffeesBid::<T>::get(coffee_id),
            Some((bidder.clone(), price))
        );

        let stake_amount = <T as Config>::StakeAmount::get();

        assert_eq!(
            <T as Config>::Currency::reserved_balance(&bidder),
            origin_reserved_balance + price + stake_amount
        );
        assert_eq!(
            <T as Config>::Currency::free_balance(&bidder),
            origin_free_balance - price - stake_amount
        );
        assert_has_event::<T>(
            Event::<T>::CoffeeBid {
                bidder: bidder.clone(),
                coffee_id,
                price,
            }
            .into(),
        );

        let origin_reserved_balance_of_owner = <T as Config>::Currency::reserved_balance(&owner);
        let origin_free_balance_of_owner = <T as Config>::Currency::free_balance(&owner);
        let origin_reserved_balance = <T as Config>::Currency::reserved_balance(&bidder);
        let origin_free_balance = <T as Config>::Currency::free_balance(&bidder);
        frame_system::Pallet::<T>::set_block_number(until_block);
        let _ = Pallet::<T>::on_initialize(frame_system::Pallet::<T>::block_number());
        assert_eq!(CoffeeOwner::<T>::get(coffee_id), Some(bidder.clone()));
        assert_eq!(
            <T as Config>::Currency::reserved_balance(&bidder),
            origin_reserved_balance - price
        );
        assert_eq!(
            <T as Config>::Currency::free_balance(&bidder),
            origin_free_balance
        );
        assert_eq!(
            <T as Config>::Currency::reserved_balance(&owner),
            origin_reserved_balance_of_owner - stake_amount
        );
        assert_eq!(
            <T as Config>::Currency::free_balance(&owner),
            origin_free_balance_of_owner + price + stake_amount
        );
        let prices = Prices::<T>::get();
        let average_price = prices
            .clone()
            .into_iter()
            .reduce(|a, b| a.saturating_add(b))
            .map(|s| s / prices.len() as u32);
        assert_has_event::<T>(
            Event::<T>::CoffeeTransferredAfterBidKnockedDown {
                from: owner,
                to: bidder.clone(),
                coffee_id,
                price,
                usd_price: average_price.map(|p| price * p.into()),
            }
            .into(),
        );
    }

    impl_benchmark_test_suite!(
        PalletCoffees,
        crate::mock::new_test_ext(),
        crate::mock::Test
    );
}