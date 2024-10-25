#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod augmea_lending_protocol 
{
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////"dataImports"//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    use ink::storage::Mapping;
    use ink::env::call::{ExecutionInput, Selector};
    use ink::prelude::string::String;



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////"customDataStruct"/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct position_data
    {
        position_id: u128,
        borrower: AccountId,
        collateral_dot_used: u128,
        dot_value_at_borrowing_time: u128,
        liquidation_price: u128,
        borrowed_amount: u128,
        timestamp: u128,
        pending_debt_without_interests: u128,
        pending_collateral_dot: u128,
        liquidated: bool,
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////"inkStorageVariablesStruct"////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    #[ink(storage)]
    pub struct AugmeaLendingProtocol 
    {
        borrow_positions: Mapping<u128, position_data>,
        lender_deposited_augmea: Mapping<AccountId, u128>,
        borrower_collateral: Mapping<AccountId, u128>,

        oracle_address: AccountId,
        augmea_stablecoin_address: AccountId,
        wrapped_dot_address: AccountId,
        
        dot_str_pair: String,

        total_augmea_deposited: u128,
        available_augmea_liquidity_reserve: u128,

        next_position_id: u128, //must be 1 at construction time
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////"inkFunctionMessages"//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    impl AugmeaLendingProtocol 
    {
        ////////////////////////////////////////////////////////////////////////////
        /////"CONSTRUCTORS"/////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        #[ink(constructor)]
        pub fn new(param_oracle_address: AccountId, param_augmea_stablecoin_address: AccountId, param_wrapped_dot_address: AccountId, param_dot_pair_str: String) -> Self 
        {
            let empty_mapping = Mapping::default();
            let empty_mapping_2 = Mapping::default();
            let empty_mapping_3 = Mapping::default();

            Self 
            {
                borrow_positions: empty_mapping,
                lender_deposited_augmea: empty_mapping_2,
                borrower_collateral: empty_mapping_3,

                oracle_address: param_oracle_address,
                augmea_stablecoin_address: param_augmea_stablecoin_address,
                wrapped_dot_address: param_wrapped_dot_address,
                
                dot_str_pair: param_dot_pair_str,

                total_augmea_deposited: 0,
                available_augmea_liquidity_reserve: 0,

                next_position_id: 1, 
            }
        }

        ////////////////////////////////////////////////////////////////////////////
        /////"FUNCTIONS"////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        #[ink(message)]
        pub fn deposit_initial_liquidity(&mut self, param_initial_liquidity: u128)
        {
            let caller = self.env().caller();
            let contract_address = self.env().account_id();

            let my_return_value = ink::env::call::build_call::<Environment>()
            .call(self.augmea_stablecoin_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("allowance")))
                .push_arg(caller)
                .push_arg(contract_address)
            )
            .returns::<u128>()
            .invoke();


            assert!(my_return_value >= param_initial_liquidity, "Not enough allowance. Plase permit augmeaProtocol to use the asset.");

            ink::env::call::build_call::<Environment>()
            .call(self.augmea_stablecoin_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer_from")))
                .push_arg(caller)
                .push_arg(param_initial_liquidity)
                .push_arg(contract_address)
            )
            .returns::<()>()
            .invoke();

            self.total_augmea_deposited += param_initial_liquidity;
            self.available_augmea_liquidity_reserve += param_initial_liquidity;
        }

        #[ink(message)]
        pub fn deposit(&mut self, param_amount_to_deposit: u128)
        {
            let caller = self.env().caller();
            let contract_address = self.env().account_id();

            let my_return_value = ink::env::call::build_call::<Environment>()
            .call(self.augmea_stablecoin_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("allowance")))
                .push_arg(caller)
                .push_arg(contract_address)
            )
            .returns::<u128>()
            .invoke();


            assert!(my_return_value >= param_amount_to_deposit, "Not enough allowance. Plase permit augmeaProtocol to use the asset.");

            ink::env::call::build_call::<Environment>()
            .call(self.augmea_stablecoin_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer_from")))
                .push_arg(caller)
                .push_arg(param_amount_to_deposit)
                .push_arg(contract_address)
            )
            .returns::<()>()
            .invoke();


            let mut actual_caller_deposited_augmea_balance = self.lender_deposited_augmea.get(caller).unwrap_or(0);
            actual_caller_deposited_augmea_balance += param_amount_to_deposit;
            self.lender_deposited_augmea.insert(&caller, &actual_caller_deposited_augmea_balance);

            self.total_augmea_deposited += param_amount_to_deposit;
            self.available_augmea_liquidity_reserve += param_amount_to_deposit;
        }

        #[ink(message)]
        pub fn redeem(&mut self, param_amount_to_redeem: u128)
        {
            let caller = self.env().caller();
            let user_deposited_augmea = self.lender_deposited_augmea.get(caller).unwrap_or(0);
            let actual_liquidity_reserve = self.available_augmea_liquidity_reserve;

            assert!(user_deposited_augmea >= param_amount_to_redeem, "Incorrect amount to redeem, the specified amount is bigger than the actual balance.");
            assert!(actual_liquidity_reserve >= param_amount_to_redeem, "Not enough liquidity.");


            ink::env::call::build_call::<Environment>()
            .call(self.augmea_stablecoin_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                .push_arg(param_amount_to_redeem)
                .push_arg(caller)
            )
            .returns::<()>()
            .invoke();


            self.total_augmea_deposited -= param_amount_to_redeem;
            self.available_augmea_liquidity_reserve -= param_amount_to_redeem;
        }

        #[ink(message)]
        pub fn borrow(&mut self, param_amount_dot_collateral: u128)
        {
            let caller = self.env().caller();
            let contract_address = self.env().account_id();
            
            let my_return_value = ink::env::call::build_call::<Environment>()
            .call(self.wrapped_dot_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("allowance")))
                .push_arg(caller)
                .push_arg(contract_address)
            )
            .returns::<u128>()
            .invoke();

            assert!(my_return_value >= param_amount_dot_collateral, "Not enough allowance. Plase permit augmeaProtocol to use the asset.");

            ink::env::call::build_call::<Environment>()
            .call(self.wrapped_dot_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer_from")))
                .push_arg(caller)
                .push_arg(param_amount_dot_collateral)
                .push_arg(contract_address)
            )
            .returns::<()>()
            .invoke();


            let dot_str = &self.dot_str_pair;

            let my_return_value_two = ink::env::call::build_call::<Environment>()
            .call(self.oracle_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("OracleGetters::get_latest_price")))
                .push_arg(dot_str)
            )
            .returns::<Option<(u64, u128)>>()
            .invoke();

            let (_value_one, value_two): (u64, u128) = my_return_value_two.expect("REASON");
            let decimals_adapted_price = value_two / 1000000;

            let collateral_value = (decimals_adapted_price * param_amount_dot_collateral) / 1000000000000;
            // let collateral_liquidation_price = (collateral_value * 75) / 100;
            let collateral_liquidation_price = (decimals_adapted_price * 75) / 100;
            let borrow_value = (collateral_value * 70) / 100;

            assert!(self.available_augmea_liquidity_reserve >= borrow_value, "Not enough reserve liquidity.");

            ink::env::call::build_call::<Environment>()
            .call(self.augmea_stablecoin_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                .push_arg(borrow_value)
                .push_arg(caller)
            )
            .returns::<()>()
            .invoke();


            self.available_augmea_liquidity_reserve -= borrow_value;

            let actual_timestamp: u64 = Self::env().block_timestamp(); 
            let actual_timestamp_128 = actual_timestamp as u128;


            let position_info: position_data = position_data 
            {
                position_id: self.next_position_id,
                borrower: caller,
                collateral_dot_used: param_amount_dot_collateral,
                dot_value_at_borrowing_time: decimals_adapted_price,
                liquidation_price: collateral_liquidation_price,
                borrowed_amount: borrow_value,
                timestamp: actual_timestamp_128,
                pending_debt_without_interests: borrow_value,
                pending_collateral_dot: param_amount_dot_collateral,
                liquidated: false,
            };

            self.borrow_positions.insert(&self.next_position_id, &position_info);
            self.next_position_id += 1;
        }

        #[ink(message)]
        pub fn repay(&mut self, position_to_repay_id: u128, param_amount_to_repay: u128)
        {
            assert!(position_to_repay_id < self.next_position_id, "Position ID doesnt exist.");

            let mut position_info = self.borrow_positions.get(position_to_repay_id).unwrap();            
            assert!(position_info.liquidated == false, "Position already liquidated.");

            let caller = self.env().caller();
            let contract_address = self.env().account_id();

            let my_return_value = ink::env::call::build_call::<Environment>()
            .call(self.augmea_stablecoin_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("allowance")))
                .push_arg(caller)
                .push_arg(contract_address)
            )
            .returns::<u128>()
            .invoke();

            assert!(my_return_value >= param_amount_to_repay, "Not enough allowance. Plase permit augmeaProtocol to use the asset.");

            let apy = 1000;
            let actual_timestamp: u64 = Self::env().block_timestamp(); 
            let actual_timestamp_128 = actual_timestamp as u128;
            let time_passed = actual_timestamp_128 - position_info.timestamp;
            let YEAR = 60 * 60 * 24 * 365;
            let total_apy = (apy * time_passed) / YEAR;
            let to_repay = (((position_info.pending_debt_without_interests) * (10000 + total_apy)) / 10000) + 1;

            if param_amount_to_repay >= to_repay
            {
                ink::env::call::build_call::<Environment>()
                .call(self.augmea_stablecoin_address)
                .transferred_value(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer_from")))
                    .push_arg(caller)
                    .push_arg(param_amount_to_repay)
                    .push_arg(contract_address)
                )
                .returns::<()>()
                .invoke();

                self.available_augmea_liquidity_reserve += param_amount_to_repay;

                ink::env::call::build_call::<Environment>()
                .call(self.wrapped_dot_address)
                .transferred_value(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                    .push_arg(position_info.pending_collateral_dot)
                    .push_arg(caller)
                )
                .returns::<()>()
                .invoke();

                position_info.pending_debt_without_interests = 0;
                position_info.pending_collateral_dot = 0;
                position_info.liquidated = true;

                self.borrow_positions.insert(&position_to_repay_id, &position_info);
            }
            else
            {
                let collateral_to_return = (param_amount_to_repay * position_info.pending_collateral_dot) / to_repay;

                ink::env::call::build_call::<Environment>()
                .call(self.augmea_stablecoin_address)
                .transferred_value(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer_from")))
                    .push_arg(caller)
                    .push_arg(param_amount_to_repay)
                    .push_arg(contract_address)
                )
                .returns::<()>()
                .invoke();

                self.available_augmea_liquidity_reserve += param_amount_to_repay;

                ink::env::call::build_call::<Environment>()
                .call(self.wrapped_dot_address)
                .transferred_value(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                    .push_arg(collateral_to_return)
                    .push_arg(caller)
                )
                .returns::<()>()
                .invoke();

                // a - to_repay                  ->      b - fullPendingDebt
                // c - param_amount_to_repay     ->      x - ???????????????

                // x = (b * c) / a         ->      ? = (fullPendingDebt * param_amount_to_repay) / to_repay

                let paying_original_debt_without_interests = (position_info.pending_debt_without_interests * param_amount_to_repay) / to_repay;

                position_info.pending_debt_without_interests -= paying_original_debt_without_interests;
                position_info.pending_collateral_dot -= collateral_to_return;
                
                self.borrow_positions.insert(&position_to_repay_id, &position_info);
            }
        }

        #[ink(message)]
        pub fn calculate_borrow_amount_approximately(&self, param_dot_amount_to_use: u128) -> u128
        {
            let dot_str = &self.dot_str_pair;

            let my_return_value = ink::env::call::build_call::<Environment>()
            .call(self.oracle_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("OracleGetters::get_latest_price")))
                .push_arg(dot_str)
            )
            .returns::<Option<(u64, u128)>>()
            .invoke();

            let (_value_one, value_two): (u64, u128) = my_return_value.expect("REASON");
            let decimals_adapted_price = value_two / 1000000;

            let collateral_value_one = decimals_adapted_price.checked_mul(param_dot_amount_to_use); //(decimals_adapted_price * param_dot_amount_to_use);
            let unwraped_value_one = collateral_value_one.unwrap();
            let collateral_value_two = unwraped_value_one.checked_div(1000000000000); //collateral_value_one.unwrap() / 1000000000000;
            let borrow_value_one = (collateral_value_two.unwrap() * 70) ;
            let borrow_value_two = borrow_value_one / 100;   

            borrow_value_two
        }

        #[ink(message)]
        pub fn liquidate(&mut self, param_borrow_position_id: u128)
        {
            assert!(param_borrow_position_id < self.next_position_id, "Position ID doesnt exist.");

            let position_info = self.borrow_positions.get(param_borrow_position_id).unwrap(); 
            assert!(position_info.liquidated == false, "Position already liquidated.");


            let dot_str = &self.dot_str_pair;

            let my_return_value_two = ink::env::call::build_call::<Environment>()
            .call(self.oracle_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("OracleGetters::get_latest_price")))
                .push_arg(dot_str)
            )
            .returns::<Option<(u64, u128)>>()
            .invoke();

            let (_value_one, value_two): (u64, u128) = my_return_value_two.expect("REASON");
            let decimals_adapted_price = value_two / 1000000;


            assert!(position_info.liquidation_price >= decimals_adapted_price, "Position not ");


            let caller = self.env().caller();
            let contract_address = self.env().account_id();

            let my_return_value = ink::env::call::build_call::<Environment>()
            .call(self.augmea_stablecoin_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("allowance")))
                .push_arg(caller)
                .push_arg(contract_address)
            )
            .returns::<u128>()
            .invoke();

            assert!(my_return_value >= position_info.pending_debt_without_interests, "Not enough allowance. Plase permit augmeaProtocol to use the asset.");

            ink::env::call::build_call::<Environment>()
                .call(self.augmea_stablecoin_address)
                .transferred_value(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer_from")))
                    .push_arg(caller)
                    .push_arg(position_info.pending_debt_without_interests)
                    .push_arg(contract_address)
                )
                .returns::<()>()
                .invoke();

            ink::env::call::build_call::<Environment>()
                .call(self.wrapped_dot_address)
                .transferred_value(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                    .push_arg(position_info.pending_collateral_dot)
                    .push_arg(caller)
                )
                .returns::<()>()
                .invoke();

            self.available_augmea_liquidity_reserve += position_info.pending_debt_without_interests;
        }

        #[ink(message)]
        pub fn flashloan(&mut self,  param_amount_augmea_stablecoin_to_use: u128)
        {
            assert!(self.available_augmea_liquidity_reserve >= param_amount_augmea_stablecoin_to_use, "Not enough liquidity available for the flashloan.");

            let caller = self.env().caller();
            let contract_address = self.env().account_id();

            let balance_before = self.available_augmea_liquidity_reserve;
            let balance_after;

            ink::env::call::build_call::<Environment>()
            .call(self.augmea_stablecoin_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                .push_arg(param_amount_augmea_stablecoin_to_use)
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
            .call(self.augmea_stablecoin_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("balance_of")))
                .push_arg(contract_address)
            )
            .returns::<u128>()
            .invoke();

            let fee = param_amount_augmea_stablecoin_to_use / 10;

            assert!(balance_after >= balance_before + fee, "Liquidity not returnd correctly.");

            self.available_augmea_liquidity_reserve = balance_after;
        }

        #[ink(message)]
        pub fn get_actual_augmea_reserves(&self) -> u128
        {
            self.available_augmea_liquidity_reserve
        }

        #[ink(message)]
        pub fn get_number_of_borrowing_positions(&self) -> u128
        {
            let number_of_positions = self.next_position_id - 1;
            number_of_positions
        }

        #[ink(message)]
        pub fn get_borrowing_position_data(&self, param_borrowing_position_id: u128) -> position_data
        {
            assert!(param_borrowing_position_id < self.next_position_id, "Position ID doesnt exist.");
            self.borrow_positions.get(param_borrowing_position_id).unwrap()       
        }

        #[ink(message)]
        pub fn is_liquidated(&self, param_borrowing_position_id: u128) -> bool
        {
            assert!(param_borrowing_position_id < self.next_position_id, "Position ID doesnt exist.");
            let borrowing_position = self.borrow_positions.get(param_borrowing_position_id).unwrap();     
            borrowing_position.liquidated      
        }

        #[ink(message)]
        pub fn ready_to_be_liquidated(&self, param_borrowing_position_id: u128) -> bool
        {
            assert!(param_borrowing_position_id < self.next_position_id, "Position ID doesnt exist.");

            let borrowing_position = self.borrow_positions.get(param_borrowing_position_id).unwrap();     
            let position_liquidation_price = borrowing_position.liquidation_price;
            
            let dot_str = &self.dot_str_pair;

            let my_return_value_two = ink::env::call::build_call::<Environment>()
            .call(self.oracle_address)
            .transferred_value(0)
            .exec_input(
                ExecutionInput::new(Selector::new(ink::selector_bytes!("OracleGetters::get_latest_price")))
                .push_arg(dot_str)
            )
            .returns::<Option<(u64, u128)>>()
            .invoke();

            let (_value_one, value_two): (u64, u128) = my_return_value_two.expect("REASON");
            let decimals_adapted_price = value_two / 1000000;


            let can_be_liquidated;

            if decimals_adapted_price <= position_liquidation_price
            {
                can_be_liquidated = true;
            }
            else
            {
                can_be_liquidated = false;
            }

            can_be_liquidated
        }
    }
}