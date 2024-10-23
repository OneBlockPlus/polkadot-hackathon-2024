#!/bin/bash

export RUST_LOG=debug,h2=info,hyper=info,reqwest=info,tower=info
export RUST_LOG_SANITIZED=false
export RUST_LOG_ANSI_COLOR=true
export http_proxy=

inst_seq=${INST_SEQ:-0}
pflix_port=$((${PFLIX_PORT:-8000} + $inst_seq))
pub_port=$((${PUB_PORT:-17777} + $inst_seq))
mnemonic=${MNEMONIC:-//Ferdie}
inject_key=$(printf %064d $(($inst_seq + 1)))
snapshot="--take-checkpoint"
if [[ -z "${SNAPSHOT}" ]]; then
    snapshot=
fi

echo $PWD
bin="./target/debug/enfrost"
log_file="./target/enfrost-$inst_seq.log"

if [[ -e $log_file ]]; then
    rm $log_file
fi

$bin \
    --chain-ws-endpoint ws://127.0.0.1:9944 \
    --internal-endpoint http://127.0.0.1:$pflix_port \
    --public-endpoint http://127.0.0.1:$pub_port \
    --inject-key $inject_key \
    --mnemonic $mnemonic \
    --attestation-provider none \
    --longevity 16 \
    $snapshot \
    --operator cXjHGCWMUM8gM9YFJUK2rqq2tiFWB4huBKWdQPkWdcXcZHhHA |&
    tee $log_file
