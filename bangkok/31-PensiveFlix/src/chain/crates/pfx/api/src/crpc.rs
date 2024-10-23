pub use crate::proto_generated::*;
use alloc::vec::Vec;
use pfx_types::messaging::{MessageOrigin, SignedMessage};
pub type EgressMessages = Vec<(MessageOrigin, Vec<SignedMessage>)>;
