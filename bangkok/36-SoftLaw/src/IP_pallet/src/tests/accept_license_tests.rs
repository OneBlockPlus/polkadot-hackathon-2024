use crate::{
    mock::*,
    pallet::{Error, Event},
    tests::util::*,
    types::{Contract, ContractType, PaymentType},
};
use frame_support::{assert_noop, assert_ok};


// Failure Tests
#[test]
fn fail_accept_nonexistent_offer() {
    new_test_ext().execute_with(|| {
        let licensee = 2u64;
        assert_noop!(
            IPPallet::accept_license(RuntimeOrigin::signed(licensee), 999u32),
            Error::<Test>::OfferNotFound
        );
    });
}

#[test]
fn fail_accept_wrong_offer_type() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let licensee = 2u64;
        let nft_id = create_nft(owner);

        // Create purchase offer
        assert_ok!(IPPallet::offer_purchase(
            RuntimeOrigin::signed(owner),
            nft_id,
            create_one_time_payment_type(),
        ));
        let offer_id = get_last_offer_id();

        // Try to accept as license
        assert_noop!(
            IPPallet::accept_license(RuntimeOrigin::signed(licensee), offer_id),
            Error::<Test>::NotALicenseOffer
        );
    });
}

#[test]
fn fail_accept_license_insufficient_balance_onetime() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let poor_licensee = 4u64; // Account with no balance
        let nft_id = create_nft(owner);

        // Create license offer with one-time payment
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            PaymentType::OneTime(50_000u128.into()), // Amount greater than any initial balance
            false,
            100u32.into()
        ));
        let offer_id = get_last_offer_id();

        // Try to accept offer without sufficient balance
        assert_noop!(
            IPPallet::accept_license(RuntimeOrigin::signed(poor_licensee), offer_id),
            Error::<Test>::InsufficientBalance
        );
    });
}

#[test]
fn fail_accept_license_insufficient_balance_periodic() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let poor_licensee = 4u64; // Account with no balance
        let nft_id = create_nft(owner);

        // Create license offer with periodic payment
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            PaymentType::Periodic {
                amount_per_payment: 50_000u128.into(), // Amount greater than any initial balance
                total_payments: 10u32,
                frequency: 10u32.into(),
            },
            false,
            100u32.into()
        ));
        let offer_id = get_last_offer_id();

        // Try to accept offer without sufficient balance for first payment
        assert_noop!(
            IPPallet::accept_license(RuntimeOrigin::signed(poor_licensee), offer_id),
            Error::<Test>::InsufficientBalance
        );
    });
}

// Success Tests
#[test]
fn success_accept_onetime_license() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let licensee = 2u64;
        let nft_id = create_nft(owner);
        let payment_amount = 1_000u128;

        let owner_initial_balance = Balances::free_balance(owner);
        let licensee_initial_balance = Balances::free_balance(licensee);

        // Create license offer
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            PaymentType::OneTime(payment_amount.into()),
            false,
            100u32.into()
        ));
        let offer_id = get_last_offer_id();

        // Accept offer
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            offer_id
        ));

        // Verify balances
        assert_eq!(
            Balances::free_balance(owner),
            owner_initial_balance + payment_amount
        );
        assert_eq!(
            Balances::free_balance(licensee),
            licensee_initial_balance - payment_amount
        );

        // Verify contract state
        let contracts = IPPallet::nft_contracts(nft_id);
        assert_eq!(contracts.len(), 1);
        let contract_id = contracts[0];

        if let Some(Contract::License(license)) = IPPallet::contracts(contract_id) {
            assert_eq!(license.licensee, licensee);
            assert_eq!(license.licensor, owner);
            assert_eq!(license.nft_id, nft_id);
            assert!(license.payment_schedule.is_none());
        } else {
            panic!("Contract not found or wrong type");
        }

        // Verify events
        System::assert_has_event(RuntimeEvent::IPPallet(Event::ContractCreated {
            contract_id: contract_id,
            contract_type: ContractType::License,
            nft_id,
            offered_by: owner,
            accepted_by: licensee,
        }));
        System::assert_has_event(RuntimeEvent::IPPallet(Event::PaymentMade {
            payer: licensee,
            payee: owner,
            amount: payment_amount.into(),
        }));
    });
}

#[test]
fn success_accept_periodic_license() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let licensee = 2u64;
        let nft_id = create_nft(owner);
        let payment_amount = 1_000u128;

        let owner_initial_balance = Balances::free_balance(owner);
        let licensee_initial_balance = Balances::free_balance(licensee);

        // Create periodic license offer
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            PaymentType::Periodic {
                amount_per_payment: payment_amount.into(),
                total_payments: 10u32,
                frequency: 10u32.into(),
            },
            false,
            100u32.into()
        ));
        let offer_id = get_last_offer_id();

        // Accept offer
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            offer_id
        ));

        // Verify balances after first payment
        assert_eq!(
            Balances::free_balance(owner),
            owner_initial_balance + payment_amount
        );
        assert_eq!(
            Balances::free_balance(licensee),
            licensee_initial_balance - payment_amount
        );

        // Verify contract state
        let contracts = IPPallet::nft_contracts(nft_id);
        assert_eq!(contracts.len(), 1);
        let contract_id = contracts[0];

        if let Some(Contract::License(license)) = IPPallet::contracts(contract_id) {
            let schedule = license.payment_schedule.unwrap();
            assert_eq!(schedule.payments_made, 1u32);
            assert_eq!(schedule.payments_due, 9u32);
            assert!(schedule.missed_payments.is_none());
            assert!(schedule.penalty_amount.is_none());
            assert_eq!(schedule.frequency, 10u64);
            assert_eq!(schedule.next_payment_block, frame_system::Pallet::<Test>::block_number() + 10u64);
        }

        // Verify events
        System::assert_has_event(RuntimeEvent::IPPallet(Event::ContractCreated {
            contract_id: contract_id,
            contract_type: ContractType::License,
            nft_id,
            offered_by: owner,
            accepted_by: licensee,
        }));
        System::assert_has_event(RuntimeEvent::IPPallet(Event::PaymentMade {
            payer: licensee,
            payee: owner,
            amount: payment_amount.into(),
        }));

    });
}
