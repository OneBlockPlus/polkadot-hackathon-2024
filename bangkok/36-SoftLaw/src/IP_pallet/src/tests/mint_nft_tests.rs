use crate::{mock::*, pallet::{Error, Event, Config}};

use frame_support::{assert_noop, assert_ok};

#[test]
fn test_successful_mint() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let origin = RuntimeOrigin::signed(account_id);

        assert_ok!(IPPallet::mint_nft(
            origin,
            "Test NFT".into(),
            "Test Description".into(),
            "2023-05-01".into(),
            "Test Jurisdiction".into()
        ));

        let nft_id = IPPallet::next_nft_id() - 1;

        assert!(IPPallet::nfts(nft_id).is_some());
        assert_eq!(IPPallet::next_nft_id(), nft_id + 1);

        let expected_event = RuntimeEvent::IPPallet(Event::NftMinted {
            owner: account_id,
            nft_id,
        });
        assert!(System::events()
            .iter()
            .any(|record| record.event == expected_event));
    });
}

#[test]
fn test_name_too_long() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let origin = RuntimeOrigin::signed(account_id);
        let long_name = "a".repeat(<Test as Config>::MaxNameLength::get() as usize + 1);

        assert_noop!(
            IPPallet::mint_nft(
                origin,
                long_name,
                "Test Description".into(),
                "2023-05-01".into(),
                "Test Jurisdiction".into()
            ),
            Error::<Test>::NameTooLong
        );
    });
}

#[test]
fn test_description_too_long() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let origin = RuntimeOrigin::signed(account_id);
        let long_description =
            "a".repeat(<Test as Config>::MaxDescriptionLength::get() as usize + 1);

        assert_noop!(
            IPPallet::mint_nft(
                origin,
                "Test NFT".into(),
                long_description,
                "2023-05-01".into(),
                "Test Jurisdiction".into()
            ),
            Error::<Test>::DescriptionTooLong
        );
    });
}

#[test]
fn test_filing_date_too_long() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let origin = RuntimeOrigin::signed(account_id);
        let long_filing_date =
            "a".repeat(<Test as Config>::MaxNameLength::get() as usize + 1);

        assert_noop!(
            IPPallet::mint_nft(
                origin,
                "Test NFT".into(),
                "Test Description".into(),
                long_filing_date,
                "Test Jurisdiction".into()
            ),
            Error::<Test>::FilingDateTooLong
        );
    });
}

#[test]
fn test_jurisdiction_too_long() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let origin = RuntimeOrigin::signed(account_id);
        let long_jurisdiction =
            "a".repeat(<Test as Config>::MaxNameLength::get() as usize + 1);

        assert_noop!(
            IPPallet::mint_nft(
                origin,
                "Test NFT".into(),
                "Test Description".into(),
                "2023-05-01".into(),
                long_jurisdiction
            ),
            Error::<Test>::JurisdictionTooLong
        );
    });
}
