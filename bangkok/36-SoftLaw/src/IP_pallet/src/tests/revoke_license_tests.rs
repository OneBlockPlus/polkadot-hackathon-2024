use crate::{mock::*, Error, Event, LicenseStatus, PaymentType, RevokeReason};
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
    IPPallet::next_license_id()  - 1
}

#[test]
fn test_revoke_license_success_offered() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let nft_id = mint_nft(licensor);
        let price = 100;
        let license_id = create_license(licensor, nft_id, price, false, PaymentType::OneTime(price));

        assert_ok!(IPPallet::revoke_license(
            RuntimeOrigin::signed(licensor),
            license_id,
            RevokeReason::Other
        ));

        assert!(IPPallet::licenses(license_id).is_none());

        System::assert_last_event(RuntimeEvent::IPPallet(Event::LicenseRevoked {
            license_id,
            nft_id,
            licensee: None,
            reason: RevokeReason::Other,
        }));
    });
}

#[test]
fn test_revoke_license_success_active_no_payments() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;
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

        assert_ok!(IPPallet::revoke_license(
            RuntimeOrigin::signed(licensor),
            license_id,
            RevokeReason::Violation
        ));

        assert!(IPPallet::licenses(license_id).is_none());
        assert!(IPPallet::license_ownership(nft_id, licensee).is_none());

        System::assert_last_event(RuntimeEvent::IPPallet(Event::LicenseRevoked {
            license_id,
            nft_id,
            licensee: Some(licensee),
            reason: RevokeReason::Violation,
        }));
    });
}

#[test]
fn test_revoke_license_not_license_owner() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let other_account = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;
        let license_id = create_license(licensor, nft_id, price, false, PaymentType::OneTime(price));

        assert_noop!(
            IPPallet::revoke_license(
                RuntimeOrigin::signed(other_account),
                license_id,
                RevokeReason::MutualAgreement
            ),
            Error::<Test>::NotLicenseOwner
        );
    });
}

#[test]
fn test_revoke_license_not_revocable_one_time_payment() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;
        let license_id = create_license(licensor, nft_id, price, false, PaymentType::OneTime(price));

        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        // Ensure the license status is Completed after acceptance
        let license = IPPallet::licenses(license_id).unwrap();
        assert_eq!(license.status, LicenseStatus::Completed);

        assert_noop!(
            IPPallet::revoke_license(
                RuntimeOrigin::signed(licensor),
                license_id,
                RevokeReason::MutualAgreement
            ),
            Error::<Test>::LicenseNotRevocable
        );
    });
}

#[test]
fn test_revoke_license_not_revocable_after_payment() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;
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

        // Simulate a payment being made
        IPPallet::make_periodic_payment(RuntimeOrigin::signed(licensee), license_id).unwrap();

        assert_noop!(
            IPPallet::revoke_license(
                RuntimeOrigin::signed(licensor),
                license_id,
                RevokeReason::Violation
            ),
            Error::<Test>::LicenseNotRevocable
        );
    });
}
