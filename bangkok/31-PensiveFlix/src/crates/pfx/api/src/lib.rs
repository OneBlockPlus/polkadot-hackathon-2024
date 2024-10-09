extern crate alloc;

pub mod blocks;
pub mod crpc;
pub mod crypto;
pub mod ecall_args;
pub mod storage_sync;

mod proto_generated;

#[cfg(feature = "pflix-client")]
pub mod pflix_client {
    use crate::crpc::pflix_api_client::PflixApiClient;
    pub type PflixClient<T> = PflixApiClient<T>;
}

pub mod greeting {
    tonic::include_proto!("pflix.greeting");
}