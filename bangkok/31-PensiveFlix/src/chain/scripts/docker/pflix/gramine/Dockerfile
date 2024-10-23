# ====== build pflix ======

FROM pflixlab/gramine-rust-env:latest AS builder

WORKDIR /root

ARG https_proxy
ARG http_proxy
ARG IAS_API_KEY
ARG IAS_SPID
ARG SGX_ENV
ARG BUILD=release
ARG OA
ARG VC
ARG GIT_SHA

RUN <<EOF
  set -e
  : "${IAS_API_KEY:?IAS_API_KEY needs to be set and non-empty.}"
  : "${IAS_SPID:?IAS_SPID needs to be set and non-empty.}"
  mkdir pfx-code
EOF

COPY ./scripts/docker/cargo-config.toml /usr/local/cargo/config
COPY pallets ./pfx-code/pallets
COPY crates ./pfx-code/crates
COPY standalone ./pfx-code/standalone
COPY Cargo.toml Cargo.lock rustfmt.toml rust-toolchain.toml Makefile ./pfx-code/

RUN mkdir prebuilt

ENV VERGEN_GIT_SHA=${GIT_SHA}

RUN <<EOF
  set -e
  cd pfx-code/standalone/teeworker/pflix/gramine-build
  PATH=$PATH:/root/.cargo/bin
  make dist PREFIX=/root/prebuilt
  make clean
  rm -rf /root/.cargo/registry
  rm -rf /root/.cargo/git
EOF

# ====== runtime ======

FROM pflixlab/intel-sgx-env:latest AS runtime

ARG https_proxy
ARG http_proxy

WORKDIR /opt/pflix

COPY --from=builder /root/prebuilt/ .
ADD ./scripts/docker/pflix/gramine/start.sh ./start.sh

ENV SGX=1
ENV SKIP_AESMD=0
ENV SLEEP_BEFORE_START=6
ENV RUST_LOG=info
ENV EXTRA_OPTS=
EXPOSE 8000
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/bin/bash", "./start.sh"]
HEALTHCHECK --start-period=8s --timeout=5s \
  CMD curl -s --fail --http2-prior-knowledge http://localhost:8000 || exit 1