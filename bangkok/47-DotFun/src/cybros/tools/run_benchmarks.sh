#!/usr/bin/env sh
set -e

# The following lines ensure we run from the project root
PROJECT_ROOT=$(dirname $(dirname "$(readlink -f "$0")"))
cd "$PROJECT_ROOT"

echo "*** Run benchmark for pallet-computing_workers ***"

./target/production/cybros-node benchmark pallet \
  --pallet=pallet_offchain_computing_infra \
  --extrinsic="*" \
  --chain=dev \
  --steps=50 \
  --repeat=50 \
  --no-storage-info \
  --no-median-slopes \
  --no-min-squares \
  --wasm-execution=compiled \
  --heap-pages=4096 \
  --output=./pallets/offchain_computing_infra/src/weights.rs \
  --template=./pallet-weight-template.hbs \
  --header ./AGPL3-HEADER
