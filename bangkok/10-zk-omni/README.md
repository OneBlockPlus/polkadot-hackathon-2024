zk-omni
# Basic Information

## Project Name

zk-omni

## Project Creation Date

2024.08.27

## Project Background
## Introduction

zk-omni is an omni-chain asset solution which enable the asset to be used across many chains without fragmentation, and with universal security.
Besides, can also run with lower gas fees and high performance.

## Features planned for the Hackathon

- a ZK-Rollup Layer serving for multiple chains, including parachain( like moonbeam ), BTC, and Ethereum.
- the Ledger chain cell, in form of smart contract and substrate pallet and Taproot script.
- the Operation chain cell,  in form of smart contract and substrate pallet

## Architect
TBA

## Schedule

- ZK-Provers
    - ZK-State-Prover for state(UTXO/Assets) transition(based on P2)
    - ZK-Signature-Prover for tx-signatures verification(based on SP1)
    - ZK-Proof-Aggregator for final Plonk Proof(based on SP1)
- Ledger Chain Cell
    - ZK-Verifier for Moonbeam(Moonbeam smart contract)
    - ZK-Verifier for Pallet
    - BTC Taproot script
- Operation Chain Cell
    - Substrate Parachain
    - Moonbeam smart contract

## Bounty

- We will participate Moonbeam bounty 1 and bounty 2
    - Bounty 1: Use a Moonbeam Precompile
        - The ZK-Proofs of the execution of batched transactions will be verified on Moonbeam, then use XCM Transactor precompile smart contract to make the verification result be shared by all Parachains
    - Bounty 2: Build an Application on Moonbeam
        - Ledger Chain Cell and Operation Chain Cell will be both built on Moonbeam

## Team info

- Jason C(Team leader/PM/Marketing)
- Shawn Z (Tech leader)
- Kay L (Web3 full-stack development, core development engineer)
- George H (Web3 full-stack development, core development engineer)

## Material for Demo

1. Demo Video [link to Youtube]
2. PPT [link to google doc]
