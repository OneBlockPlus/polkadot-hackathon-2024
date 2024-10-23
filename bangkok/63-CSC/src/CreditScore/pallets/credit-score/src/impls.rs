use frame_support::pallet_macros::pallet_section;
/// Define the implementation of the pallet, like helper functions.
#[pallet_section]
mod impls {
    impl<T: Config> Pallet<T> {
        pub fn random_value(who: &T::AccountId) -> [u8; 16] {
            let nonce = frame_system::Pallet::<T>::account_nonce(&who);
            // // let nonce_u32: u32 = nonce as u32;
            // // generate a random value based on account and its nonce
            // let nonce_u32: u32 = TryInto::try_into(nonce).ok().expect("nonce is u64; qed");
            // let a: BlockNumberFor<T> = TryFrom::try_from(nonce_u32)
            //     .ok()
            //     .expect("nonce is u32; qed");
            // // payload.using_encoded(blake2_128)
            // let payload = (
            //     T::Randomness::random_seed(),
            //     a,
            //     <frame_system::Pallet<T>>::extrinsic_index()
            // );
            // payload.using_encoded(sp_io::hashing::blake2_128)
            nonce.using_encoded(sp_io::hashing::blake2_128)
        }

        /// Offchain Worker entry point.
        fn offchain_worker(block_number: BlockNumberFor<T>) {
            // Note that having logs compiled to WASM may cause the size of the blob to increase
            // significantly. You can use `RuntimeDebug` custom derive to hide details of the types
            // in WASM. The `sp-api` crate also provides a feature `disable-logging` to disable
            // all logging and thus, remove any logging from the WASM.
            let order_item_vec = OrderItem::<T>::get();
            // this is hard code, todo!
            let mut url = "http://www.example.com";
            let mut score_name = 0;
            let mut internal_order_id = 0;
            let mut user_account;
            let mut order_content = BoundedVec::default();

            if !order_item_vec.is_empty() {
                for order_item_info in order_item_vec.iter() {
                    /// if flag is false, expired timed deletion, todo!
                    if order_item_info.flag {
                        score_name = order_item_info.score_name.clone();
                        internal_order_id = order_item_info.internal_order_id.clone();
                        user_account = order_item_info.user_account.clone();
                        order_content = order_item_info.order_content.clone();
                    }
                }
            }

            log::info!("Exterlnal Order-ID caller from offchain workers!");
            // Since off-chain workers are just part of the runtime code, they have direct access
            // to the storage and other included pallets.
            //
            // We can easily import `frame_system` and retrieve a block hash of the parent block.
            let parent_hash = <frame_system::Pallet<T>>::block_hash(block_number - 1u32.into());
            log::debug!(
                "Current block: {:?} (parent hash: {:?})",
                block_number,
                parent_hash
            );

            let order_bound = &order_content.to_vec();
            let order_content_vec = std::str::from_utf8(order_bound).unwrap();
            // let order_content_vec = order_content.to_vec().as_bytes();
            
            // For this example we are going to send both signed and unsigned transactions
            // depending on the block number.
            // Usually it's enough to choose one or the other.
            let should_send = Self::choose_transaction_type(block_number);
            let res = match should_send {
                TransactionType::Signed => Self::send_signed(url, order_content_vec, score_name, user_account, internal_order_id),
                TransactionType::UnsignedForAny => {
                    Self::send_unsigned_for_any_account(block_number)
                }
                TransactionType::UnsignedForAll => {
                    Self::send_unsigned_for_all_accounts(block_number)
                }
                TransactionType::Raw => Self::send_raw_unsigned(block_number),
                TransactionType::None => Ok(()),
            };
            if let Err(e) = res {
                log::error!("Error: {}", e);
            }
        }

        /// Chooses which transaction type to send.
        ///
        /// This function serves mostly to showcase `StorageValue` helper
        /// and local storage usage.
        ///
        /// Returns a type of transaction that should be produced in current run.
        fn choose_transaction_type(block_number: BlockNumberFor<T>) -> TransactionType {
            /// A friendlier name for the error that is going to be returned in case we are in the grace
            /// period.
            const RECENTLY_SENT: () = ();

            // Start off by creating a reference to Local Storage value.
            // Since the local storage is common for all offchain workers, it's a good practice
            // to prepend your entry with the module name.
            let val = StorageValueRef::persistent(b"example_ocw::last_send");
            // The Local Storage is persisted and shared between runs of the offchain workers,
            // and offchain workers may run concurrently. We can use the `mutate` function, to
            // write a storage entry in an atomic fashion. Under the hood it uses `compare_and_set`
            // low-level method of local storage API, which means that only one worker
            // will be able to "acquire a lock" and send a transaction if multiple workers
            // happen to be executed concurrently.
            let res = val.mutate(
                |last_send: Result<Option<BlockNumberFor<T>>, StorageRetrievalError>| {
                    match last_send {
                        // If we already have a value in storage and the block number is recent enough
                        // we avoid sending another transaction at this time.
                        Ok(Some(block)) if block_number < block + T::GracePeriod::get() => {
                            Err(RECENTLY_SENT)
                        }
                        // In every other case we attempt to acquire the lock and send a transaction.
                        _ => Ok(block_number),
                    }
                },
            );

            // The result of `mutate` call will give us a nested `Result` type.
            // The first one matches the return of the closure passed to `mutate`, i.e.
            // if we return `Err` from the closure, we get an `Err` here.
            // In case we return `Ok`, here we will have another (inner) `Result` that indicates
            // if the value has been set to the storage correctly - i.e. if it wasn't
            // written to in the meantime.
            match res {
                // The value has been set correctly, which means we can safely send a transaction now.
                Ok(block_number) => {
                    // We will send different transactions based on a random number.
                    // Note that this logic doesn't really guarantee that the transactions will be sent
                    // in an alternating fashion (i.e. fairly distributed). Depending on the execution
                    // order and lock acquisition, we may end up for instance sending two `Signed`
                    // transactions in a row. If a strict order is desired, it's better to use
                    // the storage entry for that. (for instance store both block number and a flag
                    // indicating the type of next transaction to send).
                    let transaction_type = block_number % 1u32.into();
                    if transaction_type == Zero::zero() {
                        TransactionType::Signed
                    } else if transaction_type == BlockNumberFor::<T>::from(1u32) {
                        TransactionType::UnsignedForAny
                    } else if transaction_type == BlockNumberFor::<T>::from(2u32) {
                        TransactionType::UnsignedForAll
                    } else {
                        TransactionType::Raw
                    }
                }
                // We are in the grace period, we should not send a transaction this time.
                Err(MutateStorageError::ValueFunctionFailed(RECENTLY_SENT)) => {
                    TransactionType::None
                }
                // We wanted to send a transaction, but failed to write the block number (acquire a
                // lock). This indicates that another offchain worker that was running concurrently
                // most likely executed the same logic and succeeded at writing to storage.
                // Thus we don't really want to send the transaction, knowing that the other run
                // already did.
                Err(MutateStorageError::ConcurrentModification(_)) => TransactionType::None,
            }
        }

        fn send_unsigned_for_any_account(_block_number: BlockNumberFor<T>) -> Result<(), &'static str> {
            Ok(())
        }

        fn send_unsigned_for_all_accounts(_block_number: BlockNumberFor<T>) -> Result<(), &'static str> {
            Ok(())
        }

        fn send_raw_unsigned(_block_number: BlockNumberFor<T>) -> Result<(), &'static str> {
            Ok(())
        }

    }
}
