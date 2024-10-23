<img src="/bangkok/56-Neja/docs/icon.jpg" height="80" width="120" />

# Neja.js: Stateless Cloud Functions for Substrate

## Introduction

Neja.js is a Substrate-based tool that enables developers to easily build cross chain applications using programmable, stateless cloud functions in JavaScript.

Neja is based on the idea of leveraging Substrate's pallet design to create a more suitable programmable layer than smart contracts.

## Category
Tooling: (Infrastructure) Polkadot ecological developer tools

## Problem

The current blockchain development landscape within the Polkadot ecosystem presents several challenges:

1.⁠ ⁠*Building on Substrate is Complicated*: Dapps development has extra efforts of learning Rust, Substrate, and ink! for smart contracts, which slows down development compared to traditional apps.

2.⁠ ⁠*Limited Programmability*: Building on top of parachain SDKs limits innovation and adoption on the application layer (for every new functionality required the parachain needs to add a pallet function).

3.⁠ ⁠*Compromised Solutions*: Current attempts to simplify development often involve porting Ethereum contracts to Polkadot, which undermines the unique advantages of the Substrate framework.


## Existing Solutions

Current approaches to simplify Polkadot development are focused on:

1.⁠ ⁠*Smart Contract Compatibility*: 
   - Porting Ethereum-style smart contracts to Polkadot
   - Using EVM compatibility layers

2.⁠ ⁠*Development Starter Frameworks*:
   - Development environments still requiring extensive Substrate knowledge

These solutions undermine Substrate's pallet architecture or fail to significantly reduce the development complexity.

## Neja: Stateless Cloud Functions for Substrate

Neja introduces a new paradigm in the space with the concept of Cloud Functions on Parachains. A cloud function is a simple script that has no state of its own but manages a keyless Substrate account and can execute any parachain extrinsics.

Neja is the simplest programmability solution for dApps on Polkadot.

For example, a dApp that wants to leverage existing pallets of a parachain but needs an additional function, such as having an on-chain, verified KILT DID-gated community on Subsocial, can now achieve this with Neja—without the need to write a smart contract.

### Utility

1.⁠ ⁠*Cross-Chain Programmability:*
    Integration across chains using XCM without need of writing pallet or smart contracts
   
2.⁠ ⁠*Stateless Architecture:*
    Reduces memory stored on chain, no state-bloat issues

3.⁠ ⁠*WebAssembly Foundation:*
    Flexibility of writing function logic in any wasm compilable language (JS, Python)

4.⁠ ⁠*Composability:*
    Cloud functions are the smallest computing units, thus they have very good composability with each other 

## Neja.js vs Smart Contracts

For more clarity, here's a comparison of Smart Contracts with Neja Tool

| Aspect | Smart Contracts | Neja |
|--------|----------------|------|
| *State Management* | Stateful, high memory usage for storage | Stateless cloud functions, optimized for execution |
| *Substrate Integration* | Additional layer on top of blockchain, does not align with pallet architecture | Native integration with Substrate pallets |
| *Interoperability* | Fragmented state with custom standards, difficult to generalize | Consistent with Substrate's native state, naturally interoperable |

Neja is ideal for cross-chain applications, creating standards for high interoperability for Dapps within the Polkadot ecosystem.

### Technical Implementation

![Image](/bangkok/56-Neja/docs/img.png)


### Important Links

- **Neja Pallet**: https://github.com/sheetalojha/neja-pallet
  Neja Pallet is the implmentation of Cloud Functions on Substrate Chain. It's a simple design yet provides huge value in terms of possiblities of apps that can be built on top of it.

- **Neja CLI**: https://github.com/sheetalojha/neja-cli
  Neja CLI is an internal library that makes it easier for devs to work, compile & build wasm without ever leaving the VS Code. 

- **Neja Template**: https://github.com/sheetalojha/neja-template
  Neja Template is a simple Next.js template that has pre-integrated Neja CLI, and basic project's boilerplate initiated in it. The project can be used to directly to build apps. It's the starting point for app devs.


### Team

**Sheetal Ojha**
Founder, Portalx 
Polkadot Blockchain Academy, Singapore Graduate