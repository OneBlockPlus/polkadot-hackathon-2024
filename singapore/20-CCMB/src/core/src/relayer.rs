use crate::core::CrossChainMessage;
use secp256k1::{PublicKey, Secp256k1, SecretKey};

pub struct Relayer {
    secp: Secp256k1<secp256k1::All>,
    private_key: SecretKey,
    public_key: PublicKey,
}

impl Default for Relayer {
    fn default() -> Self {
        Self::new()
    }
}
impl Relayer {
    pub fn new() -> Self {
        let secp = Secp256k1::new();
        let mut rng = rand::rngs::OsRng;
        let secret_key = SecretKey::new(&mut rng);
        let public_key = PublicKey::from_secret_key(&secp, &secret_key);
        Relayer {
            secp,
            private_key: secret_key,
            public_key,
        }
    }

    pub fn send_message(&self, message: &mut CrossChainMessage) {
        message.sign(&self.private_key);
    }

    pub fn receive_message(&self, message: &CrossChainMessage) -> bool {
        message.verify(&self.public_key)
    }

    pub fn forward_message(
        &self,
        message: &mut CrossChainMessage,
        destination_relayer: &Relayer,
    ) -> bool {
        if self.receive_message(message) {
            destination_relayer.send_message(message);
            true
        } else {
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use secp256k1::Secp256k1;

    #[test]
    fn relayer_initialization() {
        let relayer = Relayer::new();
        assert!(relayer.private_key[..].len() == 32);
        assert!(relayer.public_key.serialize().len() == 33);
    }

    #[test]
    fn send_and_receive_message() {
        let relayer = Relayer::new();
        let mut message =
            CrossChainMessage::new("Polkadot", "Ethereum", b"Transfer 100 DOT".to_vec());

        // Relayer sends the message
        relayer.send_message(&mut message);

        assert!(message.signature.is_some());

        let is_valid = relayer.receive_message(&message);
        assert!(is_valid);
    }

    #[test]
    fn receive_invalid_message() {
        let relayer1 = Relayer::new();
        let relayer2 = Relayer::new();
        let mut message =
            CrossChainMessage::new("Polkadot", "Ethereum", b"Transfer 100 DOT".to_vec());

        // First relayer sends the message
        relayer1.send_message(&mut message);

        // Second relayer tries to verify it with its own public key, which should fail
        let is_valid = relayer2.receive_message(&message);
        assert!(!is_valid);
    }

    #[test]
    fn forward_message() {
        let relayer1 = Relayer::new();
        let relayer2 = Relayer::new();
        let mut message =
            CrossChainMessage::new("Polkadot", "Ethereum", b"Transfer 100 DOT".to_vec());

        // First relayer sends the message
        relayer1.send_message(&mut message);

        let is_forwarded = relayer1.forward_message(&mut message, &relayer2);

        // Check if the forwarding was successful
        assert!(is_forwarded);

        // Relayer 2 should be able to verify the forwarded message
        let is_valid = relayer2.receive_message(&message);
        assert!(is_valid);
    }
}
