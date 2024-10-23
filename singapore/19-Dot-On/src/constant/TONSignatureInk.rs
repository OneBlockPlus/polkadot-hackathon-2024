#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod account_factory {
    use ink::prelude::vec::Vec;
    use ink::env::hash::Sha2x256;
    use ink::env::AccountId;
    use ink::env::Clear;
    use sp_core::crypto::Pair;
    use sp_core::ed25519;
    use sp_runtime::traits::Verify;

    #[ink(storage)]
    pub struct AccountFactory {
        accounts: Vec<Account>,
    }

    #[derive(Clone, Debug)]
    #[ink(storage)]
    pub struct Account {
        owner: ed25519::Public, // Ton account public key
    }

    impl AccountFactory {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { accounts: Vec::new() }
        }

        #[ink(message)]
        pub fn create_account(&mut self, ton_pub_key: [u8; 32]) -> AccountId {
            let account = Account { owner: ed25519::Public::from_raw(ton_pub_key) };
            self.accounts.push(account);
            Self::env().account_id()
        }

        #[ink(message)]
        pub fn execute_with_ton_signature(
            &self,
            account_id: AccountId,
            payload: Vec<u8>,
            signature: [u8; 64],
        ) -> Result<(), &'static str> {
            let account = self.get_account_by_id(account_id)?;
            let signature = ed25519::Signature::from_raw(signature);
            let public_key = account.owner;

            // Hash the payload to get a 256-bit digest
            let hash = Sha2x256::hash(&payload);

            // Verify ED25519 signature
            if ed25519::Pair::verify(&signature, &hash, &public_key) {
                // Signature verified, execute payload
                // TODO: Implement payload execution logic here
                Ok(())
            } else {
                Err("Invalid signature")
            }
        }

        fn get_account_by_id(&self, account_id: AccountId) -> Result<&Account, &'static str> {
            self.accounts
                .iter()
                .find(|acc| Self::env().account_id() == account_id)
                .ok_or("Account not found")
        }
    }

    impl Account {
        #[ink(message)]
        pub fn transfer(&self, to: AccountId, value: Balance) -> Result<(), &'static str> {
            // Transfer logic here
            if self.env().transfer(to, value).is_err() {
                return Err("Transfer failed");
            }
            Ok(())
        }
    }
}
