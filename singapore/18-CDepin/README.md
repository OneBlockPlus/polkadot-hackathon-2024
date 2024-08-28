# CDepin

## Introduction

CDepin is a decentralized CDN (Content Delivery Network) that aims to monetize the idle storage and bandwidth resources of storage nodes, enabling the acceleration of Web3 data retrieval for users.

![Storage nodes](./doc/storage%20nodes.png)

In decentralized storage networks, storage nodes are distributed globally. However, whether it's Crust, CESS, Filecoin, or others, the utilization rate of their storage resources is mostly less than 60%, and some projects have even not reached 5%. Although storage nodes may be able to earn profits through idle data mining, due to the characteristics of the sealing algorithm, each storage node still has a small amount of disk space that cannot be fully utilized.

On the other hand, due to the limited data volume and location distribution of the gateways, global users face high latency or even inability to use when retrieving data, directly affecting the access experience of the applications. 

Although traditional CDN platforms have advantages such as mature technology and easy-to-use, they need to obtain the complete file from the gateway (origin site) before distribution, making it difficult to utilize the characteristics of decentralized storage networks' distributed data storage to achieve parallel and low-bandwidth content distribution.

CDepin aims to revaluate the wasted storage and bandwidth resources of storage nodes, and leverage the global distribution of storage nodes as well as the characteristics of data sharding and decentralized storage, to build a CDN network dedicated to Web3 storage projects.

!["Comparison with traditional CDN" ](./doc/CDepin-compare.svg)

== **We want to apply for Crust bounty** ==

## Features Planned for the Hackathon

- [ ] Buy CDepin node NFT tokens
- [ ] Register CDepin node
- [ ] Calculate and claim node rewards
- [ ] Accelerate crust network resources such as videos, pictures, and documents


## Architect
CDepin adopts a three-layer architecture. 

The bottom layer is the CDN working protocol layer, composed of the Substrate chain and a smart contract runtime environment, as well as the data source layer consisting of the Web3 storage network. 

The middle layer is the content distribution layer of the CDepin network, which is composed of CDepin nodes, client SDKs, open-source toolchains and components, as well as the smart contracts required for the caching network. 

The top layer is the application layer, consisting of applications that use the CDepin content distribution network.

!["architect"](./doc/architect.svg)

The CDepin smart contracts consist of two parts: the Token contract and the Working Protocol contract. The Token contract is responsible for minting, selling, and transferring the CDepin NFT Tokens. These Tokens serve as the entry barrier for nodes to join the CDepin network, and also play a role in protecting the network's security. 

The Working Protocol contract is primarily used for node registration and exit, the creation and claim of caching orders, as well as the approximate Proof-of-Work mechanism and reward distribution based on the order system. The CDepin network operates based on the business model shown in Figure 4:

!["business model"](./doc/business%20model.svg)

CDepin has abandoned the complex scheduling mechanism dependent on the network itself, and instead focuses solely on peer-to-peer data distribution. It focuses on the process of data sharding from source to destination, while the application terminals integrated with the CDepin client SDK independently decide what data is needed, which nodes to select for acceleration, and how to process the received data. The working principle of CDepin is shown in Figure 5:

!["how it works"](./doc/how%20it%20to%20work.svg)

The absence of scheduling means the users have full control over how they utilize CDepin, so it is not limited by the type of data or platform. CDepin also does not intervene in the data content that users want to distribute. Node earnings will not be affected by uneven scheduling algorithm allocation, but will be entirely determined by the market. 

These gives CDepin the characteristic of local resource pooling, where any caller who can establish a stable connection with the nodes can simultaneously receive service from them, breaking the resource limitations of a single node. CDepin has also established a resource sharing mechanism to help data resources be better distributed from storage nodes to target terminals.

CDepin will also provide a set of pluggable components for developers to quickly build their own applications, and the project is completely open-source, encouraging more developers to participate in ecosystem building.

## Schedule


## Team Info

| Name     |	Role |
| ---- | ---- |
| ValorXu  |	Full Stack |Developer |
| AndyZou  |	Product Manager |
| YeouLiu  |	Contract Developer |
| ToneyDai |	Full Stack Developer |

## Material for Demo

1. Demo Video [CDepin Demo Video](https://youtu.be/uq2Ugu3csPw)
2.  PPT [CDepin PPT](https://docs.google.com/presentation/d/1yIs7GULx2xirMtBoaKYrs_QemGUXWu99YZpm6wrIeeA/edit?usp=sharing)