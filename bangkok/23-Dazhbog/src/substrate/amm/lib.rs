#![cfg_attr(not(feature = "std"), no_std, no_main)]
/// Simple AMM pool contract
///
/// This contract is based on Balancer multi asset LP design and all formulas are taken from the Balancer's whitepaper (https://balancer.fi/whitepaper.pdf)
/// It has one pool with PSP22 tokens with equal weights
///
/// Swaps can be performed between all pairs in the pool whitelisted for trading
/// Liquidity provisioning is limited to designated accounts only and works as deposits / withdrawals of arbitrary composition.
pub use self::amm::{AmmPool, AmmPoolRef};

// THIS CONTRACT DOESN'T WORK!
#[ink::contract]
mod amm {
    use ink::{
        contract_ref,
        prelude::{number::Number, string::String, vec, vec::Vec},
        storage::Mapping,
    };
    use psp22::{PSP22Error, PSP22};
    //use psp37::{PSP37Error, PSP37};

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct SwapPair {
        pub from: AccountId,
        pub to: AccountId,
    }

    impl SwapPair {
        pub fn new(from: AccountId, to: AccountId) -> Self {
            Self { from, to }
        }
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum AmmError {
        PSP22(PSP22Error),
        InsufficientAllowanceOf(AccountId),
        Arithmethic,
        WrongParameterValue,
        TooMuchSlippage,
        NotAdmin,
        NotEnoughLiquidityOf(AccountId),
        UnsupportedSwapPair(SwapPair),
    }

    impl From<PSP22Error> for AmmError {
        fn from(e: PSP22Error) -> Self {
            AmmError::PSP22(e)
        }
    }

    #[ink(event)]
    pub struct Withdrawn {
        #[ink(topic)]
        caller: AccountId,
        #[ink(topic)]
        token: AccountId,
        amount: Balance,
    }

    #[ink(event)]
    pub struct SwapPairAdded {
        #[ink(topic)]
        pair: SwapPair,
    }

    #[ink(event)]
    pub struct SwapPairRemoved {
        #[ink(topic)]
        pair: SwapPair,
    }

    #[ink(event)]
    pub struct Swapped {
        caller: AccountId,
        #[ink(topic)]
        token_in: AccountId,
        #[ink(topic)]
        token_out: AccountId,
        amount_in: Balance,
        amount_out: Balance,
    }

    #[ink(storage)]
    pub struct AmmPool {
        pub owner: AccountId,
        pub swap_fee_percentage: u128,
        // a set of pairs that are availiable for swapping between
        pub swap_pairs: Mapping<SwapPair, ()>,
    }

    impl AmmPool {
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();
            Self {
                owner: caller,
                swap_fee_percentage: 0,
                swap_pairs: Mapping::default(),
            }
        }

        /// Swaps a specified amount of one of the pool's PSP22 tokens for another PSP22 token.
        ///
        /// This function allows users to swap between two supported tokens (`token_in` and `token_out`)
        /// within the AMM pool. The user needs to specify the amount of `token_in` they are willing to spend
        /// (`amount_token_in`) and the minimum amount of `token_out` they expect to receive (`min_amount_token_out`).
        ///
        /// Requirements:
        ///  * The calling account needs to have granted sufficient allowance to the AMM contract to transfer
        ///    the specified `amount_token_in` beforehand.
        ///  * The provided `token_in` and `token_out` pair must be a whitelisted swap pair in the AMM pool.
        ///
        /// # Arguments
        /// * `token_in`: The token contract `account_id` being provided for the swap.
        /// * `token_out`: The token contract `account_id` desired in return for the swap.
        /// * `amount_token_in`: The amount of `token_in` the user is willing to spend.
        /// * `min_amount_token_out`: The minimum amount of `token_out` the user expects to receive.
        ///
        /// Emits a `Swapped` event upon successful execution.
        ///
        /// Throws Errors:
        /// * NotEnoughLiquidityOf(token_out)
        /// * UnsupportedSwapPair(swap_pair)
        /// * InsufficientAllowanceOf(token_in)
        /// * TooMuchSlippage - before this tx gets executed as a sandwich attack prevention
        #[ink(message)]
        pub fn swap(
            &mut self,
            token_in: AccountId,
            token_out: AccountId,
            amount_token_in: Balance,
            min_amount_token_out: Balance,
        ) -> Result<(), AmmError> {
            let this = self.env().account_id();
            let caller = self.env().caller();

            let balance_token_out = self.balance_of(token_out, this);
            if balance_token_out < min_amount_token_out {
                return Err(AmmError::NotEnoughLiquidityOf(token_out));
            }

            let swap_pair = SwapPair::new(token_in, token_out);
            if !self.swap_pairs.contains(&swap_pair) {
                return Err(AmmError::UnsupportedSwapPair(swap_pair));
            }

            // check allowance
            if self.allowance(token_in, caller, this) < amount_token_in {
                return Err(AmmError::InsufficientAllowanceOf(token_in));
            }

            let amount_token_out = self.out_given_in(token_in, token_out, amount_token_in)?;

            if amount_token_out < min_amount_token_out {
                return Err(AmmError::TooMuchSlippage);
            }

            self.transfer_from_tx(token_in, caller, this, amount_token_in)?;
            self.transfer_tx(token_out, caller, amount_token_out)?;

            self.env().emit_event(Swapped {
                caller,
                token_in,
                token_out,
                amount_in: amount_token_in,
                amount_out: amount_token_out,
            });

            Ok(())
        }

        /// Allows authorized accounts to withdraw liquidity from the AMM pool.
        ///
        /// This function enables designated accounts (typically admins) to remove liquidity from the pool.
        /// It takes a vector of tuples specifying the token contract `account_id` (`token_out`) and the amount (`amount`)
        /// to be withdrawn for each token.
        ///
        /// Requirements:
        ///  * The caller must be authorized to perform withdrawals (usually the admin or authorized liquidity providers).
        ///
        /// # Arguments
        /// * `withdrawals`: A vector of tuples specifying the token contract `account_id` and amount to withdraw for each token.
        ///
        /// Emits a `Withdrawn` event for each successful withdrawal.
        ///
        /// Throws PSP22Error on failed transactions
        #[ink(message)]
        pub fn withdrawal(
            &mut self,
            withdrawals: Vec<(AccountId, Balance)>,
        ) -> Result<(), AmmError> {
            let caller = self.env().caller();

            // check role, under normal circumstances only designated account can remove liquidity
            self.check_owner(caller)?;
            withdrawals.into_iter().try_for_each(
                |(token_out, amount)| -> Result<(), AmmError> {
                    // transfer token_out from the contract to the caller
                    self.transfer_tx(token_out, caller, amount)?;
                    self.env().emit_event(Withdrawn {
                        caller,
                        token: token_out,
                        amount,
                    });

                    Ok(())
                },
            )?;

            Ok(())
        }

        /// Alters the swap_fee parameter
        ///
        /// Can only be called by the contract's Admin.
        #[ink(message)]
        pub fn set_swap_fee_percentage(
            &mut self,
            swap_fee_percentage: u128,
        ) -> Result<(), AmmError> {
            if swap_fee_percentage.gt(&100) {
                return Err(AmmError::WrongParameterValue);
            }

            self.check_owner(self.env().caller())?;

            self.swap_fee_percentage = swap_fee_percentage;

            Ok(())
        }

        /// Returns current value of the swap_fee_percentage parameter
        #[ink(message)]
        pub fn swap_fee_percentage(&self) -> Balance {
            self.swap_fee_percentage
        }

        /// Whitelists a token pair for swapping between
        ///
        /// Token pair is understood as a swap between tokens in one direction
        /// Can only be called by an Admin
        #[ink(message)]
        pub fn add_swap_pair(&mut self, from: AccountId, to: AccountId) -> Result<(), AmmError> {
            self.check_owner(self.env().caller())?;

            let pair = SwapPair::new(from, to);
            self.swap_pairs.insert(&pair, &());

            self.env().emit_event(SwapPairAdded { pair });

            Ok(())
        }

        /// Returns true if a pair of tokens is whitelisted for swapping between
        #[ink(message)]
        pub fn can_swap_pair(&self, from: AccountId, to: AccountId) -> bool {
            self.swap_pairs.contains(SwapPair::new(from, to))
        }

        /// Blacklists a token pair from swapping
        ///
        /// Token pair is understood as a swap between tokens in one direction
        /// Can only be called by an Admin
        #[ink(message)]
        pub fn remove_swap_pair(&mut self, from: AccountId, to: AccountId) -> Result<(), AmmError> {
            self.check_owner(self.env().caller())?;

            let pair = SwapPair::new(from, to);
            self.swap_pairs.remove(&pair);
            self.env().emit_event(SwapPairRemoved { pair });

            Ok(())
        }

        /// Terminates the contract.
        ///
        /// Can only be called by the contract's Admin.
        #[ink(message)]
        pub fn terminate(&mut self) -> Result<(), AmmError> {
            let caller = self.env().caller();
            self.check_owner(self.env().caller())?;
            self.env().terminate_contract(caller)
        }

        /// Calculates the amount of token required to be paid given a desired amount of another token to receive.
        ///
        /// This function helps users estimate the amount of `token_in` they need to spend to acquire a
        /// specific amount (`amount_token_out`) of `token_out` based on the current pool liquidity.
        ///
        /// # Arguments
        /// * `token_in`: The token contract `account_id` to be paid.
        /// * `token_out`: The token contract `account_id` desired to receive.
        /// * `amount_token_out`: The desired amount of `token_out` to receive.
        ///
        /// Returns the calculated amount of `token_in` required to be paid.
        ///
        /// Throws NotEnoughLiquidityOf(token_out)
        #[ink(message)]
        pub fn in_given_out(
            &self,
            token_in: AccountId,
            token_out: AccountId,
            amount_token_out: Balance,
        ) -> Result<Balance, AmmError> {
            let this = self.env().account_id();
            let balance_token_in = self.balance_of(token_in, this);
            let balance_token_out = self.balance_of(token_out, this);

            if balance_token_out <= amount_token_out {
                // throw early as otherwise caller will only see AmmError::Arithmetic
                return Err(AmmError::NotEnoughLiquidityOf(token_out));
            }

            Self::_in_given_out(amount_token_out, balance_token_in, balance_token_out)
        }

        /// Calculates the maximum amount of token received (`token_out`) given an amount of token provided (`token_in`).
        ///
        /// This function helps users estimate the maximum amount of `token_out` they will receive when swapping a specific
        /// amount (`amount_token_in`) of `token_in` considering the current pool reserves and swap fee.
        ///
        /// # Arguments
        /// * `token_in`: The token contract `account_id` being paid for the swap (PSP22 token address).
        /// * `token_out`: The token contract `account_id` desired to receive (PSP22 token address).
        /// * `amount_token_in`: The amount of `token_in` the user is willing to spend (U128 integer representing the amount).
        ///
        /// Returns the maximum amount of `token_out` receivable, considering fees.
        ///
        /// Throws AmmError
        #[ink(message)]
        pub fn out_given_in(
            &self,
            token_in: AccountId,
            token_out: AccountId,
            amount_token_in: Balance,
        ) -> Result<Balance, AmmError> {
            let this = self.env().account_id();
            let balance_token_in = self.balance_of(token_in, this);
            let balance_token_out = self.balance_of(token_out, this);

            Self::_out_given_in(amount_token_in, balance_token_in, balance_token_out)
        }

        /// This function is used internally to determine the amount of token needed to swap for a specified amount of another token,
        /// considering the current balances of both tokens within the pool.
        ///
        /// B_i * A_o / (B_o - A_o)
        fn _in_given_out(
            amount_token_out: Balance,
            balance_token_in: Balance,
            balance_token_out: Balance,
        ) -> Result<Balance, AmmError> {
            let op1 = balance_token_in
                .checked_mul(amount_token_out)
                .ok_or(AmmError::Arithmethic)?;

            let op2 = balance_token_out
                .checked_sub(amount_token_out)
                .ok_or(AmmError::Arithmethic)?;

            op1.checked_div(op2).ok_or(AmmError::Arithmethic)
        }

        /// This function helps estimate the maximum amount of a desired token (`amount_token_out`) a user can receive when swapping
        /// a specific amount of another token (`amount_token_in`), considering the current pool reserves and potential fee impact.
        ///
        /// B_o * A_i / (B_i + A_i)
        fn _out_given_in(
            amount_token_in: Balance,
            balance_token_in: Balance,
            balance_token_out: Balance,
        ) -> Result<Balance, AmmError> {
            let op1 = balance_token_out
                .checked_mul(amount_token_in)
                .ok_or(AmmError::Arithmethic)?;

            let op2 = balance_token_in
                .checked_add(amount_token_in)
                .ok_or(AmmError::Arithmethic)?;

            op1.checked_div(op2).ok_or(AmmError::Arithmethic)
        }

        /// Transfers a given amount of a PSP22 token to a specified using the callers own balance
        fn transfer_tx(
            &self,
            token: AccountId,
            to: AccountId,
            amount: Balance,
        ) -> Result<(), PSP22Error> {
            let mut token_ref: contract_ref!(PSP22) = token.into();
            token_ref.transfer(to, amount, vec![])?;

            Ok(())
        }

        /// Transfers a given amount of a PSP22 token on behalf of a specified account to another account
        ///
        /// Will revert if not enough allowance was given to the caller prior to executing this tx
        fn transfer_from_tx(
            &self,
            token: AccountId,
            from: AccountId,
            to: AccountId,
            amount: Balance,
        ) -> Result<(), AmmError> {
            let mut token_ref: contract_ref!(PSP22) = token.into();
            token_ref.transfer_from(from, to, amount, vec![0x0])?;

            Ok(())
        }

        /// Returns the amount of unused allowance that the token owner has given to the spender
        fn allowance(&self, token: AccountId, owner: AccountId, spender: AccountId) -> Balance {
            let token_ref: contract_ref!(PSP22) = token.into();
            token_ref.allowance(owner, spender)
        }

        /// Returns AMM balance of a PSP22 token for an account
        fn balance_of(&self, token: AccountId, account: AccountId) -> Balance {
            let token_ref: contract_ref!(PSP22) = token.into();
            token_ref.balance_of(account)
        }

        /// Checks if the `account` is eligible to call the secured messages.
        fn check_owner(&self, account: AccountId) -> Result<(), AmmError> {
            if account != self.owner {
                return Err(AmmError::NotAdmin);
            }

            Ok(())
        }
    }

    impl Default for AmmPool {
        fn default() -> Self {
            AmmPool::new()
        }
    }

    #[cfg(test)]
    mod test {
        use proptest::prelude::*;

        use super::*;

        #[test]
        fn test_liquidity_error() {
            let balance_in = 1000000000000000u128;
            let balance_out = 10000000000000u128;
            let amount_out = 10000000000000u128;

            assert_eq!(
                Err(AmmError::Arithmethic),
                AmmPool::_in_given_out(amount_out, balance_in, balance_out)
            );
        }

        #[test]
        fn test_in_given_out() {
            let balance_in = 1054100000000000u128;
            let balance_out = 991358845313840u128;

            let dust = 1u128;
            let expected_amount_in = 1000000000000u128;

            let amount_out =
                AmmPool::_out_given_in(expected_amount_in, balance_in, balance_out).unwrap();

            assert_eq!(939587570196u128, amount_out);

            let amount_in = AmmPool::_in_given_out(amount_out, balance_in, balance_out).unwrap();

            assert_eq!(amount_in, expected_amount_in - dust);
        }

        proptest! {
            #[test]
            fn proptest_in_given_out(
                amount_in   in 1000000000000..1054100000000000u128,
            ) {
                let balance_in =  1054100000000000u128;
                let balance_out = 991358845313840u128;

                let amount_out =
                    AmmPool::_out_given_in(amount_in, balance_in, balance_out).unwrap();

                let in_given_out = AmmPool::_in_given_out(amount_out, balance_in, balance_out).unwrap();
                let dust = 1u128;

                println! ("{} - {} = {}", amount_in, in_given_out, amount_in - in_given_out);
                assert!(amount_in - in_given_out <= 10 * dust);
            }
        }

        proptest! {
            #[test]
            fn rounding_benefits_dex(
                balance_token_a in 1000000000000..100000000000000u128,
                balance_token_b in 1000000000000..100000000000000u128,
                pay_token_a in 1000000000000..100000000000000u128,

            ) {
                let get_token_b =
                    AmmPool::_out_given_in(pay_token_a, balance_token_a, balance_token_b).unwrap();
                let balance_token_a = balance_token_a + pay_token_a;
                let balance_token_b = balance_token_b - get_token_b;
                let get_token_a =
                    AmmPool::_out_given_in(get_token_b, balance_token_b, balance_token_a).unwrap();

                assert!(get_token_a <= pay_token_a);
            }
        }
    }
}
