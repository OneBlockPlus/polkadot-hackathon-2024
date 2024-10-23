//! # Pools Pallet
//!
//! The Pools pallet manages synthetic asset pools, allowing users to mint and burn synthetic assets
//! backed by collateral. It handles pool creation, minting, burning, and debt tracking.
//!
//! ## Overview
//!
//! The pallet implements the following functionality:
//! - Create and manage synthetic asset pools
//! - Mint synthetic assets
//! - Burn synthetic assets
//! - Track user and total pool debt
//! - Interact with other pallets (Reserve, Risk Management, Oracle)

#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;
use pallet_risk_manager;
use pallet_oracle;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub mod weights;

use frame_support::pallet_prelude::*;
use frame_system::pallet_prelude::*;
use sp_runtime::ArithmeticError;
use crate::weights::WeightInfo;
use frame_support::traits::Currency;
use sp_runtime::traits::{AtLeast32BitUnsigned, MaybeSerializeDeserialize};
use frame_support::{
    sp_runtime::{
        traits::{
            AccountIdConversion, CheckedAdd, CheckedMul, CheckedSub, Convert, One, Saturating,
        },
        FixedPointOperand,
    },
    traits::{
        fungibles::{
            Create, Destroy, Inspect, Mutate, metadata::{
                Mutate as MetadataMutate, 
                Inspect as MetadataInspect
            }
        },
        tokens::{Balance, Fortitude, Precision, Preservation, WithdrawConsequence},
    },
    PalletId,
};
use codec::EncodeLike;
use sp_std::fmt::Debug;
use sp_runtime::Vec;
use frame_support::BoundedVec;
use sp_std::convert::TryInto;

pub type AccountIdOf<T> = <T as frame_system::Config>::AccountId;
pub type BalanceOf<T> = <<T as Config>::Currency as Currency<AccountIdOf<T>>>::Balance;
pub type AssetIdOf<T> = <T as Config>::AssetId;
pub type AssetBalanceOf<T> = <T as Config>::AssetBalance;

use common::{PoolsTrait, RiskManagerTrait, UserPoolData, AssetMetadata, OracleTrait, AssetMetadataTrait};



#[frame_support::pallet]
pub mod pallet {
    use sp_runtime::traits::Zero;

    use super::*;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        /// The pool ID type
        type PoolId: Parameter
           + Member
           + Copy
           + MaybeSerializeDeserialize
           + MaxEncodedLen
           + Default
           + From<u64>
           + Into<u64>
           + CheckedAdd<Output = Self::PoolId>
           + One
           + PartialOrd;
       
        /// The currency trait.
        type Currency: Currency<Self::AccountId>;
        /// The asset ID type.
        type AssetId: MaybeSerializeDeserialize
            + MaxEncodedLen
            + TypeInfo
            + Clone
            + Debug
            + PartialEq
            + EncodeLike
            + Decode
            + From<u64>
            + Into<u64>;
        
        /// The balance type for assets (i.e. tokens).
        type AssetBalance: Balance
            + FixedPointOperand
            + MaxEncodedLen
            + MaybeSerializeDeserialize
            + TypeInfo
            + Zero;
        
        type Price: Member
            + Parameter
            + Copy
            + Default
            + MaxEncodedLen
            + Saturating
            + From<u128>
            + Into<u128>;


        /// The type for tradable assets.
        type Assets: Inspect<Self::AccountId, AssetId = Self::AssetId, Balance = Self::AssetBalance>
        + Mutate<Self::AccountId>;

        /// The type for liquidity tokens.
        type AssetRegistry: Inspect<Self::AccountId, AssetId = Self::AssetId, Balance = Self::AssetBalance>
            + Mutate<Self::AccountId>
            + Create<Self::AccountId>
            + Destroy<Self::AccountId>
            + MetadataMutate<Self::AccountId>
            + MetadataInspect<Self::AccountId>
            + AssetMetadataTrait<Self::RuntimeOrigin, Self::AssetId>;

        type RiskManager: RiskManagerTrait<Self::PoolId, Self::AccountId, Self::AssetId, Self::AssetBalance>;
        type Oracle: OracleTrait<Self::AssetId, Self::Price>;
        /// Pallet ID.
        #[pallet::constant]
        type PalletId: Get<PalletId>;

        /// The maximum number of pools that can be created
        #[pallet::constant]
        type MaxPools: Get<u32>;

        /// Weight information for extrinsics in this pallet.
        type WeightInfo: crate::weights::WeightInfo;
    }

    pub trait ConfigHelper: Config {
        fn pallet_account() -> AccountIdOf<Self>;
    }

    impl<T: Config> ConfigHelper for T {
        #[inline(always)]
        fn pallet_account() -> AccountIdOf<Self> {
            Self::PalletId::get().into_account_truncating()
        }
    }

    #[pallet::storage]
    #[pallet::getter(fn pools_by_asset)]
    pub(super) type PoolsByAsset<T: Config> = StorageMap<_, Blake2_128Concat, AssetIdOf<T>, T::PoolId, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn pool_total_debt)]
    pub(super) type PoolTotalDebt<T: Config> = StorageMap<_, Blake2_128Concat, T::PoolId, AssetBalanceOf<T>, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn user_debt)]
    pub(super) type UserDebt<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        (T::PoolId, T::AccountId),
        AssetBalanceOf<T>,
        ValueQuery,
    >;

    #[pallet::storage]
    #[pallet::getter(fn get_total_pools)]
    pub(super) type TotalPools<T: Config> = StorageValue<_, T::PoolId, ValueQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// A new pool has been created. [pool_id, asset_id]
        PoolCreated(T::PoolId),
        /// Synthetic assets have been minted. [account, pool_id, amount]
        SyntheticMinted(T::AccountId, T::PoolId, AssetBalanceOf<T>),
        /// Synthetic assets have been burned. [account, pool_id, amount]
        SyntheticBurned(T::AccountId, T::PoolId, AssetBalanceOf<T>),
        /// Debt has been transferred in preparation for liquidation. [liquidator, account, pool_id, amount]
        DebtTransferred(T::AccountId, T::AccountId, T::PoolId, AssetBalanceOf<T>),
        /// Assets minted via faucet. [account, asset_id, amount]
        FaucetMint(T::AccountId, AssetIdOf<T>, AssetBalanceOf<T>),
    }

    #[pallet::error]
    pub enum Error<T> {
        /// The pool already exists
        PoolAlreadyExists,
        /// The pool was not found
        PoolNotFound,
        /// There is insufficient collateral for the operation
        InsufficientCollateral,
        /// The operation would exceed the debt ceiling
        ExceedsDebtCeiling,
        /// The collateral asset is not valid for this pool
        InvalidCollateralAsset,
        /// The synthetic amount is invalid
        InvalidSyntheticAmount,
        /// The user position was not found
        PositionNotFound,
        /// The maximum number of pools has been reached
        TooManyPools,
        /// The asset is not found
        AssetNotFound,
        /// The caller is not the asset admin
        NotAssetAdmin,
        /// Reached the maximum number of pools allowed
        PoolLimitReached,
        /// The name is too long
        NameTooLong,
        /// The symbol is too long
        SymbolTooLong,
        /// The price for the asset was not found
        PriceNotFound,
        /// Invalid amount
        InvalidAmount,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Mint synthetic assets
        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::mint())]
        pub fn mint(
            origin: OriginFor<T>,
            pool_id: T::PoolId,
            amount: AssetBalanceOf<T>
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let pool = T::RiskManager::get_pool_parameters(pool_id).map_err(|_| Error::<T>::PoolNotFound)?;

            let new_total_debt = PoolTotalDebt::<T>::get(pool_id).checked_add(&amount)
                .ok_or(ArithmeticError::Overflow)?;
            ensure!(new_total_debt <= pool.debt_ceiling, Error::<T>::ExceedsDebtCeiling);

            // TODO: Ensure health factor is sufficient

            let new_user_debt = UserDebt::<T>::get((pool_id, &who)).checked_add(&amount)
                .ok_or(ArithmeticError::Overflow)?;
            UserDebt::<T>::insert((pool_id, &who), new_user_debt);
            PoolTotalDebt::<T>::insert(pool_id, new_total_debt);

            // Mint the synthetic asset
            T::AssetRegistry::mint_into(pool.synthetic_asset, &who, amount)?;

            Self::deposit_event(Event::SyntheticMinted(who, pool_id, amount));
            Ok(())
        }

        /// Burn synthetic assets
        #[pallet::call_index(1)]
        #[pallet::weight(T::WeightInfo::burn())]
        pub fn burn(
            origin: OriginFor<T>,
            pool_id: T::PoolId,
            amount: AssetBalanceOf<T>
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let pool = T::RiskManager::get_pool_parameters(pool_id).map_err(|_| Error::<T>::PoolNotFound)?;
            let user_debt = UserDebt::<T>::get((pool_id, &who));
            ensure!(amount <= user_debt, Error::<T>::InvalidSyntheticAmount);

            // Burn the synthetic asset
            T::AssetRegistry::burn_from(
                pool.synthetic_asset, 
                &who, 
                amount, 
                Preservation::Preserve,
                Precision::Exact,
                Fortitude::Polite,
            )?;

            let new_user_debt = user_debt.checked_sub(&amount)
                .ok_or(ArithmeticError::Underflow)?;
            UserDebt::<T>::insert((pool_id, &who), new_user_debt);

            let new_total_debt = PoolTotalDebt::<T>::get(pool_id)
                .checked_sub(&amount)
                .ok_or(ArithmeticError::Underflow)?;
            PoolTotalDebt::<T>::insert(pool_id, new_total_debt);

            Self::deposit_event(Event::SyntheticBurned(who, pool_id, amount));
            Ok(())
        }

        #[pallet::call_index(2)]
        #[pallet::weight(T::WeightInfo::faucet())]
        pub fn faucet(
            origin: OriginFor<T>,
            asset_id: AssetIdOf<T>,
            amount: AssetBalanceOf<T>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            // Attempt to mint tokens to the user
            T::AssetRegistry::mint_into(
                asset_id.clone(),
                &who,
                amount,
            )?;

            // Emit faucet event
            Self::deposit_event(Event::FaucetMint(who, asset_id, amount));

            Ok(())
        }
    }

    impl<T: Config> PoolsTrait<AccountIdOf<T>, T::PoolId, AssetBalanceOf<T>> for Pallet<T> {
        /// Create a new synthetic asset pool
        fn create_pool(
            name: Vec<u8>,
            symbol: Vec<u8>,
        ) -> DispatchResult {
            // Increment the total pools
            TotalPools::<T>::try_mutate(|value| {
                // Safely increment the pool_id using `checked_add`
                *value = value.checked_add(&One::one()).ok_or(Error::<T>::PoolLimitReached)?;
                Ok::<(), DispatchError>(())
            })?;
            let pool_id = TotalPools::<T>::get();

            // Convert pool_id to asset_id using `From` or `Into` trait
            let asset_id: AssetIdOf<T> = pool_id.into().into();
        
            // Deploy synthetic asset
            T::AssetRegistry::create(
                asset_id.clone(),
                T::pallet_account(),
                false,
                <AssetBalanceOf<T>>::one(),
            )?;
        
            // Set metadata for the synthetic asset
            T::AssetRegistry::set_metadata(
                frame_system::RawOrigin::Root.into(),
                asset_id,
                name,
                symbol,
                18
            )?;
        
            Self::deposit_event(Event::PoolCreated(pool_id));
            Ok(())
        }
        
		/// Prepare for liquidation by transferring debt from the user to the liquidator.
		/// This function can only be called by the Reserve pallet.
		fn prepare_liquidation(
			liquidator: T::AccountId,
			user: T::AccountId,
			pool_id: T::PoolId,
			debt_amount: AssetBalanceOf<T>
		) -> DispatchResult {
			// Ensure the pool exists
			ensure!(pool_id < TotalPools::<T>::get(), Error::<T>::PoolNotFound);
	
			// Get the user's current debt
			let user_debt = UserDebt::<T>::get((pool_id, &user));
			
			// Ensure the user has enough debt to transfer
			ensure!(debt_amount <= user_debt, Error::<T>::InvalidSyntheticAmount);
	
			// Calculate new debt values
			let new_user_debt = user_debt.checked_sub(&debt_amount)
				.ok_or(ArithmeticError::Underflow)?;
			let new_liquidator_debt = UserDebt::<T>::get((pool_id, &liquidator))
				.checked_add(&debt_amount)
				.ok_or(ArithmeticError::Overflow)?;
	
			// Update user debts
			UserDebt::<T>::insert((pool_id, &user), new_user_debt);
			UserDebt::<T>::insert((pool_id, &liquidator), new_liquidator_debt);
	
			// Emit an event for the debt transfer
			Self::deposit_event(Event::DebtTransferred(liquidator.clone(), user.clone(), pool_id, debt_amount));
	
			Ok(())
		}

        fn get_total_pools() -> T::PoolId {
            TotalPools::<T>::get()
        }
	}

    // UI Data
    impl<T: Config> Pallet<T> {
        pub fn get_all_pools(account: T::AccountId) -> Result<Vec<UserPoolData<AssetIdOf<T>, AssetBalanceOf<T>, T::PoolId, T::Price>>, DispatchError> {
            let mut pools = Vec::new();
            let total_pools: u64 = TotalPools::<T>::get().into();

            for pool_id_num in 1..(total_pools+1) {
                // Convert `u64` to `T::PoolId`
                let pool_id: T::PoolId = pool_id_num.into();

                // Correctly handle the Result returned by `get_pool_parameters`
                let pool_params = T::RiskManager::get_pool_parameters(pool_id.clone())
                    .map_err(|_| Error::<T>::PoolNotFound)?;

                let debt_amount: <T as Config>::AssetBalance = UserDebt::<T>::get((pool_id.clone(), &account));

                let synthetic_asset = AssetMetadata {
                    id: pool_params.synthetic_asset.clone(),
                    name: T::AssetRegistry::name(pool_params.synthetic_asset.clone())
                        .try_into()
                        .map_err(|_| Error::<T>::NameTooLong)?,
                    symbol: T::AssetRegistry::symbol(pool_params.synthetic_asset.clone())
                        .try_into()
                        .map_err(|_| Error::<T>::SymbolTooLong)?,
                    decimals: T::AssetRegistry::decimals(pool_params.synthetic_asset.clone()),
                    price: T::Oracle::get_price(pool_params.synthetic_asset.clone())
                        .ok_or(Error::<T>::PriceNotFound)?,
                };

                pools.push(UserPoolData {
                    id: pool_id, // Correct type: `T::PoolId`
                    debt_amount,
                    synthetic_asset,
                    params: pool_params,
                });
            }
            Ok(pools)
        }
    }
} 

