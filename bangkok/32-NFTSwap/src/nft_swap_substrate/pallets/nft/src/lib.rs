#![cfg_attr(not(feature = "std"), no_std)]

/// A module for NFT
pub use pallet::*;

pub mod weights;
pub use weights::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

#[frame_support::pallet]
pub mod pallet {
        use super::*;
        use frame_system::pallet_prelude::*;
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

        #[pallet::config]
        pub trait Config: frame_system::Config {
            type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		    /// Weights required by the dispatchables
		    type WeightInfo: WeightInfo;
        }

        #[pallet::pallet]
        pub struct Pallet<T>(_);

        /// The collection id array.
        #[pallet::storage]
        pub type NFTCollectionIds<T: Config> = StorageValue<_, BoundedVec<H256, MaxCollectionsLength>>;

        /// The detail of a collection.
        #[pallet::storage]
        pub type NFTCollections<T: Config> = StorageMap<
            _,
            Blake2_128Concat,
            H256, // collection
            (u32, u32, BoundedVec<u8, MaxMetadataLength>), // (max_items, cur_item_index, collecton_metadata)
        >;

        /// The NFTs owned by an account. 
        #[pallet::storage]
        pub type OwnedNFTs<T: Config> = StorageMap<
            _,
            Blake2_128Concat,
            T::AccountId,
            BoundedVec<NftItemWithShare, MaxNftsLength>, // (collection, item_id, share)
        >;

        #[derive(Clone, Encode, Decode, PartialEq, Eq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
        pub struct NftInfo {
            pub merged_nft: Option<NftItem>, // for sub nft, record merged nft
            pub sub_nfts: BoundedVec<NftItem, MaxSubNftsLength>, // for merged nft, record sub nfts
            pub metadata: BoundedVec<u8, MaxMetadataLength>, // nft metadata
        }

        /// The details of an NFT.
        #[pallet::storage]
        pub type NFTDetails<T: Config> = StorageMap<
            _,
            Blake2_128Concat,
            NftItem,
            NftInfo
        >;

        /// The owner of an NFT.
        #[pallet::storage]
        pub type NFTOwners<T: Config> = StorageMap<
            _,
            Blake2_128Concat,
            NftItem,
            BoundedVec<T::AccountId, MaxNftOwners>, // nft owners
        >;

        #[pallet::event]
        #[pallet::generate_deposit(pub(super) fn deposit_event)]
        pub enum Event<T: Config> {
            /// A collection was created.
            NFTCollectionCreated(T::AccountId, H256, u32), // account, collection, max_items
            /// An NFT was minted.
            NFTMinted(T::AccountId, NftItem),
            /// An NFT was transfered.
            NFTTransferred(T::AccountId, T::AccountId, NftItem),
            /// An NFT was merged.
            NFTMerged(T::AccountId, NftItem, BoundedVec::<NftItem, MaxSubNftsLength>),
            /// An NFT was splited.
            NFTSplited(T::AccountId, NftItem, BoundedVec::<NftItem, MaxSubNftsLength>),
        }

        #[pallet::error]
        pub enum Error<T> {
            /// The collection already exists.
            CollectionAlreadyExists,
            /// The collection is not found.
            CollectionNotFound,
            /// The number of collections has exceeded the maximum limit.
            CollectionExceeds,
            /// The NFT already exists.
            NFTAlreadyExists,
            /// The NFT is not found.
            NFTNotFound,
            /// The number of NFTs has exceeded the maximum limit.
            NFTExceeds,
            /// The owner of NFT is not the signed account.
            NotOwner,
            /// The NFT already merged.
            NFTAlreadyMerged,
            /// No sub NFTs when the NFT is merged.
            NFTNoSubNfts,
            /// The NFT is not merged.
            NFTNotMerged,
            /// The NFT is not the merged NFT.
            NFTIsNotTheMerged,
            /// The NFT is frozen.
            NFTIsFrozen,
            /// The NFT has not enough share.
            NFTNotEnoughShare,
            /// The NFT can not be merged or splited.
            NFTCanNotMergeOrSplit,
        }

        #[pallet::call]
        impl<T: Config> Pallet<T> {
            /// Create an NFT collection.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `max_items`: The maximum NFT number of the collection.
            /// - `metadata`: The collection metadata.
            ///
            /// Emits `NFTCollectionCreated` event when successful.
            #[pallet::call_index(0)]
            #[pallet::weight(T::WeightInfo::create_collection())]
            pub fn create_collection(origin: OriginFor<T>, max_items: u32, metadata: BoundedVec<u8, MaxMetadataLength>) -> DispatchResult {
                let sender = ensure_signed(origin)?;
                let collection_id_array = blake2_256(&metadata);
                let collection_id = H256::from_slice(&collection_id_array);

                ensure!(!NFTCollections::<T>::contains_key(&collection_id), Error::<T>::CollectionAlreadyExists);

                NFTCollections::<T>::insert(&collection_id, (max_items, 0, metadata));
                NFTCollectionIds::<T>::mutate(|col| {
                    if col.is_none() {
                        *col = Some(BoundedVec::<H256, MaxCollectionsLength>::default());
                    }
                    if let Some(col_value) = col {
                        col_value.try_push(collection_id).unwrap_or_default();
                    }
                });

                Self::deposit_event(Event::NFTCollectionCreated(sender, collection_id, max_items));
                Ok(())
            }

            /// Mint an NFT.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `collection_id`: The collection id of an NFT.
            /// - `metadata`: The NFT metadata.
            ///
            /// Emits `NFTMinted` event when successful.
            #[pallet::call_index(1)]
            #[pallet::weight(T::WeightInfo::mint_nft())]
            pub fn mint_nft(origin: OriginFor<T>, collection_id: H256, metadata: BoundedVec<u8, MaxMetadataLength>) -> DispatchResult {
                let sender = ensure_signed(origin)?;

                ensure!(NFTCollections::<T>::contains_key(&collection_id), Error::<T>::CollectionNotFound);

                let (max_items, cur_item_index, collection_metadata) = NFTCollections::<T>::get(&collection_id).ok_or(Error::<T>::CollectionNotFound)?;
                ensure!(cur_item_index < max_items, Error::<T>::NFTExceeds);

                let nft_item = (collection_id, cur_item_index);
                let nft_item_with_share = (collection_id, cur_item_index, 100);
                OwnedNFTs::<T>::mutate(&sender, |nfts| {
                    if nfts.is_none() {
                        *nfts = Some(BoundedVec::<NftItemWithShare, MaxNftsLength>::default());
                    }
                    if let Some(nfts_value) = nfts {
                        nfts_value.try_push(nft_item_with_share).unwrap_or_default();
                    }
                });

                let nft_info = NftInfo {
                    merged_nft: None,
                    sub_nfts: BoundedVec::default(),
                    metadata: metadata,
                };
                NFTDetails::<T>::insert(nft_item, nft_info);
                NFTOwners::<T>::mutate(&nft_item, |accounts| {
                    if accounts.is_none() {
                        *accounts = Some(BoundedVec::<T::AccountId, MaxNftOwners>::default());
                    }
                    if let Some(accounts_value) = accounts {
                        accounts_value.try_push(sender.clone()).unwrap_or_default();
                    }
                });
                NFTCollections::<T>::insert(&collection_id, (max_items, cur_item_index + 1, collection_metadata));

                Self::deposit_event(Event::NFTMinted(sender, nft_item));
                Ok(())
            }

            /// Transfer an NFT.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `to`: The target account id for the transfer.
            /// - `nft_item`: The NFT to transfer.
            /// - `share`: The NFT share to transfer.
            ///
            /// Emits `NFTTransferred` event when successful.
            #[pallet::call_index(2)]
            #[pallet::weight(T::WeightInfo::transfer_nft())]
            pub fn transfer_nft(origin: OriginFor<T>, to: T::AccountId, nft_item: NftItem, share: u8) -> DispatchResult {
                let sender = ensure_signed(origin)?;

                // Retrieve NFT details and ensure the NFT exists
                let nft_details = NFTDetails::<T>::get(nft_item).ok_or(Error::<T>::NFTNotFound)?;
                if let Some(merged_nft) = nft_details.merged_nft {
                    ensure!(merged_nft == nft_item, Error::<T>::NFTIsFrozen);
                }

                // Retrieve sender's owned NFTs
                let mut sender_owned_nfts = OwnedNFTs::<T>::get(&sender).ok_or(Error::<T>::NFTNotFound)?;
                let sender_nft_item_with_share_index = sender_owned_nfts.iter()
                    .position(|&nft| nft.0 == nft_item.0 && nft.1 == nft_item.1)
                    .ok_or(Error::<T>::NotOwner)?;
                let sender_nft_item_with_share = sender_owned_nfts[sender_nft_item_with_share_index];
                ensure!(sender_nft_item_with_share.2 >= share, Error::<T>::NFTNotEnoughShare);

                let mut remove_sender_nft = false;
                // Update sender's owned NFTs
                if sender_nft_item_with_share.2 == share {
                    sender_owned_nfts.remove(sender_nft_item_with_share_index);
                    remove_sender_nft = true;
                } else {
                    sender_owned_nfts[sender_nft_item_with_share_index].2 -= share;
                }
                OwnedNFTs::<T>::insert(&sender, sender_owned_nfts);

                // Retrieve receiver's owned NFTs
                let mut receiver_owned_nfts = OwnedNFTs::<T>::get(&to).unwrap_or_default();
                let receiver_nft_item_with_share = receiver_owned_nfts.iter_mut()
                    .find(|nft| nft.0 == nft_item.0 && nft.1 == nft_item.1);
            
                // Update receiver's owned NFTs
                if let Some(nft_item_with_share) = receiver_nft_item_with_share {
                    nft_item_with_share.2 += share;
                } else {
                    receiver_owned_nfts.try_push((nft_item.0, nft_item.1, share)).unwrap_or_default();
                }
                OwnedNFTs::<T>::insert(&to, receiver_owned_nfts);
            
                // Update NFT owners
                let mut nft_owners = NFTOwners::<T>::get(nft_item).ok_or(Error::<T>::NFTNotFound)?;
                if !nft_owners.contains(&to) {
                    nft_owners.try_push(to.clone()).unwrap_or_default();
                }
                if remove_sender_nft {
                    nft_owners.retain(|owner| *owner != sender);
                }
                NFTOwners::<T>::insert(&nft_item, nft_owners);

                Self::deposit_event(Event::NFTTransferred(sender, to, nft_item));
                Ok(())
            }

            /// Merge NFTs.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `nft_items`: The NFTs to be merged.
            ///
            /// Emits `NFTMerged` event when successful.
            #[pallet::call_index(3)]
            #[pallet::weight(T::WeightInfo::merge_nfts())]
            pub fn merge_nfts(origin: OriginFor<T>, nft_items: BoundedVec::<NftItem, MaxSubNftsLength>) -> DispatchResult {
                let sender = ensure_signed(origin)?;
                let mut sub_nfts: BoundedVec::<NftItem, MaxSubNftsLength> = BoundedVec::<NftItem, MaxSubNftsLength>::default();
                let mut merged_nft: NftItem = NftItem::default();

                ensure!(nft_items.len() > 1, Error::<T>::NFTNoSubNfts);

                for (index, nft_item) in nft_items.iter().enumerate() {
                    let mut nft_details = NFTDetails::<T>::get(nft_item).ok_or(Error::<T>::NFTNotFound)?;
                    ensure!(nft_details.merged_nft.is_none(), Error::<T>::NFTAlreadyMerged);

                    if index == 0 {
                        merged_nft = *nft_item;
                        for nft in &nft_items {
                            sub_nfts.try_push(*nft).unwrap_or_default();
                        }
                    }

                    let accounts = NFTOwners::<T>::get(nft_item).ok_or(Error::<T>::NFTNotFound)?;
                    ensure!(accounts.len() == 1, Error::<T>::NFTCanNotMergeOrSplit);
                    nft_details.merged_nft = Some(merged_nft);
                    NFTDetails::<T>::mutate(nft_item, |details_wrap| {
                        if let Some(details) = details_wrap {
                            details.merged_nft = Some(merged_nft);
                            if index == 0 {
                                details.sub_nfts = sub_nfts.clone();
                            }
                        }
                    });
                }

                Self::deposit_event(Event::NFTMerged(sender, merged_nft, sub_nfts));
                Ok(())
            }

            /// Split the merged NFT.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `nft_item`: The merged NFT to be splited.
            ///
            /// Emits `NFTSplited` event when successful.
            #[pallet::call_index(4)]
            #[pallet::weight(T::WeightInfo::split_nft())]
            pub fn split_nft(origin: OriginFor<T>, nft_item: NftItem) -> DispatchResult {
                let sender = ensure_signed(origin)?;
                let nft_details = NFTDetails::<T>::get(nft_item).ok_or(Error::<T>::NFTNotFound)?;
                let sub_nfts = nft_details.sub_nfts.clone();

                ensure!(!nft_details.merged_nft.is_none(), Error::<T>::NFTNotMerged);
                if let Some(merged_nft) = nft_details.merged_nft {
                    ensure!(nft_item == merged_nft, Error::<T>::NFTIsNotTheMerged);
                }

                let accounts = NFTOwners::<T>::get(nft_item).ok_or(Error::<T>::NFTNotFound)?;
                ensure!(accounts.len() == 1, Error::<T>::NFTCanNotMergeOrSplit);

                for (index, sub_nft_item) in sub_nfts.iter().enumerate() {
                    NFTDetails::<T>::mutate(sub_nft_item, |details_wrap| {
                        if let Some(details) = details_wrap {
                            if index == 0 {
                                details.sub_nfts.clear();
                            }
                            details.merged_nft = None;
                        }
                    });
                }

                Self::deposit_event(Event::NFTSplited(sender, nft_item, sub_nfts));
                Ok(())
            }
        }
}
