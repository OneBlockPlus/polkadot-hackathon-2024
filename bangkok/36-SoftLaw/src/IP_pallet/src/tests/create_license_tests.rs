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

#[test]
fn test_create_license_success() {
    new_test_ext().execute_with(|| {
        let account = 1;
        let nft_id = mint_nft(account);
        let price = 100;
        let duration = Some(100);
        let payment_type = PaymentType::OneTime(price);

        assert_ok!(IPPallet::create_license(
            RuntimeOrigin::signed(account),
            nft_id,
            price,
            false,
            duration,
            payment_type.clone(),
            false
        ));

        let license_id = IPPallet::next_license_id() - 1;
        let license = IPPallet::licenses(license_id).unwrap();

        assert_eq!(license.nft_id, nft_id);
        assert_eq!(license.licensor, account);
        assert_eq!(license.price, price);
        assert_eq!(license.duration, duration);
        assert_eq!(license.payment_type, payment_type);
        assert_eq!(license.status, LicenseStatus::Offered);

        System::assert_last_event(RuntimeEvent::IPPallet(Event::LicenseOffered {
            nft_id,
            license_id,
            licensor: account,
        }));
    });
}

#[test]
fn test_create_license_not_nft_owner() {
    new_test_ext().execute_with(|| {
        let account1 = 1;
        let account2 = 2;
        let nft_id = mint_nft(account1);
        let price = 100;

        assert_noop!(
            IPPallet::create_license(
                RuntimeOrigin::signed(account2),
                nft_id,
                price,
                false,
                None,
                PaymentType::OneTime(price),
                false
            ),
            Error::<Test>::NotNftOwner
        );
    });
}

#[test]
fn test_create_license_nft_not_found() {
    new_test_ext().execute_with(|| {
        let account = 1;
        let nft_id = 999; // Non-existent NFT
        let price = 100;

        assert_noop!(
            IPPallet::create_license(
                RuntimeOrigin::signed(account),
                nft_id,
                price,
                false,
                None,
                PaymentType::OneTime(price),
                false
            ),
            Error::<Test>::NftNotFound
        );
    });
}

#[test]
fn test_create_license_nft_in_escrow() {
    new_test_ext().execute_with(|| {
        let account = 1;
        let nft_id = mint_nft(account);
        let price = 100;

        assert_ok!(IPPallet::escrow_nft(
            RuntimeOrigin::signed(account),
            nft_id,
            price
        ));

        assert_noop!(
            IPPallet::create_license(
                RuntimeOrigin::signed(account),
                nft_id,
                price,
                false,
                None,
                PaymentType::OneTime(price),
                false
            ),
            Error::<Test>::NftInEscrow
        );
    });
}

#[test]
fn test_create_exclusive_license_with_existing_licenses() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;

        // Create a non-exclusive license
        assert_ok!(IPPallet::create_license(
            RuntimeOrigin::signed(licensor),
            nft_id,
            price,
            false,
            None,
            PaymentType::OneTime(price),
            false
        ));

        // Accept the non-exclusive license
        let license_id = IPPallet::next_license_id() - 1;
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        // Now try to create an exclusive license
        assert_noop!(
            IPPallet::create_license(
                RuntimeOrigin::signed(licensor),
                nft_id,
                price,
                false,
                None,
                PaymentType::OneTime(price),
                true
            ),
            Error::<Test>::ActiveLicensesExist
        );
    });
}

#[test]
fn test_create_non_exclusive_license_with_existing_exclusive() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;

        // Create an exclusive license
        assert_ok!(IPPallet::create_license(
            RuntimeOrigin::signed(licensor),
            nft_id,
            price,
            false,
            None,
            PaymentType::Periodic { amount_per_payment: 2, total_payments: 12, frequency: 60 },
            true
        ));

        // Accept the exclusive license
        let license_id = IPPallet::next_license_id() - 1;
        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        // Try to create a non-exclusive license
        assert_noop!(
            IPPallet::create_license(
                RuntimeOrigin::signed(licensor),
                nft_id,
                price,
                false,
                None,
                PaymentType::OneTime(price),
                false
            ),
            Error::<Test>::ExclusiveLicenseExists
        );
    });
}
