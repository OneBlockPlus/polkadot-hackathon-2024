#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod dazhbog {

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct Dazhbog {
        /// Stores a single `bool` value on the storage.
        value: bool,
    }

    impl Dazhbog {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(init_value: bool) -> Self {
            Self { value: init_value }
        }

        #[ink(message)]
        pub fn create_something_test(&mut self) {
            //close user position in manager contract
            // // transfer fees to vault
            // let send_fee_to_vault = build_call::<DefaultEnvironment>()
            //     .call(self.erc20)
            //     .call_v1()
            //     .gas_limit(0)
            //     .exec_input(
            //         ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
            //             .push_arg(self.vault)
            //             .push_arg(self.fee),
            //     )
            //     .returns::<bool>()
            //     .invoke();
            //update user balance
        }
    }
}
