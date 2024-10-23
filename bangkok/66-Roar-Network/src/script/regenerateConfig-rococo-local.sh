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
      "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      1000000000000000000000
    ],
    [
      "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
      1000000000000000000000
    ],
    [
      "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
      1000000000000000000000
    ],
    [
      "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw",
      1000000000000000000000
    ],
    [
      "5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL",
      1000000000000000000000
    ],
    [
      "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY",
      1000000000000000000000
    ],
    [
      "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc",
      1000000000000000000000
    ],
    [
      "5Ck5SLSHYac6WFt5UZRSsdJjwmpSZq85fd5TRNAdZQVzEAPT",
      1000000000000000000000
    ],
    [
      "5HKPmK9GYtE1PSLsS1qiYU9xQ9Si1NcEhdeCq9sw5bqu4ns8",
      1000000000000000000000
    ],
    [
      "5FCfAonRZgTFrTd9HREEyeJjDpT397KMzizE6T3DvebLFE7n",
      1000000000000000000000
    ],
    [
      "5CRmqmsiNFExV6VbdmPJViVxrWmkaXXvBrSX8oqBT8R9vmWk",
      1000000000000000000000
    ],
    [
      "5CdP9o2qTCPe26e3J5kWXm1XDrT9G9eQ6NquiYGtqZaEG7aw",
      1000000000000000000000000
    ]
  ]
}'

newSudo='
{
  "sudo":"5CdP9o2qTCPe26e3J5kWXm1XDrT9G9eQ6NquiYGtqZaEG7aw"
}'

rm -fr config
rm -fr data
mkdir config
mkdir data

################################################################################parachain
#alice    "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
#bob      "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
#charlie  "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y"

echo "build Pixel chainspec"

./Pixel build-spec --disable-default-bootnode --chain rococo >  ./config/Pixel-dev.json
./Pixel export-genesis-state --chain ./config/Pixel-dev.json > ./config/Pixel-dev.genesis
./Pixel export-genesis-wasm --chain ./config/Pixel-dev.json > ./config/Pixel-dev.wasm


newParas="{\"paras\":[
        [
            2000,
            {
                \"genesis_head\": \"`cat ./config/Pixel-dev.genesis`\",
                \"validation_code\":\"`cat ./config/Pixel-dev.wasm`\",
                \"parachain\":true
            }
        ]
    ]}"

echo $newParas > ./config/newParas.json

################################################################################parachain



# Generate Relay ChainSpec
echo "build relay chainspec"
./polkadot build-spec --chain rococo-local --disable-default-bootnode |
jq 'setpath(["name"]; "Pixel Rococo Testnet")' |
jq --argjson version "${chainSpecVersion}" 'setpath(["id"]; $version.id)' |
jq --argjson replace2 "${newBalance}" 'setpath(["genesis","runtime","runtime_genesis_config","balances","balances"]; $replace2.balances)' |
jq --argjson replace3 "${newSudo}" 'setpath(["genesis","runtime","runtime_genesis_config","sudo","key"]; $replace3.sudo)' |
jq --slurpfile newParas ./config/newParas.json 'setpath(["genesis","runtime","runtime_genesis_config","paras","paras"]; $newParas[0].paras)' |
jq 'setpath(["genesis","runtime","session_length_in_blocks"];10)' |
sed 's/1e+21/10000000000000000/g' |
sed 's/1e+24/10000000000000000000000/g'  > ./config/rococo-local.json


echo "build relay raw chainspec"
./polkadot build-spec --chain ./config/rococo-local.json --disable-default-bootnode --raw > ./config/rococo-local-raw.json

