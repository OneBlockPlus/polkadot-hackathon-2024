#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod ink_hello_world {
    // Import String from ink prelude
    use ink::prelude::string::String;

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct InkHelloWorld {
        /// Stores a single `String` value on the storage.
        message: String,
    }

    impl InkHelloWorld {
        /// Constructor that initializes the `String` value to the given `message`,
        /// or "hello world" if no message is provided.
        #[ink(constructor)]
        pub fn new(message: Option<String>) -> Self {
            Self {
                message: message.unwrap_or_else(|| String::from("hello world")),
            }
        }

        /// A message that can be called on instantiated contracts.
        /// This one changes the stored `String` value.
        #[ink(message)]
        pub fn set_message(&mut self, new_message: String) {
            self.message = new_message;
        }

        /// Simply returns the current value of our `String`.
        #[ink(message)]
        pub fn get_message(&self) -> String {
            self.message.clone()
        }
    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let ink_hello_world = InkHelloWorld::new();
            assert_eq!(ink_hello_world.get_message(), "hello world");
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut ink_hello_world = InkHelloWorld::new();
            assert_eq!(ink_hello_world.get_message(), "hello world");
            ink_hello_world.set_message(String::from("new message"));
            assert_eq!(ink_hello_world.get_message(), "new message");
        }
    }


    /// This is how you'd write end-to-end (E2E) or integration tests for ink! contracts.
    ///
    /// When running these you need to make sure that you:
    /// - Compile the tests with the `e2e-tests` feature flag enabled (`--features e2e-tests`)
    /// - Are running a Substrate node which contains `pallet-contracts` in the background
    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
        use ink_e2e::ContractsBackend;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let constructor = InkHelloWorldRef::new();

            // When
            let contract = client
                .instantiate("ink_hello_world", &ink_e2e::alice(), constructor)
                .submit()
                .await
                .expect("instantiate failed");
            let call_builder = contract.call_builder::<InkHelloWorld>();

            // Then
            let get = call_builder.get_message();
            let get_result = client.call(&ink_e2e::alice(), &get).dry_run().await?;
            assert_eq!(get_result.return_value(), "hello world");

            Ok(())
        }

        #[ink_e2e::test]
        async fn it_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let constructor = InkHelloWorldRef::new();
            let contract = client
                .instantiate("ink_hello_world", &ink_e2e::bob(), constructor)
                .submit()
                .await
                .expect("instantiate failed");
            let mut call_builder = contract.call_builder::<InkHelloWorld>();

            // Initial state
            let get = call_builder.get_message();
            let get_result = client.call(&ink_e2e::bob(), &get).dry_run().await?;
            assert_eq!(get_result.return_value(), "hello world");

            // When
            let set = call_builder.set_message(String::from("new message"));
            let _set_result = client
                .call(&ink_e2e::bob(), &set)
                .submit()
                .await
                .expect("set_message failed");

            // Then
            let get = call_builder.get_message();
            let get_result = client.call(&ink_e2e::bob(), &get).dry_run().await?;
            assert_eq!(get_result.return_value(), "new message");

            Ok(())
        }
    }
}
