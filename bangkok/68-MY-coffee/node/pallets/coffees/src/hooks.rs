use frame_support::pallet_macros::pallet_section;

use crate::migration;

/// Define all hooks used in the pallet.
#[pallet_section]
mod hooks {
    //use crate::migration;
    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
        fn on_runtime_upgrade() -> Weight {
            migration::migrate_to_v1::<T>()
            //Weight::default()
        }

        fn on_initialize(n: BlockNumberFor<T>) -> Weight {
            log::info!("Coffees on_initialize at block {:?}", n);
            let _ = Self::trade(n);
            Weight::default()
        }

        fn on_poll(n: BlockNumberFor<T>, _remaining_weight: &mut WeightMeter) {
            log::info!("Coffees on_poll at block {:?}", n);
        }

        fn on_finalize(n: BlockNumberFor<T>) {
            log::info!("Coffees on_finalize at block {:?}", n);
        }

        fn on_idle(n: BlockNumberFor<T>, _remaining_weight: Weight) -> Weight {
            log::info!("Coffees on_idle at block {:?}", n);
            Weight::default()
        }

        fn integrity_test() {
            assert!(NextCoffeeId::<T>::get() == 0);
        }

        fn offchain_worker(n: BlockNumberFor<T>) {
            log::info!("Coffees offchain_worker at block {:?}", n);
            let _ = Self::offchain_worker(n);
        }

        #[cfg(feature = "try-runtime")]
        fn pre_upgrade() -> Result<Vec<u8>, TryRuntimeError> {
            log::info!("Coffees storage pre_upgrade");
            let coffee_id = NextCoffeeId::<T>::get();
            Ok(coffee_id.encode())
        }

        #[cfg(feature = "try-runtime")]
        fn post_upgrade(state: Vec<u8>) -> Result<(), TryRuntimeError> {
            log::info!("Coffees storage post_upgrade");
            let coffee_id_before = u32::decode(&mut &state[..]).map_err(|_| "invalid id state")?;
            assert!(
                coffee_id_before == 0 || Coffees::<T>::contains_key(&coffee_id_before),
                "invalid not include state"
            );
            Ok(())
        }

        #[cfg(feature = "try-runtime")]
        fn try_state(_n: BlockNumberFor<T>) -> Result<(), TryRuntimeError> {
            Ok(())
        }
    }
}
