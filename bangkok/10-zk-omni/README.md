# zk-omni
## Basic Information

### Project Name

zk-omni

### Project Creation Date

2024.08.27

### Project Background
This project is built for improving the practicability of an open-source protocol.

This protocol is also proposed by us, named Omniverse DLT.

Since we have applied a Grant last year, Omniverse DLT ( [https://github.com/w3f/Grants-Program/blob/master/applications/Omniverse DLT.md](https://github.com/w3f/Grants-Program/blob/master/applications/Omniverse%20DLT.md) ).

It introduced an asset protocol which enable asset to be used across many chains without fragmentation, and with universal security. 

We call it omni-asset, and the transaction related to the omni-asset is called omni-transaction, or o-transaction.

What dose universal Security mean, it means no matter which chain goes wrong, crash temporarily or even close forever, the omni-asset will still survive and can be used on other chains normally.

By the way, We have submitted the protocol standards and the MVP, shows the features of omni-asset which I mentioned above.

Although It has achieved all the milestones and passed the acceptance by Web3 Foundation now, we still think there is something more should be done to make up for some flaw when it comes into the practice.

For example, the Gas issue, the Synchronous time issue, the double-spend attack issues. They are issues related and affect each other.

So we have started exploring  since finished the Grant, and up to this day, we think we have find the solution, and we will elaborate the detail in the following chapters.
### Brief Introduction

zk-omni is an omni-chain asset solution which enable the asset to be used across many chains without fragmentation, and with universal security.
Besides, can also run with lower gas fees and high performance.
### Problem to be Solved

The Intractable problem in cross-chain circulation and use of assets, including fragmentation, security, performance and Gas cost.

### Selected Bounty
We will participate Moonbeam bounty 1 and bounty 2:
- Bounty 1: Use a Moonbeam Precompile
    The ZK-Proofs of the execution of batched transactions will be verified on Moonbeam, then use XCM Transactor precompile smart contract to make the verification result be shared by all Parachains
- Bounty 2: Build an Application on Moonbeam 
    Beacon Cell and Operation Cell will be both built on Moonbeam.
  
## Features planned for the Hackathon

- a ZK-Rollup Layer serving for multiple chains, including parachain( like moonbeam ), BTC, and Ethereum.
- the Beacon cell, in form of smart contract and substrate pallet and Taproot script.
- the Operation cell,  in form of smart contract and substrate pallet.
- the updated omniverse DLT protocol in the UTXO model edition.

## Detailed Introduction
### Problem Analysis
In theory, and in MVP demonstration, it works very well, asset can be used directly on each chain it supported without the mechanism like Lock/Mint, the security is guaranteed by the private key signature instead of a third party like MPC, the State is unique and global consistency.

But there are some problems in practice like mentioned above.

- First is the Gas issue, the transaction and state of the omni-asset should be synchronized among many chains, gas should be payed for each chain separately.  It’s more expensive for using omni-asset than local asset( eg. ERC20 Token on Ethereum).
- Second is the synchronous time issue, the omni-asset must wait for a moment for the finalization of all chains, if the time to be set too short, maybe it’s not enough for some chain to synchronize to the latest state , but if the time to be set too long, maybe it’s not friendly for the user experience for they must wait a long time to use their omni-asset.
- Besides, if the synchronization is too frequently, there would be not enough time for the finalization for all chains, and the gas cost will soaring, but, if the synchronization frequency is too low,  the resource consumption ( eg. bandwidth, computing power ) maybe too large for each synchronization, and the user experience will still be bad with high latency.
- Then is the double-spend attack issue, it’s somewhat related to the synchronous time issue, if we could wait enough time for the finalization of synchronization, there would be no room for double-spend attack.

So, we must take these issues as whole, solve problems systematically.
### Solution
Each chain has it own traits, we should not simply take them as just one thing. 

For example, some chain, like BTC and Ethereum, all of us know they are chains with enough security and stability, but also low TPS, and expensive blockspace thus lead to High gas fees.

And other chains, like the parachain of Polkadot, most of them are chains with high TPS and low Gas fee. Some are built for general use with EVM virtual machine, some are built for certain application like storage, privacy preserving computing, or DeFi.

Each has it’s own advantages and disadvantages. We should treat them individualized, let them complement each other, not just repeat each other.

Refer to the statement above, We view the chains as three categories.

**The first is the ones we called “the Beacon chain”**, they act as the checkpoint of the omni-asset, the checkpoint verified and record by the Beacon chain must be absolutely true and correct, the history of the omni-asset before the checkpoint should never be reversed, that means they must be security and stability enough, if the ledger on other chains is corrupted, or even other chains stopped their service, user can still restore their omni-asset from the Ledger chain.

The most account for the Ledger chain is **decentralization, censorship-resistance, robustness**, like BTC and Ethereum.

**The second is the ones we called “the Ledger chain“**, they act as the DA layer, that store the complete data of the omniverse ledger, which include all the transactions of all the omni-assets, that means their blockspace should be large and cheap enough, and easy for access, if the ledger on other chains is corrupted, or even other chains stopped their service, user can still restore their omni-asset from the Ledger chain.

The most account for the Ledger chain is **the storage and retrieval capability of blockspace**, like Avail and EigenDA.

**The last is the ones we called “the Operation chain“**, they provide the playground for the Dapps to use the onmi-asset, demonstrating all the advanced traits of omni-asset.

The omni-transaction should be confirmed here as soon as possible so that the omni-asset can be used quickly and conveniently on chains.

The most account for the Operation chain is **performance and cost of execution**, so at least the TPS should be high and the gas fee should be low.

Although the Ethereum is a general use platform since the EVM is Turing-complete, but considering its low TPS and high gas fees, it’s still recommended to be the Beacon chain instead of the Operation chain and the Ledger chain.

So, we have the ultimate solution composed with four major parts. As shown in the figure below.
### Architect
![image](https://github.com/user-attachments/assets/7fa76c3d-717b-44a5-9acf-3d55926f8322)

### Component
First is a ZK-Rollup, second is the Beacon cell, third is the Operation cell, and the last is the Ledger chain.

These four parts play different roles in the system and can cooperate with each other to enrich the functions and enhance the robustness of the whole system.

- The ZK-Rollup is the common part mainly consist of the sequencer, the proposer and the zk-prover. It’s the standard three-piece suit of a ZK-Rollup. The sequencer is responsible for collecting transactions and organizing them in order, the proposer will get transactions from the sequencer and package them into multiple batches, and the zk-prover will generate proof for each batch, the proof can prove that the state transition by this batch of transactions is correct quickly without re-execution of transactions in this batch one by one.
- The Beacon cell is deployed on the Beacon chain, mainly in form of smart contract, it act as the ZK-Verifier, which can verify if the latest state is correct by verifying if the batch provided by the proposer and the proof produced by the zk-prover can be matched. One exception is BTC, since it cannot verify ZK proof on chain, so it just store the ZK proof, batch and the state in form of Taproot script.
- the Operation cell is integrated by the Operation chain, which can get the omni-transaction directly from the sequencer, verify the legality of each transaction independently, and transfer to the latest state, there is no need to wait for the rollup batch and ZK proof.
- The Ledger chain is as known as the data-availability layer, as mentioned above, it stores the complete data of the omniverse ledger. As how to integrate the Ledger chain into our system, it depends on the methods provider by the DA layer provider.

The multi-chain availability is guaranteed by the Ledger chain and the Beacon chain, and the multi-chain usability is guaranteed by the Operation chain, the ZK-Rollup is the underlying service layer for the Ledger chain and the Operation chain.

In general, who can be the Beacon chain or the Ledger chain and who can be the Opeartion chain is not mandatory. We choose the BTC and Ethereum to be the templet of the Beacon chain, and we suggest the Application chain built with Substrate to be the Operation chain, but that’s not always this case.

### Additional update in protocol
The last but not least, we have made some updates to the O-DLT protocol, we replace the account-balance model to the UTXO model ,like BTC, thus can bring some new benefits for the omni-asset.

- First is the concurrency, one can initiate multiple transactions on multiple chains simultaneously by using different UTXO separately.
- Second is self-preservation, which means you can store you UTXO by yourself, this further makes you asset perpetual.
- Third is privacy, UTXO is easier for implement privacy, this is a generally acknowledged truth.

As the O-DLT protocol in UTXO model edition, you can refer to the link below:

https://github.com/Omniverse-Web3-Labs/bitcoin-proposals/blob/main/omni-utxo-proposal.md

We have implement it in this hackathon project. You can some examples of the `UTXO` in this hackathon [here](./src/zk-6358-state-prover/src/mock/mock_utils.rs#L273)

### Extensible function: Paymaster
For the better user experience in the future, there is still something pending.

It’s the related to the gas issue, but not the expense, it’s related to the convenience of paying the gas for multiple chains for each synchronization. 

Luckily, we have the ZK-Rollup execution layer, besides the fundamental duty mentioned above, it can also act as the paymaster in EIP-4337.

There are many ways for it to charge users for synchronization in one kind of token, the paymaster will exchange this kind of token into gas token needed for other chains, like BTC for Bitcoin, ETH for Ethereum and so on, And then pay the gas fee for each chain for users.

Like the ZK-Rollup execution layer can issue their native token, just as arb of Arbtrium and op of Optimism, and users can pay the gas in this native token.

Besides, it can also charge in the form of some existed token, like USDT, ETH or BTC, It's the same principle.

The key components for this paymaster function is the deposit vault module, the payment vault module, the Oracle module and the exchange module.

- the deposit vault module: user need to deposit the single kind of token to this vault for the paymaster
- the deposit vault module: this vault is consist of multiple kind of tokens, using for paying for the actual gas fee of each chain.
- the Oracle module: using for importing the real price of related token, and the gas price of each chain.
- the exchange module: calculate the exchange ratio of these tokens, thus can charge fees to users in one kind of token appropriately.

![Paymaster](https://github.com/user-attachments/assets/d6586bf8-f411-41be-9575-9eb2a1d0c280)

Users even needn’t to know this process, they just pay one token everytime they initiating an omni-transaction, and the ZK-Rollup execution layer will do the rest thing for them.

This is already on the agenda, we will finish that later.
### ZK-6358-Prover in Particular

![image](https://github.com/user-attachments/assets/811e8348-d3f6-42ef-8fda-7151ba692dbb)

The State-Prover is built based on `Plonky2` and the details can be found [here](./src/zk-6358-state-prover/README.md). Then the `p2-state-proof` is aggregated into a compressed `SP1` proof, say, `sp1-aggregated-state-proof`. Details can be found [here](./src/zk-6358-final-prover/circuit/p2agg/).  

On the other hand, the verification of the signatures of the batched transactions are proved by [zk-6358-eip712-sign-prover](./src/zk-6358-final-prover/circuit/sp1eip712/). Another `SP1 compressed proof` is generated.  

Both the above proofs are `STARKy` proofs, which are costly being verified on-chain. And the connection between the `state proof` and `sig proof` has not been proved yet. As a result, a `final-prover` is built to generate an aggregated `SNARK` proof, the details can be found [here](./src/zk-6358-final-prover/README.md).  

### Conclusion
We provide both the Beacon cell and the Operation cell for public,  you can choose the role for your chain by integrated different cell.

As to the Ledger chain, you should deal with it case by case, since the data-availability solution is entirely provided by the third-party, you should refer to it’s own document to use it’s service, but it’s your freedom to compare among a multitude of DA solutions and select one or more to be the Ledger chain, we will do this work later.

thus it can exert different effect to the omni-asset. The choice is free, it ultimately depends on the you, or rather, depends on the market.

## Schedule

- ZK-Provers
    - [ZK-State-Prover for state(UTXO/Assets) transition(based on P2)](./src/zk-6358-state-prover/)
    - [ZK-Signature-Prover for tx-signatures verification(based on SP1)](./src/zk-6358-final-prover/circuit/sp1eip712/)
    - [ZK-Proof-Aggregator for final Plonk Proof(based on SP1)](./src/zk-6358-final-prover/circuit/)
- Beacon Cell
    - [ZK-Verifier for Moonbeam(Moonbeam smart contract)](./src/contracts/omni-zk-verifier/)
    - [BTC Taproot script](./src/bitcoin-taproot-script-proof-chain/)
- Operation Cell
    - [Substrate Parachain](./src/pallet-omniverse-operation/)
    - [Moonbeam smart contract](./src/contracts/omniveres-beacon/)


## Team info

- Jason C(Team leader/PM/Marketing)
- Shawn Z (Tech leader)
- Kay L (Web3 full-stack development, core development engineer)
- George H (Web3 full-stack development, core development engineer)

## Material for Demo

1. [Try It Yourself](https://hackathon.omnicoins.net/)
    - [faucet](https://yourfaucet.hackathon.omnicoins.net)
    - `OMNI`(**gas token**)
        - erc-20 address on `Moonbase alpha`: `0x94A930781066D811DBDEFD4B7A0250D4a346786e`, which can be used for check the balance in `Metamask`
        - [substrate asset](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpallet.hackathon.omnicoins.net#/assets)
    - `AWSOME`(cuscom deployed token)
        - erc-20 address on `Moonbase alpha`: `0xF76463B43AEc7F2E7a198dc684DFb214fE31f58C`
        - [substrate asset](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpallet.hackathon.omnicoins.net#/assets)
2. [Demo Video](https://omniverse-dev.s3.us-east-1.amazonaws.com/hackathon/Hackathon+Demo.mp4)
3. [ZK-OMNI PPT](https://docs.google.com/presentation/d/1cBIcnYrU4dwlWp1XE4eB1fdnh5UqRi-5/edit#slide=id.p1)
