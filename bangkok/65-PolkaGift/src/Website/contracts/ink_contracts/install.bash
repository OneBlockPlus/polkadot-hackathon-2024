curl https://sh.rustup.rs -sSf | sh
rustup component add rust-src
cargo install --force --locked --version 4.1.0 cargo-contract
cargo install cargo-dylint dylint-link
