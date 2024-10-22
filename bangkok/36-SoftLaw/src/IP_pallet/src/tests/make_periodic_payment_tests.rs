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
fn test_make_periodic_payment_success() {
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

        assert_ok!(IPPallet::make_periodic_payment(
            RuntimeOrigin::signed(licensee),
            license_id
        ));


        System::assert_last_event(RuntimeEvent::IPPallet(Event::PeriodicPaymentProcessed {
            license_id,
            nft_id,
            payer: licensee,
            licensor,
            amount: price / 4,
        }));
    });
}

#[test]
fn test_make_periodic_payment_license_not_found() {
    new_test_ext().execute_with(|| {
        let licensee = 2;
        let non_existent_license_id = 999;

        assert_noop!(
            IPPallet::make_periodic_payment(RuntimeOrigin::signed(licensee), non_existent_license_id),
            Error::<Test>::LicenseNotFound
        );
    });
}

#[test]
fn test_make_periodic_payment_license_not_active() {
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

        assert_noop!(
            IPPallet::make_periodic_payment(RuntimeOrigin::signed(licensee), license_id),
            Error::<Test>::LicenseNotActive
        );
    });
}


#[test]
fn test_make_periodic_payment_complete_license() {
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
                amount_per_payment: price / 2,
                total_payments: 2,
                frequency: 10,
            },
        );

        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        assert_ok!(IPPallet::make_periodic_payment(
            RuntimeOrigin::signed(licensee),
            license_id
        ));
        assert_ok!(IPPallet::make_periodic_payment(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        let license = IPPallet::licenses(license_id).unwrap();
        assert_eq!(license.status, LicenseStatus::Completed);

        System::assert_last_event(RuntimeEvent::IPPallet(Event::LicenseCompleted {
            license_id,
            nft_id,
            licensee,
        }));
    });
}
