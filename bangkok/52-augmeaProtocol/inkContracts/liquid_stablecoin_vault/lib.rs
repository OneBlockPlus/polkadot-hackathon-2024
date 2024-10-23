#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod liquid_stablecoin_vault 
{
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////"dataImports"//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    use ink::prelude::string::String;
    use ink::env::call::{ExecutionInput, Selector};
    use ink::storage::Mapping;



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////"inkStorageVariablesStruct"////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    #[ink(storage)]
    pub struct LiquidStablecoinVault 
    {
        minted_stablecoin: Mapping<AccountId, u128>,
        used_liquid_token_for_colllateral: Mapping<AccountId, u128>,

        locked_liquid_staking_collateral: u128,

        liquid_staking_asset_address: AccountId,
        stablecoin_address: AccountId,

        oracle_address: AccountId,
        azero_asset: String,
    }

    

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////"inkFunctionMessages"//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    impl LiquidStablecoinVault 
    {
        ////////////////////////////////////////////////////////////////////////////
        /////"CONSTRUCTORS"/////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        #[ink(constructor)]
        pub fn new(param_liquid_staking_asset_address: AccountId, param_oracle_address: AccountId, param_azero_asset: String) -> Self 
        {
            let empty_mapping = Mapping::default();
            let empty_mapping_2 = Mapping::default();

            Self { minted_stablecoin: empty_mapping, used_liquid_token_for_colllateral: empty_mapping_2, locked_liquid_staking_collateral: 0 ,liquid_staking_asset_address: param_liquid_staking_asset_address, stablecoin_address: param_liquid_staking_asset_address, oracle_address: param_oracle_address, azero_asset: param_azero_asset }
        }

        ////////////////////////////////////////////////////////////////////////////
        /////"FUNCTIONS"////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        #[ink(message)]
        pub fn set_stablecoin_address(&mut self, param_stablecoin_address: AccountId)
        {
            self.stablecoin_address = param_stablecoin_address;
        }

        #[ink(message)]
        pub fn get_azero_price(&mut self) -> u128
        {
            let azero_str = &self.azero_asset;

            let my_return_value = ink::env::call::build_call::<Environment>()
            .call(self.oracle_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("OracleGetters::get_latest_price")))
                .push_arg(azero_str)
            )
            .returns::<Option<(u64, u128)>>()
            .invoke();

            let (_value_one, value_two): (u64, u128) = my_return_value.expect("REASON");

            value_two
        }

        #[ink(message)]
        pub fn mint_stablecoin(&mut self, param_quantity_liquid_asset_to_use_to_mint: u128)
        {
            let caller = self.env().caller();
            let contract_address = self.env().account_id();

            let my_return_value = ink::env::call::build_call::<Environment>()
            .call(self.liquid_staking_asset_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("allowance")))
                .push_arg(caller)
                .push_arg(contract_address)
            )
            .returns::<u128>()
            .invoke();


            assert!(my_return_value >= param_quantity_liquid_asset_to_use_to_mint, "Not enough allowance. Plase permit the vault to use the asset");

            ink::env::call::build_call::<Environment>()
            .call(self.liquid_staking_asset_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer_from")))
                .push_arg(caller)
                .push_arg(param_quantity_liquid_asset_to_use_to_mint)
                .push_arg(contract_address)
            )
            .returns::<()>()
            .invoke();


            //     // a - 1000000000000                                        ->      b - azero_price
            //     // c - param_quantity_liquid_asset_to_use_to_mint           ->      x - ?

            //     // x = (b * c) / a          ->          ? = (azero_price * param_quantity_liquid_asset_to_use_to_mint) / 1000000000000

            let azero_str = &self.azero_asset;

            let my_return_value = ink::env::call::build_call::<Environment>()
            .call(self.oracle_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("OracleGetters::get_latest_price")))
                .push_arg(azero_str)
            )
            .returns::<Option<(u64, u128)>>()
            .invoke();

            let (_value_one, value_two): (u64, u128) = my_return_value.expect("REASON");
            let adapated_price = value_two / 1000000;


            let quantity_liquid_asset_value = adapated_price.wrapping_mul(param_quantity_liquid_asset_to_use_to_mint).wrapping_div(1000000000000);
            let overcollateralized_stablecoin_to_mint = quantity_liquid_asset_value / 2;

            let mut actual_caller_minted_stablecoin_balance = self.minted_stablecoin.get(caller).unwrap_or(0);
            actual_caller_minted_stablecoin_balance += overcollateralized_stablecoin_to_mint;
            self.minted_stablecoin.insert(&caller, &actual_caller_minted_stablecoin_balance);

            let mut actual_caller_used_liquid_token_for_colllateral = self.used_liquid_token_for_colllateral.get(caller).unwrap_or(0);
            actual_caller_used_liquid_token_for_colllateral += param_quantity_liquid_asset_to_use_to_mint;
            self.minted_stablecoin.insert(&caller, &actual_caller_used_liquid_token_for_colllateral);

            self.locked_liquid_staking_collateral += param_quantity_liquid_asset_to_use_to_mint;

            ink::env::call::build_call::<Environment>()
            .call(self.stablecoin_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("mint_tokens")))
                .push_arg(caller)
                .push_arg(overcollateralized_stablecoin_to_mint)
            )
            .returns::<()>()
            .invoke();
        }

        #[ink(message)]
        pub fn flashloan(&mut self,  param_amount_liquid_token_to_use: u128)
        {
            assert!(self.locked_liquid_staking_collateral >= param_amount_liquid_token_to_use, "Not enough liquidity available for the flashloan.");

            let caller = self.env().caller();
            let contract_address = self.env().account_id();

            let balance_before = self.locked_liquid_staking_collateral;
            let balance_after;

            ink::env::call::build_call::<Environment>()
            .call(self.liquid_staking_asset_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                .push_arg(param_amount_liquid_token_to_use)
                .push_arg(caller)
            )
            .returns::<()>()
            .invoke();

            ink::env::call::build_call::<Environment>()
            .call(caller)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("execute_flashloan_logic")))
            )
            .returns::<()>()
            .invoke();

            balance_after = ink::env::call::build_call::<Environment>()
            .call(self.liquid_staking_asset_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("balance_of")))
                .push_arg(contract_address)
            )
            .returns::<u128>()
            .invoke();

            let fee = param_amount_liquid_token_to_use / 10;

            assert!(balance_after >= balance_before + fee, "Liquidity not returnd correctly.");

            self.locked_liquid_staking_collateral = balance_after;
        }

        #[ink(message)]
        pub fn user_minted_stablecoin(&self, param_address_to_check: AccountId) -> u128
        {
            self.minted_stablecoin.get(param_address_to_check).unwrap_or(0)
        }

        #[ink(message)]
        pub fn user_used_liquid_token_for_colllateral(&self, param_address_to_check: AccountId) -> u128
        {
            self.used_liquid_token_for_colllateral.get(param_address_to_check).unwrap_or(0)
        }

        #[ink(message)]
        pub fn get_vault_liquid_asset_balance(&mut self) -> u128
        {
            let contract_address = self.env().account_id();

            let my_return_value = ink::env::call::build_call::<Environment>()
            .call(self.liquid_staking_asset_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("balance_of")))
                .push_arg(contract_address)
            )
            .returns::<u128>()
            .invoke();

            my_return_value
        }
    }
}
