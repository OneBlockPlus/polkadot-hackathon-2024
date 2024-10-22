#!/usr/bin/env bash

set -e

mkdir -p /data/huggingface
chown -R runner:runner /data
chown -R runner:runner /home/runner

cd /home/runner
su --whitelist-environment="HF_HOME" runner -c "jupyter lab --config=/home/runner/.jupyter/jupyter_server_config.py ${@}"
