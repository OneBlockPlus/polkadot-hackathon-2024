use frame_support::pallet_macros::pallet_section;

#[pallet_section]
mod genesis {  
  /*  
    #[pallet::genesis_config]
    pub struct GenesisConfig<T: Config> {
        pub genesis_kitty: KittyInfo,
        pub _marker: sp_std::marker::PhantomData<T>,
    }

    impl<T: Config> Default for GenesisConfig<T> {
        fn default() -> Self {
            Self {
                genesis_kitty: KittyInfo([0; 16]),
                _marker: Default::default(),
            }
        }
    }

    #[pallet::genesis_build]
    impl<T: Config> BuildGenesisConfig for GenesisConfig<T> {
        fn build(&self) {
            //  KittyInfoList::<T>::insert(u32::MAX, self.genesis_kitty.clone());
        }
    }
  
  
   */
}
