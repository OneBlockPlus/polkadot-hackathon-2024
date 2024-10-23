.EXPORT_ALL_VARIABLES: # https://www.gnu.org/software/make/manual/make.html#index-_002eEXPORT_005fALL_005fVARIABLES
CARGO_NET_GIT_FETCH_WITH_CLI=true

.PHONY: setup
setup:
	bash ./scripts/setup/dev_setup.sh

.PHONY: license-check
license-check:
	cargo license-template --template LICENSE-HEADER -i license.template.ignore

.PHONY: clean
clean:
	cargo clean

.PHONY: dev
dev: fmt clippy

.PHONY: fmt-check fmt
fmt-check:
	taplo fmt --check
	cargo fmt --all -- --check
fmt:
	taplo fmt
	cargo fmt --all

.PHONY: clippy clippy-release
clippy:
	cargo clippy --all --all-targets --features=runtime-benchmarks,try-runtime -- -D warnings
clippy-release:
	cargo clippy --release --all --all-targets --features=runtime-benchmarks,try-runtime -- -D warnings

.PHONY: check check-release
check:
	cargo check
check-release:
	cargo check --release

.PHONY: build build-debug build-release build-production
build build-debug:
	WASM_BUILD_TYPE=debug cargo build
build-release:
	WASM_BUILD_TYPE=release cargo build --release
build-production:
	WASM_BUILD_TYPE=production cargo build --profile=production

.PHONY: build-beacon build-beacon-debug build-beacon-release build-beacon-production
build-beacon build-beacon-debug:
	WASM_BUILD_TYPE=debug cargo build -p altbeacon
build-beacon-release:
	WASM_BUILD_TYPE=release cargo build --release -p altbeacon
build-beacon-production:
	WASM_BUILD_TYPE=production cargo build --profile=production -p altbeacon

.PHONY: test test-release
test:
	cargo test --lib --all
test-release:
	cargo test --release --lib --all

# show help
help:
	@echo ''
	@echo 'Usage:'
	@echo ' make [target]'
	@echo ''
	@echo 'Targets:'
	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
	helpMessage = match(lastLine, /^# (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")); \
			helpMessage = substr(lastLine, RSTART + 2, RLENGTH); \
			printf "\033[36m%-22s\033[0m %s\n", helpCommand,helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help
