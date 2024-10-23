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
use sp_runtime::traits::Zero;
use crate::weights::WeightInfo; 
use frame_support::BoundedVec;
use sp_std::vec::Vec;
use common::OracleTrait;

#[frame_support::pallet]
pub mod pallet {
    use super::*;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        type WeightInfo: WeightInfo;  // Change this line
        type Price: MaybeSerializeDeserialize + Member + Parameter + Copy + Default + Zero + MaxEncodedLen;
        type AssetId: MaybeSerializeDeserialize + Member + Parameter + Copy + MaxEncodedLen;
        #[pallet::constant]
        type MaxPriceSources: Get<u32>;
    }

    #[pallet::storage]
    pub type Prices<T: Config> = StorageMap<_, Blake2_128Concat, T::AssetId, (T::Price, BlockNumberFor<T>)>; // (price, block number)

    #[pallet::storage]
    pub type PriceSources<T: Config> = StorageMap<_, Blake2_128Concat, T::AssetId, BoundedVec<T::AccountId, T::MaxPriceSources>>;

    #[pallet::storage]
    pub type StalenessThreshold<T: Config> = StorageValue<_, BlockNumberFor<T>>; // threshold in blocks

    #[pallet::storage]
    pub type MinimumSources<T: Config> = StorageValue<_, u8, ValueQuery>; // minimum number of sources

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        PriceUpdated {
            asset_id: T::AssetId,
            price: T::Price,
            provider: T::AccountId,
        },
        PriceSourceAdded {
            asset_id: T::AssetId,
            provider: T::AccountId,
        },
        PriceSourceRemoved {
            asset_id: T::AssetId,
            provider: T::AccountId,
        },
        StalenessThresholdUpdated {
            threshold: BlockNumberFor<T>,
        },
        MinimumSourcesUpdated {
            minimum: u8,
        },
        StalePrice {
            asset_id: T::AssetId,
        },
    }

    #[pallet::error]
    pub enum Error<T> {
        AssetNotSupported,
        UnauthorizedPriceProvider,
        InsufficientPriceSources,
        StalePrice,
        InvalidPrice,
        UnauthorizedOperation,
        TooManySources,
    }

    // Set initial prices for all assets
    #[pallet::genesis_config]
    pub struct GenesisConfig<T: Config> {
        pub prices: Vec<(T::AssetId, T::Price)>,
        pub staleness_threshold: BlockNumberFor<T>,
    }

    impl<T: Config> Default for GenesisConfig<T> {
        fn default() -> Self {
            GenesisConfig {
                prices: Vec::new(),
                staleness_threshold: BlockNumberFor::<T>::zero()
            }
        }
    }

    #[pallet::genesis_build]
    impl<T: Config> BuildGenesisConfig for GenesisConfig<T> {
        fn build(&self) {
            for (asset_id, price) in self.prices.iter() {
                Prices::<T>::insert(asset_id, (price, BlockNumberFor::<T>::zero()));
            }
            StalenessThreshold::<T>::put(self.staleness_threshold);
        }
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::update_price())]
        pub fn update_price(
            origin: OriginFor<T>,
            asset_id: T::AssetId,
            new_price: T::Price,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            ensure!(Self::is_authorized_provider(asset_id, &who), Error::<T>::UnauthorizedPriceProvider);
            ensure!(!new_price.is_zero(), Error::<T>::InvalidPrice);

            let now = <frame_system::Pallet<T>>::block_number();
            Prices::<T>::insert(asset_id, (new_price, now));

            Self::deposit_event(Event::PriceUpdated { asset_id, price: new_price, provider: who });
            Ok(())   
        }

        #[pallet::call_index(1)]
        #[pallet::weight(T::WeightInfo::add_price_source())]
        pub fn add_price_source(
            origin: OriginFor<T>,
            asset_id: T::AssetId,
            provider: T::AccountId,
        ) -> DispatchResult {
            ensure_root(origin)?;

            let mut sources: BoundedVec<T::AccountId, T::MaxPriceSources> = PriceSources::<T>::get(asset_id).unwrap_or_else(BoundedVec::new);
            if !sources.contains(&provider) {
                sources.try_push(provider.clone()).map_err(|_| Error::<T>::TooManySources)?;
                PriceSources::<T>::insert(asset_id, sources);
            }

            Self::deposit_event(Event::PriceSourceAdded { asset_id, provider });
            Ok(())
        }

        #[pallet::call_index(2)]
        #[pallet::weight(T::WeightInfo::remove_price_source())]
        pub fn remove_price_source(
            origin: OriginFor<T>,
            asset_id: T::AssetId,
            provider: T::AccountId,
        ) -> DispatchResult {
            ensure_root(origin)?;

            PriceSources::<T>::mutate(asset_id, |sources| {
                if let Some(sources) = sources {
                    sources.retain(|p| p != &provider);
                }
            });

            Self::deposit_event(Event::PriceSourceRemoved { asset_id, provider });
            Ok(())
        }

        #[pallet::call_index(3)]
        #[pallet::weight(T::WeightInfo::set_staleness_threshold())]
        pub fn set_staleness_threshold(
            origin: OriginFor<T>,
            threshold: BlockNumberFor<T>,
        ) -> DispatchResult {
            ensure_root(origin)?;

            StalenessThreshold::<T>::put(threshold);

            Self::deposit_event(Event::StalenessThresholdUpdated { threshold });
            Ok(())
        }

        #[pallet::call_index(4)]
        #[pallet::weight(T::WeightInfo::set_minimum_sources())]
        pub fn set_minimum_sources(
            origin: OriginFor<T>,
            minimum: u8,
        ) -> DispatchResult {
            ensure_root(origin)?;

            MinimumSources::<T>::put(minimum);

            Self::deposit_event(Event::MinimumSourcesUpdated { minimum });
            Ok(())
        }
    }

    impl<T: Config> OracleTrait<T::AssetId, T::Price> for Pallet<T> {
        fn get_price(asset_id: T::AssetId) -> Option<T::Price> {
            if let Some((price, block_number)) = Prices::<T>::get(asset_id) {
                if Self::is_price_fresh(block_number) {
                    Some(price)
                } else {
                    Self::deposit_event(Event::StalePrice { asset_id });
                    None
                }
            } else {
                None
            }
        }
    }
    
    impl<T: Config> Pallet<T> {
        fn is_price_valid(asset_id: T::AssetId) -> bool {
            if let Some((_, block_number)) = Prices::<T>::get(asset_id) {
                Self::is_price_fresh(block_number) &&
                    Self::has_sufficient_sources(asset_id)
            } else {
                false
            }
        }

        fn get_price_sources(asset_id: T::AssetId) -> BoundedVec<T::AccountId, T::MaxPriceSources> {
            PriceSources::<T>::get(asset_id).unwrap_or_default()
        }

        fn is_price_fresh(block_number: BlockNumberFor<T>) -> bool {
            let current_block = <frame_system::Pallet<T>>::block_number();
            let staleness_threshold = StalenessThreshold::<T>::get().unwrap_or_default();

            current_block - block_number <= staleness_threshold
        }

        fn is_authorized_provider(asset_id: T::AssetId, provider: &T::AccountId) -> bool {
            PriceSources::<T>::get(asset_id)
                .map(|sources| sources.contains(provider))
                .unwrap_or(false)
        }

        fn has_sufficient_sources(asset_id: T::AssetId) -> bool {
            let minimum_sources = MinimumSources::<T>::get();
            let current_sources = PriceSources::<T>::get(asset_id).map(|s| s.len() as u32).unwrap_or(0);
            current_sources >= minimum_sources.try_into().unwrap_or(0)
        }

        fn get_staleness_threshold() -> Option<BlockNumberFor<T>> {
            StalenessThreshold::<T>::get()
        }

        fn get_minimum_sources() -> u8 {
            MinimumSources::<T>::get()
        }
    }

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}
}
