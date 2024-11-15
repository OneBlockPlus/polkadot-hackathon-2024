use crate::{
    mock::*,
    pallet::{Error, Event},
    types::Offer,
    tests::util::*
};
use frame_support::{assert_noop, assert_ok};




// Add to existing helper functions
fn create_and_accept_periodic_purchase(owner: u64, buyer: u64, nft_id: u32) {
    // Create and accept a periodic purchase to put NFT in escrow
    assert_ok!(IPPallet::offer_purchase(
        RuntimeOrigin::signed(owner),
        nft_id,
        create_periodic_payment_type(),
    ));
    let offer_id = get_last_offer_id();
    assert_ok!(IPPallet::accept_purchase(
        RuntimeOrigin::signed(buyer),
        offer_id
    ));
}

fn create_active_license(owner: u64, licensee: u64, nft_id: u32, is_exclusive: bool) {
    assert_ok!(IPPallet::offer_license(
        RuntimeOrigin::signed(owner),
        nft_id,
        create_one_time_payment_type(),
        is_exclusive,
        100u32.into()
    ));
    let offer_id = get_last_offer_id();
    assert_ok!(IPPallet::accept_license(
        RuntimeOrigin::signed(licensee),
        offer_id
    ));
}

// License Offer Tests
#[test]
fn success_license_onetime_payment() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let nft_id = create_nft(owner);
        let payment_type = create_one_time_payment_type();

        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            payment_type.clone(),
            false,         // non-exclusive
            100u32.into()  // duration
        ));

        let offer_id = get_last_offer_id();

        // Check storage
        let stored_offer = IPPallet::offers(offer_id).unwrap();
        match stored_offer {
            Offer::License(offer) => {
                assert_eq!(offer.nft_id, nft_id);
                assert_eq!(offer.licensor, owner);
                assert_eq!(offer.payment_type, payment_type);
                assert_eq!(offer.is_exclusive, false);
            }
            _ => panic!("Wrong offer type"),
        }

        // Check event
        System::assert_has_event(RuntimeEvent::IPPallet(Event::LicenseOffered {
            offer_id,
            nft_id,
            is_exclusive: false,
        }));
    });
}

#[test]
fn success_license_periodic_payment() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let nft_id = create_nft(owner);
        let payment_type = create_periodic_payment_type();

        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            payment_type.clone(),
            false,
            100u32.into()
        ));

        let offer_id = get_last_offer_id();

        // Check storage and event
        assert!(IPPallet::offers(offer_id).is_some());
        System::assert_has_event(RuntimeEvent::IPPallet(Event::LicenseOffered {
            offer_id,
            nft_id,
            is_exclusive: false,
        }));
    });
}

#[test]
fn fail_license_nonexistent_nft() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let non_existent_nft_id = 999u32;

        assert_noop!(
            IPPallet::offer_license(
                RuntimeOrigin::signed(owner),
                non_existent_nft_id,
                create_one_time_payment_type(),
                false,
                100u32.into()
            ),
            Error::<Test>::NftNotFound
        );
    });
}

#[test]
fn fail_license_non_owner() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let not_owner = 2u64;
        let nft_id = create_nft(owner);

        assert_noop!(
            IPPallet::offer_license(
                RuntimeOrigin::signed(not_owner),
                nft_id,
                create_one_time_payment_type(),
                false,
                100u32.into()
            ),
            Error::<Test>::NotNftOwner
        );
    });
}

#[test]
fn fail_license_escrowed_nft() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let nft_id = create_nft(owner);

        // Put NFT in escrow through periodic purchase
        create_and_accept_periodic_purchase(owner, buyer, nft_id);

        // Try to create license offer for NFT in escrow
        assert_noop!(
            IPPallet::offer_license(
                RuntimeOrigin::signed(owner),
                nft_id,
                create_one_time_payment_type(),
                false,
                100u32.into()
            ),
            Error::<Test>::NftInEscrow
        );
    });
}

#[test]
fn fail_license_existing_exclusive() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let licensee = 2u64;
        let nft_id = create_nft(owner);

        // Create active exclusive license
        create_active_license(owner, licensee, nft_id, true);

        // Try to create another license offer
        assert_noop!(
            IPPallet::offer_license(
                RuntimeOrigin::signed(owner),
                nft_id,
                create_one_time_payment_type(),
                false,
                100u32.into()
            ),
            Error::<Test>::ExclusiveLicenseExists
        );
    });
}

#[test]
fn fail_exclusive_with_active_license() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let licensee = 2u64;
        let nft_id = create_nft(owner);

        // Create active non-exclusive license
        create_active_license(owner, licensee, nft_id, false);

        // Try to create exclusive license offer
        assert_noop!(
            IPPallet::offer_license(
                RuntimeOrigin::signed(owner),
                nft_id,
                create_one_time_payment_type(),
                true,
                100u32.into()
            ),
            Error::<Test>::ActiveLicensesExist
        );
    });
}

// Purchase Offer Tests
#[test]
fn success_purchase_onetime_payment() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let nft_id = create_nft(owner);
        let payment_type = create_one_time_payment_type();

        assert_ok!(IPPallet::offer_purchase(
            RuntimeOrigin::signed(owner),
            nft_id,
            payment_type.clone(),
        ));

        let offer_id = get_last_offer_id();

        // Check storage
        let stored_offer = IPPallet::offers(offer_id).unwrap();
        match stored_offer {
            Offer::Purchase(offer) => {
                assert_eq!(offer.nft_id, nft_id);
                assert_eq!(offer.seller, owner);
                assert_eq!(offer.payment_type, payment_type);
            }
            _ => panic!("Wrong offer type"),
        }

        // Check event
        System::assert_has_event(RuntimeEvent::IPPallet(Event::PurchaseOffered {
            offer_id,
            nft_id,
        }));
    });
}

#[test]
fn fail_purchase_nonexistent_nft() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let non_existent_nft_id = 999u32;

        assert_noop!(
            IPPallet::offer_purchase(
                RuntimeOrigin::signed(owner),
                non_existent_nft_id,
                create_one_time_payment_type(),
            ),
            Error::<Test>::NftNotFound
        );
    });
}

#[test]
fn fail_purchase_non_owner() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let not_owner = 2u64;
        let nft_id = create_nft(owner);

        assert_noop!(
            IPPallet::offer_purchase(
                RuntimeOrigin::signed(not_owner),
                nft_id,
                create_one_time_payment_type(),
            ),
            Error::<Test>::NotNftOwner
        );
    });
}

#[test]
fn fail_purchase_escrowed_nft() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let nft_id = create_nft(owner);

        // Put NFT in escrow through periodic purchase
        create_and_accept_periodic_purchase(owner, buyer, nft_id);

        // Try to create purchase offer for NFT in escrow
        assert_noop!(
            IPPallet::offer_purchase(
                RuntimeOrigin::signed(owner),
                nft_id,
                create_one_time_payment_type(),
            ),
            Error::<Test>::NftInEscrow
        );
    });
}

#[test]
fn fail_purchase_with_active_license() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let licensee = 2u64;
        let nft_id = create_nft(owner);

        // Create active license (exclusive or non-exclusive)
        create_active_license(owner, licensee, nft_id, false);

        // Try to create purchase offer
        assert_noop!(
            IPPallet::offer_purchase(
                RuntimeOrigin::signed(owner),
                nft_id,
                create_one_time_payment_type(),
            ),
            Error::<Test>::ActiveLicensesExist
        );
    });
}
