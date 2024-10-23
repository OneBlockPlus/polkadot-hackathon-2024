#![cfg_attr(not(feature = "std"), no_std)]

/// A module for NFT Market
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
        use frame_support::traits::OriginTrait;
        use frame_system::pallet_prelude::*;
        use frame_support::pallet_prelude::*;
        use frame_support::traits::Currency;
        use frame_support::sp_runtime::traits::Zero;
        use sp_core::H256;
        use scale_info::TypeInfo;
        use scale_info::prelude::fmt;
        use pallet_nft::{Pallet as NftPallet, NFTOwners, OwnedNFTs};
        type MaxNftsLength = ConstU32<10000>;
        type MaxOfferNftsLength = ConstU32<10>;
        type NftItemWithShare = (H256, u32, u8);
        pub type BalanceOf<T> = <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;


        /// The module configuration trait.
        #[pallet::config]
        pub trait Config: frame_system::Config + pallet_nft::Config + TypeInfo + fmt::Debug {
            type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
            type Currency: frame_support::traits::Currency<Self::AccountId>;
		    /// Weights required by the dispatchables
		    type WeightInfo: WeightInfo;
        }

        #[pallet::pallet]
        pub struct Pallet<T>(_);

        #[derive(Clone, Encode, Decode, PartialEq, Eq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
        pub struct Offer<T: Config> {
            pub offered_nfts: BoundedVec<NftItemWithShare, MaxOfferNftsLength>,
            pub token_amount: BalanceOf<T>,
            pub buyer: T::AccountId,
        }

        #[derive(Clone, Encode, Decode, PartialEq, Eq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
        pub struct ListInfo<T: Config> {
            pub owner: T::AccountId,
            pub price: BalanceOf<T>,
        }

        /// The listed NFTs, account and the list infos
        #[pallet::storage]
        pub type Listings<T: Config> = StorageDoubleMap<
            _,
            Twox64Concat,
            NftItemWithShare,
            Twox64Concat,
            T::AccountId,
            ListInfo<T>,
        >;

        /// Offers for listed NFTs
        #[pallet::storage]
        pub type Offers<T: Config> = StorageDoubleMap<
            _,
            Twox64Concat,
            NftItemWithShare,
            Twox64Concat,
            T::AccountId,
            BoundedVec<Offer<T>, MaxNftsLength>,
        >;

        #[pallet::event]
        #[pallet::generate_deposit(pub(super) fn deposit_event)]
        pub enum Event<T: Config> {
            /// An NFT was listed.
            NftListed(T::AccountId, NftItemWithShare),
            /// An NFT was unlisted.
            NftUnlisted(T::AccountId, NftItemWithShare),
            /// Buy NFT success.
            BuySuccess(NftItemWithShare, T::AccountId, BalanceOf<T>),
            /// An NFT offer was palced.
            OfferPlaced(NftItemWithShare, T::AccountId, Offer<T>),
            /// An NFT offer was palced.
            OfferCanceled(NftItemWithShare, T::AccountId, Offer<T>),
            /// An NFT offer was accepted.
            OfferAccepted(T::AccountId, NftItemWithShare, T::AccountId, Offer<T>),
            /// An NFT offer was rejected.
            OfferRejected(T::AccountId, NftItemWithShare, T::AccountId, Offer<T>),
        }

        #[pallet::error]
        pub enum Error<T> {
            /// The NFT is not found.
            NFTNotFound,
            /// The owner of NFT is not the signed account.
            NotOwner,
            /// The NFT has been already listed.
            NftAlreadyListed,
            /// The NFT has not been listed.
            NotListed,
            /// The NFT offer has not been placed.
            NotOffered,
            /// Token amount is insufficient.
            InsufficientBalance,
            /// The share of NFT is not enough.
            ShareNotEnough,
        }

        #[pallet::call]
        impl<T: Config> Pallet<T> {
            /// List an NFT so that others can buy it.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `nft_item_with_share`: The NFT to be listed.
            /// - `price`: Price of the NFT.
            ///
            /// Emits `NftListed` event when successful.
            #[pallet::call_index(0)]
            #[pallet::weight(<T as pallet::Config>::WeightInfo::list_nft())]
            pub fn list_nft(origin: OriginFor<T>, nft_item_with_share: NftItemWithShare, price: BalanceOf<T>) -> DispatchResult {
                let sender = ensure_signed(origin)?;
                let nft_item = (nft_item_with_share.0, nft_item_with_share.1);
                let share = nft_item_with_share.2;
                ensure!(NFTOwners::<T>::contains_key(nft_item), Error::<T>::NFTNotFound);
                let owned_nfts_with_share = OwnedNFTs::<T>::get(sender.clone()).ok_or(Error::<T>::NotOwner)?;
                let owned_nft_with_share = owned_nfts_with_share.iter().find(|owned_nft| {
                    owned_nft.0 == nft_item.0 && owned_nft.1 == nft_item.1}).ok_or(Error::<T>::NotOwner)?;
                ensure!(owned_nft_with_share.2 >= share, Error::<T>::ShareNotEnough);

                let list_info = ListInfo {
                    owner: sender.clone(),
                    price,
                };
                let nft_item_with_share = (nft_item.0, nft_item.1, share);
                Listings::<T>::insert(nft_item_with_share, sender.clone(), &list_info);

                Self::deposit_event(Event::NftListed(sender.clone(), nft_item_with_share));

                Ok(())
            }

            /// Unlist an NFT.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `nft_item_with_share`: The NFT to be unlisted.
            ///
            /// Emits `NftUnlisted` event when successful.
            #[pallet::call_index(1)]
            #[pallet::weight({10_000})]
            pub fn unlist_nft(origin: OriginFor<T>, nft_item_with_share: NftItemWithShare) -> DispatchResult {
                let sender = ensure_signed(origin)?;
                let nft_item = (nft_item_with_share.0, nft_item_with_share.1);
                ensure!(NFTOwners::<T>::contains_key(nft_item), Error::<T>::NFTNotFound);

                Listings::<T>::remove(nft_item_with_share, sender.clone());
                Offers::<T>::remove(nft_item_with_share, sender.clone());

                Self::deposit_event(Event::NftUnlisted(sender, nft_item_with_share));

                Ok(())
            }

            /// Buy an NFT.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `nft_item_with_share`: The NFT to buy.
            /// - `seller`: Seller of the NFT.
            ///
            /// Emits `BuySucess` event when successful.
            #[pallet::call_index(2)]
            #[pallet::weight({10_000})]
            pub fn buy_nft(origin: OriginFor<T>, nft_item_with_share: NftItemWithShare, seller: T::AccountId) -> DispatchResult {
                let buyer = ensure_signed(origin.clone())?;
                let nft_item = (nft_item_with_share.0, nft_item_with_share.1);
                let share = nft_item_with_share.2;
                let list_info = Listings::<T>::get(nft_item_with_share, seller.clone()).ok_or(Error::<T>::NotListed)?;
                let buyer_balance = T::Currency::free_balance(&buyer.clone());

                ensure!(buyer_balance >= list_info.price, Error::<T>::InsufficientBalance);
                T::Currency::transfer(&buyer.clone(), &seller.clone(), list_info.price, frame_support::traits::ExistenceRequirement::AllowDeath)?;
                let seller_origin = frame_system::RawOrigin::Signed(seller.clone()).into();
                NftPallet::<T>::transfer_nft(seller_origin, buyer.clone(), nft_item, share)?;

                Listings::<T>::remove(nft_item_with_share, seller.clone());

                Self::deposit_event(Event::BuySuccess(nft_item_with_share, seller, list_info.price));
                Ok(())
            }

            /// Provide an offer to buy an NFT.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `nft_item_with_share`: The NFT to be purchased.
            /// - `offered_nfts`: The NFTs that needs to be used as an offer.
            /// - `token_amount`: The token amount that needs to be used as an offer.
            /// - `seller`: Seller of the NFT.
            ///
            /// Emits `OfferPlaced` event when successful.
            #[pallet::call_index(3)]
            #[pallet::weight({10_000})]
            pub fn place_offer(origin: OriginFor<T>,
                               nft_item_with_share: NftItemWithShare,
                               offered_nfts: BoundedVec<NftItemWithShare, MaxOfferNftsLength>,
                               token_amount: BalanceOf<T>,
                               seller: T::AccountId) -> DispatchResult {
                let sender = ensure_signed(origin)?;
                ensure!(Listings::<T>::contains_key(nft_item_with_share, seller.clone()), Error::<T>::NotListed);

                let owned_nfts_with_share = OwnedNFTs::<T>::get(sender.clone()).unwrap_or_default();
                for offered_nft_item_with_share in offered_nfts.clone().into_iter() {
                    let offered_nft_item = (offered_nft_item_with_share.0, offered_nft_item_with_share.1);
                    ensure!(NFTOwners::<T>::contains_key(offered_nft_item), Error::<T>::NFTNotFound);
                    let owned_nft_item_with_share = owned_nfts_with_share.iter().find(|nft| nft.0 == offered_nft_item.0 && nft.1 == offered_nft_item.1);
                    if let Some(nft_item_with_share) = owned_nft_item_with_share {
                        ensure!(nft_item_with_share.2 >= offered_nft_item_with_share.2, Error::<T>::ShareNotEnough);
                    } else {
                        return Err(Error::<T>::NotOwner.into());
                    }
                }

                let offer_item = Offer {
                    offered_nfts,
                    token_amount,
                    buyer: sender.clone(),
                };

                Offers::<T>::mutate(nft_item_with_share, seller, |offer_items| {
                    if offer_items.is_none() {
                        *offer_items = Some(BoundedVec::<Offer<T>, MaxNftsLength>::default());
                    }
                    if let Some(offer_items_value) = offer_items {
                        offer_items_value.try_push(offer_item.clone()).unwrap_or_default();
                    }
                });

                Self::deposit_event(Event::OfferPlaced(nft_item_with_share, sender, offer_item));
                Ok(())
            }

            /// Cancel an NFT offer.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `nft_item_with_share`: The NFT to be purchased.
            /// - `offered_nfts`: The NFTs that needs to be used as an offer.
            /// - `token_amount`: The token amount that needs to be used as an offer.
            /// - `seller`: Seller of the NFT.
            ///
            /// Emits `OfferCanceled` event when successful.
            #[pallet::call_index(4)]
            #[pallet::weight({10_000})]
            pub fn cancel_offer(origin: OriginFor<T>,
                                nft_item_with_share: NftItemWithShare,
                                offered_nfts: BoundedVec<NftItemWithShare, MaxOfferNftsLength>,
                                token_amount: BalanceOf<T>,
                                seller: T::AccountId) -> DispatchResult {
                let sender = ensure_signed(origin)?;
                ensure!(Listings::<T>::contains_key(nft_item_with_share, seller.clone()), Error::<T>::NotListed);

                let owned_nfts_with_share = OwnedNFTs::<T>::get(sender.clone()).unwrap_or_default();
                for offered_nft_item_with_share in offered_nfts.clone().into_iter() {
                    let offered_nft_item = (offered_nft_item_with_share.0, offered_nft_item_with_share.1);
                    ensure!(NFTOwners::<T>::contains_key(offered_nft_item), Error::<T>::NFTNotFound);
                    let owned_nft_item_with_share = owned_nfts_with_share.iter().find(|nft| nft.0 == offered_nft_item.0 && nft.1 == offered_nft_item.1);
                    if let Some(nft_item_with_share) = owned_nft_item_with_share {
                        ensure!(nft_item_with_share.2 >= offered_nft_item_with_share.2, Error::<T>::ShareNotEnough);
                    } else {
                        return Err(Error::<T>::NotOwner.into());
                    }
                }

                let offer_item = Offer {
                    offered_nfts,
                    token_amount,
                    buyer: sender.clone(),
                };

                Offers::<T>::mutate(nft_item_with_share, seller, |offer_items| {
                    if let Some(offer_items_value) = offer_items {
                        if let Some(index) = offer_items_value.iter().position(|x| *x == offer_item) {
                            offer_items_value.remove(index);
                        } else {
                            return Err(Error::<T>::NotOffered);
                        }
                    }
                    Ok(())
                })?;

                Self::deposit_event(Event::OfferCanceled(nft_item_with_share, sender, offer_item));
                Ok(())
            }

            /// Accept an offer.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `nft_item_with_share`: The NFT for sale.
            /// - `offered_nfts`: The NFTs that needs to be used as an offer.
            /// - `offered_token_amount`: The token amount that needs to be used as an offer.
            /// - `buyer`: Buyer of the NFT.
            ///
            /// Emits `OfferAccepted` event when successful.
            #[pallet::call_index(5)]
            #[pallet::weight({10_000})]
            pub fn accept_offer(origin: OriginFor<T>,
                                nft_item_with_share: NftItemWithShare,
                                offered_nfts: BoundedVec<NftItemWithShare, MaxOfferNftsLength>,
                                offered_token_amount: BalanceOf<T>,
                                buyer: T::AccountId) -> DispatchResult {
                let sender = ensure_signed(origin.clone())?;
                let offers = Offers::<T>::get(nft_item_with_share, sender.clone()).ok_or(Error::<T>::NotOffered)?;
                let offer = offers.iter().find(|offer| {
                    offer.buyer == buyer && offer.offered_nfts == offered_nfts && offer.token_amount == offered_token_amount
                    }).ok_or(Error::<T>::NotOffered)?;

                NftPallet::<T>::transfer_nft(origin.clone(), buyer.clone(), (nft_item_with_share.0, nft_item_with_share.1), nft_item_with_share.2)?;
                for offered_nft_item in offered_nfts.clone().into_iter() {
                    NftPallet::<T>::transfer_nft(OriginFor::<T>::signed(buyer.clone()), sender.clone(), (offered_nft_item.0, offered_nft_item.1), offered_nft_item.2)?;
                }

                if offered_token_amount > BalanceOf::<T>::zero() {
                   let buyer_balance = T::Currency::free_balance(&buyer.clone());
                   ensure!(buyer_balance >= offered_token_amount, Error::<T>::InsufficientBalance);
                   T::Currency::transfer(&buyer.clone(), &sender.clone(), offered_token_amount, frame_support::traits::ExistenceRequirement::AllowDeath)?;
                }

                Listings::<T>::remove(nft_item_with_share, sender.clone());
                Offers::<T>::remove(nft_item_with_share, sender.clone());

                Self::deposit_event(Event::OfferAccepted(sender, nft_item_with_share, buyer, offer.clone()));
                Ok(())
            }

            /// Reject an offer.
            ///
            /// The origin must be signed.
            ///
            /// Parameters:
            /// - `nft_item_with_share`: The NFT for sale.
            /// - `offered_nfts`: The NFTs that needs to be used as an offer.
            /// - `offered_token_amount`: The token amount that needs to be used as an offer.
            /// - `buyer`: Buyer of the NFT.
            ///
            /// Emits `OfferRejected` event when successful.
            #[pallet::call_index(6)]
            #[pallet::weight({10_000})]
            pub fn reject_offer(origin: OriginFor<T>,
                                nft_item_with_share: NftItemWithShare,
                                offered_nfts: BoundedVec<NftItemWithShare, MaxOfferNftsLength>,
                                offered_token_amount: BalanceOf<T>,
                                buyer: T::AccountId) -> DispatchResult {
                let sender = ensure_signed(origin.clone())?;
                let mut offers = Offers::<T>::get(nft_item_with_share, sender.clone()).ok_or(Error::<T>::NotOffered)?;
                let mut remove_offer_wrap: Option<Offer<T>> = None;
                for (i, offer) in offers.clone().into_iter().enumerate() {
                    if offer.buyer == buyer && offer.offered_nfts == offered_nfts && offer.token_amount == offered_token_amount {
                        offers.remove(i);
                        remove_offer_wrap = Some(offer);
                        break;
                    }
                }
                if let Some(remove_offer) = remove_offer_wrap {
                    Offers::<T>::insert(nft_item_with_share, sender.clone(), offers);
                    Self::deposit_event(Event::OfferRejected(sender, nft_item_with_share, buyer, remove_offer));
                    Ok(())
                } else {
                    return Err(Error::<T>::NotOffered.into());
                }
            }
        }
}
