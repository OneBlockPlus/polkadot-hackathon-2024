use frame_support::pallet_macros::pallet_section;

/// Define the implementation of the pallet, like helper functions.
#[pallet_section]
mod impls {
    impl<T: Config> Pallet<T> { 
    }
}
