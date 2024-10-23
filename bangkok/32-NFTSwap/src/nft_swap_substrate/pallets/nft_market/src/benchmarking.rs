#![cfg(feature = "runtime-benchmarks")]

use super::*;

use frame_benchmarking::v2::*;
use frame_system::RawOrigin;
use frame_support::traits::Currency;
use frame_support::{BoundedVec,  pallet_prelude::Get};
use sp_std::vec;
use sp_core::hashing::blake2_256;
use sp_core::H256;
use frame_support::pallet_prelude::*;
use pallet_nft::{NFTOwners, OwnedNFTs};

type MaxNftOwners = ConstU32<10>;
type MaxNftsLength = ConstU32<10000>;

#[benchmarks]
mod benchmarks {
    use super::*;

    #[benchmark]
    fn list_nft() {
        let caller: T::AccountId = whitelisted_caller();

        let collection_id = H256::zero();
        let item_id = 0u32;
        let share = 40;
        let price = BalanceOf::<T>::from(100u32);

        let mut nft_owners = BoundedVec::<T::AccountId, MaxNftOwners>::default();
        nft_owners.try_push(caller.clone()).unwrap();
        NFTOwners::<T>::insert((collection_id, item_id), nft_owners);

        let mut owned_nfts = BoundedVec::try_from(vec![(collection_id, item_id, 100)]).unwrap();
        OwnedNFTs::<T>::insert(caller.clone(), owned_nfts);

        #[extrinsic_call]
        _(RawOrigin::Signed(caller), (collection_id, item_id, share), price);
    }
}

