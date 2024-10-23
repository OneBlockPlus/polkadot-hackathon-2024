#!/bin/bash

cp ../target/release/Pixel .
cp ../../polkadot/target/release/polkadot .

bash ./regenerateConfig-rococo-local.sh