use crate::core::CrossChainMessage;
use crate::validator::Validator;
use secp256k1::PublicKey;

pub struct MessageHub {
    pub incoming_messages: Vec<CrossChainMessage>,
    pub outgoing_messages: Vec<CrossChainMessage>,
    pub validator: Validator,
}

impl MessageHub {
    pub fn new() -> Self {
        MessageHub {
            incoming_messages: Vec::new(),
            outgoing_messages: Vec::new(),
            validator: Validator::new(),
        }
    }

    pub fn process_incoming_message(
        &mut self,
        message: CrossChainMessage,
        public_key: &PublicKey,
    ) -> bool {
        if self.validator.validate_message(&message, public_key) {
            self.incoming_messages.push(message);
            true
        } else {
            false
        }
    }

    pub fn process_outgoing_message(&mut self, message: CrossChainMessage) {
        self.outgoing_messages.push(message);
    }

    pub fn get_incoming_messages(&self) -> &Vec<CrossChainMessage> {
        &self.incoming_messages
    }

    pub fn get_outgoing_messages(&self) -> &Vec<CrossChainMessage> {
        &self.outgoing_messages
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use secp256k1::{PublicKey, Secp256k1, SecretKey};

    fn generate_keypair() -> (SecretKey, PublicKey) {
        let secp = Secp256k1::new();
        let mut rng = rand::rngs::OsRng;
        let secret_key = SecretKey::new(&mut rng);
        let public_key = PublicKey::from_secret_key(&secp, &secret_key);
        (secret_key, public_key)
    }

    #[test]
    fn process_incoming_message() {
        let (private_key, public_key) = generate_keypair();
        let mut message =
            CrossChainMessage::new("Polkadot", "Ethereum", b"Transfer 100 DOT".to_vec());

        message.sign(&private_key);

        let mut hub = MessageHub::new();
        let result = hub.process_incoming_message(message, &public_key);

        assert!(result);
        assert_eq!(hub.get_incoming_messages().len(), 1);
    }

    #[test]
    fn process_outgoing_message() {
        let mut message =
            CrossChainMessage::new("Polkadot", "Ethereum", b"Transfer 100 DOT".to_vec());

        let mut hub = MessageHub::new();
        hub.process_outgoing_message(message);

        assert_eq!(hub.get_outgoing_messages().len(), 1);
    }

    #[test]
    fn invalid_incoming_message() {
        let (private_key, public_key) = generate_keypair();
        let (wrong_private_key, _) = generate_keypair();
        let mut message =
            CrossChainMessage::new("Polkadot", "Ethereum", b"Transfer 100 DOT".to_vec());

        // Sign the message with a wrong private key
        message.sign(&wrong_private_key);

        let mut hub = MessageHub::new();
        let result = hub.process_incoming_message(message, &public_key);

        assert!(!result);
        assert_eq!(hub.get_incoming_messages().len(), 0);
    }
}
