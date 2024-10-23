check:
	SKIP_GUEST_BUILD=1 cargo check
	SKIP_GUEST_BUILD=1 cargo check --manifest-path crates/provers/risc0/guest-celestia/Cargo.toml
	SKIP_GUEST_BUILD=1 cargo check --manifest-path crates/provers/risc0/guest-mock/Cargo.toml

lint:
	SKIP_GUEST_BUILD=1 cargo fmt --all -- --check
	SKIP_GUEST_BUILD=1 cargo check
	SKIP_GUEST_BUILD=1 cargo check --features celestia_da --no-default-features
	SKIP_GUEST_BUILD=1 cargo clippy
	SKIP_GUEST_BUILD=1 cargo clippy --features celestia_da --no-default-features


install-risczero:
	cargo risczero install --version r0.1.79.0


clean:
	@cargo clean
	@cargo clean --manifest-path crates/provers/risc0/guest-celestia/Cargo.toml
	@cargo clean --manifest-path crates/provers/risc0/guest-mock/Cargo.toml
	rm -rf rollup-starter-data/
	rm -rf crates/rollup/mock_da.sqlite
