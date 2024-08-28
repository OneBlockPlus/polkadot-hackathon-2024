#!/usr/bin/env bash

# Generate the various keys for the gensis.

target/release/diora key insert --chain $1 --keystore-path script/keystores/keystore1 --suri "${SECRET1}" --scheme Sr25519 --key-type nmbs
target/release/diora key insert --chain $1 --keystore-path script/keystores/keystore2 --suri "${SECRET2}" --scheme Sr25519 --key-type nmbs
target/release/diora key insert --chain $1 --keystore-path script/keystores/keystore3 --suri "${SECRET3}" --scheme Sr25519 --key-type nmbs