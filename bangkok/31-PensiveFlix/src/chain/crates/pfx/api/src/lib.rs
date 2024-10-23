extern crate alloc;

pub mod blocks;
pub mod crpc;
pub mod crypto;
pub mod ecall_args;
pub mod storage_sync;

mod proto_generated;

#[cfg(feature = "pflix-client")]
pub mod pflix_client {
    pub type PflixClient<T> = crate::crpc::pflix_api_client::PflixApiClient<T>;
}
