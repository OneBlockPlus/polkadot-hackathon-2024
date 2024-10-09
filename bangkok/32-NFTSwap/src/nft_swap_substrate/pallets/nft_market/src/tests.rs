use super::*;
use crate::{mock::*, Error};
use frame_support::{assert_noop, assert_ok, BoundedVec};
use sp_core::H256;
use sp_core::hashing::blake2_256;
use pallet_nft::{NFTOwners, OwnedNFTs};

type AccountId = <Test as frame_system::Config>::AccountId;

#[test]
fn list_nft() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));

        let price = 10_000_000;
        let list_info = ListInfo {
            price,
            owner: account_id.clone(),
        };
        let share = 40;
        assert_ok!(NftMarketModule::list_nft(RuntimeOrigin::signed(account_id), (collection_id, 0, share), price));
        assert_eq!(Listings::<Test>::get((collection_id, 0, share), account_id), Some(list_info));
    })
}

#[test]
fn list_nft_fail_when_not_owner() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));

        let share = 100;
        assert_noop!(
            NftMarketModule::list_nft(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), 0),
            Error::<Test>::NotOwner
        );

        assert_noop!(
            NftMarketModule::list_nft(RuntimeOrigin::signed(account_id0), (collection_id, 1, share), 0),
            Error::<Test>::NFTNotFound
        );
    })
}

#[test]
fn unlist_nft() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));

        let nft_item = (collection_id, 0);
        let price = 10_000_000;
        let share = 40;
        let list_info = ListInfo {
            price,
            owner: account_id.clone(),
        };
        let nft_item_with_share = (nft_item.0, nft_item.1, share);
        assert_ok!(NftMarketModule::list_nft(RuntimeOrigin::signed(account_id), nft_item_with_share, price));
        assert_eq!(Listings::<Test>::get(nft_item_with_share, account_id.clone()), Some(list_info));
        assert_ok!(NftMarketModule::unlist_nft(RuntimeOrigin::signed(account_id), nft_item_with_share));
        assert_eq!(Listings::<Test>::get(nft_item_with_share, account_id.clone()), None);
    })
}

#[test]
fn place_offer() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        let share = 100;
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));
        assert_ok!(NftMarketModule::list_nft(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), 0));

        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id1), collection_id, metainfo1.clone()));
        let token_amount: u128 = 10;
        let placed_share = 40;
        let offer_nfts = BoundedVec::try_from(vec![(collection_id, 1, placed_share)]).unwrap();
        assert_ok!(NftMarketModule::place_offer(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), offer_nfts, token_amount, account_id0));

        let offered_nfts_boundedvec = BoundedVec::try_from(vec![(collection_id, 1, placed_share)]).unwrap();
        let offer = Offer {
            offered_nfts: offered_nfts_boundedvec,
            token_amount,
            buyer: account_id1.clone(),
        };
        let offered_boundedvec = BoundedVec::try_from(vec![offer]).unwrap();
        assert_eq!(Offers::<Test>::get((collection_id, 0, share), account_id0), Some(offered_boundedvec));
    })
}

#[test]
fn place_offer_fail_with_wrong_nft() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));
        let share = 10;
        assert_ok!(NftMarketModule::list_nft(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), 0));

        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id1), collection_id, metainfo1.clone()));

        // account0: nft0,1
        // account1: nft2
        let token_amount: u128 = 0;
        let placed_share = 40;
        let offer_nfts_id2 = BoundedVec::try_from(vec![(collection_id, 2, placed_share)]).unwrap();
        assert_ok!(NftMarketModule::place_offer(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), offer_nfts_id2.clone(), token_amount, account_id0));

        assert_noop!(
            NftMarketModule::place_offer(RuntimeOrigin::signed(account_id1), (collection_id, 1, share), offer_nfts_id2.clone(), token_amount, account_id0),
            Error::<Test>::NotListed
        );

        let offer_nfts_id3 = BoundedVec::try_from(vec![(collection_id, 3, placed_share)]).unwrap();
        assert_noop!(
            NftMarketModule::place_offer(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), offer_nfts_id3, token_amount, account_id0),
            Error::<Test>::NFTNotFound
        );

        let offer_nfts_id1 = BoundedVec::try_from(vec![(collection_id, 1, placed_share)]).unwrap();
        assert_noop!(
            NftMarketModule::place_offer(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), offer_nfts_id1, token_amount, account_id0),
            Error::<Test>::NotOwner
        );
    })
}

#[test]
fn place_offer_fail_when_not_enough_share() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));
        let share = 10;
        assert_ok!(NftMarketModule::list_nft(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), 0));

        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id1), collection_id, metainfo1.clone()));

        // account0: nft0
        // account1: nft1
        let transfered_share = 90;
        let placed_share = 40;
        assert_ok!(NftModule::transfer_nft(RuntimeOrigin::signed(account_id1), account_id0, (collection_id, 1), transfered_share));

        let token_amount: u128 = 0;
        let offer_nfts_id1 = BoundedVec::try_from(vec![(collection_id, 1, placed_share)]).unwrap();
        assert_noop!(
            NftMarketModule::place_offer(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), offer_nfts_id1, token_amount, account_id0),
            Error::<Test>::ShareNotEnough
        );
    })
}

#[test]
fn cancel_offer() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));
        let share = 100;
        assert_ok!(NftMarketModule::list_nft(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), 0));

        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id1), collection_id, metainfo1.clone()));
        let placed_share = 40;
        let token_amount: u128 = 0;
        let offer_nfts= BoundedVec::try_from(vec![(collection_id, 1, placed_share)]).unwrap();
        assert_ok!(NftMarketModule::place_offer(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), offer_nfts.clone(), token_amount, account_id0));
        assert_ok!(NftMarketModule::cancel_offer(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), offer_nfts.clone(), token_amount, account_id0));

        let offered_boundedvec = BoundedVec::default();
        assert_eq!(Offers::<Test>::get((collection_id, 0, share), account_id0), Some(offered_boundedvec));
    })
}

#[test]
fn accept_offer() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        let share = 100;
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));
        assert_ok!(NftMarketModule::list_nft(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), 0));

        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id1), collection_id, metainfo1.clone()));
        let token_amount: u128 = 20;
        let placed_share = 80;
        let offer_nfts= BoundedVec::try_from(vec![(collection_id, 1, placed_share)]).unwrap();
        assert_ok!(NftMarketModule::place_offer(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), offer_nfts.clone(), token_amount, account_id0));
        assert_ok!(NftMarketModule::accept_offer(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), offer_nfts.clone(), token_amount, account_id1));

        let nft0_owners = BoundedVec::try_from(vec![account_id1]).unwrap();
        let nft1_owners = BoundedVec::try_from(vec![account_id1, account_id0]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(nft0_owners));
        assert_eq!(NFTOwners::<Test>::get((collection_id, 1)), Some(nft1_owners));

        let account0_owned_nfts = BoundedVec::try_from(vec![(collection_id, 1, placed_share)]).unwrap();
        let account1_owned_nfts = BoundedVec::try_from(vec![(collection_id, 1, 100 - placed_share), (collection_id, 0, share)]).unwrap();
        assert_eq!(OwnedNFTs::<Test>::get(account_id0), Some(account0_owned_nfts));
        assert_eq!(OwnedNFTs::<Test>::get(account_id1), Some(account1_owned_nfts));
    })
}

#[test]
fn accept_offer_fail_with_insufficient_balance() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        let share = 100;
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));
        assert_ok!(NftMarketModule::list_nft(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), 0));

        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id1), collection_id, metainfo1.clone()));
        let token_amount: u128 = 200000000;
        let placed_share = 100;
        let offer_nfts= BoundedVec::try_from(vec![(collection_id, 1, placed_share)]).unwrap();
        assert_ok!(NftMarketModule::place_offer(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), offer_nfts.clone(), token_amount, account_id0));
        assert_noop!(
            NftMarketModule::accept_offer(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), offer_nfts.clone(), token_amount, account_id1),
            Error::<Test>::InsufficientBalance
        );

        let nft0_owners = BoundedVec::try_from(vec![account_id0]).unwrap();
        let nft1_owners = BoundedVec::try_from(vec![account_id1]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(nft0_owners));
        assert_eq!(NFTOwners::<Test>::get((collection_id, 1)), Some(nft1_owners));
    })
}

#[test]
fn reject_offer() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        let share = 100;
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));
        assert_ok!(NftMarketModule::list_nft(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), 0));

        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id1), collection_id, metainfo1.clone())); // id1
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id1), collection_id, metainfo1.clone())); // id2
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id1), collection_id, metainfo1.clone())); // id3
        let token_amount: u128 = 0;
        let placed_share = 100;
        let offer_nfts_id1 = BoundedVec::try_from(vec![(collection_id, 1, placed_share)]).unwrap();
        assert_ok!(NftMarketModule::place_offer(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), offer_nfts_id1.clone(), token_amount, account_id0));
        let offer_nfts_id23 = BoundedVec::try_from(vec![(collection_id, 2, placed_share), (collection_id, 3, placed_share)]).unwrap();
        assert_ok!(NftMarketModule::place_offer(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), offer_nfts_id23, token_amount, account_id0));

        assert_ok!(NftMarketModule::reject_offer(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), offer_nfts_id1.clone(), token_amount, account_id1));

        let offered_nfts_boundedvec = BoundedVec::try_from(vec![(collection_id, 2, placed_share), (collection_id, 3, placed_share)]).unwrap();
        let offer = Offer {
            offered_nfts: offered_nfts_boundedvec,
            token_amount,
            buyer: account_id1
        };
        let offered_boundedvec = BoundedVec::try_from(vec![offer]).unwrap();
        assert_eq!(Offers::<Test>::get((collection_id, 0, share), account_id0), Some(offered_boundedvec));
        let nft0_owners = BoundedVec::try_from(vec![account_id0]).unwrap();
        let nft1_owners = BoundedVec::try_from(vec![account_id1]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(nft0_owners));
        assert_eq!(NFTOwners::<Test>::get((collection_id, 1)), Some(nft1_owners));
    })
}

#[test]
fn buy_nft() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));
        let share = 100;
        assert_ok!(NftMarketModule::list_nft(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), 200000));
        assert_ok!(NftMarketModule::buy_nft(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), account_id0));

        let nft0_owners = BoundedVec::try_from(vec![account_id1]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(nft0_owners));
        let account0_owned_nfts = BoundedVec::default();
        let account1_owned_nfts = BoundedVec::try_from(vec![(collection_id, 0, share)]).unwrap();
        assert_eq!(OwnedNFTs::<Test>::get(account_id0), Some(account0_owned_nfts));
        assert_eq!(OwnedNFTs::<Test>::get(account_id1), Some(account1_owned_nfts));
    })
}

#[test]
fn buy_nft_fail_when_insufficient_balance() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));

        let share = 10;
        assert_ok!(NftMarketModule::list_nft(RuntimeOrigin::signed(account_id0), (collection_id, 0, share), 2000000));
        assert_noop!(
            NftMarketModule::buy_nft(RuntimeOrigin::signed(account_id1), (collection_id, 0, share), account_id0),
            Error::<Test>::InsufficientBalance
        );

        let nft0_owners = BoundedVec::try_from(vec![account_id0]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(nft0_owners));
    })
}
