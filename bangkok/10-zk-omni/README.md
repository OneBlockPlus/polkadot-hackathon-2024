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
    Ledger Chain Cell and Operation Chain Cell will be both built on Moonbeam.
  
## Features planned for the Hackathon

- a ZK-Rollup Layer serving for multiple chains, including parachain( like moonbeam ), BTC, and Ethereum.
- the Ledger chain cell, in form of smart contract and substrate pallet and Taproot script.
- the Operation chain cell,  in form of smart contract and substrate pallet

## Architect
TBA

## Schedule

- ZK-Provers
    - [ZK-State-Prover for state(UTXO/Assets) transition(based on P2)](./src/zk-6358-prover/)
    - [ZK-Signature-Prover for tx-signatures verification(based on SP1)](./src/zk-6358-final-prover/circuit/sp1eip712/)
    - [ZK-Proof-Aggregator for final Plonk Proof(based on SP1)](./src/zk-6358-final-prover/circuit/)
- Ledger Chain Cell
    - ZK-Verifier for Moonbeam(Moonbeam smart contract)
    - ZK-Verifier for Pallet
    - BTC Taproot script
- Operation Chain Cell
    - Substrate Parachain
    - Moonbeam smart contract



## Team info

- Jason C(Team leader/PM/Marketing)
- Shawn Z (Tech leader)
- Kay L (Web3 full-stack development, core development engineer)
- George H (Web3 full-stack development, core development engineer)

## Material for Demo

1. Demo Video [link to Youtube]
2. PPT [link to google doc]
