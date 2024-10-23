use crate::{Config, Coffees, Coffee, Pallet};
use frame_support::{pallet_prelude::*, storage_alias};
use sp_std::prelude::*;
// use storage::IterableStorageMap;
mod v0 {
    use super::*;
    // only contains V0 storage format
    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    pub struct OldCoffee(pub [u8; 16]);
    #[storage_alias]
    pub type Coffees<T: Config, OldCoffee> = StorageMap<Pallet<T>, Blake2_128Concat, u32, OldCoffee>;
}

// migrate fron v0 to v1
pub fn migrate_to_v1<T: Config>() -> Weight {
    // get current version
    let on_chain: StorageVersion = Pallet::<T>::on_chain_storage_version();
    if on_chain == 0 {
        log::info!("current version is 0, will upgrade to v1");
        log::info!(
            "current version is 0, will upgrade to v1,Old Coffee len:{:?}",
            v0::Coffees::<T, v0::OldCoffee>::iter().count()
        );

        Coffees::<T>::translate::<v0::OldCoffee, _>(|key: u32, value: v0::OldCoffee| {
            log::info!(
                " translate current version is 0, will upgrade to v1,Old Coffees id:{:?}",
                key
            );
            Some(Coffee {
                dna: value.0,
                price: None,
            })
        });
        
        StorageVersion::new(1).put::<Pallet<T>>();

        let count = Coffees::<T>::iter().count() as u64 + 1;
        log::info!(
            "current version is 0, will upgrade to v1,Coffees len:{:?}",
            count
        );
        return T::DbWeight::get().reads_writes(count, count);
        
    }
    Weight::default()
}