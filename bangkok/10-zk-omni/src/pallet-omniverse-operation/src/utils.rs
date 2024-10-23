use sha3::{Digest, Keccak256};

pub const HASH_LEN: usize = 32;
pub const TOKEN_ADDRESS_LEN: usize = HASH_LEN;
pub const TX_HASH_LEN: usize = HASH_LEN;
pub const INDEX_LEN: usize = 8;
pub const USER_ADDRESS_LEN: usize = HASH_LEN;
pub const AMOUNT_LEN: usize = 2 * 8;
pub const BYTES_UNIT_LEN: usize = HASH_LEN;
pub const DEPLOY_SALT_LEN: usize = 8;
pub const DEPLOY_NAME_LEN: usize = 24;

pub fn keccak_256(bytes: &[u8]) -> [u8; 32] {
	let mut hasher = Keccak256::new();
	hasher.update(bytes);
	let hash = hasher.finalize();
	let mut out = [0u8; 32];
	out.copy_from_slice(&hash);
	out
}
