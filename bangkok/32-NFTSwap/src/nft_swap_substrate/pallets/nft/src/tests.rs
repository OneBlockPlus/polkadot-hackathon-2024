use super::*;
use crate::{mock::*, Error};

use frame_support::{assert_noop, assert_ok, BoundedVec};
use sp_core::H256;
use sp_core::hashing::blake2_256;

type AccountId = <Test as frame_system::Config>::AccountId;

#[test]
fn create_collections() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));
        
        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        assert_eq!(
            NFTCollections::<Test>::get(&collection_id),
            Some((max_items, 0_u32, metainfo))
        );

        let collection_id_boundedvec = BoundedVec::try_from(vec![collection_id]).unwrap();
        assert_eq!(NFTCollectionIds::<Test>::get(), Some(collection_id_boundedvec));
    })
}

#[test]
fn create_collections_fail_when_already_exist() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));
        assert_noop!(
            NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()),
            Error::<Test>::CollectionAlreadyExists
        );
    })
}

#[test]
fn mint() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        let mut items_boundedvec = BoundedVec::try_from(vec![(collection_id, 0, 100)]).unwrap();
        assert_eq!(OwnedNFTs::<Test>::get(account_id), Some(items_boundedvec));
        items_boundedvec = BoundedVec::try_from(vec![(collection_id, 0, 100), (collection_id, 1, 100)]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_eq!(OwnedNFTs::<Test>::get(account_id), Some(items_boundedvec));

        let account_vec = BoundedVec::try_from(vec![account_id]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(account_vec.clone()));
        assert_eq!(NFTOwners::<Test>::get((collection_id, 1)), Some(account_vec.clone()));
    })
}

#[test]
fn mint_fail_when_exceed() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 2;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_noop!(
            NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()),
            Error::<Test>::NFTExceeds
        );
    })
}

#[test]
fn transfer() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));
        let account_vec0 = BoundedVec::try_from(vec![account_id0]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(account_vec0));

        assert_ok!(NftModule::transfer_nft(RuntimeOrigin::signed(account_id0), account_id1, (collection_id, 0), 100));
        let account_vec1 = BoundedVec::try_from(vec![account_id1]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(account_vec1));
        let account0_owned_nfts = BoundedVec::default();
        let account1_owned_nfts = BoundedVec::try_from(vec![(collection_id, 0, 100)]).unwrap();
        assert_eq!(OwnedNFTs::<Test>::get(account_id0), Some(account0_owned_nfts));
        assert_eq!(OwnedNFTs::<Test>::get(account_id1), Some(account1_owned_nfts));
    })
}
#[test]
fn transfer_with_share() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id0), collection_id, metainfo1.clone()));
        let account_vec0 = BoundedVec::try_from(vec![account_id0]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(account_vec0));

        let transfer_share = 30;
        assert_ok!(NftModule::transfer_nft(RuntimeOrigin::signed(account_id0), account_id1, (collection_id, 0), transfer_share));
        let account_vec01 = BoundedVec::try_from(vec![account_id0, account_id1]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(account_vec01));
        let account0_owned_nfts = BoundedVec::try_from(vec![(collection_id, 0, 100 - transfer_share)]).unwrap();
        let account1_owned_nfts = BoundedVec::try_from(vec![(collection_id, 0, transfer_share)]).unwrap();
        assert_eq!(OwnedNFTs::<Test>::get(account_id0), Some(account0_owned_nfts));
        assert_eq!(OwnedNFTs::<Test>::get(account_id1), Some(account1_owned_nfts));

        let transfer_share2 = 35;
        assert_ok!(NftModule::transfer_nft(RuntimeOrigin::signed(account_id0), account_id1, (collection_id, 0), transfer_share2));
        let account_vec01 = BoundedVec::try_from(vec![account_id0, account_id1]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(account_vec01));
        let account0_owned_nfts = BoundedVec::try_from(vec![(collection_id, 0, 100 - transfer_share - transfer_share2)]).unwrap();
        let account1_owned_nfts = BoundedVec::try_from(vec![(collection_id, 0, transfer_share + transfer_share2)]).unwrap();
        assert_eq!(OwnedNFTs::<Test>::get(account_id0), Some(account0_owned_nfts));
        assert_eq!(OwnedNFTs::<Test>::get(account_id1), Some(account1_owned_nfts));

        let transfer_share2 = 35;
        assert_ok!(NftModule::transfer_nft(RuntimeOrigin::signed(account_id0), account_id1, (collection_id, 0), transfer_share2));
        let account_vec1 = BoundedVec::try_from(vec![account_id1]).unwrap();
        assert_eq!(NFTOwners::<Test>::get((collection_id, 0)), Some(account_vec1));
        let account0_owned_nfts = BoundedVec::default();
        let account1_owned_nfts = BoundedVec::try_from(vec![(collection_id, 0, 100)]).unwrap();
        assert_eq!(OwnedNFTs::<Test>::get(account_id0), Some(account0_owned_nfts));
        assert_eq!(OwnedNFTs::<Test>::get(account_id1), Some(account1_owned_nfts));
    })
}

#[test]
fn transfer_when_nft_not_owned() {
    new_test_ext().execute_with(|| {
        let account_id0: AccountId = 1;
        let account_id1: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id0), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));

        assert_noop!(
            NftModule::transfer_nft(RuntimeOrigin::signed(account_id0), account_id1, (collection_id, 0), 100),
            Error::<Test>::NFTNotFound
        );
    })
}

#[test]
fn merge_nft() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));

        let nft_items = BoundedVec::try_from(vec![(collection_id, 0), (collection_id, 1), (collection_id, 2)]).unwrap();
        assert_ok!(NftModule::merge_nfts(RuntimeOrigin::signed(account_id), nft_items.clone()));

        let nft_0_info = NftInfo {
            merged_nft: Some((collection_id, 0)),
            sub_nfts: nft_items,
            metadata: metainfo1.clone(),
        };
        let nft_n_info = NftInfo {
            merged_nft: Some((collection_id, 0)),
            sub_nfts: BoundedVec::default(),
            metadata: metainfo1.clone(),
        };
        assert_eq!(NFTDetails::<Test>::get((collection_id, 0)), Some(nft_0_info));
        assert_eq!(NFTDetails::<Test>::get((collection_id, 1)), Some(nft_n_info.clone()));
        assert_eq!(NFTDetails::<Test>::get((collection_id, 2)), Some(nft_n_info.clone()));
    })
}

#[test]
fn merge_nft_fail_when_no_sub_nfts() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));

        let nft_items = BoundedVec::try_from(vec![(collection_id, 0)]).unwrap();
        assert_noop!(
            NftModule::merge_nfts(RuntimeOrigin::signed(account_id), nft_items.clone()),
            Error::<Test>::NFTNoSubNfts
        );
    })
}

#[test]
fn merge_nft_fail_when_nft_already_merged() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));

        let nft_items = BoundedVec::try_from(vec![(collection_id, 0), (collection_id, 1)]).unwrap();
        assert_ok!(NftModule::merge_nfts(RuntimeOrigin::signed(account_id), nft_items.clone()));
        assert_noop!(
            NftModule::merge_nfts(RuntimeOrigin::signed(account_id), nft_items.clone()),
            Error::<Test>::NFTAlreadyMerged
        );
    })
}

#[test]
fn merge_nft_fail_when_nft_part_share() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let account_id2: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::transfer_nft(RuntimeOrigin::signed(account_id), account_id2, (collection_id, 0), 20));

        let nft_items = BoundedVec::try_from(vec![(collection_id, 0), (collection_id, 1)]).unwrap();
        assert_noop!(
            NftModule::merge_nfts(RuntimeOrigin::signed(account_id), nft_items.clone()),
            Error::<Test>::NFTCanNotMergeOrSplit
        );
    })
}

#[test]
fn split_nft() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));

        let nft_items = BoundedVec::try_from(vec![(collection_id, 0), (collection_id, 1), (collection_id, 2)]).unwrap();
        assert_ok!(NftModule::merge_nfts(RuntimeOrigin::signed(account_id), nft_items.clone()));

        let nft_0_info = NftInfo {
            merged_nft: Some((collection_id, 0)),
            sub_nfts: nft_items,
            metadata: metainfo1.clone(),
        };
        let nft_n_info = NftInfo {
            merged_nft: Some((collection_id, 0)),
            sub_nfts: BoundedVec::default(),
            metadata: metainfo1.clone(),
        };
        assert_eq!(NFTDetails::<Test>::get((collection_id, 0)), Some(nft_0_info));
        assert_eq!(NFTDetails::<Test>::get((collection_id, 1)), Some(nft_n_info.clone()));
        assert_eq!(NFTDetails::<Test>::get((collection_id, 2)), Some(nft_n_info.clone()));

        assert_ok!(NftModule::split_nft(RuntimeOrigin::signed(account_id), (collection_id, 0)));

        let splited_nft_info = NftInfo {
            merged_nft: None,
            sub_nfts: BoundedVec::default(),
            metadata: metainfo1.clone(),
        };
        assert_eq!(NFTDetails::<Test>::get((collection_id, 0)), Some(splited_nft_info.clone()));
        assert_eq!(NFTDetails::<Test>::get((collection_id, 1)), Some(splited_nft_info.clone()));
        assert_eq!(NFTDetails::<Test>::get((collection_id, 2)), Some(splited_nft_info.clone()));
        assert!(NFTDetails::<Test>::get((collection_id, 0)).unwrap().merged_nft.is_none());
    })
}

#[test]
fn split_nft_fail_when_not_merged() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));

        assert_noop!(
            NftModule::split_nft(RuntimeOrigin::signed(account_id), (collection_id, 0)),
            Error::<Test>::NFTNotMerged
        );
    })
}

#[test]
fn split_nft_fail_when_not_the_merged_nft() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));

        let nft_items = BoundedVec::try_from(vec![(collection_id, 0), (collection_id, 1), (collection_id, 2)]).unwrap();
        assert_ok!(NftModule::merge_nfts(RuntimeOrigin::signed(account_id), nft_items.clone()));

        assert_noop!(
            NftModule::split_nft(RuntimeOrigin::signed(account_id), (collection_id, 1)),
            Error::<Test>::NFTIsNotTheMerged
        );
    })
}

#[test]
fn split_nft_fail_when_nft_part_share() {
    new_test_ext().execute_with(|| {
        let account_id: AccountId = 1;
        let account_id2: AccountId = 2;
        let max_items: u32 = 100;
        let metainfo = BoundedVec::try_from(vec![0, 1]).unwrap();
        assert_ok!(NftModule::create_collection(RuntimeOrigin::signed(account_id), max_items, metainfo.clone()));

        let collection_id = H256::from_slice(&blake2_256(&metainfo.clone()));
        let metainfo1 = BoundedVec::try_from(vec![1, 2]).unwrap();
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));
        assert_ok!(NftModule::mint_nft(RuntimeOrigin::signed(account_id), collection_id, metainfo1.clone()));

        let nft_items = BoundedVec::try_from(vec![(collection_id, 0), (collection_id, 1), (collection_id, 2)]).unwrap();
        assert_ok!(NftModule::merge_nfts(RuntimeOrigin::signed(account_id), nft_items.clone()));
        assert_ok!(NftModule::transfer_nft(RuntimeOrigin::signed(account_id), account_id2, (collection_id, 0), 20));

        assert_noop!(
            NftModule::split_nft(RuntimeOrigin::signed(account_id), (collection_id, 0)),
            Error::<Test>::NFTCanNotMergeOrSplit
        );
    })
}

