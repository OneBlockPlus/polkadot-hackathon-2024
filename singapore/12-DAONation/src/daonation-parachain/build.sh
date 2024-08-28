sudo apt-get install protobuf-compiler -y
rustup target add wasm32-unknown-unknown
cargo build --release
