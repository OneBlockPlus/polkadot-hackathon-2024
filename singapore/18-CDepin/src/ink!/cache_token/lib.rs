#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub use self::cache_token::CacheTokenRef;

#[openbrush::implementation(PSP34, PSP34Metadata, PSP34Enumerable)]
#[openbrush::contract]
mod cache_token {
    use crate::cache_token::PSP34Impl;
    use ink::{env::hash::Keccak256, storage::Mapping};
    use openbrush::{
        contracts::psp34::{Owner, PSP34Error},
        traits::Storage,
    };
    use scale::Encode;

    type TokenId = Vec<u8>;

    #[ink(storage)]
    #[derive(Storage)]
    pub struct CacheToken {
        #[storage_field]
        psp34: psp34::Data,
        #[storage_field]
        metadata: metadata::Data,
        #[storage_field]
        enumerable: enumerable::Data,
        owner: Owner,
        release_time: Mapping<TokenId, u64>,
    }

    #[ink(event)]
    pub struct MintToken {
        owner: Owner,
        token_id: TokenId,
    }

    impl CacheToken {
        #[ink(constructor)]
        pub fn new(name: String, symbol: String) -> Self {
            let mut instance = Self {
                owner: Self::env().caller(),
                psp34: Default::default(),
                release_time: Mapping::default(),
                metadata: Default::default(),
                enumerable: Default::default(),
            };
            let token_id = Self::generate_token();
            let name_key = String::from("name");
            let symbol_key = String::from("symbol");
            metadata::Internal::_set_attribute(&mut instance, Id::Bytes(token_id.clone()), name_key, name);
            metadata::Internal::_set_attribute(&mut instance, Id::Bytes(token_id), symbol_key, symbol);

            instance
        }

        #[ink(message, payable)]
        pub fn mint_token(&mut self, to: Owner) -> Result<(), PSP34Error> {
            let zero_address = AccountId::from([0x00; 32]);

            if to == zero_address {
                return Err(PSP34Error::Custom("Invalid receiver: zero address".into()));
            }

            let transferred_value = Self::env().transferred_value();

            if transferred_value < 100_000_000_000_000_000_000 {
                return Err(PSP34Error::Custom("Insufficient payment".into()));
            }

            let token_id = Self::generate_token();

            psp34::Internal::_mint_to(self, to, Id::Bytes(token_id.clone()))?;

            self.release_time.insert(
                token_id.clone(),
                &(self.env().block_timestamp() + 300 * 1000),
            );

            Self::env().emit_event(MintToken {
                owner: to,
                token_id,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn withdraw(&mut self) -> Result<(), PSP34Error> {
            let caller = self.env().caller();
            let balance = self.env().balance();
            if self.owner != caller {
                return Err(PSP34Error::Custom("Not Authorized!".into()));
            }

            if balance < 1_000_000_000_000_000_000 {
                return Err(PSP34Error::Custom("Insufficient balance!".into()));
            }

            if let Err(_) = self.env().transfer(self.owner, balance) {
                return Err(PSP34Error::Custom("Withdraw failed!".into()));
            }

            Ok(())
        }

        fn generate_token() -> TokenId {
            let timestamp = Self::env().block_timestamp();
            let encoded_timestamp = timestamp.encode();
            let mut output = [0; 32];
            ink::env::hash_bytes::<Keccak256>(&encoded_timestamp, &mut output);
            output.to_vec()
        }

        #[ink(message)]
        pub fn transfer_from(
            &mut self,
            to: Owner,
            token_id: TokenId,
            data: Option<Vec<u8>>,
        ) -> Result<(), PSP34Error> {
            // returns false if token is not locked.
            // else throws error
            self.check_token_id_lock(token_id.clone())?;

            let data = if let Some(data) = data {
                data
            } else {
                Vec::new()
            };

            psp34::Internal::_transfer_token(self, to, Id::Bytes(token_id), data)?;

            Ok(())
        }

        fn check_token_id_lock(&self, token_id: TokenId) -> Result<bool, PSP34Error> {
            if let Some(release_time) = self.release_time.get(token_id) {
                if self.env().block_timestamp() < release_time {
                    return Err(PSP34Error::Custom("The token is locked.".into()));
                }

                Ok(false)
            } else {
                return Err(PSP34Error::Custom("Token not found.".into()));
            }
        }

        #[ink(message)]
        pub fn owner_of(&self, token_id: TokenId) -> Result<Option<AccountId>, PSP34Error> {
            let account = psp34::Internal::_owner_of(self, &Id::Bytes(token_id));
            Ok(account)
        }

        #[ink(message)]
        pub fn account_id(&self) -> AccountId {
            self.env().account_id()
        }
    }
}
