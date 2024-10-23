FROM ubuntu:22.04 as builder

ARG RUST_TOOLCHAIN='1.73.0'
ARG CARGO_PROFILE='production'

RUN apt-get update && \
    DEBIAN_FRONTEND='noninteractive' apt-get install -y apt-utils apt-transport-https software-properties-common readline-common curl wget unzip vim gnupg gnupg2 gnupg-agent ca-certificates build-essential llvm clang protobuf-compiler && \
    DEBIAN_FRONTEND='noninteractive' apt-get autoremove -y && \
    apt-get clean

ENV PATH="/root/.cargo/bin:${PATH}"
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain="${RUST_TOOLCHAIN}" && \
    rustup component add cargo clippy rust-analyzer rust-src rust-std rustc-dev rustc rustfmt && \
    rustup target add wasm32-unknown-unknown --toolchain "${RUST_TOOLCHAIN}"

# ARG GIT_REPO='https://github.com/cybros-network/cybros-network.git'
# ARG GIT_TAG='main'
# WORKDIR /root
# RUN git clone --depth 1 --recurse-submodules --shallow-submodules -j 8 -b ${GIT_TAG} ${GIT_REPO} cybros-network

COPY . /root/cybros-network
WORKDIR /root/cybros-network
RUN cargo build --locked --profile ${CARGO_PROFILE} && \
    cp target/${CARGO_PROFILE}/cybros-node /root

FROM ubuntu:22.04
LABEL description="Docker image for Cybros network: an off-chain compute platform for web3"

ARG CARGO_PROFILE='production'
COPY --from=builder /root/cybros-node /usr/local/bin/cybros-node

RUN useradd -m -u 1000 -U -s /bin/sh -d /runner runner && \
    mkdir -p /data /runner/.local/share && \
    chown -R runner:runner /runner && \
    chown -R runner:runner /data && \
    ln -s /data /runner/.local/share/cybros-node && \
# Sanity checks
    ldd /usr/local/bin/cybros-node && \
# unclutter and minimize the attack surface
    rm -rf /usr/bin /usr/sbin && \
    /usr/local/bin/cybros-node --version

USER runner
EXPOSE 30333 9944 9615
VOLUME ["/data"]
ENTRYPOINT ["/usr/local/bin/cybros-node"]
