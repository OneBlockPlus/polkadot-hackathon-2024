use frame_support::pallet_macros::pallet_section;

/// Define all extrinsics for the pallet.
#[pallet_section]
mod dispatches {

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        //创建kitty
        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::do_something())]
        pub fn do_something(origin: OriginFor<T>) -> DispatchResult {
            let who = ensure_signed(origin)?; // 创建者是否已经授权签名

            let _value = Self::random_value(&who); // 假设random_value返回一个随机生成的数值
                                                   /* Self::deposit_event(Event::KittyBreeded {
                                                       creator: who,
                                                       kitty_1: kitty_1,
                                                       kitty_2: kitty_2,
                                                       index: kitty_id.into(),
                                                       data: value,
                                                   }); */
            Ok(())
        }
    }
}
