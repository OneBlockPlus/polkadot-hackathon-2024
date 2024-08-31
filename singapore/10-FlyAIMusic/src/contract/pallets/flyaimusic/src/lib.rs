#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

// #[cfg(test)]
// mod mock;

// #[cfg(test)]
// mod tests;

// #[cfg(feature = "runtime-benchmarks")]
// mod benchmarking;
// pub mod weights;
// pub use weights::*;

#[frame_support::pallet]
pub mod pallet {
    use super::*;
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;

    use frame_support::traits::{Currency, ExistenceRequirement};
    use frame_support::PalletId;
    use sp_runtime::traits::AccountIdConversion;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    pub type TokenId = u64;

    pub type BalanceOf<T> = <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

    /// 音乐信息
    #[derive(Encode, Decode, Clone, PartialEq, Eq, Default, TypeInfo, MaxEncodedLen)]
    pub struct AiMisic<T: Config> {
        token_id: TokenId,
        url: BoundedVec<u8, ConstU32<256>>,
        price: BalanceOf<T>,
        author: T::AccountId,
    }

    /// 查询下一个token id
    #[pallet::storage]
    #[pallet::getter(fn next_key)]
    pub type NextTokenId<T> = StorageValue<_, u64, ValueQuery>;

    /// 音乐列表
    #[pallet::storage]
    #[pallet::getter(fn music_list)]
    pub type MusicList<T: Config> = StorageMap<_, Blake2_128Concat, TokenId, AiMisic<T>>;

    /// nft 所有者
    #[pallet::storage]
    #[pallet::getter(fn token_owner)]
    pub type TokenOwner<T: Config> = StorageMap<_, Blake2_128Concat, TokenId, T::AccountId>;

    /// 所有者拥有的token数量
    #[pallet::storage]
    #[pallet::getter(fn owned_tokens_count)]
    pub type OwnedTokensCount<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, u32>;

    /// 除了owner外的token授权者
    #[pallet::storage]
    #[pallet::getter(fn token_approvals)]
    pub type TokenApprovals<T: Config> = StorageMap<_, Blake2_128Concat, TokenId, T::AccountId>;

    /// 所有者将token授权给其他人的权限（所有者，其他人）
    #[pallet::storage]
    #[pallet::getter(fn operator_approvals)]
    pub type OperatorApprovals<T: Config> =
        StorageMap<_, Blake2_128Concat, (T::AccountId, T::AccountId), ()>;

    #[pallet::config]
    pub trait Config: frame_system::Config + TypeInfo {
        /// The overarching runtime event type.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        type Currency: Currency<Self::AccountId>;
        #[pallet::constant]
        type Price:Get<BalanceOf<Self>>;
        type MyPalletId: Get<PalletId>;
    }

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        MusicUploaded(TokenId),
        BuyMusic(TokenId),
        NftTransfer {
            from: Option<T::AccountId>,
            to: Option<T::AccountId>,
            id: TokenId,
        },
        ApprovalForAll {
            owner: T::AccountId,
            operator: T::AccountId,
            approved: bool,
        },
        Approval {
            from: T::AccountId,
            to: T::AccountId,
            id: TokenId,
        },
    }

    #[pallet::error]
    pub enum Error<T> {
        MusicNotFound,
        NotOwner,
        NotApproved,
        TokenExists,
        TokenNotFound,
        CannotInsert,
        CannotFetchValue,
        NotAllowed,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {

        /// 上传音乐 创建nft的tokenId
        #[pallet::call_index(0)]
        #[pallet::weight(0)]
        pub fn upload_music(
            origin: OriginFor<T>,
            url: BoundedVec<u8, ConstU32<256>>,
        ) -> DispatchResult {
            // Check that the extrinsic was signed and get the signer.
            let who = ensure_signed(origin)?;
            let token_id = Self::get_next_key();
            let music = AiMisic {
                token_id,
                url,
                price: T::Price::get(),
                author: who.clone(),
            };
            // let p:BalanceOf<T> = 1000u32.into();
            T::Currency::transfer(&who, &Self::get_account_id(), music.price, ExistenceRequirement::KeepAlive)?;
            MusicList::<T>::insert(token_id, music);
            //NextKey 添加数据id
            NextTokenId::<T>::set(token_id);
            Self::add_token_to(&who, token_id)?;
            Self::deposit_event(Event::MusicUploaded(token_id));
            // Return a successful `DispatchResult`
            Ok(())
        }

        /// 购买音乐
        #[pallet::call_index(1)]
        #[pallet::weight(0)]
        pub fn buy(origin: OriginFor<T>, id: u64) -> DispatchResult {
            // Check that the extrinsic was signed and get the signer.
            let who = ensure_signed(origin)?;
            let owner = Self::owner_of(id).ok_or(Error::<T>::TokenNotFound)?;
            Self::deposit_event(Event::BuyMusic(id));
            T::Currency::transfer(&who, &owner, 100u32.into(), ExistenceRequirement::KeepAlive)?;
            // Return a successful `DispatchResult`
            Ok(())
        }

        /// 所有者转移nft
        #[pallet::call_index(2)]
        #[pallet::weight(0)]
        pub fn transfer(origin: OriginFor<T>, to: T::AccountId, id: TokenId) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Self::transfer_token_from(&who, &who, &to, id)?;
            Ok(())
        }

        /// 被授权的账户转移nft
        #[pallet::call_index(3)]
        #[pallet::weight(0)]
        pub fn transfer_from(
            origin: OriginFor<T>,
            from: T::AccountId,
            to: T::AccountId,
            id: TokenId,
        ) -> DispatchResult {
            let caller = ensure_signed(origin)?;
            Self::transfer_token_from(&caller, &from, &to, id)?;
            Ok(())
        }

        /// 设置授权账户，approved控制是否授权
        #[pallet::call_index(4)]
        #[pallet::weight(0)]
        pub fn set_approve_for_all(
            origin: OriginFor<T>,
            to: T::AccountId,
            approved: bool,
        ) -> DispatchResult {
            let caller = ensure_signed(origin)?;
            Self::approve_for_all(&caller, to, approved)?;
            Ok(())
        }

        /// 授权某个tokenId给其他账户
        #[pallet::call_index(5)]
        #[pallet::weight(0)]
        pub fn approve(origin: OriginFor<T>, to: T::AccountId, id: TokenId) -> DispatchResult {
            let who = ensure_signed(origin)?;
            Self::approve_for(&who, &to, id)?;
            Ok(())
        }
        /// approve的反操作，撤销是否授权
        #[pallet::call_index(6)]
        #[pallet::weight(0)]
        pub fn remove_approval(origin: OriginFor<T>, id: TokenId) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let owner = Self::owner_of(id).ok_or(Error::<T>::TokenNotFound)?;
            if !Self::approved_or_owner(&who, id, &owner) {
                return Err(Error::<T>::NotApproved.into());
            };
            Self::clear_approval(id);
            Ok(())
        }
          /// 购买nft音乐
          #[pallet::call_index(7)]
          #[pallet::weight(0)]
          pub fn buy_nft(origin: OriginFor<T>, id: u64) -> DispatchResult {
              // Check that the extrinsic was signed and get the signer.
              let who = ensure_signed(origin)?;
              let owner = Self::owner_of(id).ok_or(Error::<T>::TokenNotFound)?;
              Self::deposit_event(Event::BuyMusic(id));
              T::Currency::transfer(&who, &owner, 100000u32.into(), ExistenceRequirement::KeepAlive)?;
              Self::transfer_token_from(&owner, &owner, &who, id)?;
              // Return a successful `DispatchResult`
              Ok(())
          }
    }

    impl<T: Config> Pallet<T> {
        fn get_next_key() -> u64 {
            NextTokenId::<T>::mutate(|k| k.checked_add(1).unwrap_or(0))
        }

        fn transfer_token_from(
            caller: &T::AccountId,
            from: &T::AccountId,
            to: &T::AccountId,
            id: TokenId,
        ) -> DispatchResult {
            let owner = Self::owner_of(id).ok_or(Error::<T>::TokenNotFound)?;
            if !Self::approved_or_owner(caller, id, &owner) {
                return Err(Error::<T>::NotApproved.into());
            };
            if owner != *from {
                return Err(Error::<T>::NotOwner.into());
            };
            Self::clear_approval(id);
            Self::remove_token_from(from, id)?;
            Self::add_token_to(to, id)?;
            Self::deposit_event(Event::NftTransfer {
                from: Some((*from).clone()),
                to: Some((*to).clone()),
                id,
            });
            Ok(())
        }

        fn approve_for_all(
            caller: &T::AccountId,
            to: T::AccountId,
            approved: bool,
        ) -> DispatchResult {
            if to == *caller {
                return Err(Error::<T>::NotAllowed.into());
            }
            Self::deposit_event(Event::ApprovalForAll {
                owner: (*caller).clone(),
                operator: to.clone(),
                approved,
            });

            if approved {
                OperatorApprovals::<T>::insert((caller, &to), &());
            } else {
                OperatorApprovals::<T>::remove((caller, &to));
            }

            Ok(())
        }

        fn approve_for(caller: &T::AccountId, to: &T::AccountId, id: TokenId) -> DispatchResult {
            let owner = Self::owner_of(id).ok_or(Error::<T>::TokenNotFound)?;
            if !(owner == *caller || Self::approved_for_all(&owner, caller)) {
                return Err(Error::<T>::NotAllowed.into());
            };

            if TokenApprovals::<T>::contains_key(id) {
                return Err(Error::<T>::CannotInsert.into());
            } else {
                TokenApprovals::<T>::insert(id, to);
            }

            Self::deposit_event(Event::Approval {
                from: (*caller).clone(),
                to: (*to).clone(),
                id,
            });

            Ok(())
        }

        fn balance_of_or_zero(of: &T::AccountId) -> u32 {
            OwnedTokensCount::<T>::get(of).unwrap_or(0)
        }

        fn approved_for_all(owner: &T::AccountId, caller: &T::AccountId) -> bool {
            OperatorApprovals::<T>::get((owner, caller)) == Some(())
        }

        fn owner_of(id: TokenId) -> Option<T::AccountId> {
            TokenOwner::<T>::get(id)
        }

        fn approved_or_owner(caller: &T::AccountId, id: TokenId, owner: &T::AccountId) -> bool {
            caller == owner
                || TokenApprovals::<T>::get(id) == Some(caller.clone())
                || OperatorApprovals::<T>::get((owner, caller)) == Some(())
        }
        fn clear_approval(id: TokenId) {
            TokenApprovals::<T>::remove(id);
        }

        fn add_token_to(to: &T::AccountId, id: TokenId) -> DispatchResult {
            if TokenOwner::<T>::contains_key(id) {
                return Err(Error::<T>::TokenExists.into());
            }
            let owned_tokens_count = OwnedTokensCount::<T>::get(to).unwrap_or(0);
            if owned_tokens_count >= 100 {
                return Err(Error::<T>::CannotInsert.into());
            }
            TokenOwner::<T>::insert(id, to);
            OwnedTokensCount::<T>::insert(to, owned_tokens_count + 1);
            Ok(())
        }

        fn remove_token_from(from: &T::AccountId, id: TokenId) -> DispatchResult {
            if !TokenOwner::<T>::contains_key(id) {
                return Err(Error::<T>::TokenNotFound.into());
            }
            let owned_tokens_count = OwnedTokensCount::<T>::get(from).unwrap_or(0);
            if owned_tokens_count == 0 {
                return Err(Error::<T>::CannotFetchValue.into());
            }
            TokenOwner::<T>::remove(id);
            OwnedTokensCount::<T>::insert(from, owned_tokens_count - 1);
            Ok(())
        }

        fn get_account_id() -> T::AccountId {
            T::MyPalletId::get().into_account_truncating()
        }
    }
}
