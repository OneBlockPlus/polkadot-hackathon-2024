#!/bin/bash
# relaychain

nohup script/polkadot --alice -d script/data/node1 --chain script/config/rococo-local-raw.json --validator  --ws-port 9955 --rpc-port 10025 --port 30033  --rpc-cors all  -lapproval_voting=trace,sync=debug,staking=trace,babe=trace --pruning archive  > script/data/log.alice 2>&1 &
nohup script/polkadot --bob   -d script/data/node2 --chain script/config/rococo-local-raw.json --validator  --ws-port 9966 --rpc-port 10026 --port 30034  --rpc-cors all -lapproval_voting=trace > script/data/log.bob 2>&1 &
nohup script/polkadot --charlie -d script/data/node3 --chain script/config/rococo-local-raw.json --validator  --ws-port 9977 --rpc-port 10027 --port 30035  --rpc-cors all -lapproval_voting=trace > script/data/log.charlie 2>&1 &

# parachain
nohup target/release/pixel -d script/data/pixel1 --keystore-path=script/keystores/keystore1 --force-authoring --collator --discover-local --unsafe-ws-external --unsafe-rpc-external --rpc-methods=unsafe --ws-max-connections 10000 --rpc-cors all --rpc-external --ws-external --ws-port 9944 --rpc-port 9933 --port 40041 --chain script/config/$1.json -llog=info -lruntime=debug,evm=trace --  --chain script/config/rococo-local-raw.json --discover-local > script/data/log.2022 2>&1 &
nohup target/release/pixel -d script/data/pixel2 --keystore-path=script/keystores/keystore2 --force-authoring --collator --discover-local --unsafe-ws-external --unsafe-rpc-external --rpc-methods=unsafe --ws-max-connections 10000 --rpc-cors all --rpc-external --ws-external --ws-port 9945 --rpc-port 9934 --port 40042 --chain script/config/$1.json -llog=info -lruntime=debug,evm=trace --  --chain script/config/rococo-local-raw.json --discover-local > script/data/log.2023 2>&1 &
nohup target/release/pixel -d script/data/pixel3 --keystore-path=script/keystores/keystore3 --force-authoring --collator --discover-local --unsafe-ws-external --unsafe-rpc-external --rpc-methods=unsafe --ws-max-connections 10000 --rpc-cors all --rpc-external --ws-external --ws-port 9946 --rpc-port 9935 --port 40043 --chain script/config/$1.json -llog=info -lruntime=debug,evm=trace --  --chain script/config/rococo-local-raw.json --discover-local > script/data/log.2024 2>&1 &

