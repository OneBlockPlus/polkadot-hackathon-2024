#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod l2e_top {
    use core::iter;
    use ink::env::{
        call::{build_call, ExecutionInput, Selector},
        DefaultEnvironment,
    };
    use ink::prelude::{format, vec::Vec};
    use ink::storage::Mapping;

    type TokenId = u32;

    // type AccountId = <<L2eTop as ::ink::env::ContractEnv>::Env as ::ink::env::Environment>::AccountId;

    #[ink(storage)]
    pub struct L2eTop {
        // spenderid -> <(ownerid, dot balance, token balance)> total balance can be mutli stage claim.
        balances: Mapping<AccountId, Vec<(AccountId, Balance, Balance)>>,
        // ownerid -> <(spenderid, nft tokenid)>
        nfts: Mapping<AccountId, Vec<(AccountId, TokenId)>>,
        erc20_address: Vec<AccountId>,
        erc721_address: Vec<AccountId>,
        token_id_num: u32,
        self_address: AccountId,
    }

    #[ink(event)]
    pub struct Transferred {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        dot_amount: Balance,
        token_amount: Balance,
        nft_id: TokenId,
    }

    impl L2eTop {
        #[ink(constructor)]
        pub fn default(erc20: AccountId, erc721: AccountId) -> Self {
            // only test environment
            // let default_bal: Vec<(AccountId, Balance, Balance)> = Vec::new();
            let default_bal_map = Mapping::default();
            // default_bal_map.insert(AccountId::from([0x00; 32]), &default_bal);

            // let default_nft: Vec<(AccountId, TokenId)> = Vec::new();
            let default_nft_map = Mapping::default();
            // default_nft_map.insert(AccountId::from([0x00; 32]), &default_nft);

            let mut erc20_address: Vec<AccountId> = Vec::new();
            // 5CvYPNqkGfBHnXg4dcq64wH8UPzErkgLi4AxNuvk5kU6PonN
            // let def_erc20 = "5CvYPNqkGfBHnXg4dcq64wH8UPzErkgLi4AxNuvk5kU6PonN";
            // let def_erc20_address = AccountId32::from_ss58check(0def_erc20).unwrap();
            erc20_address.push(erc20);
            let mut erc721_address: Vec<AccountId> = Vec::new();
            // let def_erc721 = "5HiNjbd3BAVwbGFwtZgsZcphi3HZv1yFZqAVWQwASjEARzuC";
            // let def_erc721_address = AccountId32::from_ss58check(def_erc20).unwrap();
            erc721_address.push(erc721);

            let token_id_num = 10000;
            // let self_address = AccountId::from([0x42; 32]);

            let self_address = Self::env().caller();

            Self {
                balances: default_bal_map,
                nfts: default_nft_map,
                erc20_address,
                erc721_address,
                token_id_num,
                self_address,
            }
        }

        #[ink(message)]
        pub fn get_erc20_address(&self) -> Vec<AccountId> {
            ink::env::debug_println!("erc20_address: {:?}", self.erc20_address.clone());
            self.erc20_address.clone()
        }

        #[ink(message)]
        pub fn get_erc721_address(&self) -> Vec<AccountId> {
            ink::env::debug_println!("erc721_address: {:?}", self.erc721_address.clone());
            self.erc721_address.clone()
        }

        // AccountId: spender address
        // bool: if bool is false, then spender already claim nft.
        #[ink(message)]
        pub fn get_all_spender_approved_for_owner(&self) -> Option<Vec<(AccountId, bool)>> {
            let owner = self.env().caller();

            if self.nfts.contains(owner) {
                let spender_address: Result<
                    Vec<(ink::primitives::AccountId, TokenId)>,
                    ink::env::Error,
                > = self
                    .nfts
                    .try_get(owner)
                    .expect("Failed to try get_approved_balances_for_owner");

                if let Ok(vecs) = spender_address {
                    let mut spender_flag: Vec<(AccountId, bool)> = Vec::new();
                    for (a, n) in vecs {
                        if n > 0 {
                            spender_flag.push((a, true));
                        } else {
                            spender_flag.push((a, false));
                        }
                    }

                    return Some(spender_flag);
                }
            }

            None
        }

        // Not already claim dot and token
        #[ink(message)]
        pub fn get_balances_approved_for_spender(&self) -> Option<Vec<(Balance, Balance)>> {
            let spender = self.env().caller();

            if self.balances.contains(spender) {
                let owner_address: Result<
                    Vec<(ink::primitives::AccountId, u128, u128)>,
                    ink::env::Error,
                > = self
                    .balances
                    .try_get(spender)
                    .expect("Failed to try get_balances_approved_for_spender");
                ink::env::debug_println!("owner_address: {:?}", owner_address);
                if let Ok(vecs) = owner_address {
                    ink::env::debug_println!("vecs: {:?}", vecs);
                    return Some(vecs.iter().map(|&v| (v.1, v.2)).collect());
                }
                ink::env::debug_println!("get_balances_approved_for_spender over");
            }

            None
        }

        #[ink(message)]
        pub fn get_spender_dot_allowances(&self, owner: AccountId) -> Option<Balance> {
            let spender = self.env().caller();

            if self.balances.contains(spender) {
                let balances = self
                    .balances
                    .try_get(spender)
                    .expect("try get_spender_token_allowances failed");

                if let Ok(vec) = balances {
                    let value = vec.iter().find(|&v| v.0 == owner);
                    if let Some(v) = value {
                        return Some(v.1);
                    }
                }
            }
            None
        }

        #[ink(message)]
        pub fn get_spender_token_allowances(&self, owner: AccountId, erc20_num: u32) -> Option<()> {
            let spender = self.env().caller();

            let mut current_erc20 = self.erc20_address[0];

            if (self.erc20_address.len() as u32)
                > erc20_num.checked_add(1).expect("Failed to add erc20_num")
            {
                current_erc20 = self.erc20_address[erc20_num as usize];
            }

            if self.balances.contains(spender) {
                let balances = build_call::<DefaultEnvironment>()
                    // ERC20 address, gas_limit must be some value when in mainnet
                    .call(current_erc20)
                    .call_v1()
                    .gas_limit(0)
                    .transferred_value(0)
                    .exec_input(
                        ExecutionInput::new(Selector::new(ink::selector_bytes!("allowances")))
                            .push_arg(owner)
                            .push_arg(spender),
                    )
                    .returns::<Vec<u8>>()
                    .try_invoke()
                    .expect("Failed to get_spender_token_allowances");

                // if let Ok(value) = balances {
                //     return Some(value);
                // }
            }
            None
        }

        #[ink(message)]
        pub fn get_spender_nft_allowances(&self, owner: AccountId) -> Option<TokenId> {
            let spender = self.env().caller();

            if self.nfts.contains(owner) {
                let nfts = self
                    .nfts
                    .try_get(owner)
                    .expect("try get_spender_token_allowances failed");

                if let Ok(vec) = nfts {
                    let value = vec.iter().find(|&v| v.0 == spender);
                    if let Some(v) = value {
                        return Some(v.1);
                    }
                }
            }
            None
        }

        #[ink(message, payable)]
        pub fn approve_balances(
            &mut self,
            spender: AccountId,
            erc20_num: u32,
            dot_value: Balance,
            token_value: u128,
        ) -> Result<(Balance, Balance), Error> {
            let owner = self.env().caller();
            let mut current_value = 0;
            // dot_value should be transfer value, self.env().transferred_value() acutal value.
            // frontend control dot_value == self.env().transferred_value()
            if dot_value > 0 {
                current_value = self.env().transferred_value();
            }
            ink::env::debug_println!("current_value-{}", current_value);
            ink::env::debug_println!("token_value:{}", token_value);
            if token_value > 0 {
                ink::env::debug_println!("token_value>0");
                let mut current_erc20 = self.erc20_address[0];

                if (self.erc20_address.len() as u32)
                    > erc20_num.checked_add(1).expect("Failed to add erc20_num")
                {
                    current_erc20 = self.erc20_address[erc20_num as usize];
                }
                ink::env::debug_println!("current_erc20:{:?}", current_erc20);
                ink::env::debug_println!("current_erc20:{:?}", self.erc20_address);
                let result_approve = build_call::<DefaultEnvironment>()
                    // ERC20 address, gas_limit must be some value when in mainnet
                    .call(current_erc20)
                    .call_v1()
                    .gas_limit(0)
                    .transferred_value(0)
                    .exec_input(
                        ExecutionInput::new(Selector::new(ink::selector_bytes!("approve")))
                            .push_arg(spender)
                            .push_arg(token_value),
                    )
                    .returns::<()>()
                    .try_invoke()
                    .map_err(|e| format!("approve_balances failed: {:?}", e));

                ink::env::debug_println!("result_approve error3:{:?}", result_approve);
            }
            ink::env::debug_println!("token_value  over");
            if self.balances.contains(spender) {
                ink::env::debug_println!("self.balances.contains(spender)");
                let mut owner_value = self
                    .balances
                    .take(spender)
                    .expect("failed to take owner value");
                ink::env::debug_println!("owner_value::{:?}", owner_value);
                if owner_value.iter().any(|&(o, _, _)| o == owner) {
                    return Err(Error::BalancesAlreadyApproved);
                }

                owner_value.push((owner, current_value, token_value));
            } else {
                let mut owner_value = Vec::new();
                owner_value.push((owner, current_value, token_value));
                self.balances.insert(spender, &owner_value);
                ink::env::debug_println!("owner_value--{:?}", owner_value);
            }
            ink::env::debug_println!("owner_value--over");
            Ok((current_value, token_value))
        }

        #[ink(message)]
        pub fn mint_approve_nft(
            &mut self,
            erc721_num: u32,
            spender: AccountId,
        ) -> Result<(), Error> {
            let owner = self.env().caller();

            // tokenid u32
            self.token_id_num = self
                .token_id_num
                .checked_add(1)
                .expect("Failed to create token_id");
            let mut token_id: TokenId = self.token_id_num;

            let mut current_erc721 = self.erc721_address[0];
            if (self.erc721_address.len() as u32) > erc721_num {
                current_erc721 = self.erc721_address[erc721_num as usize];
            }
            ink::env::debug_println!("current_erc721:{:?}", current_erc721);
            ink::env::debug_println!("token_id:{:?}", token_id);
            // call ERC721 mint function
            let mint_approve_nft = build_call::<DefaultEnvironment>()
                // ERC721
                .call(current_erc721)
                .call_v1()
                .gas_limit(0)
                .transferred_value(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("mint")))
                        .push_arg(token_id),
                )
                .returns::<()>()
                .try_invoke()
                // .map_err(|_| Error::FailedMintNFT)?;
                .map_err(|e| format!("mint_approve_nft failed: {:?}", e));

            ink::env::debug_println!("mint_approve_nft error:{:?}", mint_approve_nft);

            Self::env().emit_event(Transferred {
                from: None,
                to: Some(owner),
                dot_amount: 0,
                token_amount: 0,
                nft_id: token_id,
            });

            let approve_nft = build_call::<DefaultEnvironment>()
                // DOT ERC721 address
                .call(current_erc721)
                .call_v1()
                .gas_limit(0)
                .transferred_value(0)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("approve")))
                        .push_arg(spender)
                        .push_arg(token_id),
                )
                .returns::<()>()
                .try_invoke()
                // .map_err(|_| Error::ApproveNFTFailed)?;
                .map_err(|e| format!("approve_nft failed: {:?}", e));

            ink::env::debug_println!("approve_nft error:{:?}", approve_nft);

            if self.nfts.contains(owner) {
                let mut nft_tokens = self
                    .nfts
                    .take(owner)
                    .expect("Failed to get (spender, token_id)");
                nft_tokens.push((spender, token_id));
            } else {
                let mut spender_token_id = Vec::new();
                spender_token_id.push((spender, token_id));

                self.nfts.insert(owner, &spender_token_id);
            }
            ink::env::debug_println!("mint_approve_nft--over");
            Ok(())
        }

        #[ink(message)]
        pub fn transfer_balances_from(
            &mut self,
            owner: AccountId,
            dot: Balance,
            token: Balance,
            erc20_num: u32,
        ) -> Result<(), Error> {
            let spender = self.env().caller();

            // check nft authorization
            if self.nfts.contains(owner) {
                let spender_value_vec = self
                    .nfts
                    .get(owner)
                    .expect("failed to get nfts spender_value");

                let spender_value = spender_value_vec.iter().find(|&x| x.0 == spender);

                if spender_value.is_none() {
                    return Err(Error::NoExistNFTApprove);
                }
            } else {
                return Err(Error::NoExistNFTApprove);
            }
            ink::env::debug_println!("check nft authorization--over");
            // check dot authorization
            if !self.balances.contains(spender) {
                return Err(Error::NoExistDOTApprove);
            } else {
                let owner_value_vec = self
                    .balances
                    .get(spender)
                    .expect("failed to get balances owner_value");

                let owner_value = owner_value_vec.iter().find(|&x| x.0 == owner);

                if owner_value.is_none() {
                    return Err(Error::NoExistDOTApprove);
                }

                if dot > 0 && owner_value.expect("failed to get value").1 < dot {
                    return Err(Error::InsufficientApproveTokens);
                    // transfer dot to spender account
                } else if self.env().transfer(spender, dot).is_err() {
                    return Err(Error::TransactionFailed);
                }
                let mut current_erc20 = self.erc20_address[0];

                if (self.erc20_address.len() as u32)
                    > erc20_num.checked_add(1).expect("Failed to add erc20_num")
                {
                    current_erc20 = self.erc20_address[erc20_num as usize];
                }

                if token > 0 && owner_value.expect("failed to get value").2 < token {
                    return Err(Error::InsufficientApproveTokens);
                }

                // // spender claim straight through ERC20 claim token
                // let _ = build_call::<DefaultEnvironment>()
                //     .call(current_erc20)
                //     .call_v1()
                //     .gas_limit(0)
                //     .transferred_value(0)
                //     .exec_input(
                //         ExecutionInput::new(Selector::new(ink::selector_bytes!("transferFrom")))
                //             .push_arg(owner)
                //             .push_arg(spender)
                //             .push_arg(token),
                //     )
                //     .returns::<Vec<u8>>()
                //     .try_invoke()
                //     .map_err(|_| Error::TransactionTokenCallFailed)?;
            }
            ink::env::debug_println!("check dot authorization--over");
            Self::env().emit_event(Transferred {
                from: Some(owner),
                to: Some(spender),
                dot_amount: dot,
                token_amount: token,
                nft_id: 0,
            });

            let mut owner_value = self
                .balances
                .take(spender)
                .expect("failed to take owner value");
            // subtract approve value
            for (k, dot_v, token_v) in owner_value.iter_mut() {
                if k == &owner {
                    *dot_v = (*dot_v).checked_sub(dot).expect("sub transfer dot failed");
                    *token_v = (*token_v)
                        .checked_sub(token)
                        .expect("sub transfer token failed");
                    break;
                }
            }
            ink::env::debug_println!("transfer_balances_from owner_value::{:?}", owner_value);
            Ok(())
        }

        #[ink(message)]
        pub fn transfer_nft_from(
            &mut self,
            owner: AccountId,
            erc721_num: u32,
        ) -> Result<(), Error> {
            let spender = self.env().caller();

            let spender_token_id_vec = self.nfts.get(owner).expect("failed to get owner_value");

            let spender_token_id = spender_token_id_vec.iter().find(|&x| x.0 == spender);

            if !self.nfts.contains(owner) {
                return Err(Error::NoExistNFTApprove);
            } else if spender_token_id.is_none() {
                return Err(Error::NoExistNFTApprove);
            }

            let token_id = spender_token_id.expect("failed to get value").1;
            ink::env::debug_println!(
                "transfer_nft_from spender_token_id_vec::{:?}",
                spender_token_id_vec
            );
            if token_id == 0 {
                return Err(Error::InsufficientApproveTokens);
            }
            ink::env::debug_println!("token_id: {:?}", token_id);
            let mut current_erc721 = self.erc721_address[0];
            if (self.erc721_address.len() as u32)
                > erc721_num.checked_add(1).expect("Failed to add erc721_num")
            {
                current_erc721 = self.erc721_address[erc721_num as usize];
            }

            // // spender claim straight through ERC721 claim nft
            // let transfer_nft = build_call::<DefaultEnvironment>()
            //     .call(current_erc721)
            //     .call_v1()
            //     .gas_limit(0)
            //     .transferred_value(0)
            //     .exec_input(
            //         ExecutionInput::new(Selector::new(ink::selector_bytes!("transferFrom")))
            //             .push_arg(owner)
            //             .push_arg(spender)
            //             .push_arg(token_id),
            //     )
            //     .returns::<()>()
            //     .try_invoke()
            //     // .map_err(|_| Error::TransactionNFTCallFailed)?;
            //     .map_err(|e| format!("transfer_nft failed: {:?}", e));

            // ink::env::debug_println!("transfer_nft error3:{:?}", transfer_nft);

            Self::env().emit_event(Transferred {
                from: Some(owner),
                to: Some(spender),
                dot_amount: 0,
                token_amount: 0,
                nft_id: token_id,
            });

            let mut spender_token_id = self.nfts.take(owner).expect("failed to take owner value");
            // clear to already claim nft
            spender_token_id.retain(|&x| x.0 == spender && x.1 == token_id);
            ink::env::debug_println!("transfer_nft_from spender_token_id::{:?}", spender_token_id);
            Ok(())
        }

        #[ink(message)]
        pub fn add_contract_address(
            &mut self,
            erc20_address: AccountId,
            erc721_address: AccountId,
        ) -> Result<(), Error> {
            let current_caller = self.env().caller();
            if current_caller != self.self_address {
                return Err(Error::NoAuthorityAddContractAddress);
            }

            // add erc20 contract address
            let mut erc20_address_vec = self.erc20_address.clone();
            erc20_address_vec.push(erc20_address);

            // add erc721 contract address
            let mut erc721_address_vec = self.erc721_address.clone();
            erc721_address_vec.push(erc721_address);
            Ok(())
        }
    }

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        ApproveDotsFailed,
        BalancesAlreadyApproved,
        FailedMintNFT,
        ApproveNFTFailed,
        TransactionNFTCallFailed,
        TransactionTokenCallFailed,
        TransactionFailed,
        NoExistDOTApprove,
        NoExistNFTApprove,
        InsufficientApproveTokens,
        NoExistNFT,
        NoAuthorityAddContractAddress,
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
            let l2etop = L2eTop::default(AccountId::from([0x0; 32]), AccountId::from([0x0; 32]));
            assert_eq!(l2etop.get_erc20_address(), vec![AccountId::from([0x0; 32])]);
            assert_eq!(l2etop.get_erc20_address(), vec![AccountId::from([0x0; 32])]);
            assert_eq!(l2etop.get_all_spender_approved_for_owner(), None);
            assert_eq!(l2etop.get_balances_approved_for_spender(), None);
            assert_eq!(
                l2etop.get_spender_dot_allowances(AccountId::from([0x0; 32])),
                None
            );
        }
    }

    /// This is how you'd write end-to-end (E2E) or integration tests for ink! contracts.
    ///
    /// When running these you need to make sure that you:
    /// - Compile the tests with the `e2e-tests` feature flag enabled (`--features e2e-tests`)
    /// - Are running a Substrate node which contains `pallet-contracts` in the background
    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;
        use ink_e2e::subxt::book::setup::client;
        use ink_e2e::subxt::{tx::Signer, Config};
        /// A helper function used for calling contract messages.
        use ink_e2e::ContractsBackend;
        // use sp_keyring::sr25519::Keyring::*;
        /// The End-to-End test `Result` type.
        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        /// We test that we can upload and instantiate the contract using its default constructor.
        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client) -> E2EResult<()> {
            // Given
            // let erc20_contrract_code = client
            //     .upload("erc20", &ink_e2e::alice())
            //     .submit()
            //     .await
            //     .expect("erc20_contract upload failed");

            // let erc721_contrract_code = client
            //     .upload("erc721", &ink_e2e::alice())
            //     .submit()
            //     .await
            //     .expect("erc721_contract upload failed");

            // let erc20_return = Erc20Ref::new(100);
            // ink::env::debug_println!("erc20_return: {:?}", erc20_return);

            // let mut constructor = L2eTopRef::default(
            //     erc20_contrract_code.code_hash,
            //     erc721_contrract_code.code_hash,
            // );

            let mut constructor = L2eTopRef::default(
                AccountId::from([0x0; 32]),
                AccountId::from([0x0; 32]),
            );

            // When
            let contract = client
                .instantiate("l2e", &ink_e2e::alice(), &mut constructor)
                .submit()
                .await
                .expect("instantiate failed");
            let call_builder = contract.call_builder::<L2eTop>();

            // Then
            let get = call_builder.get_all_spender_approved_for_owner();
            let get_result = client.call(&ink_e2e::alice(), &get).dry_run().await?;
            assert!(matches!(get_result.return_value(), None));

            // Then
            let get = call_builder.get_balances_approved_for_spender();
            let get_result = client.call(&ink_e2e::alice(), &get).dry_run().await?;
            assert!(matches!(get_result.return_value(), None));

            // Then
            let get = call_builder
                .get_spender_dot_allowances(ink_e2e::account_id(ink_e2e::AccountKeyring::Bob));
            let get_result = client.call(&ink_e2e::alice(), &get).dry_run().await?;
            assert!(matches!(get_result.return_value(), None));
            Ok(())
        }

        /// We test that we can read and write a value from the on-chain contract.
        #[ink_e2e::test]
        async fn it_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given initial deploy once
            let mut constructor = L2eTopRef::default(
                AccountId::from([0x0; 32]),
                AccountId::from([0x0; 32]),
            );

            let contract = client
                .instantiate("l2e", &ink_e2e::alice(), &mut constructor)
                .value(0)
                .submit()
                .await
                .expect("instantiate failed");
            let mut call_builder = contract.call_builder::<L2eTop>();

            // Then get_contract_address
            // let get_contract_address = call_builder.get_contract_address();
            // let contract_address =  client.call(&ink_e2e::alice(), &get_contract_address).dry_run().await?;

            // 1. approve_balances, alice call contract and approve to bob
            let transfer_amount = 100;
            let get = call_builder.approve_balances(
                ink_e2e::account_id(ink_e2e::AccountKeyring::Bob),
                0,
                transfer_amount,
                0,
            );
            let get_result = client.call(&ink_e2e::alice(), &get).dry_run().await?;
            // ink::env::debug_println!("get_result.return_value(): {:?}", &get_result.return_value());
            // println!(
            //     "get_result.return_value()1: {:?}",
            //     get_result.return_value()
            // );
            assert!(matches!(get_result.return_value(), Ok((0, 0))));

            // 2. get_spender_dot_allowances, bob call contract and get result
            let get_spender_dot_allowances = call_builder
                .get_spender_dot_allowances(ink_e2e::account_id(ink_e2e::AccountKeyring::Alice));
            let get_result = client
                .call(&ink_e2e::bob(), &get_spender_dot_allowances)
                .dry_run()
                .await?;
            // println!(
            //     "get_result.return_value()2: {:?}",
            //     get_result.return_value()
            // );
            assert!(matches!(get_result.return_value(), None));

            Ok(())
        }
    }
}
