use crate::{mock::*, Error, Event};
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
fn test_escrow_nft_success() {
    new_test_ext().execute_with(|| {
        let account = 1;
        let nft_id = mint_nft(account);
        let price = 100;

        assert_ok!(IPPallet::escrow_nft(
            RuntimeOrigin::signed(account),
            nft_id,
            price
        ));

        assert!(IPPallet::escrow(nft_id).is_some());

        System::assert_last_event(RuntimeEvent::IPPallet(Event::NftEscrowed {
            nft_id,
            owner: account,
            price,
        }));
    });
}

#[test]
fn test_escrow_nft_not_owner() {
    new_test_ext().execute_with(|| {
        let account1 = 1;
        let account2 = 2;
        let nft_id = mint_nft(account1);
        let price = 100;

        assert_noop!(
            IPPallet::escrow_nft(RuntimeOrigin::signed(account2), nft_id, price),
            Error::<Test>::NotNftOwner
        );
    });
}

#[test]
fn test_escrow_nft_already_escrowed() {
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
            IPPallet::escrow_nft(RuntimeOrigin::signed(account), nft_id, price),
            Error::<Test>::NftAlreadyEscrowed
        );
    });
}

#[test]
fn test_escrow_nft_not_found() {
    new_test_ext().execute_with(|| {
        let account = 1;
        let nft_id = 999; // Non-existent NFT
        let price = 100;

        assert_noop!(
            IPPallet::escrow_nft(RuntimeOrigin::signed(account), nft_id, price),
            Error::<Test>::NftNotFound
        );
    });
}
