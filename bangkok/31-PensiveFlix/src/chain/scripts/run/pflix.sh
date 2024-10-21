#!/bin/bash

inst_seq=${INST_SEQ:-0}
pflix_port=$((${PFLIX_PORT:-8000} + $inst_seq))
pub_port=$((${PUB_PORT:-19999} + $inst_seq))
work_dir="./standalone/teeworker/pflix/bin"

export RUST_LOG=debug,pflix=trace,pfx=trace,h2=info,hyper=info,reqwest=info,tower=info
export RUST_LOG_SANITIZED=false
export RUST_LOG_ANSI_COLOR=true

purge_data=0
getopts ":p" opt
case ${opt} in
p)
    purge_data=1
    ;;
*) ;;
esac

cd $work_dir

bin="./pflix"
data_dir="data-$inst_seq"
log_file="$data_dir/pflix.log"

if [[ -e $log_file ]]; then
    rm $log_file
fi
if [[ $purge_data -eq 1 && -e $data_dir ]]; then
    echo "purge data ..."
    rm -rf $data_dir
    mkdir $data_dir
fi

$bin \
    --port $pflix_port \
    --public-port $pub_port \
    --data-dir $data_dir |&
    tee $log_file
