use std::marker::PhantomData;

use sov_bank::Amount;
use sov_modules_api::transaction::PriorityFeeBips;
use sov_modules_api::{CryptoSpec, DaSpec, Spec};
use sov_sequencer_registry::{CallMessage, SequencerRegistry};

use crate::{Message, MessageGenerator};

/// Defines the data required to register a sequencer.
pub struct RegisterData<S: Spec> {
    sender_priv_key: <S::CryptoSpec as sov_modules_api::CryptoSpec>::PrivateKey,
    da_address: Vec<u8>,
    amount: Amount,
}

/// Defines the data required to deposit tokens as a sequencer.
pub struct DepositData<S: Spec> {
    sender_priv_key: <S::CryptoSpec as sov_modules_api::CryptoSpec>::PrivateKey,
    da_address: Vec<u8>,
    amount: Amount,
}

/// Defines a message generator for the sequencer registry module.
pub struct SequencerRegistryMessageGenerator<S: Spec, Da: DaSpec> {
    register_txs: Vec<RegisterData<S>>,
    deposit_txs: Vec<DepositData<S>>,
    _phantom: PhantomData<Da>,
}

impl<S: Spec, Da: DaSpec> SequencerRegistryMessageGenerator<S, Da> {
    /// Generates a new [`SequencerRegistryMessageGenerator`] that will register a sequencer with the given DA address and amount.
    pub fn generate_sequencer_registration(
        da_address: Vec<u8>,
        amount: Amount,
        private_key: <<S as Spec>::CryptoSpec as CryptoSpec>::PrivateKey,
    ) -> Self {
        Self {
            _phantom: PhantomData,
            deposit_txs: vec![],
            register_txs: vec![RegisterData {
                da_address,
                amount,
                sender_priv_key: private_key,
            }],
        }
    }

    /// Generates a new [`SequencerRegistryMessageGenerator`] that will register multiple sequencers with the given DA addresses and amounts.
    pub fn generate_multiple_sequencer_registration(
        sequencer_and_stake: Vec<(Vec<u8>, Amount)>,
        private_key: <<S as Spec>::CryptoSpec as CryptoSpec>::PrivateKey,
    ) -> Self {
        let msgs = sequencer_and_stake
            .into_iter()
            .map(|(da_address, amount)| RegisterData {
                da_address,
                amount,
                sender_priv_key: private_key.clone(),
            })
            .collect();
        Self {
            _phantom: PhantomData,
            deposit_txs: vec![],
            register_txs: msgs,
        }
    }

    /// Generates a new [`SequencerRegistryMessageGenerator`] that will register a sequencer with the given DA address and `initial_amount`.
    /// Then deposits the additional given `amount`.
    pub fn generate_register_and_deposit(
        da_address: Vec<u8>,
        initial_amount: Amount,
        deposit: Amount,
        private_key: <<S as Spec>::CryptoSpec as CryptoSpec>::PrivateKey,
    ) -> Self {
        Self {
            _phantom: PhantomData,
            deposit_txs: vec![DepositData {
                da_address: da_address.clone(),
                amount: deposit,
                sender_priv_key: private_key.clone(),
            }],
            register_txs: vec![RegisterData {
                da_address,
                amount: initial_amount,
                sender_priv_key: private_key,
            }],
        }
    }
}

impl<S: Spec, Da: DaSpec> MessageGenerator for SequencerRegistryMessageGenerator<S, Da> {
    type Module = SequencerRegistry<S, Da>;
    type Spec = S;

    fn create_messages(
        &self,
        chain_id: u64,
        max_priority_fee_bips: PriorityFeeBips,
        max_fee: u64,
        estimated_gas_usage: Option<<Self::Spec as Spec>::Gas>,
    ) -> Vec<crate::Message<Self::Spec, Self::Module>> {
        let mut messages = Vec::<Message<S, SequencerRegistry<S, Da>>>::new();
        let mut nonce = 0;

        // need the sender
        for msg in &self.register_txs {
            messages.push(Message::new(
                msg.sender_priv_key.clone().into(),
                CallMessage::Register {
                    da_address: msg.da_address.clone(),
                    amount: msg.amount,
                },
                chain_id,
                max_priority_fee_bips,
                max_fee,
                estimated_gas_usage.clone(),
                nonce,
            ));
            nonce += 1;
        }

        for msg in &self.deposit_txs {
            messages.push(Message::new(
                msg.sender_priv_key.clone().into(),
                CallMessage::Deposit {
                    da_address: msg.da_address.clone(),
                    amount: msg.amount,
                },
                chain_id,
                max_priority_fee_bips,
                max_fee,
                estimated_gas_usage.clone(),
                nonce,
            ));
            nonce += 1;
        }

        messages
    }
}
