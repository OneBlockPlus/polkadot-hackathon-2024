#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub type TokenId = u128;
pub type Result<T> = core::result::Result<T, Error>;
pub type PositionId = u128;

#[derive(Debug, PartialEq, Eq)]
#[ink::scale_derive(Encode, Decode, TypeInfo)]
pub enum Error {
    Overflow,
    Underflow,
    ZeroAmount,
    NonZeroAmount,
}

#[ink::contract]
mod vault {
    use super::*;
    use ink::env::call::{build_call, ExecutionInput, Selector};
    use ink::env::DefaultEnvironment;
    use ink::{contract_ref, storage::Mapping};

    #[ink(event)]
    pub struct AddLiquidity {
        #[ink(topic)]
        from: Option<AccountId>,
        token: TokenId,
        #[ink(topic)]
        amount: Balance,
    }

    #[ink(event)]
    pub struct UpdateLiquidity {
        #[ink(topic)]
        from: Option<AccountId>,
        token: TokenId,
        #[ink(topic)]
        amount: Balance,
    }

    #[ink(event)]
    pub struct WithdrawLiquidity {
        #[ink(topic)]
        from: Option<AccountId>,
        token: TokenId,
        #[ink(topic)]
        amount: Balance,
    }

    #[ink(storage)]
    pub struct Vault {
        contributors: Mapping<(AccountId, TokenId), Balance>,
        erc20contract: AccountId,
        fee: Balance,
        total_amount_deposit: Balance,
        distributor: AccountId,
    }

    impl Vault {
        #[ink(constructor)]
        pub fn new(erc20_contract_address: AccountId, fee: Balance, distributor_address: AccountId) -> Self {
            let contributors = Mapping::default();
            let erc20contract = erc20_contract_address;
            let total_amount_deposit = 0;
            let distributor = distributor_address;
            Self {
                contributors,
                erc20contract,
                fee,
                total_amount_deposit,
                distributor,
            }
        }

        #[ink(message)]
        pub fn add_liquidity(
            &mut self,
            token: TokenId,
            amount: Balance,
            user: AccountId,
        ) -> Result<()> {
            let current_amount = self.contributors.get(&(user, token)).unwrap_or_default();

            if current_amount > 0 {
                return Err(Error::NonZeroAmount);
            }

            self.contributors.insert((user, token), &amount);

            let deposit_amount = amount.checked_add(self.fee).ok_or(Error::Overflow)?;

            self.total_amount_deposit = self.total_amount_deposit.checked_add(deposit_amount).ok_or(Error::Overflow)?;
            
            let deposit = build_call::<DefaultEnvironment>()
                .call(self.erc20contract)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer_from")))
                        .push_arg(user)
                        .push_arg(self.env().account_id())
                        .push_arg(deposit_amount)
                )
                .returns::<bool>()
                .invoke();

            self.env().emit_event(AddLiquidity {
                from: Some(user),
                token,
                amount,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn update_liquidity(
            &mut self,
            token: TokenId,
            new_amount: Balance,
            user: AccountId,
        ) -> Result<()> {
            let amount = self.contributors.get(&(user, token)).unwrap_or_default();

            if amount == 0 {
                return Err(Error::ZeroAmount);
            }

            let mut new_amount_final = 0;

            if new_amount > amount {
                new_amount_final = new_amount.checked_sub(amount).ok_or(Error::Underflow)?;
                let new_amount_final_with_fee = new_amount_final.checked_add(self.fee).ok_or(Error::Overflow)?;

                self.total_amount_deposit = self.total_amount_deposit.checked_add(new_amount_final_with_fee).ok_or(Error::Overflow)?;

                let deposit = build_call::<DefaultEnvironment>()
                    .call(self.erc20contract)
                    .call_v1()
                    .gas_limit(0)
                    .exec_input(
                        ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer_from")))
                            .push_arg(user)
                            .push_arg(self.env().account_id())
                            .push_arg(new_amount_final_with_fee),
                    )
                    .returns::<bool>()
                    .invoke();
            } else {
                new_amount_final = amount.checked_sub(new_amount).ok_or(Error::Underflow)?;
                self.total_amount_deposit = self.total_amount_deposit.checked_sub(new_amount_final).ok_or(Error::Underflow)?;
                self.total_amount_deposit = self.total_amount_deposit.checked_add(self.fee).ok_or(Error::Overflow)?;

                let withdraw = build_call::<DefaultEnvironment>()
                    .call(self.erc20contract)
                    .call_v1()
                    .gas_limit(0)
                    .exec_input(
                        ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                            .push_arg(user)
                            .push_arg(new_amount_final.checked_sub(self.fee).ok_or(Error::Underflow)?),
                    )
                    .returns::<bool>()
                    .invoke();
            }

            self.contributors.insert((user, token), &new_amount);

            self.env().emit_event(UpdateLiquidity {
                from: Some(user),
                token,
                amount: new_amount_final,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn remove_liquidity(&mut self, token: TokenId, user: AccountId) -> Result<()> {
            let current_amount = self.contributors.get(&(user, token)).unwrap_or_default();

            if current_amount == 0 {
                return Err(Error::ZeroAmount);
            }

            let remove_amount = current_amount.checked_sub(self.fee).ok_or(Error::Underflow)?;

            self.contributors.remove((user, token));

            self.total_amount_deposit = self.total_amount_deposit.checked_sub(remove_amount).ok_or(Error::Underflow)?;

            let withdraw = build_call::<DefaultEnvironment>()
                .call(self.erc20contract)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                        .push_arg(user)
                        .push_arg(remove_amount),
                )
                .returns::<bool>()
                .invoke();

            self.env().emit_event(WithdrawLiquidity {
                from: Some(user),
                token,
                amount: current_amount,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn liquidation(&mut self, token: TokenId, user: AccountId) -> Result<()> {
            let current_amount = self.contributors.get(&(user, token)).unwrap_or_default();

            if current_amount == 0 {
                return Err(Error::ZeroAmount);
            }

            self.contributors.remove((user, token));

            Ok(())
        }

        #[ink(message)]
        pub fn withdraw_distributor(&mut self) -> Result<()>{
            //calculate remove amount
            //contract call returns wrong amount or zero amount
            let total_amount_in_vault: Balance = build_call::<DefaultEnvironment>()
                .call(self.erc20contract)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("balance_of")))
                        .push_arg(self.env().account_id())
                )
                .returns::<Balance>()
                .invoke();

            self.total_amount_deposit = self.total_amount_deposit.checked_sub(withdraw_amount).ok_or(Error::Underflow)?;

            let withdraw = build_call::<DefaultEnvironment>()
                .call(self.erc20contract)
                .call_v1()
                .gas_limit(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                        .push_arg(self.distributor)
                        //change self.fee na pravu vrednost
                        .push_arg(total_amount_in_vault.checked_sub(self.total_amount_deposit).ok_or(Error::Underflow)?),
                )
                .returns::<bool>()
                .invoke();

            Ok(())
        }

        #[ink(message)]
        pub fn get_contributor_balance(&self, account: AccountId, token: TokenId) -> Balance {
            self.contributors.get(&(account, token)).unwrap_or_default()
        }

        #[ink(message)]
        pub fn get_total_amount_deposit(&self) -> Balance {
            self.total_amount_deposit
        }
    }

    // CROSS CONTRACT CALLS ARE NOT INCLUDED IN TESTS
    // COMMENT CROSS CONTRACT CALLS BEFORE TESTING
    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        pub fn add_liquidity_works() {
            let erc20 = AccountId::from([0x0; 32]);
            let fee = 10;
            let token = 123;
            let amount = 100;
            let mut vault = Vault::new(erc20, fee);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            assert_eq!(vault.add_liquidity(token, amount, accounts.alice), Ok(()));

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 1);

            assert_eq!(vault.get_contributor_balance(accounts.alice, token), amount);
        }

        #[ink::test]
        pub fn add_liquidity_fails() {
            let erc20 = AccountId::from([0x0; 32]);
            let fee = 10;
            let token = 123;
            let amount = 100;
            let mut vault = Vault::new(erc20, fee);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            assert_eq!(vault.add_liquidity(token, amount, accounts.alice), Ok(()));

            assert_eq!(
                vault.add_liquidity(token, amount, accounts.alice),
                Err(Error::NonZeroAmount)
            );

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 1);
        }

        #[ink::test]
        pub fn update_liquidity_works() {
            let erc20 = AccountId::from([0x0; 32]);
            let fee = 10;
            let token = 123;
            let amount = 100;
            let new_amount = 120;
            let mut vault = Vault::new(erc20, fee);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            vault.add_liquidity(token, amount, accounts.alice);
            vault.update_liquidity(token, new_amount, accounts.alice);

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 2);

            assert_eq!(
                vault.get_contributor_balance(accounts.alice, 123),
                new_amount
            );
        }

        #[ink::test]
        pub fn update_liquidity_zero_amount_fails() {
            let erc20 = AccountId::from([0x0; 32]);
            let fee = 10;
            let token = 123;
            let amount = 100;
            let mut vault = Vault::new(erc20, fee);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            assert_eq!(
                vault.update_liquidity(token, amount, accounts.alice),
                Err(Error::ZeroAmount)
            );

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 0);
        }

        #[ink::test]
        pub fn remove_liquidity_fails() {
            let erc20 = AccountId::from([0x0; 32]);
            let fee = 10;
            let token = 123;
            let mut vault = Vault::new(erc20, fee);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            assert_eq!(
                vault.remove_liquidity(token, accounts.alice),
                Err(Error::ZeroAmount)
            );

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 0);
        }

        #[ink::test]
        pub fn remove_liquidity_works() {
            let erc20 = AccountId::from([0x0; 32]);
            let fee = 10;
            let token = 123;
            let mut vault = Vault::new(erc20, fee);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            assert_eq!(vault.add_liquidity(token, 100, accounts.alice), Ok(()));
            assert_eq!(vault.remove_liquidity(token, accounts.alice), Ok(()));

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 2);

            assert_eq!(vault.get_contributor_balance(accounts.alice, 123), 0);
        }

        #[ink::test]
        pub fn contract_creation_works() {
            let fee = 10;
            let erc20 = AccountId::from([0x0; 32]);
            let mut vault = Vault::new(erc20, fee);

            assert_eq!(vault.erc20contract, erc20);
            assert_eq!(vault.fee, fee);
        }
    }
}
