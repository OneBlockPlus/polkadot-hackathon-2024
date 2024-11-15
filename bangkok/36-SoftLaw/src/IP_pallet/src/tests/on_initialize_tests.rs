use crate::{
    mock::*,
    pallet::Event,
    tests::util::*,
    types::{Contract, ContractType, PaymentType},
};
use frame_support::{assert_ok, traits::Hooks};

#[test]
fn test_on_initialize_periodic_payment_check() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = create_nft(licensor);
        let payment_amount = 100u128;

        // Create and accept license with periodic payments
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(licensor),
            nft_id,
            PaymentType::Periodic {
                amount_per_payment: payment_amount.into(),
                total_payments: 4u32,
                frequency: 5u32.into(),
            },
            false,
            20u64.into()
        ));
        let offer_id = get_last_offer_id();

        // Accept the license
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            offer_id
        ));
        let contract_id = get_last_contract_id();

        // Clear events
        System::reset_events();

        // Run on_initialize which should mark missed payment
        IPPallet::on_initialize(7u64);

        // Verify contract updated with penalty
        if let Some(Contract::License(license)) = IPPallet::contracts(contract_id) {
            let schedule = license.payment_schedule.unwrap();
            assert_eq!(schedule.missed_payments, Some(1u32.into()));
            assert_eq!(
                schedule.penalty_amount,
                Some(payment_amount * 20u128 / 100u128) // 20% penalty
            );
        }

        // Verify events
        System::assert_has_event(RuntimeEvent::IPPallet(Event::ContractPenalized {
            contract_id,
            nft_id,
            payer: licensee,
            penalty_amount: payment_amount * 20u128 / 100u128, // 20% penalty
        }));
    });
}

#[test]
fn test_on_initialize_second_missed_payment() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = create_nft(licensor);
        let payment_amount = 100u128;

        // Create and accept license with periodic payments
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(licensor),
            nft_id,
            PaymentType::Periodic {
                amount_per_payment: payment_amount.into(),
                total_payments: 4u32,
                frequency: 5u32.into(),
            },
            false,
            20u64.into()
        ));
        let offer_id = get_last_offer_id();

        // Accept the license
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            offer_id
        ));
        let contract_id = get_last_contract_id();

        // First missed payment

        IPPallet::on_initialize(8u64);

        // Verify first penalty event
        System::assert_has_event(RuntimeEvent::IPPallet(Event::ContractPenalized {
            contract_id,
            nft_id,
            payer: licensee,
            penalty_amount: payment_amount * 20u128 / 100u128,
        }));

        // Clear events
        System::reset_events();

        // Second missed payment
        IPPallet::on_initialize(14u64);

        // Verify contract is removed after second miss
        assert!(IPPallet::contracts(contract_id).is_none());
        assert!(IPPallet::nft_contracts(nft_id).is_empty());

        // Verify contract terminated event
        System::assert_has_event(RuntimeEvent::IPPallet(Event::ContractTerminated {
            contract_id,
            contract_type: ContractType::License,
            nft_id,
            offered_by: licensor,
            accepted_by: licensee,
            payments_made: 1u32.into(),
            total_paid: payment_amount.into(),
        }));
    });
}

#[test]
fn test_on_initialize_payment_not_yet_due() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = create_nft(licensor);
        let payment_amount = 100u128;

        // Create and accept license with periodic payments
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(licensor),
            nft_id,
            PaymentType::Periodic {
                amount_per_payment: payment_amount.into(),
                total_payments: 4u32,
                frequency: 5u32.into(),
            },
            false,
            20u64.into()
        ));
        let offer_id = get_last_offer_id();

        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            offer_id
        ));
        let contract_id = get_last_contract_id();

        // Clear events
        System::reset_events();

        // Run on_initialize before payment is due

        IPPallet::on_initialize(4u64);

        // Verify contract unchanged
        if let Some(Contract::License(license)) = IPPallet::contracts(contract_id) {
            let schedule = license.payment_schedule.unwrap();
            assert!(schedule.missed_payments.is_none());
            assert!(schedule.penalty_amount.is_none());
        }

        // Verify no events emitted
        assert_eq!(System::events().len(), 0);
    });
}

#[test]
fn test_on_initialize_multiple_contracts_different_states() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee1 = 2;
        let licensee2 = 3;
        let nft1 = create_nft(licensor);
        let nft2 = create_nft(licensor);
        let payment_amount = 100u128;

        // Create first license (will miss payment)
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(licensor),
            nft1,
            PaymentType::Periodic {
                amount_per_payment: payment_amount.into(),
                total_payments: 4u32,
                frequency: 5u32.into(),
            },
            false,
            20u64.into()
        ));
        let offer1 = get_last_offer_id();
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee1),
            offer1
        ));
        let contract1 = get_last_contract_id();

        // Create second license (will be paid on time)
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(licensor),
            nft2,
            PaymentType::Periodic {
                amount_per_payment: payment_amount.into(),
                total_payments: 4u32,
                frequency: 5u32.into(),
            },
            false,
            20u64.into()
        ));
        let offer2 = get_last_offer_id();
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee2),
            offer2
        ));
        let contract2 = get_last_contract_id();

        // Make payment for second license
        System::set_block_number(6u64);
        assert_ok!(IPPallet::make_periodic_payment(
            RuntimeOrigin::signed(licensee2),
            contract2
        ));

        // Clear events
        System::reset_events();

        IPPallet::on_initialize(7u64);

        // Verify first contract has penalty
        if let Some(Contract::License(license)) = IPPallet::contracts(contract1) {
            let schedule = license.payment_schedule.unwrap();
            assert_eq!(schedule.missed_payments, Some(1u32.into()));
            assert_eq!(
                schedule.penalty_amount,
                Some(payment_amount * 20u128 / 100u128)
            );
        }

        // Verify second contract is unchanged
        if let Some(Contract::License(license)) = IPPallet::contracts(contract2) {
            let schedule = license.payment_schedule.unwrap();
            assert!(schedule.missed_payments.is_none());
            assert!(schedule.penalty_amount.is_none());
        }

        // Verify only one ContractPenalized event
        assert_eq!(
            System::events()
                .iter()
                .filter(|record| matches!(
                    record.event,
                    RuntimeEvent::IPPallet(Event::ContractPenalized { .. })
                ))
                .count(),
            1
        );

        // Verify the penalized contract is the correct one
        System::assert_has_event(RuntimeEvent::IPPallet(Event::ContractPenalized {
            contract_id: contract1,
            nft_id: nft1,
            payer: licensee1,
            penalty_amount: payment_amount * 20u128 / 100u128,
        }));
    });
}
