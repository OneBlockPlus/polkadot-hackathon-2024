Ideas
====

This is a list holds todo and raw ideas.

## Principals

- Useful
- Affordable
- Profitable
- Fair
- Simple

## Useful use-cases

Current we have few use-cases:

- ChatGPT bot
- NFT factory
    - Call DallE API to generate image with input prompt
    - Upload the image to Arweave
    - Mint a NFT
    - Transfer ownership to the task owner
- Cross-chain Dex
    - This will hold now because we don't have TEE-based protocol implementation yet
- Oracle
    - We can make consensus on target chain to improve confidence level because we don't have TEE-based protocol implementation yet

These are not enough, we should keep finding potential use-cases to prove our value.

## Todo

These are certainty works need to be done.

### Multi-steps (Workflow) task support

Introducing `advanceable` for `Task`.
If a task has this attribute, when worker submit the result, the chain will made the output as input to create a new task,
deposits will success to the new task, if deposits insufficient, the old task will keep as `Processed` status,
user can add more deposit to the task, and call `advance()` to continue.

So we need add `add_deposit()` for tasks.

TODO: DAG? not quiet difficult, just add a RC field for dependent tasks, when 0 can be enabled

### Basic rates for create tasks (in `JobPolicy`)

I think we could support fixed rate first, user will pay a fixed amount of money to creating a task.

### Share benefit between pool and workers

I think we could support commission (percentage 0 - 100) first,
the pool will take some cut from user fee - Pool set a commission, the task runner and the pool share the fee

### Finalize Cybros protocol v0

When we examined our design by use-cases, we could make the first version of the protocol

### Rewrite the Deno-based reference protocol implementation and open source it

Current one is poor design and hard to maintain, I'd like to rewrite it entirely, even need to spend some money.

Open source it will allow people join to play with us.

### Move limitations into `PoolInfo`

Current we only have global limitations such as concurrency of workers, default expires in, and etc.
we should allow pool's owner configure these, but the global settings shall be the upper limit.

### Fine tests, benchmarks, and documents

These are must things when it becomes a serious product.

### The Maelstrom test network

The first semi-persisted test network and welcome everyone to play.

## Future ideas

Just a backlog, would be change in the future

### Build Tokenomic on ETH, Polygon, and BSC

ETH, Polygon, and BSC are more popular, recognition and assets,
made those ecosystems' enthusiasts can use our service easily shall have great advantage.

We could use cross-chain bridge to subscribe events on foreign chains.

We may need to consider combine an Oracle here:

- When a task completed, send result (success or fail) to foreign chain first, get a tx hash
- Submit the result with the foreign chain tx hash, examine it

Another way is we don't take care it, let the application itself push the message to foreign chain.

Trustable is the first priority concern.

### Improving handling for task expiring

Currently, the `expires_at` is actually a soft expiring, worker can still process it even the task has expired.

In pool owner's view, it's not a big deal to process too old tasks because they earn money anyway,
and task creator already pay for it.
But on the other hands, that would make application stuck.

So I'm guessing we can improve this.

For now, I can think minor improvements:
- Enable rewarding from destroying expired task, the reward shall from the pool owner's deposit
- Add `batch_destroy_expired_tasks()`

### More fairness on failure task

It expects that processing task fail, e.g. task rely on OpenAI API and it's down,
but it also possible that worker do evil,

We should find a good way to keep fairness for task owners and workers (and pool owners).

### Efficient and performant task scheduler

Current problem is when new task incoming, workers will try to pick-up it, which means all workers will send an extrinsic,
This is typical thundering herd problem.

It's Ok for now, because we only have very few pools and workers,
but it's definite would be a bottleneck if the network getting popular.

I don't like idea that making some leader workers to help to assign tasks, I still prefer to make an on-chain task scheduler.
Maybe we could use `BoundedBTreeMap` to make a sorted `Worker => Score` map, the `Score` could be the running tasks count maybe,
and we may prefer assign new task to workers who get tasks less than others and idle workers

I hope we can balance fairness and efficiency.

We need to consider how to avoid to assign to an offline worker.
We need to consider given tips when create task will influence priority.

Another option is we assign a worker on creating task, for tips, worker must submit result before a promising time.
Another option is let Validators do the job, using offchain-worker technique.

### Scheduled (Cron) task support

I was thinking it is easy to made, but I'm wrong, it's not easy to implement it efficiently.
The problem is, workers don't have to run scheduled task while there may have many instant tasks.

Besides, I'm not sure how valuable of scheduled task is, so I'm just holding this feature.

We may need a scheduler, like a hook in each block, move trigger-able scheduled task into `AssignableTask` queue,
or we may find some tokenomic way to encourage worker take scheduled tasks,
or we do it externally.

Another option is let Validators do the job, using offchain-worker technique.

### Tips for creating task

Add tips should make the task prioritize to process.

### Reference TEE-based protocol implementation

Protocol itself already considered attestation, but it's very helpful we made a reference implementation for TEE.
Based on our reference TEE implementation, people could make decentralized confidential application more easily.

SGX with DCAP is the first choice for security, ARMv9 and AMD SEV lacking attestation (my knowledge may outdated).
In addition, HyperV and vSphere has attestation too, but I don't know it's possible to get it from guest OS.

### Rates for create tasks

We have `JobPolicy` but we don't design how to charge for task, current I can figure out:

- Fixed rate
- Based on running time, it should has a upper limit
- Smart contract

In addition, offline computing or traditional async task failure is common (e.g. like OpenAI server down made GPT task failed),
how do we handle the failure task?

### Share benefit between pool and workers

For decentralized pools, we need design some rules for how to share profit, current I can figure out:

- Pool set a commission, the task runner and the pool share the fee
- Staking, the task fee sharing as bonus for shareholders based on their ratio
- Smart contract

### Slashing

We need to punish abnormal offline workers, we already have the hook, but we haven't design the rule of slashing.

### (Confidential) communication channel for pool

We need to provide a way to let the workers in a pool can broadcast messages, it should allow in a confidential way.
Consider it looks like E2E group chatting, Olm and Megolm cryptographic ratchets algorithm will help us.

See https://github.com/matrix-org/vodozemac

For the channel, not sure Substrate's pallet-message-queue can help

### Performance-wise refining

Learning from NFTs, Nomination pools, and other may have large set of data pallets.

I know blockchain has its limit, but I want to ensure we can maximize throughput.

### Decentralized application distribution

I'm considering minting application as a NFT, pool owns a sub-NFT of the application NFT,
base on that, we could design how to share profit between application owner (the NFT owner) and pool.

### Cybros protocol v1, stabilize everything, audit all of our works

These are must things when it becomes a serious business.

### The Haven main network

It will be the permanent main network.

### Becoming a public decentralized Cybros network

This is the final goal, will achieve when above ideas are cleared,
so this one should always be placed at the end of the list :)

## Questions

### Stake for Pools

Maybe we should use staking model, but how the pool get benefit from staking more?

## Archived

Nothing yet.
