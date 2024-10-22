use crate::{mock::*, PaymentType};
use frame_support::assert_ok;
use frame_system::pallet_prelude::BlockNumberFor;

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
    payment_type: PaymentType<u32, BlockNumberFor<Test>>,
    duration: Option<BlockNumberFor<Test>>,
) -> <Test as crate::Config>::LicenseId {
    IPPallet::create_license(
        RuntimeOrigin::signed(licensor),
        nft_id,
        price,
        false,
        duration,
        payment_type,
        is_exclusive,
    )
    .unwrap();
    IPPallet::next_license_id() - 1
}

#[test]
fn test_check_license_expiration() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;
        let duration = Some(10);
        let license_id = create_license(
            licensor,
            nft_id,
            price,
            false,
            PaymentType::OneTime(price),
            duration,
        );

        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        // Advance the block number to expire the license
        System::set_block_number(12);

        // Get the license and manually call check_license_expiration
        let license = IPPallet::licenses(license_id).unwrap();

        assert!(IPPallet::check_license_expiration(&license));
    });
}

#[test]
fn test_check_license_expiration_not_expired() {
    new_test_ext().execute_with(|| {
        let licensor = 1;
        let licensee = 2;
        let nft_id = mint_nft(licensor);
        let price = 100;
        let duration = Some(10);
        let license_id = create_license(
            licensor,
            nft_id,
            price,
            false,
            PaymentType::OneTime(price),
            duration,
        );

        assert_ok!(IPPallet::accept_license(
            RuntimeOrigin::signed(licensee),
            license_id
        ));

        // Advance the block number to expire the license
        System::set_block_number(5);

        // Get the license and manually call check_license_expiration
        let license = IPPallet::licenses(license_id).unwrap();

        assert!(!IPPallet::check_license_expiration(&license));
    });
}
