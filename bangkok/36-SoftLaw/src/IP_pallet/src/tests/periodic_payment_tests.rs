use crate::{
    mock::*,
    pallet::{Error, Event},
    tests::util::*,
    types::Contract,
};
use frame_support::{assert_noop, assert_ok};

// Failure Tests
#[test]
fn fail_payment_nonexistent_contract() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            IPPallet::make_periodic_payment(RuntimeOrigin::signed(1), 999u32.into()),
            Error::<Test>::ContractNotFound
        );
    });
}

#[test]
fn fail_payment_not_periodic() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let licensee = 2u64;
        let nft_id = create_nft(owner);

        // Create one-time payment license
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            create_one_time_payment_type(),
            false,
            100u32.into()
        ));
        let offer_id = get_last_offer_id();
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            offer_id
        ));
        let contract_id = get_last_contract_id();

        assert_noop!(
            IPPallet::make_periodic_payment(RuntimeOrigin::signed(licensee), contract_id),
            Error::<Test>::NotPeriodicPayment
        );
    });
}

#[test]
fn fail_payment_not_due() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let nft_id = create_nft(owner);

        // Create and accept periodic purchase
        let contract_id = create_and_accept_periodic_purchase(owner, buyer, nft_id);

        // Try to make payment before due
        assert_noop!(
            IPPallet::make_periodic_payment(RuntimeOrigin::signed(buyer), contract_id),
            Error::<Test>::PaymentNotDue
        );
    });
}

#[test]
fn fail_payment_insufficient_balance() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let poor_buyer = 4u64; // Account with no balance
        let nft_id = create_nft(owner);

        // Create and accept periodic purchase with normal buyer
        let contract_id = create_and_accept_periodic_purchase(owner, buyer, nft_id);

        // Advance to next payment block
        System::set_block_number(11);

        // Try to make payment from poor account
        assert_noop!(
            IPPallet::make_periodic_payment(RuntimeOrigin::signed(poor_buyer), contract_id),
            Error::<Test>::InsufficientBalance
        );
    });
}

// Success Tests
#[test]
fn success_make_periodic_payment() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let nft_id = create_nft(owner);
        let payment_amount = 100u128;

        let owner_initial_balance = Balances::free_balance(owner);
        let buyer_initial_balance = Balances::free_balance(buyer);

        // Create and accept periodic purchase
        let contract_id = create_and_accept_periodic_purchase(owner, buyer, nft_id);

        // Advance to next payment block
        System::set_block_number(11); // First payment due at block 10

        // Make payment
        assert_ok!(IPPallet::make_periodic_payment(
            RuntimeOrigin::signed(buyer),
            contract_id
        ));

        // Verify balances
        assert_eq!(
            Balances::free_balance(owner),
            owner_initial_balance + payment_amount * 2 // Initial + second payment
        );
        assert_eq!(
            Balances::free_balance(buyer),
            buyer_initial_balance - payment_amount * 2 // Initial + second payment
        );

        // Verify contract state
        if let Some(Contract::Purchase(purchase)) = IPPallet::contracts(contract_id) {
            let schedule = purchase.payment_schedule.unwrap();
            assert_eq!(schedule.payments_made, 2u32); // Initial + this payment
            assert_eq!(schedule.payments_due, 8u32);
            assert!(schedule.missed_payments.is_none());
            assert!(schedule.penalty_amount.is_none());
            assert_eq!(schedule.next_payment_block, 21u64); // Next payment due in 10 blocks
        }

        // Verify events
        System::assert_has_event(RuntimeEvent::IPPallet(Event::PeriodicPaymentMade {
            contract_id,
            nft_id,
            payer: buyer,
            payee: owner,
            amount: payment_amount.into(),
        }));
    });
}

#[test]
fn success_payment_with_penalty() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let nft_id = create_nft(owner);

        // Create and accept periodic purchase
        let contract_id = create_and_accept_periodic_purchase(owner, buyer, nft_id);

        // Advance past payment due date to trigger penalty
        System::set_block_number(15); // Payment was due at block 10

        // Make payment with penalty
        assert_ok!(IPPallet::make_periodic_payment(
            RuntimeOrigin::signed(buyer),
            contract_id
        ));

        // Verify contract state - penalty should be cleared after payment
        if let Some(Contract::Purchase(purchase)) = IPPallet::contracts(contract_id) {
            let schedule = purchase.payment_schedule.unwrap();
            assert_eq!(schedule.payments_made, 2u32);
            assert_eq!(schedule.payments_due, 8u32);
            assert!(schedule.missed_payments.is_none());
            assert!(schedule.penalty_amount.is_none());
            assert_eq!(schedule.next_payment_block, 21u64);
        }
    });
} 