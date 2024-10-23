#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod distributor {
    use super::*;
    use ink::env::call::{build_call, ExecutionInput, Selector};
    use ink::env::DefaultEnvironment;
    use ink::storage::Mapping;

    #[ink(storage)]
    pub struct Distributor {
        liquidity_providers: Mapping<AccountId, Balance>,
        team: AccountId,
        erc20: AccountId,
    }

    impl Distributor {
        #[ink(constructor)]
        pub fn new(team_address: AccountId, erc20_contract_address: AccountId) -> Self {
            let liquidity_providers = Mapping::default();
            let team = team_address;
            let erc20 = erc20_contract_address;
            Self { liquidity_providers, team, erc20 }
        }

        #[ink(message)]
        pub fn withdraw_funds_from_vault(&mut self, vault: AccountId) {
            let withdraw = build_call::<DefaultEnvironment>()
                .call(vault)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("withdraw_distributor")))
                )
                .returns::<bool>()
                .invoke();
        }

        #[ink(message)]
        pub fn add_funds(&mut self, amount: Balance) {
            let caller = self.env().caller();
            self.liquidity_providers.insert(caller, &amount);
        }

        #[ink(message)]
        pub fn withdraw_funds(&self) -> bool {
            let caller = self.env().caller();

            // if (caller == team) {
            //     let get_total_balance = 
            //     let withdraw_amount = 
            // } 
            //check if it's team
            //if it's liquidity provider
            //error if not team or provider
            true
        }
    }

    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let distributor = Distributor::default();
            assert_eq!(distributor.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut distributor = Distributor::new(false);
            assert_eq!(distributor.get(), false);
            distributor.flip();
            assert_eq!(distributor.get(), true);
        }
    }

    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// A helper function used for calling contract messages.
        use ink_e2e::ContractsBackend;

        /// The End-to-End test `Result` type.
        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        /// We test that we can upload and instantiate the contract using its default constructor.
        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let mut constructor = DistributerRef::default();

            // When
            let contract = client
                .instantiate("distributer", &ink_e2e::alice(), &mut constructor)
                .submit()
                .await
                .expect("instantiate failed");
            let call_builder = contract.call_builder::<Distributer>();

            // Then
            let get = call_builder.get();
            let get_result = client.call(&ink_e2e::alice(), &get).dry_run().await?;
            assert!(matches!(get_result.return_value(), false));

            Ok(())
        }

        /// We test that we can read and write a value from the on-chain contract.
        #[ink_e2e::test]
        async fn it_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let mut constructor = DistributerRef::new(false);
            let contract = client
                .instantiate("distributer", &ink_e2e::bob(), &mut constructor)
                .submit()
                .await
                .expect("instantiate failed");
            let mut call_builder = contract.call_builder::<Distributer>();

            let get = call_builder.get();
            let get_result = client.call(&ink_e2e::bob(), &get).dry_run().await?;
            assert!(matches!(get_result.return_value(), false));

            // When
            let flip = call_builder.flip();
            let _flip_result = client
                .call(&ink_e2e::bob(), &flip)
                .submit()
                .await
                .expect("flip failed");

            // Then
            let get = call_builder.get();
            let get_result = client.call(&ink_e2e::bob(), &get).dry_run().await?;
            assert!(matches!(get_result.return_value(), true));

            Ok(())
        }
    }
}
