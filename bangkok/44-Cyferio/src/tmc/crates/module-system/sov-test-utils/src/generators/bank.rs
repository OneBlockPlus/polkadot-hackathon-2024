use std::rc::Rc;

use sov_bank::{get_token_id, Bank, CallMessage, Coins, TokenId};
use sov_modules_api::transaction::PriorityFeeBips;
use sov_modules_api::{CryptoSpec, PrivateKey as _, Spec};

use crate::{
    generate_address, Message, MessageGenerator, TestSpec, TEST_DEFAULT_MAX_FEE,
    TEST_DEFAULT_MAX_PRIORITY_FEE,
};
type PrivateKey<S> = <<S as Spec>::CryptoSpec as CryptoSpec>::PrivateKey;

/// Defines the data required to transfer tokens.
pub struct TransferData<S: Spec> {
    /// The private key of the sender.
    pub sender_pkey: Rc<<S::CryptoSpec as CryptoSpec>::PrivateKey>,
    /// The address of the receiver.
    pub receiver_address: S::Address,
    /// The token ID.
    pub token_id: TokenId,
    /// The amount to transfer.
    pub transfer_amount: u64,
}

/// Defines the data required to create a token.
pub struct TokenCreateData<S: Spec> {
    /// The name of the token.
    pub token_name: String,
    /// The salt.
    pub salt: u64,
    /// The initial balance.
    pub initial_balance: u64,
    /// The address to mint the tokens to.
    pub mint_to_address: S::Address,
    /// The private key of the minter.
    pub minter_pkey: Rc<<S::CryptoSpec as CryptoSpec>::PrivateKey>,
    /// The authorized minters.
    pub authorized_minters: Vec<S::Address>,
}

impl<S: Spec> TokenCreateData<S> {
    fn get_token_id(&self) -> TokenId {
        get_token_id::<S>(&self.token_name, &self.mint_to_address, self.salt)
    }
}

/// Defines a message generator for the bank module.
pub struct BankMessageGenerator<S: Spec> {
    /// The token create transactions.
    pub token_create_txs: Vec<TokenCreateData<S>>,
    /// The transfer transactions.
    pub transfer_txs: Vec<TransferData<S>>,
}

const DEFAULT_TOKEN_NAME: &str = "Token1";
const DEFAULT_SALT: u64 = 10;
const DEFAULT_INIT_BALANCE: u64 = 1000000;

/// Gets the default token ID for the given address.
pub fn get_default_token_id<S: Spec>(address: &<S as Spec>::Address) -> TokenId {
    get_token_id::<S>(DEFAULT_TOKEN_NAME, address, DEFAULT_SALT)
}

impl<S: Spec> BankMessageGenerator<S>
where
    S::Address: From<[u8; 32]>,
{
    /// Generates a random [`CallMessage::CreateToken`] transaction for default token parameters.
    pub fn random_create_token_generator(
        private_key: <<S as Spec>::CryptoSpec as CryptoSpec>::PrivateKey,
    ) -> Self {
        let minter: S::Address = (&private_key.pub_key()).into();
        Self::generate_create_token(
            DEFAULT_TOKEN_NAME.to_owned(),
            DEFAULT_SALT,
            private_key.into(),
            vec![minter],
            DEFAULT_INIT_BALANCE,
        )
    }

    /// Create two message generators - one which creates a token, and one which generates random transfers for the token.
    /// The token generator is returned in the first position.
    pub fn generate_token_and_random_transfers(
        num_transfers: u64,
        private_key: <<S as Spec>::CryptoSpec as CryptoSpec>::PrivateKey,
    ) -> (Self, Self) {
        let mut generator_with_token = Self::random_create_token_generator(private_key);
        let token_id = generator_with_token.token_create_txs[0].get_token_id();
        let priv_key: PrivateKey<S> =
            Rc::make_mut(&mut generator_with_token.token_create_txs[0].minter_pkey).clone();
        let transfer_generator = Self::generate_random_transfers(num_transfers, token_id, priv_key);

        (generator_with_token, transfer_generator)
    }

    /// Generates a [`CallMessage::CreateToken`] transaction.
    pub fn generate_create_token(
        token_name: String,
        salt: u64,
        minter_pkey: Rc<<<S as Spec>::CryptoSpec as CryptoSpec>::PrivateKey>,
        authorized_minters: Vec<<S as Spec>::Address>,
        initial_balance: u64,
    ) -> Self {
        Self {
            token_create_txs: vec![TokenCreateData {
                token_name,
                salt,
                initial_balance,
                mint_to_address: (&minter_pkey.pub_key()).into(),
                minter_pkey,
                authorized_minters,
            }],
            transfer_txs: vec![],
        }
    }

    /// Generates random [`CallMessage::Transfer`] messages between the default sender and random receivers.
    pub fn generate_random_transfers(n: u64, token_id: TokenId, sender_pk: PrivateKey<S>) -> Self {
        let mut transfer_txs = vec![];
        for _ in 1..(n + 1) {
            let priv_key = PrivateKey::<S>::generate();
            let address: <S as Spec>::Address = (&priv_key.pub_key()).into();

            transfer_txs.push(TransferData {
                sender_pkey: Rc::new(sender_pk.clone()),
                receiver_address: address,
                token_id,
                transfer_amount: 1,
            });
        }

        BankMessageGenerator {
            token_create_txs: vec![],
            transfer_txs,
        }
    }

    /// Generates [`CallMessage::CreateToken`] and single [`CallMessage::Transfer`] transactions.
    pub fn with_minter_and_transfer(
        minter_key: <<S as Spec>::CryptoSpec as CryptoSpec>::PrivateKey,
    ) -> Self {
        let minter: <S as Spec>::Address = (&minter_key.pub_key()).into();
        let salt = DEFAULT_SALT;
        let token_name = DEFAULT_TOKEN_NAME.to_owned();
        let create_data = TokenCreateData {
            token_name: token_name.clone(),
            salt,
            initial_balance: 1000,
            mint_to_address: minter.clone(),
            minter_pkey: Rc::new(minter_key.clone()),
            authorized_minters: Vec::from([minter.clone()]),
        };
        Self {
            token_create_txs: Vec::from([create_data]),
            transfer_txs: Vec::from([TransferData {
                sender_pkey: Rc::new(minter_key),
                transfer_amount: 15,
                receiver_address: generate_address::<S>("just_receiver"),
                token_id: get_token_id::<S>(&token_name, &minter, salt),
            }]),
        }
    }

    /// Generates single [`CallMessage::CreateToken`] transaction with a specified minter.
    pub fn with_minter(minter_key: <<S as Spec>::CryptoSpec as CryptoSpec>::PrivateKey) -> Self {
        let minter: <S as Spec>::Address = (&minter_key.pub_key()).into();
        Self::generate_create_token(
            DEFAULT_TOKEN_NAME.to_owned(),
            DEFAULT_SALT,
            Rc::new(minter_key),
            vec![minter],
            DEFAULT_INIT_BALANCE,
        )
    }
}

impl BankMessageGenerator<TestSpec> {
    /// Creates a new [`BankMessageGenerator`] that will create an invalid transfer transaction.
    pub fn create_invalid_transfer(
        minter_key: <<TestSpec as Spec>::CryptoSpec as CryptoSpec>::PrivateKey,
    ) -> Self {
        let minter: <TestSpec as Spec>::Address = (&minter_key.pub_key()).into();
        let salt = DEFAULT_SALT;
        let token_name = DEFAULT_TOKEN_NAME.to_owned();
        let token_create_data = TokenCreateData {
            token_name: token_name.clone(),
            salt,
            initial_balance: 1000,
            mint_to_address: minter,
            minter_pkey: Rc::new(minter_key.clone()),
            authorized_minters: Vec::from([minter]),
        };
        Self {
            token_create_txs: Vec::from([token_create_data]),
            transfer_txs: Vec::from([
                TransferData {
                    sender_pkey: Rc::new(minter_key.clone()),
                    transfer_amount: 15,
                    receiver_address: generate_address::<TestSpec>("just_receiver"),
                    token_id: get_token_id::<TestSpec>(&token_name, &minter, salt),
                },
                TransferData {
                    sender_pkey: Rc::new(minter_key.clone()),
                    // invalid transfer because transfer_amount > minted supply
                    transfer_amount: 5000,
                    receiver_address: generate_address::<TestSpec>("just_receiver"),
                    token_id: get_token_id::<TestSpec>(&token_name, &minter, salt),
                },
            ]),
        }
    }
}

pub(crate) fn create_token_tx<S: Spec>(input: &TokenCreateData<S>) -> CallMessage<S> {
    CallMessage::CreateToken {
        salt: input.salt,
        token_name: input.token_name.clone(),
        initial_balance: input.initial_balance,
        mint_to_address: input.mint_to_address.clone(),
        authorized_minters: input.authorized_minters.clone(),
    }
}

pub(crate) fn transfer_token_tx<S: Spec>(transfer_data: &TransferData<S>) -> CallMessage<S> {
    CallMessage::Transfer {
        to: transfer_data.receiver_address.clone(),
        coins: Coins {
            amount: transfer_data.transfer_amount,
            token_id: transfer_data.token_id,
        },
    }
}

impl<S: Spec> MessageGenerator for BankMessageGenerator<S> {
    type Module = Bank<S>;
    type Spec = S;

    fn create_messages(
        &self,
        chain_id: u64,
        max_priority_fee_bips: PriorityFeeBips,
        max_fee: u64,
        gas_usage: Option<<Self::Spec as Spec>::Gas>,
    ) -> Vec<Message<Self::Spec, Self::Module>> {
        let mut messages = Vec::<Message<S, Bank<S>>>::new();

        let mut nonce = 0;

        for create_message in &self.token_create_txs {
            messages.push(Message::new(
                create_message.minter_pkey.clone(),
                create_token_tx::<S>(create_message),
                chain_id,
                max_priority_fee_bips,
                max_fee,
                gas_usage.clone(),
                nonce,
            ));
            nonce += 1;
        }

        for transfer_message in &self.transfer_txs {
            let gas_limit = None;
            messages.push(Message::new(
                transfer_message.sender_pkey.clone(),
                transfer_token_tx::<S>(transfer_message),
                Self::DEFAULT_CHAIN_ID,
                TEST_DEFAULT_MAX_PRIORITY_FEE,
                TEST_DEFAULT_MAX_FEE,
                gas_limit,
                nonce,
            ));
            nonce += 1;
        }

        messages
    }
}
