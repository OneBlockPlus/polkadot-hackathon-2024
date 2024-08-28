#!/bin/bash

chainSpecVersion='
{
  "id": "rococo_2.0"
}'

newBalance='
{
  "balances": [
    [
      "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      1000000000000000000000
    ],
    [
      "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY",
      1000000000000000000000
    ],
    [
      "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      1000000000000000000000
    ],
    [
      "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc",
      1000000000000000000000
    ]
  ]
}'

newSudo='
{
  "sudo":"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
}'

rm -fr script/config
rm -fr script/data
mkdir script/config
mkdir script/data

echo "build diora chainspec"

target/release/diora build-spec --disable-default-bootnode --chain $1 >  script/config/$1.json
target/release/diora export-genesis-state --chain script/config/$1.json > script/config/$1.genesis
target/release/diora export-genesis-wasm --chain script/config/$1.json > script/config/$1.wasm


newParas="{\"paras\":[
        [
            4202,
            {
                \"genesis_head\": \"`cat script/config/$1.genesis`\",
                \"validation_code\":\"`cat script/config/$1.wasm`\",
                \"parachain\":true
            }
        ]
    ]}"

echo $newParas > script/config/newParas.json

################################################################################parachain



# Generate Relay ChainSpec
echo "build relay chainspec"
script/polkadot build-spec --chain rococo-local --disable-default-bootnode |
jq 'setpath(["name"]; "Diora Rococo Testnet")' |
jq --argjson version "${chainSpecVersion}" 'setpath(["id"]; $version.id)' |
jq --argjson replace2 "${newBalance}" 'setpath(["genesis","runtime","runtime_genesis_config","balances","balances"]; $replace2.balances)' |
jq --argjson replace3 "${newSudo}" 'setpath(["genesis","runtime","runtime_genesis_config","sudo","key"]; $replace3.sudo)' |
jq --slurpfile newParas script/config/newParas.json 'setpath(["genesis","runtime","runtime_genesis_config","paras","paras"]; $newParas[0].paras)' |
jq 'setpath(["genesis","runtime","session_length_in_blocks"];10)' |
sed 's/1e+21/10000000000000000/g' |
sed 's/1e+24/10000000000000000000000/g'  > script/config/rococo-local.json


echo "build relay raw chainspec"
script/polkadot build-spec --chain script/config/rococo-local.json --disable-default-bootnode --raw > script/config/rococo-local-raw.json

