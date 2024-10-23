use crate::{mock::*, Error, Event, LicenseStatus, PaymentType};
use frame_support::{assert_noop, assert_ok};

fn mint_nft(account: <Test as frame_system::Config>::AccountId) -> u32 {
    IPPallet::mint_nft(
        RuntimeOrigin::signed(account),
        "Test NFT".into(),
        "Test Description".into(),
        "2023-05-01".into(),
        "Test Jurisdiction".into(),
    )
    .unwrap();
    IPPallet::next_nft_id() - 1
}

fn create_license(
    licensor: <Test as frame_system::Config>::AccountId,
    nft_id: u32,
    price: u32,
    is_exclusive: bool,
    payment_type: PaymentType<u32, u64>,
) -> <Test as crate::Config>::LicenseId {
    IPPallet::create_license(
        RuntimeOrigin::signed(licensor),
        nft_id,
        price,
        false,
        None,
        payment_type,
        is_exclusive,
    )
    .unwrap();
    IPPallet::next_license_id() - 1
}

#[test]
fn test_accept_license_success() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100u32;
        let license_id = create_license(licensor, nft_id, price, false, PaymentType::OneTime(price));

        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        let license = IPPallet::licenses(license_id).unwrap();
        assert_eq!(license.licensee, Some(licensee));
        assert_eq!(license.status, LicenseStatus::Completed);

        assert!(IPPallet::license_ownership(nft_id, licensee).is_some());

        System::assert_last_event(RuntimeEvent::IPPallet(Event::LicenseAccepted {
            license_id,
            nft_id,
            licensee,
        }));
    });
}

#[test]
fn test_accept_license_not_found() {
    new_test_ext().execute_with(|| {
        let licensee = 2;
        let non_existent_license_id = 999;

        assert_noop!(
            IPPallet::accept_license(RuntimeOrigin::signed(licensee), non_existent_license_id),
            Error::<Test>::LicenseNotFound
        );
    });
}

#[test]
fn test_accept_license_not_offered() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;
        let license_id = create_license(licensor, nft_id, price, false, PaymentType::OneTime(price));

        // Accept the license once
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        // Try to accept it again
        assert_noop!(
            IPPallet::accept_license(RuntimeOrigin::signed(licensee), license_id),
            Error::<Test>::LicenseNotOffered
        );
    });
}

#[test]
fn test_accept_license_already_licensed() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;

        // Create and accept first license
        let license_id1 = create_license(licensor, nft_id, price, false, PaymentType::OneTime(price));
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id1
        ));

        // Create second license
        let license_id2 = create_license(licensor, nft_id, price * 2, false, PaymentType::OneTime(price * 2));

        // Try to accept second license
        assert_noop!(
            IPPallet::accept_license(RuntimeOrigin::signed(licensee), license_id2),
            Error::<Test>::AlreadyLicensed
        );
    });
}

#[test]
fn test_accept_license_periodic_payment() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100u32;
        let license_id = create_license(
            licensor,
            nft_id,
            price,
            false,
            PaymentType::Periodic {
                amount_per_payment: price / 4,
                total_payments: 4,
                frequency: 10,
            },
        );

        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        let license = IPPallet::licenses(license_id).unwrap();
        assert_eq!(license.licensee, Some(licensee));
        assert_eq!(license.status, LicenseStatus::Active);
        assert!(license.payment_schedule.is_some());

        System::assert_last_event(RuntimeEvent::IPPallet(Event::LicenseAccepted {
            license_id,
            nft_id,
            licensee,
        }));
    });
}


#[test]
fn test_license_status_change_one_time_payment() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;
        let license_id = create_license(licensor, nft_id, price, false, PaymentType::OneTime(price));

        // Check initial status
        assert_eq!(IPPallet::licenses(license_id).unwrap().status, LicenseStatus::Offered);

        // Accept the license
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        // Check final status
        assert_eq!(IPPallet::licenses(license_id).unwrap().status, LicenseStatus::Completed);
    });
}

#[test]
fn test_license_status_change_periodic_payment() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100u32;
        let license_id = create_license(
            licensor,
            nft_id,
            price,
            false,
            PaymentType::Periodic {
                amount_per_payment: price / 4,
                total_payments: 4,
                frequency: 10,
            },
        );

        // Check initial status
        assert_eq!(IPPallet::licenses(license_id).unwrap().status, LicenseStatus::Offered);

        // Accept the license
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        // Check status after acceptance
        assert_eq!(IPPallet::licenses(license_id).unwrap().status, LicenseStatus::Active);
    });
}

#[test]
fn test_license_status_change_purchase() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;
        
        // Create a purchase license (is_purchase set to true)
        assert_ok!(IPPallet::create_license(
            RuntimeOrigin::signed(licensor),
            nft_id,
            price,
            true, // is_purchase
            None,
            PaymentType::OneTime(price),
            false
        ));
        let license_id = IPPallet::next_license_id()  - 1;

        // Check initial status
        assert_eq!(IPPallet::licenses(license_id).unwrap().status, LicenseStatus::Offered);

        // Accept the license
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        // Check final status
        assert_eq!(IPPallet::licenses(license_id).unwrap().status, LicenseStatus::Completed);
    });
}
