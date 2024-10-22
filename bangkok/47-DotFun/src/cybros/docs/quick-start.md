---
outline: deep
---

Quick start
====

This doc will use the local development node and the `protocol_impl` as a sample.

## Preparation

You must install [Rust](https://rustup.rs/) and [Deno](https://github.com/denoland/deno#install) to build the node and run the demo.

### Clone the repo

```sh
git clone https://github.com/cybros-network/cybros-network.git
```

### Build the node

```sh
cargo build --release
```

### Cache dependencies for the demo app

This is necessary.

```bash
cd protocol_impl
rm deno.lock # For unknown reason, esm.sh may change files' SHA which will break Deno's security check
deno cache --reload ./main.ts
```

If you wanna run `echo` sample

```bash
cd examples/simple_echo
rm deno.lock
deno cache --reload ./main.ts
```

If you wanna run `imaginator` (AIGC) sample

```bash
cd examples/imaginator
rm deno.lock
deno cache --reload ./main.ts
```

### Run and configure local test network

#### Start the local test network

```bash
target/release/cybros-node --dev
```

Once the node started, you can connect it with **Polkadot-JS Apps** front-end
to interact with the chain.

https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/extrinsics

#### Register an impl and an impl build

Use Alice to send the extrinsic
`offchainComputingInfra.registerImpl(attestationMethod)`
- `attestationMethod` Choose `OptOut` means the Impl doesn't support attestation

Submit the extrinsic,
then you should get the success event on the `Network -> Explorer` page:
- `offchainComputingInfra.ImplRegistered { implId: 101 }`

Use Alice to send the extrinsic
`offchainComputingInfra.registerImplBuild(implId, version, magicBytes)`
- `implId` fill `101` (we got the `implId` from previous extrinsic)
- `version` can fill `1` (it accepts any number larger than 0)
- `magicBytes` keep `None` (It uses for TEE)

Submit the extrinsic,
then you should see the success event on the `Network -> Explorer` page:
- `offchainComputingInfra.ImplBuildRegistered`

#### Create a pool

Use Alice to send the extrinsic
`offchainComputingPool.createPool(implId, createJobEnabled, autoDestroyProcessedJobEnabled)`
- `implId` fill `101`
- `createJobEnabled` choose `Yes` or the pool will not allow to create new job
- `autoDestroyProcessedJobEnabled` can choose `Yes`

Submit the extrinsic,
then you should see the success event on the `Network -> Explorer` page:
- `offchainComputingPool.PoolCreated { poolId: 101, ... }`

#### Create a job policy

Use Alice to send the extrinsic
`offchainComputingPool.createJobPolicy(poolId, applicableScope, startBlock, endBlock)`
- `poolId` fill `101` (we got the `poolId` from previous extrinsic)
- `applicableScope` can choose `Public` which means anyone could use the policy
- `startBlock` and `endBlock` can keep `None` which means the policy never expires

Submit the extrinsic,
then you should see the success event on the `Network -> Explorer` page:
- `offchainComputingPool.JobPolicyCreated { policyId: 1, ... }`

#### Start a worker

We use `simple_echo` as an example

```bash
cd protocol_impl
EXECUTOR_PATH="./examples/simple_echo" ./run.sh --owner-phrase "//Alice" --subscribe-pool 101 --impl 101 --rpcUrl ws://127.0.0.1:9944
```

After the program launches, you can see the worker's address from the output:

```
Worker address: 5CmLkeupoN7tSthSD6hFj9wHYc9RyMRAWb38uo5BD6LEViGw
```

Wait for few seconds,
then you should see events on the `Network -> Explorer` page:
- `offchainComputingInfra.WorkerRegistered`
- `offchainComputingInfra.WorkerOnline`

#### Add the worker to the pool

Use Alice to send the extrinsic `offchainComputingPool.authorizeWorker(poolId, worker)`
- `poolId` fill `101`
- `worker` fill `5CmLkeupoN7tSthSD6hFj9wHYc9RyMRAWb38uo5BD6LEViGw` (we got the address from the worker starting)

Submit the extrinsic,
then you should see the success event on the `Network -> Explorer` page:
- `offchainComputingPool.WorkerAuthorized`

Wait for few seconds,
then you should see the event:
- `offchainComputingPool.WorkerSubscribed`

#### Create a job

Send the extrinsic `offchainComputingPool.createJob(poolId, policyId, implSpecVersion, input, softExpiresIn)`
- `poolId` fill `101`
- `policyId` fill `1`
- `implSpecVersion` fill `1`
- `input` you can fill `Hello World !!!`
- `softExpiresIn` can keep `None`

Submit the extrinsic,
then you should see the success event on the `Network -> Explorer` page:
- `offchainComputingPool.JobCreated { jobId: 1, ... }`

Keep watching, you should see these events：
- `offchainComputingPool.JobAssigned`
- `offchainComputingPool.JobStatusUpdated { status: Processing }`
- `offchainComputingPool.JobResultUpdated { result: Sucess, output: "Hello World !!!", ... }`
- `offchainComputingPool.JobStatusUpdated { status: Processed }`

#### Destroy the processed job, releasing reserving tokens

> You don't need to do this step if you set `autoDestroyProcessedJobEnabled: true` when creating the pool

Send the extrinsic use the job's creator account `offchainComputingPool.destroyJob(poolId, jobId)`
- `poolId` fill `101`
- `jobId` fill `1`

Submit the extrinsic,
then you should see the success event on the `Network -> Explorer` page:
- `offchainComputingPool.JobDestroyed { poolId: 101, jobId: 1 }`
