#[tokio::main]
async fn main() {
    pfx_sanitized_logger::init_subscriber(false);
    enfrost::run().await;
}
