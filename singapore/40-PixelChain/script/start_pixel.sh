#!/bin/bash
# relaychain

nohup script/polkadot --alice -d script/data/node1 --chain script/config/rococo-local-raw.json --validator  --ws-port 9955 --rpc-port 10025 --port 30033  --rpc-cors all  -lapproval_voting=trace,sync=debug,staking=trace,babe=trace --pruning archive  > script/data/log.alice 2>&1 &
nohup script/polkadot --bob   -d script/data/node2 --chain script/config/rococo-local-raw.json --validator  --ws-port 9946 --rpc-port 10026 --port 30034  --rpc-cors all -lapproval_voting=trace > script/data/log.bob 2>&1 &

# parachain
nohup target/release/pixel -d script/data/diora1 --alice --force-authoring --collator --discover-local --rpc-cors=all --ws-port 9944 --rpc-port 9933 --port 40041 --chain script/config/diora_local.json -llog=info -lruntime=debug,evm=trace --  --chain script/config/rococo-local-raw.json --discover-local --port 40042 > script/data/log.2022 2>&1 &
nohup target/release/pixel -d script/data/diora2 --bob --force-authoring --collator --discover-local --rpc-cors=all --ws-port 9945 --rpc-port 9934 --port 40042 --chain script/config/diora_local.json -llog=info -lruntime=debug,evm=trace --  --chain script/config/rococo-local-raw.json --discover-local --port 40043 > script/data/log.2023 2>&1 &

