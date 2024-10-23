#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod wrapped_dot 
{
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////"dataImports"//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    use ink::prelude::string::String;
    use ink::storage::Mapping;



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////"inkStorageVariablesStruct"////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    #[ink(storage)]
    pub struct WrappedDot 
    {
        balances: Mapping<AccountId, u128>,
        allowances: Mapping<(AccountId, AccountId), u128>,

        decimals: u128,
        name: String,
        symbol: String,
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////"inkFunctionMessages"//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    impl WrappedDot 
    {
        ////////////////////////////////////////////////////////////////////////////
        /////"CONSTRUCTORS"/////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        #[ink(constructor)]
        pub fn new(param_name: String, param_symbol: String) -> Self 
        {
            let empty_mapping = Mapping::default();
            let empty_mapping_2 = Mapping::default();
            let _decimals = 12;

            Self {balances: empty_mapping, allowances: empty_mapping_2, decimals: _decimals, name: param_name ,symbol: param_symbol}
        }

        ////////////////////////////////////////////////////////////////////////////
        /////"FUNCTIONS"////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        #[ink[message]]
        pub fn mint_tokens(&mut self, param_quantity: u128)
        {
            let caller = self.env().caller();

            let mut actual_address_to_mint_balance = self.balances.get(caller).unwrap_or(0);
            actual_address_to_mint_balance += param_quantity;

            self.balances.insert(&caller, &actual_address_to_mint_balance);
        }

        #[ink(message)]
        pub fn transfer(&mut self, param_quantity: u128, param_address_to: AccountId)
        {
            let caller = self.env().caller();

            let mut actual_transferer_balance = self.balances.get(&caller).unwrap_or(0);

            assert!(actual_transferer_balance >= param_quantity, "Not enough funds.");

            actual_transferer_balance -= param_quantity;
            self.balances.insert(&caller, &actual_transferer_balance);

            let mut actual_to_balance = self.balances.get(param_address_to).unwrap_or(0);
            actual_to_balance += param_quantity;
            self.balances.insert(&param_address_to, &actual_to_balance);
        }

        #[ink(message)]
        pub fn transfer_from(&mut self, param_from: AccountId, param_quantity: u128, param_address_to: AccountId)
        {
            let caller = self.env().caller();
            let mut actual_from_balance = self.balances.get(&param_from).unwrap_or(0);
            let mut caller_allowance = self.allowance(param_from, caller);

            assert!(actual_from_balance >= param_quantity, "Not enough funds.");
            assert!(caller_allowance >= param_quantity, "Not enough allowance.");

            actual_from_balance -= param_quantity;
            caller_allowance -= param_quantity;
            self.balances.insert(&param_from, &actual_from_balance);            
            self.allowances.insert((param_from, caller), &caller_allowance);

            let mut actual_to_balance = self.balances.get(param_address_to).unwrap_or(0);
            actual_to_balance += param_quantity;
            self.balances.insert(&param_address_to, &actual_to_balance);
        }

        #[ink(message)]
        pub fn set_allowance(&mut self, param_quantity: u128, param_spender: AccountId)
        {
            let caller = self.env().caller();
            let actual_caller_balance = self.balances.get(&caller).unwrap_or(0);

            assert!(actual_caller_balance >= param_quantity, "Not enough funds.");

            self.allowances.insert((caller, param_spender), &param_quantity);
        }

        #[ink(message)]
        pub fn balance_of(&self, param_address_to_check: AccountId) -> u128
        {
            self.balances.get(param_address_to_check).unwrap_or(0)
        }

        #[ink(message)]
        pub fn allowance(&self, param_owner: AccountId, param_spender: AccountId) -> u128 
        {
            self.allowances.get((param_owner, param_spender)).unwrap_or_default()
        }

        #[ink(message)]
        pub fn get_name(&self) -> String
        {
            self.name.clone()
        }

        #[ink(message)]
        pub fn get_symbol(&self) -> String
        {
            self.symbol.clone()
        }

        #[ink(message)]
        pub fn get_decimals(&self) -> u128
        {
            self.decimals
        }

        #[ink(message)]
        pub fn get_account_address(&self) -> AccountId
        {
            self.env().account_id()
        }
    }
}
