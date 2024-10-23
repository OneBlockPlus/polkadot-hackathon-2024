#!/usr/bin/env bash
trap 'jobs -p | xargs -r kill' EXIT
echo 'Running: '\''cd crates/rollup/'\'''
cd crates/rollup/
if [ $? -ne 0 ]; then
    echo "Expected exit code 0, got $?"
    exit 1
fi

echo 'Running: '\''make clean-db'\'''
make clean-db
if [ $? -ne 0 ]; then
    echo "Expected exit code 0, got $?"
    exit 1
fi

echo 'Running: '\''export SOV_PROVER_MODE=execute'\'''
export SOV_PROVER_MODE=execute
if [ $? -ne 0 ]; then
    echo "Expected exit code 0, got $?"
    exit 1
fi

echo 'Running: '\''cargo run --bin node'\'''
output=$(mktemp)
cargo run --bin node &> $output &
background_process_pid=$!
echo "Waiting for process with PID: $background_process_pid"
until grep -q -i RPC $output
do       
  if ! ps $background_process_pid > /dev/null 
  then
    echo "The background process died" >&2
    exit 1
  fi
  echo -n "."
  sleep 5
done

echo 'Running: '\''make test-create-token'\'''
make test-create-token
if [ $? -ne 0 ]; then
    echo "Expected exit code 0, got $?"
    exit 1
fi

echo 'Running: '\''curl -sS http://127.0.0.1:12346/ledger/txs/0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c | jq'\'''
curl -sS http://127.0.0.1:12346/ledger/txs/0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c | jq
if [ $? -ne 0 ]; then
    echo "Expected exit code 0, got $?"
    exit 1
fi

echo 'Running: '\''curl -sS http://127.0.0.1:12346/ledger/txs/0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c/events | jq'\'''
curl -sS http://127.0.0.1:12346/ledger/txs/0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c/events | jq
if [ $? -ne 0 ]; then
    echo "Expected exit code 0, got $?"
    exit 1
fi

echo 'Running: '\''make test-bank-supply-of'\'''
make test-bank-supply-of
if [ $? -ne 0 ]; then
    echo "Expected exit code 0, got $?"
    exit 1
fi

echo 'Running: '\''curl -sS -X POST -H "Content-Type: application/json" -d '\''{"jsonrpc":"2.0","method":"bank_supplyOf","params":{"token_id":"token_1zdwj8thgev2u3yyrrlekmvtsz4av4tp3m7dm5mx5peejnesga27ss0lusz"},"id":1}'\'' http://127.0.0.1:12345'\'''
output=$(curl -sS -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"bank_supplyOf","params":{"token_id":"token_1zdwj8thgev2u3yyrrlekmvtsz4av4tp3m7dm5mx5peejnesga27ss0lusz"},"id":1}' http://127.0.0.1:12345)
expected='{"jsonrpc":"2.0","id":1,"result":{"amount":1000000}}
'
# Either of the two must be a substring of the other. This kinda protects us
# against whitespace differences, trimming, etc.
if ! [[ $output == *"$expected"* || $expected == *"$output"* ]]; then
    echo "'$expected' not found in text:"
    echo "'$output'"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "Expected exit code 0, got $?"
    exit 1
fi

echo 'Running: '\''curl -sS -X POST -H "Content-Type: application/json" -d '\''{"jsonrpc":"2.0","method":"bank_supplyOf","params":{"token_id":"token_1zdwj8thgev2u3yyrrlekmvtsz4av4tp3m7dm5mx5peejnesga27ss0lusz"},"id":1}'\'' http://127.0.0.1:12345'\'''
output=$(curl -sS -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"bank_supplyOf","params":{"token_id":"token_1zdwj8thgev2u3yyrrlekmvtsz4av4tp3m7dm5mx5peejnesga27ss0lusz"},"id":1}' http://127.0.0.1:12345)
expected='{"jsonrpc":"2.0","id":1,"result":{"amount":1000000}}
'
# Either of the two must be a substring of the other. This kinda protects us
# against whitespace differences, trimming, etc.
if ! [[ $output == *"$expected"* || $expected == *"$output"* ]]; then
    echo "'$expected' not found in text:"
    echo "'$output'"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "Expected exit code 0, got $?"
    exit 1
fi

echo "All tests passed!"; exit 0
