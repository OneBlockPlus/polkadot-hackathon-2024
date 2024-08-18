use {
    crate::core::CrossChainMessage,
    secp256k1::{Message, PublicKey, Secp256k1},
};

pub struct Validator;

impl Validator {
    pub fn new() -> Self {
        Validator
    }

    pub fn validate_message(&self, message: &CrossChainMessage, public_key: &PublicKey) -> bool {
        message.verify(public_key)
    }

    pub fn validate_multiple_messages(
        &self,
        messages: &[CrossChainMessage],
        public_key: &PublicKey,
    ) -> Vec<bool> {
        messages
            .iter()
            .map(|message| self.validate_message(message, public_key))
            .collect()
    }
}
