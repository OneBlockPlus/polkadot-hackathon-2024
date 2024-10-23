#![cfg(feature = "runtime-benchmarks")]

use super::*;
use frame_benchmarking::v2::*;
use frame_system::RawOrigin;

#[benchmarks]
mod benchmarks {
    use super::*;

    #[benchmark]
    fn create_limit_order() {
        let caller: T::AccountId = whitelisted_caller();
        let pair_id = T::PairId::default();
        let side = OrderSide::Buy;
        let price = 100u32.into();
        let amount = 1000u32.into();

        T::Fungibles::create(pair_id.into(), caller.clone(), true, 1u32.into()).unwrap();
        T::Fungibles::mint_into(pair_id.into(), &caller, 10000u32.into()).unwrap();

        #[extrinsic_call]
        create_limit_order(RawOrigin::Signed(caller.clone()), pair_id, side, price, amount);

        assert!(Orders::<T>::contains_key(pair_id, Pallet::<T>::get_next_order_id() - 1));
    }

    #[benchmark]
    fn cancel_order() {
        let caller: T::AccountId = whitelisted_caller();
        let pair_id = T::PairId::default();
        let side = OrderSide::Buy;
        let price = 100u32.into();
        let amount = 1000u32.into();

        T::Fungibles::create(pair_id.into(), caller.clone(), true, 1u32.into()).unwrap();
        T::Fungibles::mint_into(pair_id.into(), &caller, 10000u32.into()).unwrap();

        create_limit_order(RawOrigin::Signed(caller.clone()).into(), pair_id, side, price, amount).unwrap();
        let order_id = Pallet::<T>::get_next_order_id() - 1;

        #[extrinsic_call]
        cancel_order(RawOrigin::Signed(caller), pair_id, order_id);

        assert!(!Orders::<T>::contains_key(pair_id, order_id));
    }

    #[benchmark]
    fn execute_market_order() {
        let seller: T::AccountId = whitelisted_caller();
        let buyer: T::AccountId = account("buyer", 0, 0);
        let pair_id = T::PairId::default();
        let sell_price = 100u32.into();
        let sell_amount = 1000u32.into();

        T::Fungibles::create(pair_id.into(), seller.clone(), true, 1u32.into()).unwrap();
        T::Fungibles::mint_into(pair_id.into(), &seller, 10000u32.into()).unwrap();
        T::Fungibles::mint_into(pair_id.into(), &buyer, 10000u32.into()).unwrap();

        create_limit_order(RawOrigin::Signed(seller).into(), pair_id, OrderSide::Sell, sell_price, sell_amount).unwrap();

        let buy_amount = 500u32.into();

        #[extrinsic_call]
        execute_market_order(RawOrigin::Signed(buyer), pair_id, OrderSide::Buy, buy_amount);

        assert_eq!(Pallet::<T>::get_orderbook(pair_id).1[0].1, sell_amount - buy_amount);
    }

    impl_benchmark_test_suite!(Pallet, crate::mock::new_test_ext(), crate::mock::Test);
}