# Cyborg Network's NeuroZK - Empowering AI at the edge with zero-knowledge proofs.

![photo_2023-10-30 21 15 10](https://github.com/user-attachments/assets/0d8298e7-ef7d-4d2d-a3b0-7a59edcecc80)


## Introduction
Cyborg Network is developing a DePIN-based marketplace for edge computing resources, enabling latency-sensitive applications to scale globally with ease. Users can seamlessly offload specific low-latency workloads to edge locations while maintaining their core deployment in the cloud. Our vision is to serve as essential middleware at the network edge, orchestrating these tasks to reduce cloud operational costs and enhance existing cloud services. In response to user demand and recognizing the growing importance of distributed AI inference infrastructure, we are prioritizing the development of a decentralized AI compute platform leveraging ZK proofs as our go-to-market strategy.

Since this is an existing project, we have been continuously developing the Cyborg parachain since early 2024. However, we have only included features/milestones achieved during the hacking period of this hackathon. Judges can check the main branch of all the repositories mentioned to verify the code timeline.

For this hackathon, our team has focussed on building NeuroZK, a ZK based task verification system, which was built on top of our existing prodcut line called cyberdock, which enabled users to deploy docker images into our network of edge servers.

## Features planned for the Hackathon ( July 11 2024 - Oct 23 2024)
The planned milestone deliveries within the hacking period of this hackathon includes and is not limited to the following:
- [X] Oracle Pallet implementation - for secure and private data exchange between off-chain and on-chain components using ORML Oracle
- [X] Cyborg worker node PoC - A new implementation for launching cyborg nodes with just one click
- [X] Inventory feature in base pallet for efficient handling of connected edge servers
- [X] Payments Pallet - Custom logic for enabling on-chain payments for customers to buy compute hours
- [X] ZK Worker - Offchain SNARK proof generator that generates a ZK proof to verify integrity of the executed ZK Algorithm
- [X] UI Updates for NeuroZK
- [ ] ZK verfier pallet - substrate pallet logic to verify and approve recieved ZK proofs.

## ZK Snark proof verification
For this hackathon, we improvised our existing system with a decentralized proof verification system to incorporate an on-chain ZK Snark system for verifying AI inference models executed in an off-chain environment. The main components will include the Cyborg AppChain (Deployed on Tanssi's Dancebox testnet), Cyborg Worker node (A custom node implementation to manage running offchain tasks and streaming proofs into pallets for verification), TEE Oracle, and a testing suite.

The objective is to deploy a pre trained AI inference model in servers at different geographical locations based on user requirements. The Substrate blockchain will establish secure communication with worker nodes to issue commands for deploying, testing, and verifying model executions.

We have defined a new Substrate node configuration for the Cyborg worker nodes, which users can rent on-demand from the pool of available worker nodes.

## ZK Proof Verification process
Once a task is assigned to a particular worker node and it starts executing the task, at fixed intervals of time (currently arbitrarily set to 60 minutes), the ZK worker component in the worker node will generate a SNARK proof using the PLONK algorithm. We will use an oracle to convey this proof to the verifier pallet, which will evaluate the received proof using the verification key and public data inputs that the user submitted before execution.

The pallet performs a series of elliptic curve operations and field arithmetic (over finite fields) to check the polynomial commitments and evaluations provided in the proof. The commitments must match the expected public inputs and satisfy the polynomial equations set by the PLONK circuit.Permutation arguments and other constraints encoded into the circuit are also validated at this stage. The Pallet checks whether all evaluations and commitments hold for the circuit, using the verification key. If they match, the proof is accepted as valid; otherwise, it is rejected. Once the verification succeeds, the transaction is processed as valid (e.g., approving the computation result). If the verification fails, the transaction is reverted or flagged as invalid.

## UI Snapshots 

<img width="1718" alt="Screenshot 2024-10-22 at 6 40 51 PM" src="https://github.com/user-attachments/assets/0d23287f-eea6-4b11-b4ed-9c5f293108b6">
<img width="1718" alt="Screenshot 2024-10-22 at 6 42 05 PM" src="https://github.com/user-attachments/assets/fed86c7f-6c41-43d0-8bb9-cc05ca057525">
<img width="1718" alt="Screenshot 2024-10-22 at 6 42 20 PM" src="https://github.com/user-attachments/assets/8cecca2a-0bb3-4fca-ba5c-95f55112b359">

## Architecture

![NueroZK-baseline](https://github.com/user-attachments/assets/d7d73cc1-a045-4fab-a7f1-b3affd32e692)

## Schedule

## Team info
| name         | role         | GitHub |
| ----------- | ----------- | -----------  |
|   Barath Kanna |Founder and CEO  |  https://github.com/beekay2706  |
|   Calvin Sze  | Full-stack engineer  |  https://github.com/ZCalz  |
|   Noor Mohammed  | Substrate Rust Dev | https://github.com/noormohammedb |
|   Tom Bleek | Front-end Engineer     |  https://github.com/tom-blk  |
|   Onggo Wahyudi   | Senior systems engineer  |  https://github.com/oWahyudi  |

Approved and completed https://grants.web3.foundation/applications/Cyborg

##  Bounty tracks 
 - [Blockchain for good](https://dorahacks.io/hackathon/polkadot-2024-singapore/bounties-details#blockchain-for-good)

## Material for Demo
1. Demo Video - [Youtube]()
2. PPT google doc - 
3. Devloper Docs - 
4. Code repository
- https://github.com/Cyborg-Network/cyborg-parachain
- https://github.com/Cyborg-Network/cyborg-connect
- https://github.com/Cyborg-Network/cyborg-proxy
- https://github.com/Cyborg-Network/zk-verifier-circom
    
5. Live Demo - [Live App](https://www.demo.cyborgnetwork.io/) 

##  Additional Information

- Cyborg Network was one of the finalists at the last two Oneblock+ hackathons (Polkadot Summer Hackathon 2023 - May 23) & (Polkadot Winter Hackathon - Dec 2023)

- Cyborg Network was a part of the [Polkadot Relayers Incubator 2023](https://www.polkadotglobalseries.com/incubator/) and [Polkadot Encode Accelerator 2023](https://www.encode.club/encode-polkadot-accelerator-2023).

- We won the [web3hackx](https://www.hkweb3month.com/hackathon) Hackathon - Hong Kong (Nov 2023) in the Infrastructure track and Polkadot Bounty.

- Megha Varshini (COO) - represented Cyborg Network at the Finals (Top 7 teams) of the PBA pitch Contest in Hong Kong (Feb 2024)

- Kresna has contributed to the **InvArch's Web3 Foundation Grant** [Milestone 1](https://github.com/w3f/Grant-Milestone-Delivery/blob/7932b07cc38150701ba8ed034723193f66002975/deliveries/InvArch_M1.md) that has been completed successfully. He also contributed to the  [Chocolate Network](https://substrate.io/ecosystem/projects/chocolate/) as a Substrate developer for their Substrate Builder Program (SBP) Milestone 1 delivery which has been completed successfully.

- Cyborg Network has been inducted into the [Polkadot Alpha Builder's Program](https://polkadot.network/development/alpha/) in March 2024.

- In June 2024, we secured 3rd place in the [Polkadot Global Series: North America Hackathon](https://www.polkadotglobalseries.com/north-america/) and 2nd place in the [Polkadot Prodigy Hackathon](https://www.polkadotprodigy.com/) for the Web3 & Tooling track.
