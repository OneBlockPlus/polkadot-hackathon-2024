#![cfg_attr(not(feature = "std"), no_std)]
pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub mod weights;

use crate::weights::WeightInfo;
use codec::EncodeLike;
use frame_support::pallet_prelude::*;
use frame_support::traits::fungibles;
use frame_support::traits::Currency;
use frame_support::{
    pallet_prelude::*,
    sp_runtime::{
        traits::{
            AccountIdConversion, CheckedAdd, CheckedMul, CheckedSub, Convert, One, Saturating, Zero,
        },
        FixedPointNumber, FixedPointOperand, FixedU128,
    },
    traits::{
        fungibles::{metadata::Inspect as InspectMetadata, Create, Destroy, Inspect, Mutate},
        tokens::{Balance, Fortitude, Precision, Preservation, WithdrawConsequence},
        ExistenceRequirement,
    },
    transactional, PalletId,
};
use frame_system::pallet_prelude::*;
use pallet_assets as assets;
use sp_runtime::traits::{AtLeast32BitUnsigned, MaybeSerializeDeserialize};
use sp_runtime::ArithmeticError;
use sp_std::fmt::Debug;
use sp_std::ops::Div;
use sp_std::vec::Vec;

pub type AccountIdOf<T> = <T as frame_system::Config>::AccountId;
pub type BalanceOf<T> = <<T as Config>::Currency as Currency<AccountIdOf<T>>>::Balance;
pub type AssetIdOf<T> = <T as Config>::AssetId;
pub type AssetBalanceOf<T> = <T as Config>::AssetBalance;
use common::{
    AssetMetadata, CollateralParams, OracleTrait, PoolsTrait, ReserveTrait, RiskManagerTrait,
    UserCollateralData,
};
use frame_support::traits::OriginTrait;
use frame_support::BoundedVec;
use sp_std::convert::TryInto;

#[frame_support::pallet]
pub mod pallet {
    use super::*;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        /// The pools pallet, used for debt transfer during liquidation.
        type Pools: PoolsTrait<AccountIdOf<Self>, Self::PoolId, AssetBalanceOf<Self>>;

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
            + One;

        /// The risk management pallet, used for checking health factors.
        type RiskManager: RiskManagerTrait<
            Self::PoolId,
            AccountIdOf<Self>,
            Self::AssetId,
            AssetBalanceOf<Self>,
        >;

        type Price: Member
            + Parameter
            + Copy
            + Default
            + Zero
            + MaxEncodedLen
            + Saturating
            + From<u128>
            + Into<u128>
            + Div<AssetBalanceOf<Self>, Output = Self::Price>;

        /// The oracle pallet, used for price feeds.
        type Oracle: OracleTrait<AssetIdOf<Self>, Self::Price>;

        /// The currency trait.
        type Currency: Currency<Self::AccountId>;
        /// The asset ID type.
        type AssetId: MaybeSerializeDeserialize
            + MaxEncodedLen
            + Default
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
            + Into<u128>; // Add this bound

        /// The type for tradable assets.
        type Assets: Inspect<Self::AccountId, AssetId = Self::AssetId, Balance = Self::AssetBalance>
            + Mutate<Self::AccountId>;

        /// The type for liquidity tokens.
        type AssetRegistry: Inspect<Self::AccountId, AssetId = Self::AssetId, Balance = Self::AssetBalance>
            + Mutate<Self::AccountId>
            + Create<Self::AccountId>
            + Destroy<Self::AccountId>
            + InspectMetadata<Self::AccountId>;

        /// Pallet ID.
        #[pallet::constant]
        type PalletId: Get<PalletId>;

        /// Weight information for extrinsics in this pallet.
        type WeightInfo: WeightInfo;
    }

    // User collateral balance
    #[pallet::storage]
    #[pallet::getter(fn user_collateral)]
    pub type UserCollateral<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        (T::PoolId, AssetIdOf<T>, T::AccountId),
        AssetBalanceOf<T>,
        ValueQuery,
    >;

    // Get asset id for a pool's collateral index
    #[pallet::storage]
    #[pallet::getter(fn pool_collateral)]
    pub type PoolCollateral<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        (T::PoolId, u16), // pool_id, collateral_index
        AssetIdOf<T>,
        ValueQuery,
    >;

    // Total collateral indexes for a pool
    #[pallet::storage]
    #[pallet::getter(fn total_collaterals)]
    pub type TotalCollaterals<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::PoolId,
        u16, // latest collateral index / total collaterals
        ValueQuery,
    >;

    // Collateral parameters for a pool's collateral asset
    #[pallet::storage]
    #[pallet::getter(fn total_collateral_balance)]
    pub type TotalCollateralBalance<T: Config> =
        StorageMap<_, Blake2_128Concat, (T::PoolId, AssetIdOf<T>), AssetBalanceOf<T>, ValueQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// Collateral deposited. [account, pool_id, asset_id, amount]
        CollateralDeposited(T::AccountId, T::PoolId, AssetIdOf<T>, AssetBalanceOf<T>),
        /// Collateral withdrawn. [account, pool_id, asset_id, amount]
        CollateralWithdrawn(T::AccountId, T::PoolId, AssetIdOf<T>, AssetBalanceOf<T>),
        /// Account liquidated. [liquidator, account, pool_id, asset_id, collateral_amount, debt_amount]
        Liquidated(
            T::AccountId,
            T::AccountId,
            T::PoolId,
            AssetIdOf<T>,
            AssetBalanceOf<T>,
            AssetBalanceOf<T>,
        ),
        /// Collateral asset added to a pool. [pool_id, asset_id]
        CollateralAssetAdded(T::PoolId, AssetIdOf<T>),
        /// Collateral parameters updated. [pool_id, asset_id]
        CollateralParametersUpdated(T::PoolId, AssetIdOf<T>),
    }

    #[pallet::error]
    pub enum Error<T> {
        /// Insufficient collateral for the operation.
        InsufficientCollateral,
        /// The collateral asset was not found.
        CollateralAssetNotFound,
        /// The collateral amount is invalid.
        InvalidCollateralAmount,
        /// The withdrawal would leave the position undercollateralized.
        WithdrawalWouldUndercollateralize,
        /// The position is not liquidatable.
        PositionNotLiquidatable,
        /// The collateral asset already exists for this pool.
        CollateralAssetAlreadyExists,
        /// The caller is not authorized to perform this operation.
        UnauthorizedOperation,
        /// Arithmetic error occurred during calculation
        ArithmeticError,
        /// The name is too long.
        NameTooLong,
        /// The symbol is too long.
        SymbolTooLong,
        /// Cannot transfer the asset
        TransferError,
        /// Cannot mint the asset
        CannotMint,
        /// Cannot create the asset
        CannotCreate,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::deposit_collateral())]
        #[transactional]
        pub fn deposit_collateral(
            origin: OriginFor<T>,
            pool_id: T::PoolId,
            asset_id: AssetIdOf<T>,
            amount: AssetBalanceOf<T>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
        
            ensure!(!amount.is_zero(), Error::<T>::InvalidCollateralAmount);
        
            // Ensure accounts exist for the asset
            Self::ensure_asset_account(&asset_id, &Self::pallet_account_id())?;
            Self::ensure_asset_account(&asset_id, &who)?;
        
            Self::transfer_asset_to_pool(&who, &asset_id, amount)?;
        
            // Rest of your function remains the same
            UserCollateral::<T>::mutate((pool_id, asset_id.clone(), &who), |balance| {
                *balance = balance.saturating_add(amount)
            });
            TotalCollateralBalance::<T>::mutate((pool_id, asset_id.clone()), |balance| {
                *balance = balance.saturating_add(amount)
            });
        
            Self::deposit_event(Event::CollateralDeposited(who, pool_id, asset_id, amount));
            Ok(())
        }

        #[pallet::call_index(1)]
        #[pallet::weight(T::WeightInfo::withdraw_collateral())]
        #[transactional]
        pub fn withdraw_collateral(
            origin: OriginFor<T>,
            pool_id: T::PoolId,
            asset_id: AssetIdOf<T>,
            amount: AssetBalanceOf<T>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let current_collateral = UserCollateral::<T>::get((pool_id, asset_id.clone(), &who));
            ensure!(
                current_collateral >= amount,
                Error::<T>::InsufficientCollateral
            );

            ensure!(
                !T::RiskManager::is_position_healthy(pool_id, &who),
                Error::<T>::WithdrawalWouldUndercollateralize
            );

            UserCollateral::<T>::mutate((pool_id, asset_id.clone(), &who), |balance| {
                *balance = balance.saturating_sub(amount)
            });
            // Subtract from total_collateral
            TotalCollateralBalance::<T>::mutate((pool_id, asset_id.clone()), |balance| {
                *balance = balance.saturating_sub(amount)
            });

            Self::transfer_to_user(&who, &asset_id, amount)?;

            Self::deposit_event(Event::CollateralWithdrawn(who, pool_id, asset_id, amount));
            Ok(())
        }

        #[pallet::call_index(2)]
        #[pallet::weight(T::WeightInfo::liquidate())]
        #[transactional]
        pub fn liquidate(
            origin: OriginFor<T>,
            liquidator: AccountIdOf<T>,
            account: AccountIdOf<T>,
            pool_id: T::PoolId,
            asset_id: AssetIdOf<T>,
            max_amount: AssetBalanceOf<T>,
        ) -> DispatchResult {
            let _ = ensure_signed(origin)?;

            ensure!(
                !T::RiskManager::is_position_healthy(pool_id, &account),
                Error::<T>::PositionNotLiquidatable
            );

            // let collateral_params = CollateralParameters::<T>::get((pool_id, asset_id.clone()));
            // Get collateral params from Risk Manager
            let collateral_params = CollateralParams {
                is_enabled: false,
                max_ceiling: u128::MAX,
                base_ltv: 8500u16,
                liquidation_threshold: 9000u16,
                liquidation_penalty: 1000u16,
                liquidation_fee: 0u16,
            };

            // Ensure liquidation_penalty can be converted to u32
            let liquidation_penalty: u32 = collateral_params
                .liquidation_penalty
                .try_into()
                .map_err(|_| Error::<T>::ArithmeticError)?;

            let liquidation_amount = max_amount.min(
                UserCollateral::<T>::get((pool_id, asset_id.clone(), &account))
                    .saturating_mul(liquidation_penalty.into())
                    / 100u32.into(),
            );

            let price = T::Oracle::get_price(asset_id.clone())
                .ok_or(Error::<T>::CollateralAssetNotFound)?;

            // Convert AssetBalance to u128 for calculation
            let liquidation_amount_u128: u128 = liquidation_amount
                .try_into()
                .map_err(|_| Error::<T>::ArithmeticError)?;
            let price_u128: u128 = price.try_into().map_err(|_| Error::<T>::ArithmeticError)?;

            // Perform the calculation
            let debt_to_cover_u128 = price_u128
                .saturating_mul(liquidation_amount_u128)
                .checked_div(100)
                .ok_or(Error::<T>::ArithmeticError)?;

            // Convert back to AssetBalance
            let debt_to_cover = AssetBalanceOf::<T>::try_from(debt_to_cover_u128)
                .map_err(|_| Error::<T>::ArithmeticError)?;

            T::Pools::prepare_liquidation(
                liquidator.clone(),
                account.clone(),
                pool_id,
                debt_to_cover,
            )?;

            UserCollateral::<T>::mutate((pool_id, asset_id.clone(), &account), |balance| {
                *balance = balance.saturating_sub(liquidation_amount)
            });
            UserCollateral::<T>::mutate((pool_id, asset_id.clone(), &liquidator), |balance| {
                *balance = balance.saturating_add(liquidation_amount)
            });

            Self::deposit_event(Event::Liquidated(
                liquidator,
                account,
                pool_id,
                asset_id,
                liquidation_amount,
                debt_to_cover,
            ));
            Ok(())
        }
    }


    impl<T: Config> ReserveTrait<T::PoolId, T::AccountId, T::AssetId, T::AssetBalance, T::Price> for Pallet<T> {
        fn get_collateral_index(pool_id: T::PoolId, asset_id: AssetIdOf<T>) -> u16 {
            // Get total collaterals
            let total_collaterals = TotalCollaterals::<T>::get(pool_id);
            // Iterate through all collateral assets to find the index of the asset_id
            for i in 0..total_collaterals {
                let collateral_asset = PoolCollateral::<T>::get((pool_id, i));
                if collateral_asset == asset_id {
                    return i;
                }
            }
            // If the asset_id is not found, return u16 max value
            u16::MAX
        }

        fn add_collateral_asset(pool_id: T::PoolId, asset_id: AssetIdOf<T>) -> DispatchResult {
            // pool collateral index
            let index = TotalCollaterals::<T>::get(pool_id) + 1;

            // Check if the asset is already added
            ensure!(
                !PoolCollateral::<T>::contains_key((pool_id, index)),
                Error::<T>::CollateralAssetAlreadyExists
            );

            PoolCollateral::<T>::insert((pool_id, index), asset_id.clone());
            TotalCollaterals::<T>::insert(pool_id, index);
            // Update total collateral as 0
            TotalCollateralBalance::<T>::insert(
                (pool_id, asset_id.clone()),
                AssetBalanceOf::<T>::zero(),
            );

            Self::deposit_event(Event::CollateralAssetAdded(pool_id, asset_id));
            Ok(())
        }

        fn get_user_position(
            pool_id: T::PoolId,
            account: T::AccountId,
        ) -> Vec<UserCollateralData<AssetIdOf<T>, AssetBalanceOf<T>, T::Price>> {
            let mut user_collaterals = Vec::new();
            for i in 1..(TotalCollaterals::<T>::get(pool_id) + 1) {
                let collateral_asset = PoolCollateral::<T>::get((pool_id, i));
                let balance = UserCollateral::<T>::get((pool_id, collateral_asset.clone(), account.clone()));
                if let Some(price) = T::Oracle::get_price(collateral_asset.clone()) {
                    if let Ok(name) = T::AssetRegistry::name(collateral_asset.clone()).try_into() {
                        if let Ok(symbol) = T::AssetRegistry::symbol(collateral_asset.clone()).try_into() {
                            if let Ok(params) = T::RiskManager::get_collateral_params(pool_id, collateral_asset.clone()) {
                                user_collaterals.push(UserCollateralData {
                                    asset: AssetMetadata {
                                        id: collateral_asset.clone(),
                                        name,
                                        symbol,
                                        decimals: T::AssetRegistry::decimals(collateral_asset.clone()),
                                        price,
                                    },
                                    balance,
                                    params,
                                });
                            }
                        }
                    }
                }
            }
            user_collaterals
        }
    }

    impl<T: Config> Pallet<T> {
        /// The account ID of the reserve pool
        pub fn pallet_account_id() -> T::AccountId {
            T::PalletId::get().into_account_truncating()
        }
    
        fn transfer_asset_to_pool(
            sender: &AccountIdOf<T>,
            asset_id: &AssetIdOf<T>,
            amount: AssetBalanceOf<T>,
        ) -> DispatchResult {
            // Check if the sender has sufficient balance
            ensure!(
                T::Assets::balance(asset_id.clone(), sender) >= amount,
                Error::<T>::InsufficientCollateral
            );
    
            // Ensure pool account exists for this asset
            if T::Assets::balance(asset_id.clone(), &Self::pallet_account_id()).is_zero() {
                // If needed, create the asset account for the pool
                T::Assets::mint_into(
                    asset_id.clone(),
                    &Self::pallet_account_id(),
                    AssetBalanceOf::<T>::one(),
                ).map_err(|_| Error::<T>::CannotCreate)?;
            }
    
            // Transfer the asset from the sender to the pool account
            T::Assets::transfer(
                asset_id.clone(),
                sender,
                &Self::pallet_account_id(),
                amount,
                Preservation::Expendable, // Changed to Expendable to allow for dust amounts
            ).map_err(|_| Error::<T>::TransferError)?;
    
            Ok(())
        }
    
        fn transfer_to_user(
            recipient: &AccountIdOf<T>,
            asset_id: &AssetIdOf<T>,
            amount: AssetBalanceOf<T>,
        ) -> DispatchResult {
            // Ensure the pool has sufficient balance
            ensure!(
                T::Assets::balance(asset_id.clone(), &Self::pallet_account_id()) >= amount,
                Error::<T>::InsufficientCollateral
            );
    
            // Transfer the asset from the pool to the user
            T::Assets::transfer(
                asset_id.clone(),
                &Self::pallet_account_id(),
                recipient,
                amount,
                Preservation::Expendable, // Changed to Expendable to allow for dust amounts
            ).map_err(|_| Error::<T>::TransferError)?;
    
            Ok(())
        }

        fn ensure_asset_account(
            asset_id: &AssetIdOf<T>,
            account: &T::AccountId,
        ) -> DispatchResult {
            if T::Assets::balance(asset_id.clone(), account).is_zero() {
                T::Assets::mint_into(
                    asset_id.clone(),
                    account,
                    AssetBalanceOf::<T>::one(),
                ).map_err(|_| Error::<T>::CannotCreate)?;
            }
            Ok(())
        }
    }
}
