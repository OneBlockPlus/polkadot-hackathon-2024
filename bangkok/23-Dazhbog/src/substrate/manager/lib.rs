#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub type TokenId = u128;
pub type Result<T> = core::result::Result<T, Error>;
pub type PositionId = u128;

#[derive(Debug, PartialEq, Eq)]
#[ink::scale_derive(Encode, Decode, TypeInfo)]
pub enum Error {
    Overflow,
    Underflow,
    NotFound,
    NonZeroAmount,
    ZeroAmount,
}

#[ink::contract]
mod manager {
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
    pub struct PositionOpened {
        #[ink(topic)]
        from: Option<AccountId>,
        position_id: PositionId,
        #[ink(topic)]
        amount: Balance,
    }

    #[ink(event)]
    pub struct PositionClosed {
        #[ink(topic)]
        from: Option<AccountId>,
        position_id: PositionId,
    }

    #[ink(event)]
    pub struct UserLiquidation {
        #[ink(topic)]
        from: Option<AccountId>,
        position_id: PositionId,
    }

    #[ink(event)]
    pub struct PositionUpdated {
        #[ink(topic)]
        from: Option<AccountId>,
        position_id: PositionId,
        amount: Balance,
    }

    #[ink(storage)]
    pub struct Manager {
        positions: Mapping<(AccountId, PositionId), Position>,
        position_id: PositionId,
        oracle: AccountId,
        vault: AccountId,
        long_total: Balance,
        short_total: Balance,
    }

    impl Manager {
        #[ink(constructor)]
        pub fn new(vault_address: AccountId, oracle_address: AccountId) -> Self {
            let positions = Mapping::default();
            let position_id: PositionId = 0;
            let oracle = oracle_address;
            let vault = vault_address;
            let long_total = 0;
            let short_total = 0;
            Self {
                positions,
                position_id,
                oracle,
                vault,
                long_total,
                short_total,
            }
        }

        #[ink(message)]
        pub fn open_position(
            &mut self,
            token: TokenId,
            amount: Balance,
            position_type: PositionType,
            leverage: u32,
            user: AccountId,
        ) -> Result<()> {
            let temp = self.positions.get(&(user, self.position_id));

            if temp.is_some() {
                return Err(Error::NonZeroAmount);
            }

            let entry_price = self.get_price();
            let creation_time = self.env().block_timestamp().into();
            let position_id = self.position_id;
            self.position_id = self.position_id.checked_add(1).ok_or(Error::Overflow)?;

            match position_type {
                PositionType::LONG => {
                    self.long_total = self
                        .long_total
                        .checked_add(1)
                        .ok_or(Error::Overflow)?;
                }
                PositionType::SHORT => {
                    self.short_total = self
                        .short_total
                        .checked_add(1)
                        .ok_or(Error::Overflow)?;
                }
            }

            let position_value = amount.wrapping_mul(entry_price as Balance);

            let new_position: Position = Position {
                state: true,
                token,
                amount,
                position_type,
                leverage,
                position_value,
                creation_time,
            };

            self.positions.insert((user, position_id), &new_position);

            let deposit = build_call::<DefaultEnvironment>()
                .call(self.vault)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("add_liquidity")))
                        .push_arg(token)
                        .push_arg(amount)
                        .push_arg(user),
                )
                .returns::<bool>()
                .invoke();

            self.env().emit_event(PositionOpened {
                from: Some(user),
                position_id,
                amount,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn update_position(
            &mut self,
            updated_amount: Balance,
            position_id: PositionId,
            user: AccountId,
        ) -> Result<()> {
            let temp = self.get_position(user, position_id);
            
            if temp.is_err() {
                return Err(Error::NotFound)
            }

            let current_price = self.get_price();
            let position = temp.unwrap();
            let amount = position.amount;

            if amount == 0 {
                return Err(Error::ZeroAmount)
            }

            let mut new_amount = 0;
            let mut new_position_value: Balance = 0;

            if updated_amount > amount {
                new_amount = updated_amount.checked_sub(amount).ok_or(Error::Underflow)?;
                new_position_value = position.position_value.checked_add(current_price.wrapping_mul(new_amount as u32) as u128).ok_or(Error::Overflow)?;
            } else {
                new_amount = amount.checked_sub(updated_amount).ok_or(Error::Underflow)?;
                new_position_value = position.position_value.checked_sub(current_price.wrapping_mul(new_amount  as u32) as u128).ok_or(Error::Underflow)?;
            }

            let new_position: Position = Position {
                state: true,
                token: position.token,
                amount: updated_amount,
                position_type: position.position_type,
                leverage: position.leverage,
                position_value: new_position_value,
                creation_time: position.creation_time,
            };

            self.positions.insert((user, position_id), &new_position);

            let collect_fee = build_call::<DefaultEnvironment>()
                .call(self.vault)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("update_liquidity")))
                        .push_arg(position.token)
                        .push_arg(updated_amount)
                        .push_arg(user),
                )
                .returns::<bool>()
                .invoke();

            self.env().emit_event(PositionUpdated {
                from: Some(user),
                position_id,
                amount: updated_amount,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn close_position(&mut self, position_id: PositionId, user: AccountId) -> Result<()> {
            let temp = self.get_position(user, position_id);

            if temp.is_err() {
                return Err(Error::NotFound);
            }

            let token = self.get_position(user, position_id).unwrap().token;

            match self
                .positions
                .get((user, position_id))
                .unwrap()
                .position_type
            {
                PositionType::LONG => {
                    self.long_total = self.long_total.checked_sub(1).unwrap();
                }
                PositionType::SHORT => {
                    self.short_total = self.short_total.checked_sub(1).unwrap();
                }
            }

            self.positions.remove((user, position_id));

            let withdraw = build_call::<DefaultEnvironment>()
                .call(self.vault)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("remove_liquidity")))
                        .push_arg(token)
                        .push_arg(user),
                )
                .returns::<bool>()
                .invoke();

            self.env().emit_event(PositionClosed {
                from: Some(user),
                position_id,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn liquidation(&mut self, position_id: PositionId, user: AccountId) -> Result<()> {
            let temp = self.get_position(user, position_id);

            if temp.is_err() {
                return Err(Error::NotFound);
            }

            let token = self.get_position(user, position_id).unwrap().token;

            match self
                .positions
                .get((user, position_id))
                .unwrap()
                .position_type
            {
                PositionType::LONG => {
                    self.long_total = self.long_total.checked_sub(1).unwrap();
                }
                PositionType::SHORT => {
                    self.short_total = self.short_total.checked_sub(1).unwrap();
                }
            }

            self.positions.remove((user, position_id));

            let withdraw = build_call::<DefaultEnvironment>()
                .call(self.vault)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("liquidation")))
                        .push_arg(token)
                        .push_arg(user),
                )
                .returns::<bool>()
                .invoke();

            self.env().emit_event(UserLiquidation {
                from: Some(user),
                position_id,
            });

            Ok(())
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

        #[ink(message)]
        pub fn get_position(&self, user: AccountId, position_id: u128) -> Result<Position> {
            self.positions.get(&(user, position_id)).ok_or(Error::NotFound)
        }

        #[ink(message)]
        pub fn get_number_longs(&self) -> Result<Balance> {
            Ok(self.long_total)
        }

        #[ink(message)]
        pub fn get_number_shorts(&self) -> Result<Balance> {
            Ok(self.short_total)
        }

        #[ink(message)]
        pub fn calculate_funding_rate(&self) -> Result<u32> {
            let spot_price: u32 = 100; // TODO: fetch from oracle
            let contract_price: u32 = 100; // TODO: fetch from oracle
            let long_short_sub = contract_price
                .checked_sub(spot_price)
                .ok_or(Error::Underflow)?;
            let ff = long_short_sub
                .checked_div(spot_price)
                .ok_or(Error::Underflow)?;
            let mut oii = 0;

            if self.long_total > self.short_total {
                oii = self
                    .long_total
                    .checked_sub(self.short_total)
                    .ok_or(Error::Underflow)?;
            } else {
                oii = self
                    .short_total
                    .checked_sub(self.long_total)
                    .ok_or(Error::Underflow)?;
            }

            let toi = self
                .long_total
                .checked_add(self.short_total)
                .ok_or(Error::Underflow)?;

            let funding_rate = ff
                .wrapping_mul(oii as u32)
                .checked_div(toi as u32)
                .ok_or(Error::Underflow)?;

            Ok(funding_rate)
        }
    }

    // CROSS CONTRACT CALLS ARE NOT INCLUDED IN TESTS
    // COMMENT CROSS CONTRACT CALLS BEFORE TESTING
    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        pub fn open_position_works() {
            let token = 1;
            let position_id = 0;
            let amount = 100;
            let leverage = 10;
            let fee = 10;
            let vault = AccountId::from([0x1; 32]);
            let mut manager = Manager::new(vault);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            assert_eq!(
                manager.open_position(token, amount, PositionType::LONG, leverage, accounts.alice),
                Ok(())
            );

            let position = manager.get_position(accounts.alice, position_id).unwrap();

            assert_eq!(position.token, token);
            assert_eq!(position.amount, amount);
            assert_eq!(position.leverage, leverage);
            assert_eq!(position.position_value, amount * 1000);

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 1);
        }

        #[ink::test]
        pub fn open_position_fails() {
            let token = 1;
            let position_id = 0;
            let amount = 100;
            let leverage = 10;
            let fee = 10;
            let vault = AccountId::from([0x1; 32]);
            let mut manager = Manager::new(vault);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            manager.open_position(token, amount, PositionType::LONG, leverage, accounts.alice);

            assert_eq!(
                manager.open_position(token, amount, PositionType::LONG, leverage, accounts.alice),
                Err(Error::NonZeroAmount)
            );

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 1);
        }

        #[ink::test]
        pub fn update_position_works() {
            let token = 1;
            let position_id = 0;
            let amount = 70;
            let new_amount_1 = 100;
            let leverage = 10;
            let vault = AccountId::from([0x1; 32]);
            let mut manager = Manager::new(vault);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            manager.open_position(token, amount, PositionType::LONG, leverage, accounts.alice);

            assert_eq!(
                manager.update_position(new_amount_1, position_id, accounts.alice),
                Ok(())
            );

            let position = manager.get_position(accounts.alice, position_id).unwrap();

            assert_eq!(position.position_value, amount * 1000 + 30 * 2000);

            assert_eq!(position.amount, new_amount_1);

            assert_eq!(
                manager.update_position(amount, position_id, accounts.alice),
                Ok(())
            );

            let position = manager.get_position(accounts.alice, position_id).unwrap();
            assert_eq!(position.position_value, amount * 1000 + 30 * 2000 - 30 * 2000);


            assert_eq!(position.amount, amount);

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 3);
        }

        #[ink::test]
        pub fn update_position_fails() {
            let token = 1;
            let position_id = 0;
            let amount = 100;
            let leverage = 10;
            let vault = AccountId::from([0x1; 32]);
            let mut manager = Manager::new(vault);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            assert_eq!(
                manager.update_position(amount, position_id, accounts.alice),
                Err(Error::NotFound)
            );

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 0);
        }

        #[ink::test]
        pub fn close_position_fails() {
            let token = 1;
            let position_id = 0;
            let amount = 100;
            let leverage = 10;
            let vault = AccountId::from([0x1; 32]);
            let mut manager = Manager::new(vault);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            assert_eq!(
                manager.close_position(position_id, accounts.alice),
                Err(Error::NotFound)
            );

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 0);

            let position = manager.get_position(accounts.alice, position_id);

            assert_eq!(position.unwrap_err(), Error::NotFound);
        }

        #[ink::test]
        pub fn close_position_works() {
            let token = 1;
            let position_id = 0;
            let amount = 100;
            let leverage = 10;
            let vault = AccountId::from([0x1; 32]);
            let mut manager = Manager::new(vault);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let res =
                manager.open_position(token, amount, PositionType::LONG, leverage, accounts.alice);

            let res = manager.close_position(position_id, accounts.alice);

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 2);

            let position = manager.get_position(accounts.alice, position_id);

            assert_eq!(position.unwrap_err(), Error::NotFound);
        }

        #[ink::test]
        pub fn contract_creation_works() {
            let position_id = 0;
            let vault = AccountId::from([0x1; 32]);
            let long_total = 0;
            let short_total = 0;
            let mut manager = Manager::new(vault);

            assert_eq!(manager.position_id, position_id);
            assert_eq!(manager.long_total, long_total);
            assert_eq!(manager.short_total, short_total);
            assert_eq!(manager.vault, vault);
        }
    }
}
