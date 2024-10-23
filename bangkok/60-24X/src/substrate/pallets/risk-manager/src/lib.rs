#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub mod weights;

use frame_support::pallet_prelude::*;
use frame_system::pallet_prelude::*;
use crate::weights::WeightInfo;
use frame_support::traits::Currency;
use sp_runtime::traits::{AtLeast32BitUnsigned, MaybeSerializeDeserialize};
use frame_support::{
    pallet_prelude::*,
    sp_runtime::{
        traits::{
            AccountIdConversion, CheckedAdd, CheckedMul, CheckedSub, Convert, One, Saturating,
            Zero,
        },
        FixedPointNumber, FixedPointOperand, FixedU128,
    },
    traits::{
        fungibles::{Create, Destroy, Inspect, Mutate},
        tokens::{Balance, Fortitude, Precision, Preservation, WithdrawConsequence},
        ExistenceRequirement,
    },
    transactional, PalletId,
};

use codec::EncodeLike;
use sp_std::fmt::Debug;
use sp_std::vec::Vec;

use common::{RiskManagerTrait, ReserveTrait, OracleTrait, PoolsTrait, PoolParams, CollateralParams, GlobalRiskParams, UserPosition};

#[frame_support::pallet]
pub mod pallet {
    use super::*;
    
    pub type AccountIdOf<T> = <T as frame_system::Config>::AccountId;
    pub type BalanceOf<T> = <<T as Config>::Currency as Currency<AccountIdOf<T>>>::Balance;
    pub type AssetIdOf<T> = <T as Config>::AssetId;
    pub type AssetBalanceOf<T> = <T as Config>::AssetBalance;

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
            + TypeInfo;

        /// The type for tradable assets.
        type Assets: Inspect<Self::AccountId, AssetId = Self::AssetId, Balance = Self::AssetBalance>
        + Mutate<Self::AccountId>;

        /// The type for liquidity tokens.
        type AssetRegistry: Inspect<Self::AccountId, AssetId = Self::AssetId, Balance = Self::AssetBalance>
        + Mutate<Self::AccountId>
        + Create<Self::AccountId>
        + Destroy<Self::AccountId>;

        type Price: Member + Parameter + Copy + Default + Zero + MaxEncodedLen;
        /// The Oracle pallet, used for price feeds.
        type Oracle: OracleTrait<AssetIdOf<Self>, Self::Price>;
        /// The reserve pallet
        type Reserve: ReserveTrait<Self::PoolId, Self::AccountId, Self::AssetId, Self::AssetBalance, Self::Price>;
        /// The pools pallet
        type Pools: PoolsTrait<Self::AccountId, Self::PoolId, Self::AssetBalance>;
        /// Weight information for extrinsics in this pallet.
        type WeightInfo: WeightInfo;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::storage]
    pub type PoolParameters<T: Config> = StorageMap<_, Blake2_128Concat, T::PoolId, PoolParams<T::AssetId, AssetBalanceOf<T>>>;

    #[pallet::storage]
    pub type CollateralParameters<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        (T::PoolId, AssetIdOf<T>),
        CollateralParams,
        ValueQuery,
    >;

    #[pallet::storage]
    #[pallet::getter(fn global_risk_state)]
    pub type GlobalRiskState<T: Config> = StorageValue<_, GlobalRiskParams<AssetBalanceOf<T>>, ValueQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// Pool parameters updated. [pool_id]
        PoolParametersUpdated(T::PoolId),
        /// Collateral parameters updated. [pool_id, asset_id]
        CollateralParametersUpdated(T::PoolId, AssetIdOf<T>),
        /// Global risk parameters updated.
        GlobalRiskParametersUpdated,
        /// A position became liquidatable. [account, pool_id]
        PositionBecameLiquidatable(T::AccountId, T::PoolId),
    }

    #[pallet::error]
    pub enum Error<T> {
        /// The pool was not found.
        PoolNotFound,
        /// The collateral asset was not found.
        CollateralAssetNotFound,
        /// The parameter is invalid.
        InvalidParameter,
        /// The caller is not authorized to perform this operation.
        UnauthorizedOperation,
        /// The position was not found.
        PositionNotFound,
    }

    // GenesisConfig
    // Iterate through the pool IDs
    // Add collateral assets to the pool & set the collateral parameters (use dummy tokens initially)
    // Set the pool parameters
    // Set initial prices for all assets
    #[pallet::genesis_config]
    pub struct GenesisConfig<T: Config> {
        // First pool is always USD
        pub pool_parameters: Vec<(Vec<u8>, Vec<u8>, PoolParams<T::AssetId, AssetBalanceOf<T>>)>,
    }

    impl<T: Config> Default for GenesisConfig<T> {
        fn default() -> Self {
            GenesisConfig {
                pool_parameters: Vec::new(),
            }
        }
    }

    #[pallet::genesis_build]
    impl<T: Config> BuildGenesisConfig for GenesisConfig<T> {
        fn build(&self) {
            for (name, symbol, params) in self.pool_parameters.iter() {
                // Create pool
                T::Pools::create_pool(name.clone(), symbol.clone());
                let pool_id = T::Pools::get_total_pools();
                let mut params_mut = params.clone();
                params_mut.synthetic_asset = <u64 as Into<AssetIdOf<T>>>::into(pool_id.into());
                PoolParameters::<T>::insert(pool_id, params_mut);
                // Add every other pool synthetic asset as collateral for this pool
                let synthetic_asset_id = self.pool_parameters.len() as u64;
                for i in 1..(synthetic_asset_id+1) {
                    T::Reserve::add_collateral_asset(pool_id, i.into());
                    // Use dummy values for collateral parameters
                    CollateralParameters::<T>::insert(
                        (pool_id, <u64 as Into<AssetIdOf<T>>>::into(i)),
                        CollateralParams {
                            is_enabled: true,
                            max_ceiling: u128::MAX - 5,
                            base_ltv: 8500u16,
                            liquidation_threshold: 9000u16,
                            liquidation_penalty: 1000u16,
                            liquidation_fee: 0u16,
                        },
                    );
                }
                
            }
        }
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::update_pool_parameters())]
        pub fn update_pool_parameters(
            origin: OriginFor<T>,
            pool_id: T::PoolId,
            new_parameters: PoolParams<T::AssetId, AssetBalanceOf<T>>,
        ) -> DispatchResult {
            // Make sure the caller is the admin
            // ensure!(
            //     origin
            //     Error::<T>::NotAuthorized
            // );

            PoolParameters::<T>::mutate(pool_id, |maybe_params| {
                if let Some(params) = maybe_params {
                    *params = new_parameters;
                    Self::deposit_event(Event::PoolParametersUpdated(pool_id));
                    Ok(())
                } else {
                    Err(Error::<T>::PoolNotFound.into())
                }
            })
        }

        /// Create a new pool
        #[pallet::call_index(1)]
        #[pallet::weight(T::WeightInfo::create_pool())]
        pub fn create_pool(origin: OriginFor<T>, symbol: Vec<u8>, initial_params: PoolParams<T::AssetId, AssetBalanceOf<T>>) -> DispatchResult {
            T::Pools::create_pool(symbol.clone(), symbol.clone())?;
            let pool_id = T::Pools::get_total_pools();
            Self::update_pool_parameters(origin, pool_id, initial_params)?;
            Ok(())
        }

        #[pallet::call_index(2)]
        #[pallet::weight(T::WeightInfo::update_collateral_parameters())]
        pub fn update_collateral_parameters(
            origin: OriginFor<T>,
            pool_id: T::PoolId,
            asset_id: AssetIdOf<T>,
            new_parameters: CollateralParams,
        ) -> DispatchResult {
            // Make sure the caller is the admin
            // ensure!(
            //     origin == T::Admin::get(),
            //     Error::<T>::NotAuthorized
            // );

            // Get collateral
            let collateral_index = T::Reserve::get_collateral_index(pool_id, asset_id.clone());
            if collateral_index == u16::MAX {
                // Add new collateral
                T::Reserve::add_collateral_asset(pool_id, asset_id.clone())?;
            }

            CollateralParameters::<T>::insert((pool_id, asset_id.clone()), new_parameters);
            Self::deposit_event(Event::CollateralParametersUpdated(pool_id, asset_id.clone()));
            Ok(())
        }

        #[pallet::call_index(3)]
        #[pallet::weight(T::WeightInfo::update_global_risk_parameters())]
        pub fn update_global_risk_parameters(
            origin: OriginFor<T>,
            new_parameters: GlobalRiskParams<AssetBalanceOf<T>>,
        ) -> DispatchResult {
            // Make sure the caller is the admin
            // ensure!(
            //     origin == T::Admin::get(),
            //     Error::<T>::NotAuthorized
            // );

            GlobalRiskState::<T>::set(new_parameters);
            Self::deposit_event(Event::GlobalRiskParametersUpdated);
            Ok(())
        }
    }

    impl<T: Config> RiskManagerTrait<T::PoolId, T::AccountId, T::AssetId, AssetBalanceOf<T>> for Pallet<T> {
        fn get_health_factor(pool_id: T::PoolId, account: &T::AccountId) -> Result<AssetBalanceOf<T>, DispatchError> {
            // Implementation of health factor calculation
            // This is a placeholder and should be replaced with actual logic
            Ok(AssetBalanceOf::<T>::from(100u32))
        }

        // Check if the position can be liquidated
        fn is_liquidatable(pool_id: T::PoolId, account: &T::AccountId) -> bool {
            if let Ok(health_factor) = Self::get_health_factor(pool_id, account) {
                health_factor < AssetBalanceOf::<T>::from(100u32)
            } else {
                false
            }
        }

        // Check if the position is wuthin safe limits
        fn is_position_healthy(pool_id: T::PoolId, account: &T::AccountId) -> bool {
            if let Ok(health_factor) = Self::get_health_factor(pool_id, account) {
                health_factor >= AssetBalanceOf::<T>::from(100u32)
            } else {
                false
            }
        }

        // Check if the user can mint
        fn can_mint(who: &T::AccountId, pool_id: T::PoolId, amount: AssetBalanceOf<T>) -> bool {
            // TODO: Implement the logic for checking if minting is allowed based on amount usd
            Self::get_health_factor(pool_id, who).map_or(false, |health_factor| health_factor >= AssetBalanceOf::<T>::from(100u32))
        }

        fn get_pool_parameters(pool_id: T::PoolId) -> Result<PoolParams<T::AssetId, AssetBalanceOf<T>>, DispatchError> {
            PoolParameters::<T>::get(pool_id).ok_or(Error::<T>::PoolNotFound.into())
        }

        fn get_collateral_params(pool_id: T::PoolId, asset_id: AssetIdOf<T>) -> Result<CollateralParams, DispatchError> {
            CollateralParameters::<T>::try_get((pool_id, asset_id))
                .map_err(|_| Error::<T>::CollateralAssetNotFound.into())
        }
    }

    // UI Data
    impl<T: Config> Pallet<T> {
        pub fn get_user_position(pool_id: T::PoolId, account: &T::AccountId) -> Result<UserPosition<AssetBalanceOf<T>>, DispatchError> {
            // TODO: Implementation of user position retrieval
            Ok(UserPosition {
                debt: AssetBalanceOf::<T>::zero(),
                collateral: AssetBalanceOf::<T>::zero(),
                collateral_base: AssetBalanceOf::<T>::zero(),
                collateral_liq: AssetBalanceOf::<T>::zero(),
            })
        }
    }
}
