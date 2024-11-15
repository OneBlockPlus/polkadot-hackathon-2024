use crate::{
    mock::*,
    pallet::{Error, Event},
    tests::util::*,
    types::{ContractType, PaymentType},
};
use frame_support::{assert_noop, assert_ok};

// Failure Tests
#[test]
fn fail_complete_nonexistent_contract() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            IPPallet::complete_purchase(RuntimeOrigin::signed(1), 999u32.into()),
            Error::<Test>::ContractNotFound
        );
    });
}

#[test]
fn fail_complete_license_contract() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let licensee = 2u64;
        let nft_id = create_nft(owner);

        // Create and accept license
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            create_periodic_payment_type(),
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
            IPPallet::complete_purchase(RuntimeOrigin::signed(owner), contract_id),
            Error::<Test>::NotAPurchaseOffer
        );
    });
}

#[test]
fn fail_complete_purchase_payments_not_completed() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let nft_id = create_nft(owner);

        // Create and accept periodic purchase
        create_and_accept_periodic_purchase(owner, buyer, nft_id);
        let contract_id = get_last_contract_id();

        // Try to complete before all payments made
        assert_noop!(
            IPPallet::complete_purchase(RuntimeOrigin::signed(buyer), contract_id),
            Error::<Test>::PaymentNotCompleted
        );
    });
}

// Success Tests
#[test]
fn success_complete_purchase_after_all_payments() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let nft_id = create_nft(owner);
        let payment_amount = 100u128;
        let total_payments = 10u32;

        // Create and accept periodic purchase
        assert_ok!(IPPallet::offer_purchase(
            RuntimeOrigin::signed(owner),
            nft_id,
            PaymentType::Periodic {
                amount_per_payment: payment_amount.into(),
                total_payments,
                frequency: 10u32.into(),
            },
        ));
        let offer_id = get_last_offer_id();
        assert_ok!(IPPallet::accept_purchase(
            RuntimeOrigin::signed(buyer),
            offer_id
        ));
        let contract_id = get_last_contract_id();

        // Make all payments
        for i in 0..total_payments - 1 {
            // -1 because first payment made in accept
            System::set_block_number(1 + 10 * (i + 1) as u64); // Advance to next payment
            assert_ok!(IPPallet::make_periodic_payment(
                RuntimeOrigin::signed(buyer),
                contract_id
            ));
        }

        // Complete purchase
        assert_ok!(IPPallet::complete_purchase(
            RuntimeOrigin::signed(3u64),
            contract_id
        )); // Anyone can complete

        // Verify NFT ownership transferred
        assert_eq!(IPPallet::nfts(nft_id).unwrap().owner, buyer);

        // Verify NFT removed from escrow
        assert!(IPPallet::escrowed_nfts(nft_id).is_none());

        // Verify contract cleaned up
        assert!(IPPallet::contracts(contract_id).is_none());
        assert!(IPPallet::nft_contracts(nft_id).is_empty());

        // Verify events
        System::assert_has_event(RuntimeEvent::IPPallet(Event::NftRemovedFromEscrow {
            nft_id,
            owner,
        }));

        System::assert_has_event(RuntimeEvent::IPPallet(Event::ContractCompleted {
            contract_id,
            contract_type: ContractType::Purchase,
            nft_id,
            offered_by: owner,
            accepted_by: buyer,
            total_paid: (payment_amount * total_payments as u128).into(),
        }));
    });
}
