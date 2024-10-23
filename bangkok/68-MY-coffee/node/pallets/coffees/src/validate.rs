use frame_support::pallet_macros::pallet_section;

#[pallet_section]
mod validate {

    #[pallet::validate_unsigned]
    impl<T: Config> ValidateUnsigned for Pallet<T> {
        type Call = Call<T>;

        /// Validate unsigned call to this module.
        ///
        /// By default unsigned transactions are disallowed, but implementing the validator
        /// here we make sure that some particular calls (the ones produced by offchain worker)
        /// are being whitelisted and marked as valid.
        fn validate_unsigned(_source: TransactionSource, call: &Self::Call) -> TransactionValidity {
            // Firstly let's check that we call the right function.
            if let Call::submit_price_unsigned_with_signed_payload {
                price_payload: ref payload,
                ref signature,
            } = call
            {
                let signature_valid =
                    SignedPayload::<T>::verify::<T::AuthorityId>(payload, signature.clone());
                if !signature_valid {
                    return InvalidTransaction::BadProof.into();
                }
                Self::validate_transaction_parameters(&payload.block_number, &payload.price)
            } else if let Call::submit_price_unsigned {
                block_number,
                price: new_price,
            } = call
            {
                Self::validate_transaction_parameters(block_number, new_price)
            } else {
                InvalidTransaction::Call.into()
            }
        }
    }
}