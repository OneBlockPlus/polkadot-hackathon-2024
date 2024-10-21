BUILD?=release
OA?=1
VC?=1
ifeq ($(BUILD),release)
	XARGS=--release
endif
ifeq ($(OA),1)
	XARGS += --features only-attestation
endif
ifeq ($(VC),1)
	XARGS += --features verify-pflixbin
endif

.PHONY: all clean run app 

all: app 
app: bin/app
run:
	./bin/app -c 0

bin/app: bin/pflix
	cd bin && ln -sf pflix app

bin/pflix: target/${BUILD}/pflix
	cp $? $@

.PHONY: target/${BUILD}/pflix
target/${BUILD}/pflix:
	cargo build ${XARGS}

clean:
	rm -rf bin/*
	cargo clean

.PHONY: clippy
clippy:
	cargo clippy --tests
