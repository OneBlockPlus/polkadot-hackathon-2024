use std::env;
use std::str::FromStr;

use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::{fmt, EnvFilter};

/// Default initialization of logging
pub fn initialize_logging() {
    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(
            EnvFilter::from_str(&env::var("RUST_LOG").unwrap_or_else(|_| {
                "debug,hyper=info,jmt=info,risc0_zkvm=info,sqlx=warn,sov_blob_storage=trace"
                    .to_string()
            }))
            .unwrap(),
        )
        .init();
}
