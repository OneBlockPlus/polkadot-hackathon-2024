use crate::{mock::*, Error, Event, OrderSide};
use frame_support::{assert_noop, assert_ok};

#[test]
fn create_limit_order_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let pair_id = 1;
        let price = 100;
        let amount = 10;

        assert_ok!(Orderbook::create_limit_order(RuntimeOrigin::signed(1), pair_id, OrderSide::Buy, price, amount));
        
        let order_id = Orderbook::next_order_id() - 1;
        assert!(Orderbook::orders(pair_id, order_id).is_some());

        System::assert_last_event(Event::LimitOrderCreated(order_id, 1, pair_id, OrderSide::Buy, price, amount).into());
    });
}

#[test]
fn create_limit_order_fails_with_zero_price() {
    new_test_ext().execute_with(|| {
        let pair_id = 1;
        let price = 0;
        let amount = 10;

        assert_noop!(
            Orderbook::create_limit_order(RuntimeOrigin::signed(1), pair_id, OrderSide::Buy, price, amount),
            Error::<Test>::InvalidPrice
        );
    });
}

#[test]
fn create_limit_order_fails_with_zero_amount() {
    new_test_ext().execute_with(|| {
        let pair_id = 1;
        let price = 100;
        let amount = 0;

        assert_noop!(
            Orderbook::create_limit_order(RuntimeOrigin::signed(1), pair_id, OrderSide::Buy, price, amount),
            Error::<Test>::InvalidAmount
        );
    });
}

#[test]
fn cancel_order_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let pair_id = 1;
        let price = 100;
        let amount = 10;

        assert_ok!(Orderbook::create_limit_order(RuntimeOrigin::signed(1), pair_id, OrderSide::Buy, price, amount));
        let order_id = Orderbook::next_order_id() - 1;

        assert_ok!(Orderbook::cancel_order(RuntimeOrigin::signed(1), pair_id, order_id));
        assert!(Orderbook::orders(pair_id, order_id).is_none());

        System::assert_last_event(Event::OrderCancelled(order_id).into());
    });
}

#[test]
fn cancel_order_fails_for_non_existent_order() {
    new_test_ext().execute_with(|| {
        let pair_id = 1;
        let non_existent_order_id = 999;

        assert_noop!(
            Orderbook::cancel_order(RuntimeOrigin::signed(1), pair_id, non_existent_order_id),
            Error::<Test>::OrderNotFound
        );
    });
}

#[test]
fn execute_market_order_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let pair_id = 1;
        let sell_price = 100;
        let sell_amount = 10;

        // Create a sell order
        assert_ok!(Orderbook::create_limit_order(RuntimeOrigin::signed(1), pair_id, OrderSide::Sell, sell_price, sell_amount));

        // Execute a buy market order
        let buy_amount = 5;
        assert_ok!(Orderbook::execute_market_order(RuntimeOrigin::signed(2), pair_id, OrderSide::Buy, buy_amount));

        // Check that the order was partially filled
        let order_id = Orderbook::next_order_id() - 1;
        let updated_order = Orderbook::orders(pair_id, order_id).unwrap();
        assert_eq!(updated_order.filled, buy_amount);

        // Check the event
        System::assert_last_event(Event::MarketOrderExecuted(2, order_id, pair_id, OrderSide::Buy, buy_amount, sell_price).into());
    });
}

#[test]
fn execute_market_order_fails_with_insufficient_liquidity() {
    new_test_ext().execute_with(|| {
        let pair_id = 1;
        let buy_amount = 10;

        assert_noop!(
            Orderbook::execute_market_order(RuntimeOrigin::signed(1), pair_id, OrderSide::Buy, buy_amount),
            Error::<Test>::OrderNotFound
        );
    });
}

#[test]
fn get_orderbook_works() {
    new_test_ext().execute_with(|| {
        let pair_id = 1;

        // Create some buy and sell orders
        assert_ok!(Orderbook::create_limit_order(RuntimeOrigin::signed(1), pair_id, OrderSide::Buy, 90, 10));
        assert_ok!(Orderbook::create_limit_order(RuntimeOrigin::signed(2), pair_id, OrderSide::Buy, 95, 15));
        assert_ok!(Orderbook::create_limit_order(RuntimeOrigin::signed(3), pair_id, OrderSide::Sell, 105, 12));
        assert_ok!(Orderbook::create_limit_order(RuntimeOrigin::signed(4), pair_id, OrderSide::Sell, 110, 8));

        let (bids, asks) = Orderbook::get_orderbook(pair_id);

        assert_eq!(bids, vec![(95, 15), (90, 10)]);
        assert_eq!(asks, vec![(105, 12), (110, 8)]);
    });
}

#[test]
fn get_price_works() {
    new_test_ext().execute_with(|| {
        let pair_id = 1;

        // Create some buy and sell orders
        assert_ok!(Orderbook::create_limit_order(RuntimeOrigin::signed(1), pair_id, OrderSide::Buy, 95, 10));
        assert_ok!(Orderbook::create_limit_order(RuntimeOrigin::signed(2), pair_id, OrderSide::Sell, 105, 12));

        let price = Orderbook::get_price(pair_id);
        assert_eq!(price, Some(100)); // (95 + 105) / 2 = 100
    });
}