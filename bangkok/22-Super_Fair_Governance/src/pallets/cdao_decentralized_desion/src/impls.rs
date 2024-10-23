use frame_support::pallet_macros::pallet_section;

/// Define the implementation of the pallet, like helper functions.
#[pallet_section]
mod impls {
    impl<T: Config> Pallet<T> {
        /// An example dispatchable that takes a single u32 value as a parameter, writes the value
        /// to storage and emits an event.
        ///
        /// It checks that the _origin_ for this call is _Signed_ and returns a dispatch
        /// error if it isn't. Learn more about origins here: <https://docs.substrate.io/build/origins/>
        /*
         #[pallet::weight(T::WeightInfo::do_something())]
         pub fn do_something(origin: OriginFor<T>, something: u32) -> DispatchResult {
             // Check that the extrinsic was signed and get the signer.
             let who = ensure_signed(origin)?;

             // Update storage.
             Something::<T>::put(something);

             // Emit an event.
             // Self::deposit_event(Event::SomethingStored { something, who });

             // Return a successful `DispatchResult`
             Ok(())
         }
        */
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
        /*
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


        */

        // get a random 256.
        pub fn random_value(who: &T::AccountId) -> [u8; 16] {
            let nonce = frame_system::Pallet::<T>::account_nonce(&who);
            // let nonce_u32: u32 = nonce as u32;
            // generate a random value based on account and its nonce
            let nonce_u32: u32 = TryInto::try_into(nonce).ok().expect("nonce is u64; qed");
            let a: BlockNumberFor<T> = TryFrom::try_from(nonce_u32)
                .ok()
                .expect("nonce is u32; qed");
            // payload.using_encoded(blake2_128)
            [0_u8; 16]
        }
        // get a random 256.
        fn random_parent_value(kitty_1: u32, kitty_2: u32) -> [u8; 16] {
            // let nonce = frame_system::Pallet::<T>::account_nonce(&who);
            // let nonce_u32: u32 = nonce as u32;
            // generate a random value based on account and its nonce
            let nonce_u32: u32 = kitty_1 ^ kitty_2;
            let a: BlockNumberFor<T> = TryFrom::try_from(nonce_u32)
                .ok()
                .expect("nonce is u32; qed");
            // payload.using_encoded(blake2_128)
            [0_u8; 16]
        }
    }
}
