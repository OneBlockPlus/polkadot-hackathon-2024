#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[macro_use]
extern crate alloc;

#[ink::contract]
mod attestation {

    /// Defines the storage of your contract.
    #[ink(storage)]
    pub struct Attestation {
        /// Stores the attestation structure on the storage.
        attestation_id: u32,
        timestamp: ink_prelude::string::String,
        amount_spent: u32,
        file_metadata: ink_prelude::string::String,
        file_name: ink_prelude::string::String,
        file_hash: ink_prelude::string::String,
        attested_by: ink_prelude::string::String,
        referenda_id: u32,
    }

    impl Attestation {
        /// Constructor that initializes the struct value according to the given params.
        #[ink(constructor)]
        pub fn new(
            time: ink_prelude::string::String,
            amount: u32,
            file_met: ink_prelude::string::String,
            file_nam: ink_prelude::string::String,
            file_has: ink_prelude::string::String,
            user: ink_prelude::string::String,
            referenda: u32,
        ) -> Self {
            Self {
                attestation_id: 0,
                timestamp: time,
                amount_spent: amount,
                file_metadata: file_met,
                file_name: file_nam,
                file_hash: file_has,
                attested_by: user,
                referenda_id: referenda
            }
        }

        /// Returns the current value of our attestation_id.
        #[ink(message)]
        pub fn get_attestation_id(&self) -> u32 {
            self.attestation_id
        }

        /// Returns the current value of our timestamp.
        #[ink(message)]
        pub fn get_timestamp(&self) -> ink_prelude::string::String {
            self.timestamp.clone()
        }

        /// Returns the current value of our amount_spent.
        #[ink(message)]
        pub fn get_amount_spent(&self) -> u32 {
            self.amount_spent
        }

        /// Returns the current value of our file_metadata.
        #[ink(message)]
        pub fn get_file_metadata(&self) -> ink_prelude::string::String {
            self.file_metadata.clone()
        }

        /// Returns the current value of our file_name.
        #[ink(message)]
        pub fn get_file_name(&self) -> ink_prelude::string::String {
            self.file_name.clone()
        }

        /// Returns the current value of our file_hash.
        #[ink(message)]
        pub fn get_file_hash(&self) -> ink_prelude::string::String {
            self.file_hash.clone()
        }

        /// Returns the current value of the attesting user.
        #[ink(message)]
        pub fn get_attested_by(&self) -> ink_prelude::string::String {
            self.attested_by.clone()
        }

        /// Returns the current value of our referenda_id.
        #[ink(message)]
        pub fn get_referenda_id(&self) -> u32 {
            self.referenda_id
        }

        /// Returns a link to the Polkadot Referenda page.
        #[ink(message)]
        pub fn get_referenda_link(&self) -> ink_prelude::string::String {
            format!("https://polkadot.polkassembly.io/referenda/{}", self.referenda_id)
        }
    }

    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let attestation = Attestation::new(
                "2024-08-17".to_string(),
                1000000,
                "12378894123".to_string(),
                "AttestationABC.jpeg".to_string(),
                "HAWD72Y17E8GDQH2ED".to_string(),
                "Alice".to_string(),
                1091
            );

            attestation.get_attestation_id();
            attestation.get_timestamp();
            attestation.get_amount_spent();
            attestation.get_file_metadata();
            attestation.get_file_name();
            attestation.get_file_hash();
            attestation.get_attested_by();
            attestation.get_referenda_id();
        }
    }
}
