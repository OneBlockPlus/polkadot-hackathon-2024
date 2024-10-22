# Overview

This package is a convenient starting point for building a rollup using the Sovereign SDK:

## The repo structure:

- `crates/stf`: The `STF` is derived from the `Runtime` and is used in the `rollup` and `provers` crates.
- `crates/provers`: This crate is responsible for creating proofs for the `STF`.
- `crates/rollup`: This crate runs the `STF` and offers additional full-node functionalities.

(!) Note for using WIP repo.
This repo utilizes private [Sovereign SDK repo](https://github.com/cyferio-labs/sovereign-sdk-wip) and default cargo needs this environment variable to use an SSH key:

```
export CARGO_NET_GIT_FETCH_WITH_CLI=true
```

# Running the sov-rollup-starter

## How to run the sov-rollup-starter with mock-da

1. Change the working directory:
```shell,test-ci
$ cd crates/rollup/
```
2. If you want to run a fresh rollup, clean the database:
```sh,test-ci
$ make clean-db
```
3. Start the rollup node:
```sh,test-ci
$ export SOV_PROVER_MODE=execute
```
   This will compile and start the rollup node:
```shell,test-ci,bashtestmd:long-running,bashtestmd:wait-until=RPC
$ cargo run --bin node
```
4. Submit a token creation transaction to the `bank` module:
```sh,test-ci
$ make test-create-token
```
5. Note the transaction hash from the output of the above command
   ```text
   Submitting tx: 0: 0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c
   Transaction 0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c has been submitted: AcceptTxResponse { data: TxInfo { id: TxHash("0xa02ed59b5c698d49ad088584b86aff2134fd8e96746c1fce57b2518eb7c843e2"), status: Submitted }, meta: {} }
   Triggering batch publishing
   Your batch was submitted to the sequencer for publication. Response: SubmittedBatchInfo { da_height: 2, num_txs: 1 }
   Going to wait for target slot number 2 to be processed, up to 300s
   Rollup has processed target DA height=2!
   ```
6. To get the token address, fetch the events of the transaction hash from #5
```bash,test-ci
$ curl -sS http://127.0.0.1:12346/ledger/txs/0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c | jq
{
  "data": {
    "type": "tx",
    "number": 0,
    "hash": "0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c",
    "eventRange": {
      "start": 0,
      "end": 1
    },
    "body": "",
    "receipt": {
      "result": "successful",
      "data": null
    },
    "events": []
  },
  "meta": {}
}
$ curl -sS http://127.0.0.1:12346/ledger/txs/0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c/events | jq
{
  "data": [
    {
      "type": "event",
      "number": 0,
      "key": "Bank/TokenCreated",
      "value": {
        "TokenCreated": {
          "token_name": "sov-test-token",
          "coins": {
            "amount": 1000000,
            "token_id": "token_1zdwj8thgev2u3yyrrlekmvtsz4av4tp3m7dm5mx5peejnesga27ss0lusz"
          },
          "minter": {
            "User": "sov15vspj48hpttzyvxu8kzq5klhvaczcpyxn6z6k0hwpwtzs4a6wkvqwr57gc"
          },
          "authorized_minters": [
            {
              "User": "sov1l6n2cku82yfqld30lanm2nfw43n2auc8clw7r5u5m6s7p8jrm4zqrr8r94"
            },
            {
              "User": "sov15vspj48hpttzyvxu8kzq5klhvaczcpyxn6z6k0hwpwtzs4a6wkvqwr57gc"
            }
          ]
        }
      },
      "module": {
        "type": "moduleRef",
        "name": "bank"
      }
    }
  ],
  "meta": {}
}
```
7. Test if token creation succeeded:
```sh,test-ci
$ make test-bank-supply-of
```
8. Get a total supply of the token:
```bash,test-ci,bashtestmd:compare-output
$ curl -sS -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"bank_supplyOf","params":{"token_id":"token_1zdwj8thgev2u3yyrrlekmvtsz4av4tp3m7dm5mx5peejnesga27ss0lusz"},"id":1}' http://127.0.0.1:12345
{"jsonrpc":"2.0","id":1,"result":{"amount":1000000}}
```

## How to run the sov-rollup-starter using Celestia Da

1. Change the working directory:
   ```bash
   $ cd crates/rollup/
   ```
2. If you want to run a fresh rollup, clean the database:
   ```bash
   $ make clean
   ```
3. Start the Celestia local docker service. (make sure you have docker daemon running).
   ```bash
   $ make start
   ```
4. Start the rollup node with the feature flag building with the celestia adapter. This will compile and start the rollup node:
   ```bash
   $ cargo run --bin node --no-default-features --features celestia_da
   ```
5. Submit a token creation transaction to the `bank` module.
   Using `CELESTIA=1` will enable the client to be built with Celestia support and submit the test token
   ```bash
   $ CELESTIA=1 make test-create-token
   ```
6. Note the transaction hash from the output of the above command
   ```text
   Submitting tx: 0: 0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c
   Transaction 0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c has been submitted: AcceptTxResponse { data: TxInfo { id: TxHash("0xa02ed59b5c698d49ad088584b86aff2134fd8e96746c1fce57b2518eb7c843e2"), status: Submitted }, meta: {} }
   Triggering batch publishing
   Your batch was submitted to the sequencer for publication. Response: SubmittedBatchInfo { da_height: 2, num_txs: 1 }
   Going to wait for target slot number 2 to be processed, up to 300s
   Rollup has processed target DA height=2!
   ```
7. To get the token address, fetch the events of the transaction hash from #5
   ```bash
   $ curl -sS http://127.0.0.1:12346/ledger/txs/0x04f7ad0ca08bfc191e63c6f31d1cbe55386ae29cde959907e39b6c43977f965c
   # Output omitted, should be similar to what has been seen in mock-da section
   ```
8. Test if token creation succeeded:
   ```bash
   $ make test-bank-supply-of
   ```

9. Get a total supply of the token:
```bash,test-ci,bashtestmd:compare-output
$ curl -sS -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"bank_supplyOf","params":{"token_id":"token_1zdwj8thgev2u3yyrrlekmvtsz4av4tp3m7dm5mx5peejnesga27ss0lusz"},"id":1}' http://127.0.0.1:12345
{"jsonrpc":"2.0","id":1,"result":{"amount":1000000}}
```

## Enabling the prover

By default, demo-rollup disables proving (i.e. the default behavior is. If we want to enable proving, several options are available:

- `export SOV_PROVER_MODE=skip` Skips verification logic.
- `export SOV_PROVER_MODE=simulate` Run the rollup verification logic inside the current process.
- `export SOV_PROVER_MODE=execute` Run the rollup verifier in a zkVM executor.
- `export SOV_PROVER_MODE=prove` Run the rollup verifier and create a SNARK of execution.

#### Note: Check that users and sequencers have enough tokens to pay for the transactions.

For the transaction to be processed successfully, you have to ensure that the sender account has enough funds to pay for the transaction fees and the sequencer has staked enough tokens to pay for the pre-execution checks. This `README` file uses addresses from the `./test-data/genesis/demo/mock` folder, which are pre-populated with enough funds.

To be able to execute most simple transactions, the transaction sender should have about `1_000_000_000` tokens on their account and the sequencer should have staked `100_000_000` tokens in the registry.

More details can be found in the Sovereign book [available here](https://github.com/cyferio-labs/sovereign-book).
