A prototype of Cybros protocol implementation
====

This is a quick and dirty implementation that shows few use cases:

- Simple echo (return the message which you input)
- Echo (similar with the simple echo, but add complex features for example E2E encryption support)
- NFT factory (aka Imaginator)

Please don't bother the code quality, lacking doc, and hard to use,
this prototype spend me only a night to build and use for evaluate interactive with Cybros chain.

I plan to make a well design and rewrite it totally soon,
I prefer the architecture would look like [Faktory](https://github.com/contribsys/faktory).

For now, You also need to know [Polkadot.js](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fnode-rpc.cybros.network#/accounts).

## Preparation

- [Install latest Deno](https://deno.com/manual@v1.33.4/getting_started/installation) first.
- Caching dependencies
  - `deno cache --reload ./main.ts`
  - `cd ./examples/echo && deno cache --reload ./main.ts`
  - `cd ./examples/imaginator && deno cache --reload ./main.ts`
  - Note: If you meet `error: The source code is invalid, as it does not match the expected hash in the lock file.`, just delete `deno.lock` then retry

For the NFT factory:

- Deploy [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) separately with `--api` argument.
- Prepare an [Akord](https://v2.akord.com/) account, new user has 250MB free space.
- `cp ./examples/imaginator/.env.defaults ./examples/imaginator/.env` then edit it to use correct settings.

## How to

## Run the worker

Here's an example:

`EXECUTOR_PATH="./examples/simple_echo/" ./run.sh --owner-phrase "//Alice" --subscribe-pool 4 --impl 4 --rpcUrl wss://node-rpc.cybros.network`

- `EXECUTOR_PATH="./examples/simple_echo/"` run the simple echo demo
- `--owner-phrase "//Alice"` optional, if given the worker's owner, it will do register the worker and charge when funding are insufficient automatically
- `--subscribe-pool 4` listen the pool 4, the pool owner must add the worker to the pool on-chain (by `offchainComputing.authorize_worker` extrinsic call), or no task can assign to the worker
- `--impl 4` mock the impl id is 4, this is for demo only
- `--rpcUrl wss://node-rpc.cybros.network` connect to the dev chain RPC endpoint
  - Note: The dev chain is not persist
  
After started the app, you shall see for example `Worker address: 5CmLkeupoN7tSthSD6hFj9wHYc9RyMRAWb38uo5BD6LEViGw`
this is the worker's address that use for on-chain operations, such as register the worker, add the worker to a pool

## On-chain configuration

TODO

## Create task

If everything configure well, the worker will listen to the pool and handle new tasks.

## The demo limitations

By design these are allowed, but the dirty code couldn't support

- A worker could run multiple tasks in parallel
- A worker could subscribe multiple pools

## License

MIT
