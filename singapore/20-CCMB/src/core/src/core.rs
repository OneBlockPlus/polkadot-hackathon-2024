//!  Core Message Passing Protocol
//!

use secp256k1::ecdsa::Signature;
use secp256k1::{Message, PublicKey, Secp256k1, SecretKey};

pub struct CrossChainMessage {
    pub(crate) source_chain: String,
    pub(crate) destination_chain: String,
    pub(crate) payload: Vec<u8>,
    pub(crate) signature: Option<Signature>,
}

// Generate a new message
impl CrossChainMessage {
    pub fn new(source_chain: &str, destination_chain: &str, payload: Vec<u8>) -> Self {
        CrossChainMessage {
            source_chain: source_chain.to_string(),
            destination_chain: destination_chain.to_string(),
            payload,
            signature: None,
        }
    }

    // Sign the message
    pub fn sign(&mut self, secret_key: &SecretKey) {
        let secp = Secp256k1::new();
        let message = Message::from_digest_slice(&self.hash_payload()).expect("Exptect 32 bytes");
        let sig = secp.sign_ecdsa(&message, secret_key);
        self.signature = Some(sig);
    }

    // Verify the message using the sender's public key
    pub fn verify(&self, public_key: &PublicKey) -> bool {
        let secp = Secp256k1::new();
        let message = Message::from_digest_slice(&self.hash_payload()).expect("Exptect 32 bytes");
        match &self.signature {
            Some(sig) => secp.verify_ecdsa(&message, sig, public_key).is_ok(),
            None => false,
        }
    }
    // Hash the payload to create the message digest
    pub(crate) fn hash_payload(&self) -> [u8; 32] {
        use sha2::{Digest, Sha256};
        let mut hasher = Sha256::new();
        hasher.update(&self.payload);
        let result = hasher.finalize();
        result.into()
    }
}

#[cfg(test)]
mod tests {
    use {super::*, rand::rngs::OsRng};

    #[test]
    fn message_creation() {
        let message = CrossChainMessage::new("Polkadot", "Ethereum", b"Payload_test".to_vec());
        assert_eq!(message.source_chain, "Polkadot");
        assert_eq!(message.destination_chain, "Ethereum");
        assert_eq!(message.payload, b"Payload_test".to_vec());
        assert!(message.signature.is_none());
    }
    #[test]
    fn message_sign_and_verification() {
        let secp = Secp256k1::new();
        let mut rng = OsRng::default();
        // Generate a new key pair
        let (private_key, public_key) = secp.generate_keypair(&mut rng);
        println!(
            "private_key: {:?},public_key: {:?}",
            private_key, public_key
        );
        // Create a new message
        let mut message =
            CrossChainMessage::new("Polkadot", "Ethereum", b"Transfer 100 DOT".to_vec());

        // Sign the message
        message.sign(&private_key);

        // Ensure the message has a signature
        assert!(message.signature.is_some());

        // Verify the message
        assert!(message.verify(&public_key));
    }
    #[test]
    #[should_panic]
    fn message_verification_failure() {
        let secp = Secp256k1::new();
        let mut rng = OsRng::default();

        let (private_key1, _) = secp.generate_keypair(&mut rng);
        let (_, public_key2) = secp.generate_keypair(&mut rng);

        let mut message = CrossChainMessage::new("Polkadot", "Ethereum", b"Test Payload".to_vec());
        message.sign(&private_key1);

        assert!(message.verify(&public_key2));
    }

    #[test]
    fn message_hashing() {
        let message = CrossChainMessage::new("Polkadot", "Ethereum", b"Test Payload".to_vec());
        let hash = message.hash_payload();

        assert_eq!(hash.len(), 32);

        let hash2 = message.hash_payload();
        assert_eq!(hash, hash2);
    }
}
