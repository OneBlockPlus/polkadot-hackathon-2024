BUILD?=release
OA?=1
VC?=1
XARGS=
DEV=
ifeq ($(DEV),1)
	OA=0
	VC=0
	BUILD=debug
endif
ifeq ($(BUILD),release)
	XARGS = --release
endif
ifeq ($(OA),1)
	XARGS += --features only-attestation
endif
ifeq ($(VC),1)
	XARGS += --features verify-pflixbin
endif

.PHONY: all node pflix test clippy

all: pflix
	cargo build ${XARGS}
node:
	cargo build -p pfx-node ${XARGS}
enfrost:
	cargo build -p enfrost ${XARGS}
handover:
	cargo build -p handover --release
pflix:
	make -C standalone/teeworker/pflix
test:
	cargo test --workspace --exclude node-executor --exclude pfx-node

clippy:
	cargo clippy --tests
	make clippy -C standalone/teeworker/pflix

lint:
	cargo dylint --all --workspace

clean:
	cargo clean
	make -C standalone/teeworker/pflix clean
