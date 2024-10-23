# ====== build pflix ======

FROM pflixlab/gramine-rust-env:latest AS builder

WORKDIR /root

ARG https_proxy
ARG http_proxy
ARG IAS_API_KEY
ARG IAS_SPID
ARG RA_METHOD
ARG SGX_ENV
ARG BUILD=release
ARG OA
ARG VC
ARG GIT_SHA

RUN <<EOF
  set -e
  : "${RA_METHOD:?RA_METHOD needs to be set and non-empty.}"
  if [ "$RA_METHOD" != "dcap" ]; then
    : "${IAS_API_KEY:?IAS_API_KEY needs to be set and non-empty.}"
    : "${IAS_SPID:?IAS_SPID needs to be set and non-empty.}"
  fi
  mkdir pfx-code
  mkdir prebuilt
EOF

# COPY ./scripts/docker/cargo-config.toml /usr/local/cargo/config
COPY pallets ./pfx-code/pallets
COPY crates ./pfx-code/crates
COPY standalone ./pfx-code/standalone
COPY Cargo.toml Cargo.lock rustfmt.toml rust-toolchain.toml Makefile ./pfx-code/

ENV VERGEN_GIT_SHA=${GIT_SHA}

RUN <<EOF
  set -e
  PATH=$PATH:/root/.cargo/bin
  cd /root/pfx-code
  make handover
  cp ./target/release/handover /root/prebuilt
  cd /root/pfx-code/standalone/teeworker/pflix/gramine-build
  if [ "$RA_METHOD" = "any" ]; then
    echo "Initiating build pflix with dcap feat..."
    RA_METHOD="dcap" make dist PREFIX=/root/prebuilt/dcap-ver
    make clean
    echo "Initiating build pflix with epid feat..."
    RA_METHOD="epid" make dist PREFIX=/root/prebuilt/epid-ver
    make clean
  else
    make dist PREFIX=/root/prebuilt
  fi
  rm -rf /root/.cargo/registry
  rm -rf /root/.cargo/git
EOF

# ====== runtime ======

FROM pflixlab/intel-sgx-env:latest AS runtime

ARG https_proxy
ARG http_proxy
ARG PFLIX_VERSION
RUN : "${PFLIX_VERSION:?PFLIX_VERSION needs to be set and a long integer.}"
ARG PFLIX_HOME=/opt/pflix
ARG PFLIX_DIR=${PFLIX_HOME}/releases/${PFLIX_VERSION}
ARG PFLIX_DATA_DIR=${PFLIX_HOME}/${PFLIX_VERSION}/data
ARG REAL_PFLIX_DATA_DIR=${PFLIX_HOME}/data/${PFLIX_VERSION}

COPY --from=builder /root/prebuilt/ ${PFLIX_DIR}
ADD --chmod=0755 ./scripts/docker/pflix/gramine/start.sh ${PFLIX_DIR}/start.sh
ADD --chmod=0755 ./scripts/docker/pflix/gramine/start-with-handover.sh ${PFLIX_HOME}/start.sh
ADD ./standalone/teeworker/pflix/gramine-build/conf /opt/conf

RUN <<EOF
  set -e
  ln -s ${PFLIX_DIR} ${PFLIX_HOME}/releases/current
  #Since the file will be overwritten when the mount is started, it is meaningless to create ${REAL_PFLIX_DATA_DIR} here.
  #mkdir -p ${REAL_PFLIX_DATA_DIR}
  rm -rf ${PFLIX_DIR}/data
  ln -s ${REAL_PFLIX_DATA_DIR} ${PFLIX_DIR}/data
EOF

WORKDIR ${PFLIX_HOME}/releases/current

ENV SGX=1
ENV SKIP_AESMD=0
ENV SLEEP_BEFORE_START=6
ENV RUST_LOG=info
ENV EXTRA_OPTS=
ENV PFLIX_HOME=${PFLIX_HOME}

EXPOSE 8000
SHELL ["/bin/bash", "-c"]
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ${PFLIX_HOME}/start.sh
HEALTHCHECK --start-period=8s --timeout=5s \
  CMD curl -s --fail --http2-prior-knowledge http://localhost:8000 || exit 1
