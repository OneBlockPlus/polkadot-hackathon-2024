#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub type PositionId = u128;
pub type Result<T> = core::result::Result<T, Error>;
pub type TokenId = u128;

#[derive(Debug, PartialEq, Eq)]
#[ink::scale_derive(Encode, Decode, TypeInfo)]
pub enum Error {
    Overflow,
    Underflow,
    NotFound,
}

#[ink::contract]
mod paymentManager {
    use super::*;
    use ink::env::call::{build_call, ExecutionInput, Selector};
    use ink::env::DefaultEnvironment;
    use ink::storage::Mapping;

    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[derive(Debug, PartialEq, Eq)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub enum PositionType {
        LONG,
        SHORT,
    }

    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[derive(Debug, PartialEq, Eq)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct Position {
        state: bool,
        token: TokenId,
        amount: Balance,
        position_type: PositionType,
        leverage: u32,
        position_value: Balance,
        creation_time: u128,
    }

    #[ink(event)]
    pub struct MaintenanceFeeCollected {
        #[ink(topic)]
        from: Option<AccountId>,
        position_id: PositionId,
    }

    #[ink(event)]
    pub struct PositionUpdated {
        #[ink(topic)]
        from: Option<AccountId>,
        position_id: PositionId,
    }

    #[ink(storage)]
    pub struct PaymentManager {
        manager: AccountId,
        oracle: AccountId,
        fee: Balance,
    }

    impl PaymentManager {
        #[ink(constructor)]
        pub fn new(manager_address: AccountId, oracle_address: AccountId, fee: Balance) -> Self {
            let manager = manager_address;
            let oracle = oracle_address;
            Self { manager, oracle, fee }
        }
        
        #[ink(message)]
        pub fn update_position(&mut self, position_id: PositionId, user: AccountId) -> Result<()> {
            let position_temp = build_call::<DefaultEnvironment>()
                .call(self.manager)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("get_position")))
                        .push_arg(user)
                        .push_arg(position_id),
                )
                .returns::<Result<Position>>()
                .invoke();

            let position = position_temp.unwrap();
            let updated_amount = position.amount.checked_sub(self.fee).ok_or(Error::Underflow)?;
            
            let check: bool =
                self.check_liquidation(position.amount, position.position_value, position.leverage, position.position_type);

            if check {
                self.liquidation(position_id, user);
            } else {
                self.collect_fee(updated_amount, position_id, user);
            }

            self.env().emit_event(PositionUpdated {
                from: Some(user),
                position_id,
            });

            Ok(())
        }
        
        #[ink(message)]
        pub fn liquidation(&mut self, position_id: PositionId, user: AccountId) -> Result<()> {
            let position = build_call::<DefaultEnvironment>()
                .call(self.manager)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("liquidation")))
                        .push_arg(position_id)
                        .push_arg(user),
                )
                .returns::<bool>()
                .invoke();

            Ok(())
        }

        #[ink(message)]
        pub fn collect_fee(&mut self, updated_amount: Balance, position_id: PositionId, user: AccountId) -> Result<()> {
            // call manager to update position
            let update_position = build_call::<DefaultEnvironment>()
                .call(self.manager)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("update_position")))
                        .push_arg(updated_amount)
                        .push_arg(position_id)
                        .push_arg(user),
                )
                .returns::<bool>()
                .invoke();

            self.env().emit_event(MaintenanceFeeCollected {
                from: Some(user),
                position_id,
            });

            Ok(())
        }
        
        #[ink(message)]
        pub fn check_liquidation(
            &self,
            amount: Balance,
            position_value: Balance,
            leverage: u32,
            position_type: PositionType,
        ) -> bool {
            let entry_value = position_value.wrapping_mul(leverage as u128);

            let current_price = self.get_price();

            let real_amount_with_leverage = amount.wrapping_mul(leverage as u128);
            let real_value = real_amount_with_leverage.wrapping_mul(current_price as u128);

            match position_type {
                PositionType::LONG => {
                    if (position_value <= entry_value.checked_sub(real_value).unwrap()) {
                        true
                    } else {
                        false
                    }
                },
                PositionType::SHORT => {
                    if (position_value <= real_value.checked_sub(entry_value).unwrap()) {
                        true
                    } else {
                        false
                    }
                },
            }
        }

        #[ink(message)]
        pub fn get_price(&self) -> u32 {
            let price = build_call::<DefaultEnvironment>()
                .call(self.oracle)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("get_price")))
                )
                .returns::<u32>()
                .invoke();
            price
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        pub fn contract_creation_works() {
            let manager_address = AccountId::from([0x1; 32]);

            let mut paymentManager = PaymentManager::new(manager_address);

            assert_eq!(paymentManager.manager, manager_address);
        }

        #[ink::test]
        pub fn collect_fee_works() {
            let manager_address = AccountId::from([0x1; 32]);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let position_id = 0;

            let mut paymentManager = PaymentManager::new(manager_address);
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            paymentManager.collect_fee(position_id, accounts.alice);

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 1);
        }

        #[ink::test]
        pub fn update_position_works() {
            let manager_address = AccountId::from([0x1; 32]);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let position_id = 0;

            let mut paymentManager = PaymentManager::new(manager_address);
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            paymentManager.update_position(position_id, accounts.alice);

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 2);
        }
    }
}
