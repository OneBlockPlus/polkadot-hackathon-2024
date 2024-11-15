use crate::{
    mock::*,
    pallet::{Error, Event},
    tests::util::*,
    types::{ContractType, PaymentType},
};
use frame_support::{assert_noop, assert_ok};

// Failure Tests
#[test]
fn fail_expire_nonexistent_contract() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            IPPallet::expire_license(RuntimeOrigin::signed(1), 999u32.into()),
            Error::<Test>::ContractNotFound
        );
    });
}

#[test]
fn fail_expire_purchase_contract() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let nft_id = create_nft(owner);

        // Create and accept periodic purchase
        create_and_accept_periodic_purchase(owner, buyer, nft_id);
        let contract_id = get_last_contract_id();

        assert_noop!(
            IPPallet::expire_license(RuntimeOrigin::signed(owner), contract_id),
            Error::<Test>::NotALicenseContract
        );
    });
}

#[test]
fn fail_expire_not_expired_license() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let licensee = 2u64;
        let nft_id = create_nft(owner);

        // Create license with long duration
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            create_one_time_payment_type(),
            false,
            1000u32.into() // Long duration
        ));
        let offer_id = get_last_offer_id();
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            offer_id
        ));
        let contract_id = IPPallet::nft_contracts(nft_id)[0];

        assert_noop!(
            IPPallet::expire_license(RuntimeOrigin::signed(owner), contract_id),
            Error::<Test>::LicenseNotExpired
        );
    });
}

// Success Tests
#[test]
fn success_expire_license() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let licensee = 2u64;
        let nft_id = create_nft(owner);
        let payment_amount = 1_000u128;

        // Create license with short duration
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            PaymentType::OneTime(payment_amount.into()),
            false,
            5u32.into() // Short duration
        ));
        let offer_id = get_last_offer_id();
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            offer_id
        ));
        let contract_id = IPPallet::nft_contracts(nft_id)[0];

        // Move blocks forward past expiration
        System::set_block_number(10);

        // Expire the license
        assert_ok!(IPPallet::expire_license(
            RuntimeOrigin::signed(3u64),
            contract_id
        )); // Anyone can expire

        // Verify contract removed
        assert!(IPPallet::contracts(contract_id).is_none());
        assert!(IPPallet::nft_contracts(nft_id).is_empty());

        // Verify events
        System::assert_has_event(RuntimeEvent::IPPallet(Event::ContractExpired {
            contract_id,
            contract_type: ContractType::License,
            nft_id,
            offered_by: owner,
            accepted_by: licensee,
            payments_made: 1u32.into(),
            total_paid: payment_amount.into(),
        }));

        // Verify can create new license for same NFT
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            create_one_time_payment_type(),
            true, // Can now create exclusive license
            100u32.into()
        ));
    });
}
