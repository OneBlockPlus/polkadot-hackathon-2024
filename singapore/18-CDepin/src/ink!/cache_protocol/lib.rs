#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod cache_protocol {

    use cache_token::CacheTokenRef;
    use ink::env::hash::Keccak256;
    use ink::env::DefaultEnvironment;
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::traits::StorageLayout;
    use ink::storage::Mapping;
    use ink::EnvAccess;

    type TokenId = Vec<u8>;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]

    pub enum Error {
        /// Custom error type for cases if writer of traits added own restrictions
        Custom(String),
    }

    #[derive(scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
    pub struct NodeInfo {
        created: bool,
        collerate: u128,
        token_id: TokenId,
        peer_id: Vec<u8>,
    }

    #[derive(scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
    struct OrderInfo {
        value: u128,
        creater: AccountId,
        node: AccountId,
        term: u128,
    }

    // event Staking(address indexed nodeAcc, uint256 indexed tokenId);
    // #[ink(event)]
    #[derive(scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
    pub struct Staking {
        node_acc: AccountId,
        token_id: TokenId,
    }

    // #[ink(event)]
    #[derive(scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
    pub struct OrderPayment {
        order_id: Vec<u8>,
        node_acc: AccountId,
    }

    // #[ink(event)]
    #[derive(scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
    pub struct Claim {
        node_acc: AccountId,
        reward: u128
    }

    // #[ink(event)]
    #[derive(scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
    pub struct Exit {
        node_acc: AccountId,
    }


    #[ink(storage)]
    pub struct CacheProtocol {
        // Ref to CacheToken
        ct: CacheTokenRef,

        // Storage
        owner: AccountId,
        create_time: u128,
        node_num: u128,
        cur_total_order_num: u128,
        total_collerate: u128,

        // // Mappings
        order_num: Mapping<AccountId, u128>,
        term_total_order: Mapping<u128, u128>,
        node: Mapping<AccountId, NodeInfo>,
        token_bonded: Mapping<TokenId, bool>,
        cache_reward: Mapping<AccountId, u128>,
        reward_record: Mapping<AccountId, u128>,
        order: Mapping<Vec<u8>, OrderInfo>,
    }

    impl CacheProtocol {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(other_contract_code_hash: Hash) -> Self {
            let ct = CacheTokenRef::new(String::from("first"), String::from("second"))
                .code_hash(other_contract_code_hash)
                .endowment(0)
                .salt_bytes([0xDE, 0xAD, 0xBE, 0xEF])
                .instantiate();

            Self {
                ct,
                owner: Self::env().caller(),
                create_time: Self::env().block_timestamp() as u128,
                node_num: Default::default(),
                cur_total_order_num: Default::default(),
                total_collerate: Default::default(),
                order_num: Mapping::default(),
                term_total_order: Mapping::default(),
                node: Mapping::default(),
                token_bonded: Mapping::default(),
                cache_reward: Mapping::default(),
                reward_record: Mapping::default(),
                order: Mapping::default(),
            }
        }

        #[ink(message)]
        pub fn is_token_owner(&mut self, acc: AccountId, token_id: TokenId) -> bool {
            let owner = self.ct.owner_of(token_id).unwrap();

            owner.map_or(false, |o| acc == o)
        }

        #[ink(message, payable)]
        pub fn staking(
            &mut self,
            node_acc: AccountId,
            token_acc: AccountId,
            token_id: TokenId,
            peer_id: Vec<u8>,
            signature: Vec<u8>,
        ) -> Result<Staking, Error> {
            let transferred_value = Self::env().transferred_value();

            if transferred_value < 3_000_000_000_000_000_000_000 {
                return Err(Error::Custom("Insufficient pledge amount".into()));
            }

            if self.is_token_owner(token_acc, token_id.clone()) == false {
                return Err(Error::Custom("Not the token holder.".into()));
            }

            // TODO: Generate hash and verify the signer

            self.node.insert(
                node_acc,
                &NodeInfo {
                    created: true,
                    collerate: transferred_value,
                    token_id: token_id.clone(),
                    peer_id,
                },
            );

            self.order_num.insert(node_acc, &0);
            self.cache_reward.insert(node_acc, &0);
            self.reward_record.insert(node_acc, &0);
            self.total_collerate += transferred_value;
            self.token_bonded.insert(token_id.clone(), &true);

            // self.env().emit_event(Staking {
            //     node_acc,
            //     token_id
            // });
            Ok(Staking {
                node_acc,
                token_id
            })
        }

        #[ink(message, payable)]
        pub fn cache_order_payment(&mut self, node_acc: AccountId) -> Result<OrderPayment, Error> {
            let transferred_value = Self::env().transferred_value();
            if transferred_value < 100_000_000_000_000_000 {
                return Err(Error::Custom("Insufficient amount".into()));
            }

            let term = self.get_currency_term();
            let order_id = self.generate_order_id(node_acc);
            let order_info = OrderInfo {
                value: transferred_value,
                creater: Self::env().caller(),
                node: node_acc,
                term,
            };

            self.order.insert(order_id.clone(), &order_info);
            let order_num = transferred_value / 100_000_000_000_000_000;
            self.order_num.insert(
                node_acc,
                &(self.order_num.get(node_acc).unwrap_or(0) + order_num),
            );

            // ink_lang::codegen::EmitEvent::<OrderPayment>::emit_event(self.env(), OrderPayment {
            //     order_id,
            //     node_acc
            // });

            Ok(OrderPayment{
                node_acc,
                order_id
            })
        }

        #[ink(message)]
        pub fn order_claim(&mut self, order_id: Vec<u8>) -> Result<(), Error> {
            let order_info = self
                .order
                .get(order_id.clone())
                .ok_or(Error::Custom("Order info not found!".into()))?;
            if order_info.node != self.env().caller() {
                return Err(Error::Custom("not order node!".into()));
            }
            self.order.remove(order_id);
            Ok(())
        }

        #[ink(message)]
        pub fn claim(&mut self) -> Result<Claim, Error> {
            let term = self.get_currency_term();
            let sender = self.env().caller();
            if self.reward_record.get(sender).unwrap_or(0) >= (term - 1) {
                return Err(Error::Custom(
                    "Please wait until the next term to claim the reward".into(),
                ));
            }

            let node_info = self
                .node
                .get(sender)
                .ok_or(Error::Custom("Node info not found!".into()))?;

            if !node_info.created {
                return Err(Error::Custom("Cache node not registered".into()));
            }

            let alpha = self.get_alpha();
            let total_order_num = self.node_num + self.term_total_order.get(term - 1).ok_or(Error::Custom("Term total order not found!".into()))?;
            let avg = self.node_num / total_order_num;
            let num_order = self
                .order_num
                .get(sender)
                .ok_or(Error::Custom("Order number not found!".into()))?;
            let reward_word = self
                .cache_reward
                .get(sender)
                .ok_or(Error::Custom("Cache reward not found".into()))?;
            let reward_term = (((avg + (alpha * (num_order - avg))) / total_order_num * 2 / 10)
                + (node_info.collerate / self.total_collerate * 2 / 10))
                * 100_000_000_000_000_000_000_000;

            let issue_reward = (reward_word + reward_term) * 40 / 100;
            self.cache_reward
                .insert(sender, &(reward_word + reward_term - issue_reward));
            if let Err(_) = self.env().transfer(sender, issue_reward) {
                return Err(Error::Custom("Transfer failed!".into()));
            }
            self.reward_record.insert(sender, &(term - 1));
            self.order_num.insert(sender, &0);
            self.cur_total_order_num += num_order;

            // self.env().emit_event(Claim {
            //     sender,
            //     issue_reward
            // })
            Ok(Claim{
                node_acc: sender,
                reward: issue_reward
            })
        }

        #[ink(message)]
        pub fn exit(&mut self) -> Result<Exit, Error> {
            let sender = self.env().caller();
            let node_info = self.node.get(sender).ok_or(Error::Custom("Node not found!".into()))?;
            if !node_info.created {
                return Err(Error::Custom("Cache node not registered!".into()));
            }
            if let Err(_) = self.env().transfer(sender, node_info.collerate) {
                return Err(Error::Custom("Transfer failed!".into()));
            }
            self.order_num.remove(sender);
            self.node.remove(sender);
            self.reward_record.remove(sender);
            self.cache_reward.remove(sender);
            self.token_bonded.remove(node_info.token_id);
            
            // <EnvAccess<'_, DefaultEnvironment> as EmitEvent<CacheProtocol>>::emit_event::<Exit>(self.env(), Exit {
            //     node_acc: sender,
            // });
            
            Ok(Exit {
                node_acc: sender
            })
        }
        
        #[ink(message)]
        pub fn to_eth_signed_message_hash(&mut self, hash: [u8; 32]) -> [u8; 32] {
            let prefix = b"\x19Ethereum Signed Message:\n32";
            let mut encoded = Vec::new();
            encoded.extend_from_slice(prefix);
            encoded.extend_from_slice(&hash);

            let mut result = [0u8; 32];
            ink::env::hash_bytes::<Keccak256>(&encoded, &mut result);
            result
        }

        #[ink(message)]
        pub fn get_message_hash(&mut self, account: AccountId, token_id: u128) -> [u8; 32] {
            let mut encoded = Vec::new();
            encoded.extend_from_slice(account.as_ref());
            encoded.extend_from_slice(&token_id.to_be_bytes());

            let mut result = [0u8; 32];

            ink::env::hash_bytes::<Keccak256>(&encoded, &mut result);

            result
        }

        pub fn generate_order_id(&self, node_acc: AccountId) -> Vec<u8> {
            let block_timestamp = Self::env().block_timestamp();
            let mut encoded = Vec::new();
            encoded.extend_from_slice(&block_timestamp.to_be_bytes());
            encoded.extend_from_slice(&node_acc.as_ref());

            let mut result = [0u8; 32];

            ink::env::hash_bytes::<Keccak256>(&encoded, &mut result);

            result.to_vec()
        }

        pub fn get_alpha(&self) -> u128 {
            let alpha = 2000 + (38 * self.get_currency_term());
            if 2000 + (38 * self.get_currency_term()) < 6000 {
                return alpha;
            } else {
                return 6000;
            }
        }

        pub fn get_currency_term(&self) -> u128 {
            return ((self.env().block_timestamp() as u128 - self.create_time) / 604_800_000)
                .into();
        }

        #[ink(message)]
        pub fn cache_token_account(&mut self) -> AccountId {
            self.ct.account_id()
        }
    }
}
