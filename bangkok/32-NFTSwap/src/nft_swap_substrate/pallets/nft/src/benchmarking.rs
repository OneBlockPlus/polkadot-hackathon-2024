#![cfg(feature = "runtime-benchmarks")]

use super::*;

use frame_benchmarking::v2::*;
use frame_system::RawOrigin;
use frame_support::{BoundedVec,  pallet_prelude::Get};
use sp_std::vec;
use sp_core::hashing::blake2_256;
use sp_core::H256;
use frame_support::pallet_prelude::*;
type MaxSubNftsLength = ConstU32<10>;
type MaxNftOwners = ConstU32<10>;
type MaxMetadataLength = ConstU32<256>;
type MaxCollectionsLength = ConstU32<100>;
type MaxNftsLength = ConstU32<10000>;
type NftItem = (H256, u32);
type NftItemWithShare = (H256, u32, u8);

#[benchmarks]
mod benchmarks {
    use super::*;

    #[benchmark]
    fn create_collection() {
        let caller: T::AccountId = whitelisted_caller();
        let max_items = 100u32;
        let metadata: BoundedVec<u8, MaxMetadataLength> = vec![0; 32].try_into().unwrap();

        #[extrinsic_call]
        create_collection(RawOrigin::Signed(caller), max_items, metadata);

        assert!(NFTCollectionIds::<T>::get().is_some());
    }

    #[benchmark]
    fn mint_nft() {
        let caller: T::AccountId = whitelisted_caller();
        let max_items = 100u32;
        let collection_metadata: BoundedVec<u8, MaxMetadataLength> = vec![0; 32].try_into().unwrap();
        let collection_id = H256::from_slice(&blake2_256(&collection_metadata));

        NFTCollections::<T>::insert(&collection_id, (max_items, 0, collection_metadata.clone()));

        let nft_metadata: BoundedVec<u8, MaxMetadataLength> = vec![1; 32].try_into().unwrap();

        #[extrinsic_call]
        mint_nft(RawOrigin::Signed(caller.clone()), collection_id, nft_metadata);

        assert!(OwnedNFTs::<T>::contains_key(&caller));
    }

    #[benchmark]
    fn transfer_nft() {
        let caller: T::AccountId = whitelisted_caller();
        let receiver: T::AccountId = whitelisted_caller();
        let collection_id = H256::zero();
        let nft_item = (collection_id, 0u32);
        let share = 100u8;

        // Setup: Mint an NFT for the caller
        let nft_info = NftInfo {
            merged_nft: None,
            sub_nfts: BoundedVec::default(),
            metadata: vec![0; 32].try_into().unwrap(),
        };
        NFTDetails::<T>::insert(nft_item, nft_info);
        
        let mut owned_nfts = BoundedVec::<NftItemWithShare, MaxNftsLength>::default();
        owned_nfts.try_push((collection_id, 0u32, 100u8)).unwrap();
        OwnedNFTs::<T>::insert(&caller, owned_nfts);

        let mut nft_owners = BoundedVec::<T::AccountId, MaxNftOwners>::default();
        nft_owners.try_push(caller.clone()).unwrap();
        NFTOwners::<T>::insert(nft_item, nft_owners);

        #[extrinsic_call]
        transfer_nft(RawOrigin::Signed(caller), receiver.clone(), nft_item, share);

        assert!(OwnedNFTs::<T>::contains_key(&receiver));
    }

    #[benchmark]
    fn merge_nfts() {
        let caller: T::AccountId = whitelisted_caller();
        let collection_id = H256::zero();
        let nft_items: BoundedVec<NftItem, MaxSubNftsLength> = vec![(collection_id, 0u32), (collection_id, 1u32)].try_into().unwrap();

        // Setup: Create two NFTs for the caller
        for &nft_item in nft_items.iter() {
            let nft_info = NftInfo {
                merged_nft: None,
                sub_nfts: BoundedVec::default(),
                metadata: vec![0; 32].try_into().unwrap(),
            };
            NFTDetails::<T>::insert(nft_item, nft_info);
            
            let mut nft_owners = BoundedVec::<T::AccountId, MaxNftOwners>::default();
            nft_owners.try_push(caller.clone()).unwrap();
            NFTOwners::<T>::insert(nft_item, nft_owners);
        }

        #[extrinsic_call]
        merge_nfts(RawOrigin::Signed(caller), nft_items);

        assert!(NFTDetails::<T>::get((collection_id, 0u32)).unwrap().merged_nft.is_some());
    }

    #[benchmark]
    fn split_nft() {
        let caller: T::AccountId = whitelisted_caller();
        let collection_id = H256::zero();
        let nft_item = (collection_id, 0u32);
        let sub_nfts: BoundedVec<NftItem, MaxSubNftsLength> = vec![(collection_id, 0u32), (collection_id, 1u32), (collection_id, 2u32)].try_into().unwrap();

        // Setup: Create a merged NFT
        let nft_info = NftInfo {
            merged_nft: Some(nft_item),
            sub_nfts: sub_nfts.clone(),
            metadata: vec![0; 32].try_into().unwrap(),
        };
        NFTDetails::<T>::insert(nft_item, nft_info);

        let mut nft_owners = BoundedVec::<T::AccountId, MaxNftOwners>::default();
        nft_owners.try_push(caller.clone()).unwrap();
        NFTOwners::<T>::insert(nft_item, nft_owners);

        #[extrinsic_call]
        split_nft(RawOrigin::Signed(caller), nft_item);

        assert!(NFTDetails::<T>::get(nft_item).unwrap().merged_nft.is_none());
    }
}