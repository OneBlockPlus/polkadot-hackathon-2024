# ParaContracts - Unlocking the full potential of Polkadot!

(developed during hackathon timeline itself! August 2024)

ParaContracts is a revolutionary concept which aims to unlock the full potential of Polkadot. It helps in unlocking the combined TPS of multiple parachains by distributing a contract's state across them. This repository contains Proof of Concept for the same, mainly dev-tools which will facilitate development and deployment of ParaContracts!

(We recommend judges to read our white paper, which is much more technical)

white paper: https://docs.google.com/document/d/1dopiBQFypcg5lfeYkWrcKPrZSoXwWLKcxKagZiu3KSo/edit?usp=sharing     
youtube video: https://youtu.be/OUK1mNqTMcs

## Problem to be Solved

Polkadot Parachains (Parallel Chains) can support smart contracts. They can support both wasm and EVM
based contracts. When a smart contract is deployed on a parachain, its state only persists within that parachain. 
This means that any transaction involving a state change can only occur on that parachain. The TPS (transactions 
per second) for a contract is the same as the TPS of the parachain it is deployed on. In the event of a bottleneck, 
where many transactions are waiting to be added to the parachain, leading to low TPS and high transaction fees,
contracts deployed on that chain will experience inconvenience. 

One of Polkadot’s missions is to address blockchain scalability issues, but this challenge remains unresolved at
the contract level. While there are multiple parachains, a contract can only leverage the TPS of a single parachain 
instead of unlocking the combined TPS of multiple parachains.

## Project Overview

To unlock combined TPS of multiple parachains, we need to distribute outgoing transactions from a contract across multiple parachains, instead of just directing them to a single parachain. Doing this without ParaContracts was impossible because contract's state is persistent only on a single parachain.  We can deploy a contract on multiple parachains, but that won’t help, because state is persistent on one chain only, and contracts on different chains will have different states. We want a single instance of a contract deployed across multiple parachains, so a contract interaction can happen on the parachain offering lowest fees. This way, a transaction by a contract will execute only on parachain offering lowest fees, which will help distribute traffic caused by itself across multiple parachains, thus reducing load on a single parachain. With an ecosystem where many contract instances utilize multiple parachains for transactions instead of just one parachain, traffic across multiple parachains will distribute highly efficiently causing polkadot to scale exponentially.

These contracts having a single contract instance deployed across multiple parachains are called Paracontracts.

## Project Demonstration

This project includes dev-tools required to develop and deploy a ParaContract. All logic will be handled by dev-tools themselves. A developer doesn't need to know anything about ParaContracts,   *ANYTHING*. Eveerything is abstracted behind our dev-tools. 

To work with ParaContracts, you simply need to write normal Solidity code and then use paracontract-parser to generate equivalent ParaContract code.

This ParaContract Code will be passed to a paracontract-deployer, which will also take additional parameters like network-rpc-url of all parachains you want your contract to be deployed on, bridge contracts deployed on all parachains, and an account to make transactions.

### Use parser to generate ParaContract Code from general Solidity Code
```
mephisto@DESKTOP-RIBACK4:~/polka/paracontract-tools/paracontract-parser$ python3 paracontract-parser.py
Enter the Solidity file name: Counter.sol
Parsed code saved to parsed_Counter.sol
```

### Use paracontract-deployer to deploy ParaContract accross multiple parachains. 
deployer will take care of deploying accross multiple parachains, registering cross chain bridges, registering other parachains, you sit back and relax!

```
mephisto@DESKTOP-RIBACK4:~/polka/paracontract-tools/paracontract-deployer$ python3 deploy_paracontract.py
Enter the Solidity file name: parsed_Counter.sol
Enter RPC URLs separated by commas: http://127.0.0.1:9944, http://127.0.0.1:43279
Enter the bridge address for RPC URL http://127.0.0.1:9944: 0x01420dAE1cea60CB4E7c5808AD69712Da393e152
Enter the bridge address for RPC URL http://127.0.0.1:43279: 0xb02067DD74a44A465910a4792Db00a1C395412dF
```

## Technical Architecture

The project uses the concept of shared state, which makes it possible to deploy a contract accross multiple parachains and still have a single mutually agreed state, which is the reason why a ParaContract can make transactions on multiple parachain and choose the one with lowest fees.

Let's understand with a basic example. (Note: Example taken is basic and a lot of complexities are removed to make the concept easy to understand)

A Paracontract has a shared persistant state across multiple parachains. Let’s understand with help of a simple Counter contract, with a “count” variable set to 0 and an increment function which will increase the value of “count” variable by 1. We can deploy this contract on multiple chains, but each contract this way will have their own persistent state. We want all contracts deployed across multiple parachains to agree on one state instead. We will achieve this using the concept of versioning. Let’s understand how.

![image](https://github.com/user-attachments/assets/84700baa-9f0b-494f-97ad-b26230c70e9f)


Let’s say TPS is low and fees is high on chain A,
so the user chooses to instead execute the increment() function on chain B.

![image](https://github.com/user-attachments/assets/76da6aea-71d7-4d8f-9a85-4f22989d6ddb)

The value of the “count” variable on chain A is 0 and chain B is 1. We can see now there is inconsistency in state,
the state of the contract is no longer the same across all parachains. To solve this, we will introduce versioning.

Each variable will have a corresponding version variable. This version will increment whenever a variable is changed. The variable with the latest version is the only valid one. This way, data may be inconsistent across contracts deployed on multiple parachains, but we can have a state mutually agreed upon by all contracts. 

![image](https://github.com/user-attachments/assets/f2803abf-afe9-496a-b9d3-41236fc05b6e)

Suppose chain A has low TPS and high fees, and user chooses to execute increment() function on chain B. As shown in Fig 3.4, “count” variable for chain B will become 1, and countVersion will become 1. Even though chain A has count = 0, we will accept chain B’s count = 1 valid, because countVersion = 1 for chain B while countVersion = 0 for chain indicating chain B has latest version i.e update of “count”, and “count” provided by chain B is mutually agreed upon, and should be considered.

![image](https://github.com/user-attachments/assets/dd0a7173-592c-4407-9ea6-3183d7765829)

To make any update to state, we will have to check across all instances of contract deployed across parachains to fetch the valid state with the latest version. This means we need some sort of cross chain communication between parachains. Thankfully, XCMP exists which provides a way for parachains to exchange information. We can use XCMP, Axelar, Hyperlane, or any other bridge to fetch contract state across different parachains.

![image](https://github.com/user-attachments/assets/9a788ea6-4f18-4b7e-ab1d-d63767f058f9)

Each contract before updating state needs to make cross chain calls and fetch the valid state. Only on top of this
valid state, the contract can make any further changes. 

![image](https://github.com/user-attachments/assets/5f91f8b2-ba55-4e09-87d2-f781928d1e6e)

## Team Information

My team includes 

Raehat Singh Nanda (Blockchain Developer, Open Source Bitcoin Contributor)     
Surbhit Agrawal (Blockchain Developer)

## Selected Bounties

Category 1:(Infrastructure) Polkadot ecological developer tools    
Category 4: Open topic













