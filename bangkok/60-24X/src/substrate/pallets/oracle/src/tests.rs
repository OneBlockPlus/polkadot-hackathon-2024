use crate::{mock::*, Error, Event};
use frame_support::{assert_noop, assert_ok};

#[test]
fn update_price_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Add Alice as a price source
        assert_ok!(Oracle::add_price_source(RuntimeOrigin::root(), 1, 1));
        
        // Update price
        assert_ok!(Oracle::update_price(RuntimeOrigin::signed(1), 1, 100));
        
        // Check that the price was updated
        assert_eq!(Oracle::get_price(1), Some(100));
        
        // Check that the correct event was emitted
        System::assert_last_event(Event::PriceUpdated { asset_id: 1, price: 100, provider: 1 }.into());
    });
}

#[test]
fn update_price_fails_for_unauthorized() {
    new_test_ext().execute_with(|| {
        // Try to update price with unauthorized account
        assert_noop!(
            Oracle::update_price(RuntimeOrigin::signed(2), 1, 100),
            Error::<Test>::UnauthorizedPriceProvider
        );
    });
}

#[test]
fn add_price_source_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1); // Ensure we're not at block 0

        // Add a price source
        assert_ok!(Oracle::add_price_source(RuntimeOrigin::root(), 1, 1));
        
        // Check that the price source was added
        assert!(Oracle::get_price_sources(1).contains(&1));

        // Check that the correct event was emitted
        System::assert_has_event(crate::Event::PriceSourceAdded { asset_id: 1, provider: 1 }.into());
    });
}

#[test]
fn remove_price_source_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1); // Ensure we're not at block 0
        // Add a price source
        assert_ok!(Oracle::add_price_source(RuntimeOrigin::root(), 1, 1));
        
        // Remove the price source
        assert_ok!(Oracle::remove_price_source(RuntimeOrigin::root(), 1, 1));
        
        // Check that the price source was removed
        assert!(!Oracle::get_price_sources(1).contains(&1));
        
        // Check that the correct event was emitted
        System::assert_has_event(crate::Event::PriceSourceRemoved { asset_id: 1, provider: 1 }.into());
    });
}

#[test]
fn set_staleness_threshold_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set staleness threshold
        assert_ok!(Oracle::set_staleness_threshold(RuntimeOrigin::root(), 100));
        
        // Check that the staleness threshold was set
        assert_eq!(Oracle::get_staleness_threshold(), Some(100));
        
        // Check that the correct event was emitted
        System::assert_last_event(Event::StalenessThresholdUpdated { threshold: 100 }.into());
    });
}

#[test]
fn set_minimum_sources_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1); // Ensure we're not at block 0
        // Set minimum sources
        assert_ok!(Oracle::set_minimum_sources(RuntimeOrigin::root(), 3));
        
        // Check that the minimum sources was set
        assert_eq!(Oracle::get_minimum_sources(), 3);
        
        // Check that the correct event was emitted
        System::assert_has_event(Event::MinimumSourcesUpdated { minimum: 3 }.into());
    });
}

#[test]
fn price_staleness_check_works() {
    new_test_ext().execute_with(|| {
        // Add Alice as a price source
        assert_ok!(Oracle::add_price_source(RuntimeOrigin::root(), 1, 1));
        
        // Set staleness threshold to 100 blocks
        assert_ok!(Oracle::set_staleness_threshold(RuntimeOrigin::root(), 100));
        
        // Set minimum sources to 1
        assert_ok!(Oracle::set_minimum_sources(RuntimeOrigin::root(), 1));
        
        // Update price
        assert_ok!(Oracle::update_price(RuntimeOrigin::signed(1), 1, 100));
        
        // Price should be fresh
        assert!(Oracle::is_price_valid(1));
        
        // Advance blocks
        System::set_block_number(101);
        
        // Price should now be stale
        assert!(!Oracle::is_price_valid(1));
    });
}