#![cfg_attr(not(feature = "std"), no_std)]
use frame_support::{ensure, pallet_macros::import_section, traits::Bounded};
pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;
pub mod weights;
pub use weights::*;
extern crate alloc;
use frame_support::traits::Get;
use frame_system::{
    offchain::{
        AppCrypto, CreateSignedTransaction, SendSignedTransaction, SendUnsignedTransaction,
        SignedPayload, Signer, SigningTypes, SubmitTransaction,
    },
    pallet_prelude::BlockNumberFor,
};

use lite_json::json::JsonValue;
use sp_core::crypto::KeyTypeId;
use sp_runtime::{
    offchain::{
        http,
        storage::{MutateStorageError, StorageRetrievalError, StorageValueRef},
        Duration,
    },
    traits::Zero,
    transaction_validity::{InvalidTransaction, TransactionValidity, ValidTransaction},
    RuntimeDebug,
};

use alloc::format;
use core::primitive::str;

pub const KEY_TYPE: KeyTypeId = KeyTypeId(*b"dot1");
pub mod crypto{
    use super::KEY_TYPE;
    use sp_runtime::{MultiSignature, MultiSigner};
    use sp_runtime::traits::Verify;
    use sp_core::sr25519::Signature as Sr255198Signature;
    use sp_runtime::{
        app_crypto::{app_crypto, sr25519}
    };

    app_crypto!(sr25519, KEY_TYPE);

    pub struct TestAuthId;
    
    impl frame_system::offchain::AppCrypto<MultiSigner, MultiSignature> for TestAuthId {
        type RuntimeAppPublic = Public;
        type GenericSignature = sp_core::sr25519::Signature;
        type GenericPublic = sp_core::sr25519::Public;
        
    }

    impl frame_system::offchain::AppCrypto<<Sr255198Signature as Verify>::Signer, Sr255198Signature> for TestAuthId{
        type RuntimeAppPublic = Public;
        type GenericSignature = sp_core::sr25519::Signature;
        type GenericPublic = sp_core::sr25519::Public;
    }
}

mod config;
mod errors;
mod events;
mod extrinsics;
mod hooks;
mod impls;

// #[import_section(extrinsics::dispatches)]
#[import_section(errors::errors)]
#[import_section(events::events)]
#[import_section(config::config)]
#[import_section(hooks::hooks)]
#[import_section(impls::impls)]

#[frame_support::pallet]
pub mod pallet {
    use super::*;
    use frame_support::pallet_prelude::*;
    // use frame_support::traits::Randomness;
    use frame_system::pallet_prelude::*;
	use sp_std::prelude::*;
    use lite_json::json::JsonValue;
    use sp_io::offchain;
    use sp_runtime::{
        offchain::{
            http,
            storage::{MutateStorageError, StorageRetrievalError, StorageValueRef},
            Duration,
        },
        traits::Zero,
    };
    use alloc::vec::Vec;
    use sp_core::offchain::Timestamp;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[derive(Encode, Decode, Clone, PartialEq, TypeInfo, MaxEncodedLen, RuntimeDebug, Default)]
    #[scale_info(skip_type_params(T))]
    #[codec(mel_bound())]
    pub struct OrderItemInfo<T: Config> {
        pub score_name: u32,
        pub internal_order_id: u128,
        pub user_account: T::AccountId,
        pub order_content: BoundedVec<u8, T::MaximumOwned>,
        pub flag: bool, // means is already occure external order id
    }

    #[pallet::storage]
    pub type Something<T> = StorageValue<_, u32>;

    /// publisher --> (staking credit amount, the rate of credit and score)
    #[pallet::storage]
    pub type Credit<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, (u64, u64)>;

    /// publisher --> {score name ---> (current publisher account score amount, credit buy flag)}
    #[pallet::storage]
    pub type Score<T: Config> = StorageDoubleMap<_, Blake2_128Concat, T::AccountId, Twox64Concat, u32, (u64, bool)>;

    /// user account --> {score name --->score amount}
    /// one user to multiple score
    #[pallet::storage]
    pub type UserAccount<T: Config> = StorageDoubleMap<_, Blake2_128Concat, T::AccountId, Twox64Concat, u32, u64>;
    
    /// Only publisher can set grant score
    /// When user call claim score, need to check this precondition
    /// (score_name, grant_account) --> (password, grant_amount)
    /// grant amount if 0 is deactivate grant
    /// ervery one password is a randomly generated password, invalid after use
    #[pallet::storage]
    pub type ScoreGrantPrecondition<T: Config> = StorageMap<_, Blake2_128Concat, (u32, T::AccountId), (u64, u64)>;

    /// Only publisher can redeem precondition
    /// When user call redeem, need to check this precondition
    /// score name --> (activate redeem flag, deadline redeem date, 
    /// start redeem date, consume score amount every time, 
    /// redeem times limit if 0 is no limit default is 1, nft id threshold,
    /// redeem type 0 is default, 1 is credit, 2 is entity, 3 is credit or entity)
    #[pallet::storage]
    pub type ScoreRedeemPrecondition<T: Config> = StorageMap<_, Blake2_128Concat, u32, (bool, u64, u64, u64, u8, u32, u8)>;

    #[pallet::storage]
    pub type ScoreMappingPublisher<T: Config> = StorageMap<_, Blake2_128Concat, u32, T::AccountId>;

    /// user account -->{ internal order id ---> Vec<external order id...>}
    #[pallet::storage]
    pub type OrderList<T: Config> = StorageDoubleMap<_, Blake2_128Concat, T::AccountId, Twox64Concat, u128, BoundedVec<u64, T::MaximumOwned>>;

    /// order item struct
    #[pallet::storage]
    pub type OrderItem<T: Config> = StorageValue<_, BoundedVec<OrderItemInfo<T>, T::MaximumOwned>, ValueQuery>;

    enum TransactionType {
        Signed,
        UnsignedForAny,
        UnsignedForAll,
        Raw,
        None,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::call_index(0)]
        #[pallet::weight({0})]
        // #[pallet::weight(T::WeightInfo::set_score())]
        pub fn publish_score(
            origin: OriginFor<T>,
            score_name: u32,
            staking_rate: u64,
            credit_amount: u64,
            credit_buy: bool,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            if staking_rate < 10 || (staking_rate % 10) != 0 || staking_rate > 10000 {
                return Err(Error::<T>::InvalidStakingRate.into());
            }

            let computed_staking_credit = credit_amount * staking_rate;

            <Score::<T>>::insert(who.clone(), score_name, (computed_staking_credit, credit_buy));
            // balance staking implement todo!
            Credit::<T>::insert(who.clone(), (credit_amount,  staking_rate));

            ScoreRedeemPrecondition::<T>::insert(score_name, (false, 0, 0, 0, 1, 0, 0));

            ScoreMappingPublisher::<T>::insert(score_name, who);

            // // initial order item
            // let ord = OrderItemInfo::<T>::Default();

            // OrderItem::<T>::put(BoundedVec::from(vec![ord]));
            Ok(())
        }

        #[pallet::call_index(1)]
        #[pallet::weight({0})]
        // #[pallet::weight(T::WeightInfo::set_score())]
        pub fn staking_credit_for_score(origin: OriginFor<T>, amount: u64) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let mut publisher_account =  Credit::<T>::try_get(who.clone()).map_err(|_| Error::<T>::NoExistPublisherOrScore)?;

            publisher_account.0 += amount;

            Credit::<T>::insert(who.clone(), publisher_account);
            Ok(())
        }

        #[pallet::call_index(2)]
        #[pallet::weight({0})]
        // #[pallet::weight(T::WeightInfo::set_score())]
        pub fn activate_redeem_era(
            origin: OriginFor<T>,
            score_name: u32,
            redeem_deadline: u64,
            from_date: u64,
            consume_score_amount: u64,
            redeem_times_limit: u8,
            _nft_id_valid: u32,
            redeem_type: u8,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            // let _score_info: (u64, bool) = Score::<T>::try_get(who.clone(), score_name).map_err(|_| Error::<T>::NoExistPublisherOrScore)?;
            ensure!(Score::<T>::contains_key(who.clone(), score_name), Error::<T>::NoExistPublisherOrScore);
            ensure!(redeem_type != 1 || redeem_type != 2 || redeem_type != 3, Error::<T>::InvalidRedeemType);

            let mut score_redeem_precondition = ScoreRedeemPrecondition::<T>::try_get(score_name).map_err(|_| Error::<T>::NoExistScore)?;

            let deadline_date_convert = redeem_deadline * 24 * 60 * 60;
            let deadline = offchain::timestamp().add(Duration::from_millis(deadline_date_convert));

            // deadline: Timestamp convert to u64
            let deadline_u64 = deadline.unix_millis();

            // deadline_u64: u64 convert to Timestamp
            let deadline_timestamp = Timestamp::from_unix_millis(deadline_u64);

            let from_date_convert = from_date * 24 * 60 * 60;
            let begin_date= offchain::timestamp().add(Duration::from_millis(from_date_convert));

            // score_redeem_precondition.0 = true;
            // score_redeem_precondition.1 = redeem_deadline;
            // score_redeem_precondition.2 = from_date;
            // score_redeem_precondition.3 = consume_score_amount;
            // // frontend need to check if redeem_times_limit is valid or not, default is 1
            // score_redeem_precondition.4 = redeem_times_limit;
            // score_redeem_precondition.5 = _nft_id_valid;
            // score_redeem_precondition.6 = redeem_type;

            ScoreRedeemPrecondition::<T>::insert(score_name, (true, redeem_deadline, from_date, consume_score_amount, redeem_times_limit, _nft_id_valid, redeem_type));

            Ok(())
        }

        /// publisher call this function to grant score to user account
        /// grant_accounts is collection of user accounts, grant_amount is the amount of score to grant
        /// score_proof is a randomly generated password, invalid after use
        #[pallet::call_index(3)]
        #[pallet::weight({0})]
        // #[pallet::weight(T::WeightInfo::claim_score())]
        pub fn add_score_grant(origin: OriginFor<T>, score_name: u32, grant_accounts: BoundedVec<T::AccountId, T::MaximumOwned>, grant_amount: u64) -> DispatchResult {
            let who = ensure_signed(origin)?;

            // let _score_info: (u64, bool) = Score::<T>::try_get(who.clone(), score_name).map_err(|_| Error::<T>::NoExistPublisherOrScore)?;
            ensure!(Score::<T>::contains_key(who.clone(), score_name), Error::<T>::NoExistPublisherOrScore);

            // Define ScoreGrantPrecondition for each grant account
            for account in grant_accounts.iter() {
                let score_proof_arr = Self::random_value(&account);
                let mut score_proof = 0;
                for &num in score_proof_arr.iter() {
                    score_proof = score_proof * 10 + num as u64;
                }

                // if Exist ScoreGrantPrecondition, add grant amount to it, else create new one
                if ScoreGrantPrecondition::<T>::contains_key((score_name, account.clone())) {
                    let mut score_grant_precondition = ScoreGrantPrecondition::<T>::try_get((score_name, account.clone())).map_err(|_| Error::<T>::NoExistScoreGrantPrecondition)?;
                    score_grant_precondition.1 += grant_amount;
                    ScoreGrantPrecondition::<T>::insert((score_name, account.clone()), score_grant_precondition);
                }

                ScoreGrantPrecondition::<T>::insert((score_name, account.clone()), (score_proof, grant_amount));

                // initialize user account score amount to 0
                // UserAccount::<T>::insert(who.clone(), score_name, 0);
            }

            Ok(())
        }

        #[pallet::call_index(4)]
        #[pallet::weight({0})]
        // #[pallet::weight(T::WeightInfo::claim_score())]
        pub fn user_claim_score(origin: OriginFor<T>, score_name: u32, score_proof: u64) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let mut user_score_amount =  UserAccount::<T>::try_get(who.clone(), score_name).map_err(|_| Error::<T>::NoExistUserAccount)?;

            let score_grant_precondition = ScoreGrantPrecondition::<T>::try_get((score_name, who.clone())).map_err(|_| Error::<T>::NoExistScore)?;

            if score_proof != score_grant_precondition.0 {
                return Err(Error::<T>::InvalidClaimScoreProof.into());
            }

            user_score_amount += score_grant_precondition.1;

            // update publisher score amount
            let mut publisher_account =  Score::<T>::try_get(who.clone(), score_name).map_err(|_| Error::<T>::NoExistPublisherOrScore)?;
            ensure!(publisher_account.0 > score_grant_precondition.1, Error::<T>::NotEnoughScoreForClaim);
            publisher_account.0 -= score_grant_precondition.1;
            Score::<T>::insert(who.clone(), score_name, publisher_account);

            // update user score amount
            UserAccount::<T>::insert(who.clone(), score_name, user_score_amount);

            Ok(())
        }

        /// publisher call this function to transfer score to user account
        #[pallet::call_index(5)]
        #[pallet::weight({0})]
        // #[pallet::weight(T::WeightInfo::claim_score())]
        pub fn inspire_score(origin: OriginFor<T>, score_name: u32, score_amount: u64, user_account: T::AccountId) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(who != user_account, Error::<T>::NoSelfInspire);

            ensure!(Score::<T>::contains_key(who.clone(), score_name), Error::<T>::NoExistPublisherOrScore);
            ensure!(UserAccount::<T>::contains_key(who.clone(), score_name), Error::<T>::NoExistUserAccount);

            // update publisher score amount
            let mut publisher_account =  Score::<T>::try_get(who.clone(), score_name).map_err(|_| Error::<T>::NoExistPublisherOrScore)?;
            ensure!(publisher_account.0 > score_amount, Error::<T>::NotEnoughScoreForInspire);
            publisher_account.0 -= score_amount;

            // update user score amount
            let mut user_score_amount =  UserAccount::<T>::try_get(who.clone(), score_name).map_err(|_| Error::<T>::NoExistUserAccount)?;
            user_score_amount += score_amount;

            // transaction operate
            Score::<T>::insert(who.clone(), score_name, publisher_account);
            UserAccount::<T>::insert(who.clone(), score_name, user_score_amount);

            Ok(())
        }

        #[pallet::call_index(6)]
        #[pallet::weight({0})]
        // #[pallet::weight(T::WeightInfo::claim_score())]
        pub fn user_register(origin: OriginFor<T>, score_name: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(!UserAccount::<T>::contains_key(who.clone(), score_name), Error::<T>::AlreadyExistUserAccount);

            UserAccount::<T>::insert(who.clone(), score_name, 0);
            Ok(())
        }

        /// only publisher can call this function to get score ranking list
        #[pallet::call_index(7)]
        #[pallet::weight({0})]
        // #[pallet::weight(T::WeightInfo::set_score())]
        pub fn ranking_list(origin: OriginFor<T>, score_name: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(Score::<T>::contains_key(who.clone(), score_name.clone()), Error::<T>::NoExistPublisherOrScore);

            let mut user_accounts_list= BoundedVec::<u64, T::MaximumOwned>::new();

            for user_account in UserAccount::<T>::iter_prefix(who.clone()) {
                // user_accounts_list.try_push();
                if user_account.0 == score_name {
                    user_accounts_list.try_push(user_account.1).map_err(|_| Error::<T>::TooManyUserAccounts)?;
                }
            }

            user_accounts_list.sort_by(|a, b| b.cmp(a));
            // return user_accounts_list in event
            // Self::deposit_event(Event::UserAccountsList(user_accounts_list));
            Ok(())
        }    

        // pub fn check_publisher_staking_credit_to_score_amount(who: T::AccountId, score_name: u32, new_score_amount: u64) -> Result<u64, DispatchError> {
        //     let publisher_credit_account =  Credit::<T>::try_get(who.clone()).map_err(|_| Error::<T>::NoExistPublisherOrScore)?;
        //     let staking_rate = publisher_account.1;
        //     let staking_credit_amount = publisher_account.0;
        //     let computed_staking_credit_score_amount = staking_credit_amount * staking_rate;

        //     let  publisher_score_account =  Score::<T>::try_get(who.clone(), score_name).map_err(|_| Error::<T>::NoExistPublisherOrScore)?;
        //     let current_score_amount = publisher_score_account.0;
        //     let new_computed_score_amount = current_score_amount + new_score_amount;

        //     ensure!(computed_staking_credit_score_amount >= new_computed_score_amount, Error::<T>::NotEnoughStakingCredit);
        //     // if computed_staking_credit_score_amount < current_score_amount + new_score_amount {
        //     //     return Err(Error::<T>::NotEnoughStakingCredit.into());
        //     // }

        //     Ok(new_computed_score_amount)
        // }

        // pub fn random_value(account: &T::AccountId) -> [u8; 32] {
        //     let mut seed = account.using_encoded(sp_io::hashing::blake2_128);
        //     let mut result = [0u8; 32];
        //     for i in 0..32 {
        //         result[i] = seed[i];
        //     }
        //     result
        // }

        // #[pallet::call_index(8)]
        // #[pallet::weight({0})]
        // // #[pallet::weight(T::WeightInfo::set_score())]
        // pub fn score_record(origin: OriginFor<T>) -> DispatchResult {
        //     Ok(())
        // }

        /// user account call this function to redeem credit
        #[pallet::call_index(9)]
        #[pallet::weight({0})]
        // #[pallet::weight(T::WeightInfo::set_score())]
        pub fn score_redeem_credit(origin: OriginFor<T>, score_name: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(UserAccount::<T>::contains_key(who.clone(), score_name), Error::<T>::NoExistUserAccount);

            let mut redeem_precondition = ScoreRedeemPrecondition::<T>::try_get(score_name).map_err(|_| Error::<T>::NoExistScoreRedeemPrecondition)?;

            ensure!(redeem_precondition.0, Error::<T>::RedeemNotActive);
            let current_time = offchain::timestamp().unix_millis();
            
            ensure!(current_time >= redeem_precondition.2, Error::<T>::RedeemNotStart);
            ensure!(current_time <= redeem_precondition.1, Error::<T>::RedeemDeadline);

            ensure!(redeem_precondition.4 == 0, Error::<T>::RedeemTimesNotEnough);

            // update user score amount
            let mut user_score_amount =  UserAccount::<T>::try_get(who.clone(), score_name).map_err(|_| Error::<T>::NoExistUserAccount)?;
            let consume_score_amount = redeem_precondition.3;
            ensure!(user_score_amount >= consume_score_amount, Error::<T>::NotEnoughScoreForRedeem);
            user_score_amount -= consume_score_amount;
            UserAccount::<T>::insert(who.clone(), score_name, user_score_amount);

            // subtract redeem times
            redeem_precondition.4 -= 1;

            // update publisher credit amount
            let publisher_account =  Credit::<T>::try_get(who.clone()).map_err(|_| Error::<T>::NoExistPublisherOrScore)?;
            let staking_rate = publisher_account.1;
            let substract_credit_amount = consume_score_amount / staking_rate;
            ensure!(publisher_account.0 > substract_credit_amount, Error::<T>::NotEnoughStakingCredit);

            let credit_amount = publisher_account.0 - substract_credit_amount;

            // transaction operate
            Credit::<T>::insert(who.clone(), (credit_amount, staking_rate));            
            UserAccount::<T>::insert(who.clone(), score_name, user_score_amount);
            // transfer credit to user account todo!
            Ok(())
        }

        #[pallet::call_index(10)]
        #[pallet::weight({0})]
        // #[pallet::weight(T::WeightInfo::set_score())]
        pub fn score_redeem_entity(origin: OriginFor<T>, score_name: u32, order_content: BoundedVec<u8, T::MaximumOwned>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(UserAccount::<T>::contains_key(who.clone(), score_name), Error::<T>::NoExistUserAccount);

            let mut redeem_precondition = ScoreRedeemPrecondition::<T>::try_get(score_name).map_err(|_| Error::<T>::NoExistScoreRedeemPrecondition)?;

            ensure!(redeem_precondition.0, Error::<T>::RedeemNotActive);
            let current_time = offchain::timestamp().unix_millis();
            
            ensure!(current_time >= redeem_precondition.2, Error::<T>::RedeemNotStart);
            ensure!(current_time <= redeem_precondition.1, Error::<T>::RedeemDeadline);

            ensure!(redeem_precondition.4 == 0, Error::<T>::RedeemTimesNotEnough);

            // update order list
            // 对 who 进行hash运算取前6个字符
            let who_str = format!("{:?}", who.clone());
            let who_str_slice = &who_str[0..6];

            let internal_order_str = format!("{:?}010101{:?}",who_str_slice, current_time);
            let internal_order_id = u128::from_str_radix(internal_order_str.as_str(), 16).map_err(|_| Error::<T>::RedeemEntityConvertErr)?;
  
            // update order item info
            let order_item_info = OrderItemInfo {
                score_name: score_name,
                internal_order_id: internal_order_id,
                user_account: who.clone(),
                order_content: order_content,
                flag: false,
            };
            let mut order_item_info_vec = BoundedVec::<OrderItemInfo<T>, T::MaximumOwned>::new();
            order_item_info_vec.try_push(order_item_info).map_err(|_| Error::<T>::TooManyOrderItem)?;

            OrderItem::<T>::put(order_item_info_vec);

            // Self::deposit_event(Event::RedeemEntity(who.clone(), score_name));

            OrderList::<T>::insert(who.clone(), internal_order_id, BoundedVec::<u64, T::MaximumOwned>::new());

            // update user score amount
            let mut user_score_amount =  UserAccount::<T>::try_get(who.clone(), score_name).map_err(|_| Error::<T>::NoExistUserAccount)?;
            let consume_score_amount = redeem_precondition.3;
            ensure!(user_score_amount >= consume_score_amount, Error::<T>::NotEnoughScoreForRedeem);
            user_score_amount -= consume_score_amount;
            UserAccount::<T>::insert(who.clone(), score_name, user_score_amount);

            // subtract redeem times
            redeem_precondition.4 -= 1;

            UserAccount::<T>::insert(who, score_name, user_score_amount);

            Ok(())
        }

        /// user account transfer score to another account,
        /// need to consider fee of score
        #[pallet::call_index(11)]
        #[pallet::weight({0})]
        // #[pallet::weight(T::WeightInfo::set_score())]
        pub fn transfer_score(
            origin: OriginFor<T>,
            to: T::AccountId,
            score_name: u32,
            amount: u64,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(UserAccount::<T>::contains_key(who.clone(), score_name), Error::<T>::NoExistUserAccount);

            let mut fee_amount = amount / 10;
            if fee_amount > 200 {
                fee_amount = 200;
            }

            let mut user_score_amount =  UserAccount::<T>::try_get(who.clone(), score_name).map_err(|_| Error::<T>::NoExistUserAccount)?;
            let substract_amount = amount + fee_amount;
            ensure!(user_score_amount >= substract_amount, Error::<T>::NotEnoughScoreForTransfer);

            // update from user score amount
            user_score_amount -= substract_amount;
            UserAccount::<T>::insert(who.clone(), score_name, user_score_amount);

            // update to user score amount
            let mut to_user_score_amount =  UserAccount::<T>::try_get(to.clone(), score_name).map_err(|_| Error::<T>::NoExistUserAccount)?;
            to_user_score_amount += amount;
            UserAccount::<T>::insert(to.clone(), score_name, to_user_score_amount);

            Ok(())
        }

        // #[pallet::call_index(100)]
        // #[pallet::weight({0})]
        // // #[pallet::weight(T::WeightInfo::set_score())]
        // pub fn airdrop_prize(origin: OriginFor<T>, amount: u32) -> DispatchResult {
        //     可根据排名，现实操作分配奖励
        //     Ok(())
        // }


        /// utils extrinsics function, ensure_signed_or_root todo
        /// only publisher or root can call this function to set submit order id
        #[pallet::call_index(101)]
        #[pallet::weight({0})]
        pub fn submit_order_id(origin: OriginFor<T>, score_name: u32, user_account: T::AccountId, internal_order_id: u128, external_order_id: u64) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(Score::<T>::contains_key(who.clone(), score_name), Error::<T>::NoExistPublisherOrScore);

            let mut order_list = OrderList::<T>::try_get(user_account.clone(), internal_order_id).map_err(|_| Error::<T>::NoExistOrderList)?;

            order_list.try_push(external_order_id).map_err(|_| Error::<T>::TooManyOrderList)?;

            OrderList::<T>::insert(user_account, internal_order_id, order_list);

            Ok(())
        }

        /// An example dispatchable that takes a single u32 value as a parameter, writes the value
        /// to storage and emits an event.
        ///
        /// It checks that the _origin_ for this call is _Signed_ and returns a dispatch
        /// error if it isn't. Learn more about origins here: <https://docs.substrate.io/build/origins/>
        #[pallet::call_index(200)]
        #[pallet::weight(T::WeightInfo::do_something())]
        pub fn do_something(origin: OriginFor<T>, something: u32) -> DispatchResult {
            // Check that the extrinsic was signed and get the signer.
            let who = ensure_signed(origin)?;

            // Update storage.
            Something::<T>::put(something);

            // Emit an event.
            Self::deposit_event(Event::SomethingStored { something, who });

            // Return a successful `DispatchResult`
            Ok(())
        }

        /// An example dispatchable that may throw a custom error.
        ///
        /// It checks that the caller is a signed origin and reads the current value from the
        /// `Something` storage item. If a current value exists, it is incremented by 1 and then
        /// written back to storage.
        ///
        /// ## Errors
        ///
        /// The function will return an error under the following conditions:
        ///
        /// - If no value has been set ([`Error::NoneValue`])
        /// - If incrementing the value in storage causes an arithmetic overflow
        ///   ([`Error::StorageOverflow`])
        #[pallet::call_index(210)]
        #[pallet::weight(T::WeightInfo::cause_error())]
        pub fn cause_error(origin: OriginFor<T>) -> DispatchResult {
            let _who = ensure_signed(origin)?;

            // Read a value from storage.
            match Something::<T>::get() {
                // Return an error if the value has not been set.
                None => Err(Error::<T>::NoneValue.into()),
                Some(old) => {
                    // Increment the value read from storage. This will cause an error in the event
                    // of overflow.
                    let new = old.checked_add(1).ok_or(Error::<T>::StorageOverflow)?;
                    // Update the value in storage with the incremented result.
                    Something::<T>::put(new);
                    Ok(())
                }
            }
        }
    }

    impl <'a, T: Config> Pallet<T> {
        pub fn send_signed(url: &'a str, submit_info: &'a str, score_name: u32, user_account: T::AccountId, internal_order_id: u128) -> Result<(), &'a str> {
            let signer = Signer::<T, T::AuthorityId>::all_accounts();
            if !signer.can_sign() {
                return Err(
                    "No local accounts available. Consider adding one via `author_insertKey` RPC.",
                );
            }
            // Make an external HTTP request to fetch the current price.
            // Note this call will block until response is received.
            let external_order_id = Self::fetch_external_order(url, submit_info).map_err(|_| "Failed to fetch price")?;

            // Using `send_signed_transaction` associated type we create and submit a transaction
            // representing the call, we've just created.
            // Submit signed will return a vector of results for all accounts that were found in the
            // local keystore with expected `KEY_TYPE`.
            let results = signer.send_signed_transaction(|_account| {
                // Received price is wrapped into a call to `submit_price` public function of this
                // pallet. This means that the transaction, when executed, will simply call that
                // function passing `price` as an argument.
                let user_account = user_account.clone();
                Call::submit_order_id { score_name, user_account, internal_order_id, external_order_id }
            });

            for (acc, res) in &results {
                match res {
                    Ok(()) => log::info!("[{:?}] Successfully to submit transaction: {}-{:?}-{}-{}", acc.id, score_name, user_account, internal_order_id, external_order_id),
                    Err(e) => log::error!("[{:?}] Failed to submit transaction: {}-{:?}-{}-{}-{:?}", acc.id, score_name, user_account, internal_order_id, external_order_id, e),
                }
            }

            Ok(())
        }

        pub fn fetch_external_order(url: &str, request_body: &str) -> Result<u64, http::Error> {
            // We want to keep the offchain worker execution time reasonable, so we set a hard-coded
            // deadline to 2s to complete the external call.
            // You can also wait indefinitely for the response, however you may still get a timeout
            // coming from the host machine.
            let deadline = sp_io::offchain::timestamp().add(Duration::from_millis(2_000));
            // Initiate an external HTTP GET request.
            // This is using high-level wrappers from `sp_runtime`, for the low-level calls that
            // you can find in `sp_io`. The API is trying to be similar to `request`, but
            // since we are running in a custom WASM execution environment we can't simply
            // import the library here.
            // let b = vec![b"hello"];
            let b = vec![request_body.as_bytes()];
            let request = http::Request::post(
                url, b
            );
            // We set the deadline for sending of the request, note that awaiting response can
            // have a separate deadline. Next we send the request, before that it's also possible
            // to alter request headers or stream body content in case of non-GET requests.
            let pending = request
                .deadline(deadline)
                .send()
                .map_err(|_| http::Error::IoError)?;

            // The request is already being processed by the host, we are free to do anything
            // else in the worker (we can send multiple concurrent requests too).
            // At some point however we probably want to check the response though,
            // so we can block current thread and wait for it to finish.
            // Note that since the request is being driven by the host, we don't have to wait
            // for the request to have it complete, we will just not read the response.
            let response = pending
                .try_wait(deadline)
                .map_err(|_| http::Error::DeadlineReached)??;
            // Let's check the status code before we proceed to reading the response.
            if response.code != 200 {
                log::warn!("Unexpected status code: {}", response.code);
                return Err(http::Error::Unknown);
            }

            // Next we want to fully read the response body and collect it to a vector of bytes.
            // Note that the return object allows you to read the body in chunks as well
            // with a way to control the deadline.
            let body = response.body().collect::<Vec<u8>>();

            // Create a str slice from the body.
            let body_str = alloc::str::from_utf8(&body).map_err(|_| {
                log::warn!("No UTF8 body");
                http::Error::Unknown
            })?;

            let order_id = match Self::parse_body_return(body_str) {
                Some(order_id) => Ok(order_id),
                None => {
                    log::warn!("Unable to extract result from the response: {:?}", body_str);
                    Err(http::Error::Unknown)
                }
            }?;

            log::warn!("Got Order ID from external server: {}", order_id);

            Ok(order_id)
        }

        pub(super) fn parse_body_return(body_str: &str) -> Option<u64> {
            let val = lite_json::parse_json(body_str);
            let order_id_value = match val.ok()? {
                JsonValue::Object(obj) => {
                    let (_, v) = obj
                        .into_iter()
                        .find(|(k, _)| k.iter().copied().eq("ORDER-ID".chars()))?;
                    match v {
                        JsonValue::Number(number) => number,
                        _ => return None,
                    }
                }
                _ => return None,
            };
            // let order_id = order_id_value

            let order_id = order_id_value.integer;
            // 2 pow 64 - 1, 20 digits
            if order_id > 10000000000000000000 {
                return None;
            }
            Some(order_id)
        }
    }
}

