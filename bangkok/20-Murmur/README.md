# Murmur

Murmur is a protocol that enables keyless crypto wallets, powered by timelock encryption. Our submission showcases the creation and implementation of the murmur protocol, introducing a novel solution for account abstraction for Substrate-based chains.

**Team Name**: [Ideal Labs](https://idealabs.network)
**Category 1**:(Infrastructure) Polkadot ecological developer tools
**Development Start**: September, 2024

## Introduction

**Murmur** is a keyless crypto wallet protocol powered by the [Ideal Network](https://docs.idealabs.network/docs/intro) (IDN). Our protocol, inspired by [Hours of Horus](https://eprint.iacr.org/2021/715), uses [timelock encryption](https://docs.idealabs.network/docs/learn/crypto/timelock_encryption) and secure time-based [one-time password](https://www.techtarget.com/searchsecurity/definition/one-time-password-OTP) (OTP) generation, murmur allows users to create and execute secure crypto wallets with no mnemonic or secret key - it is a truly keyless wallet solution. The protocol is designed to be versatile and can be used in a myriad of ways, from a terminal to twitch chats.

Murmur wallets can be accessed seamlessly across web-enabled devices, providing a frictionless plug-and-play solution for app developers to integrate web3 capabilities into applications and services without any additional infrastructure or overhead. Murmur wallets can be used by installing a standalone wallet client or by using our HTTP API, which allows you to easily create in-app wallets with seamless interoperability across browsers and other HTTP clients.

We envision this protocol as having the potential to enable new ways to interact with crypto wallets by furthering account abstraction capabilities. For example, it could be an effective mechanism to onboard web2 users to web3 platforms by providing them a secure and seamless experience. 

### How Murmur is different

Crypto wallets and account abstraction come in a myriad of flavors, custodial, non-custodial, MPC, and various other "wallet-as-a-service" solutions. Murmur offers a distinct alternative to traditional MPC wallets.  Murmur can be considered as a type of MPC wallet since it relies on the Ideal Network's beacon protocol (an MPC protocol, read more [here](https://docs.idealabs.network/docs/learn/etf-pfg)). Normally, MPC wallets require wallet providers to issue threshold signatures on command. This can present several challenges, such as:

- *Scalability issues*: More users means more requests for signatures and more load on the network
- *Increased Costs*: Users can encounter significant fees for higher security, effectively adding a  paywall to wallet security

Murmur sidesteps these disadvantages by relying on the Ideal Network's randomness beacon to produce decryption keys for future OTP codes. Rather than producing threshold signatures on-demand, threshold signatures are produced with each block finalized by the IDN. This results in a highly scalable, cost-efficient, and decentralized wallet solution, where more users does not correlate with added computational overhead.

**Key Features**

- **Truly Keyless Wallet**: No mnemonic or key management required.
- **No Wallet Provider**: No reliance on a third-party provider for wallet access.
- **Infinitely Scalable**: The Murmur protocol is designed to scale without increased computational or financial overhead, limited only by the underlying blockchain.
- **Non-Custodial**: Users retain complete control of their wallets at all times. Even when opting for the convenience of HTTP-API-based access, only the heavy computational tasks are outsourced, ensuring full ownership remains with the user.
- **Secure Against Key Extraction Attacks**: Unlike some threshold ECDSA approaches, Murmur uses threshold BLS signatures and is resistant to key extraction vulnerabilities (e.g. [research by zengo](https://eprint.iacr.org/2021/1621.pdf)).

### How it Works

> For more in-depth technical details, visit our documentation at: https://murmur.idealabs.network.

A murmur wallet is a modified pure proxy set to have no delegate - meaning any origin can attempt to use the proxy. This type of proxy, which we call a murmur proxy, is the key to enabling seamless cross-platform account abstraction. Murmur proxies are created with a given unique name and self-reported root and size of a Merkle mountain range whose leaves are timelock encrypted OTP codes. Instead of relying on signature verification to determine if a call can be proxied, a murmur wallet requires: successful timelock decryption, a valid merkle proof, and a commitment to the OTP code and the call to be proxied. The idea is that valid OTP codes must be supplied on a just in time basis, where a prover (the caller) attempts to convince a verifier (the runtime) that they had knowledge of the OTP code before it could have been decrypted and without revealing it. It is important to note that end users do not observe and input generated OTP codes into an application as in standard OTP-based authentication, the handling of OTP codes is "invisible" to the end user.

**Create a wallet**

The general idea is that OTP codes are generated for future blocks and lock them with timelock encryption for each respective block. They are then organized into a Merkle mountain range which can be publicly stored. The user then submits an extrinsic to create a new wallet, specifying a unique name, root, and MMR size. The call can be sent from any origin (e.g. an ephemeral keypair built with a light client such as Substrate-connect). For formal proofs, we invite the reader to investigate the Hours of Horus paper mentioned above.


![create](https://murmur.idealabs.network/assets/images/murmur_create.drawio-261bfcd4b0582116262edcbb4cad0348.png)

**Execute Balance Transfer**

Execution of calls from a Murmur wallet requires that a user constructs a valid Merkle proof and commitment and provides the data to the chain 'just in time'. The IDN, which acquires fresh randomness with each finalized block, will attempt to use the latest known signature to decrypt the provided ciphertext. If it cannot be decrypted, then the protocol is aborted. Otherwise, the plaintext is used to verify the commitment, which should be the hash of the OTP code concatenated with the call to be proxied. If the Merkle proof is also valid, then the runtime is convinced that the caller knew the OTP code before it could have been decrypted and that it is a leaf within the MMR. When convinced of the validity, the runtime allows the proxy to execute the call.

![execute](https://murmur.idealabs.network/assets/images/murmur_execute.drawio-ced44d8bc4501617677fb962d590a71d.png)

**Limitations & Future Work**

Since the scope of this hackathon submission is limited, we want to briefly discuss the known issues and limitations with our current deliverable.

- In this initial PoC we require that all transactions are signed at some point, which requires Murmur wallet users to rely on some origin to sign their transactions on their behalf. While this does create the opportunity to introduce a [paymaster scheme](https://www.stackup.sh/blog/what-are-paymasters), we understand that this rigidity is a limitation and have already researched several mechanisms, such as relying on ephemeral light client or allowing unsigned origins. We have included this in future work for the protocol. 
- Murmur wallets are inherently ephemeral. We currently have not implemented any *update* functionality, meaning that in its current state all Murmur wallets expire at some point. We will address this in the near future.
- Murmur wallets are not recoverable currently. If the user loses their username/seed then they have effectively lost access to their wallet. We also have this scoped as a future enahncement of the protocol.
- There has been no formal security audit of the IDN or Murmur.
- Murmur wallets only work on the IDN solochain for the time being. In the near future we will deploy the network as a parachain and explore ways to make Murmur wallets easily usable in a cross-chain capacity.

## Features Planned for the Hackathon

All work completed as part of this hackathon was tracked [here](https://github.com/orgs/ideal-lab5/projects/8) (must request permission to view).

> Note: The features planned deviated from the original submission to final submission, where we expanded our plan to be more ambitious.

At a high level, the goal of our project is to deliver an MVP of our 'murmur' protocol both as a standalone CLI as well as provide easy-to-use web integrations. Features include:

- Develop a set of Substrate pallets to construct, verify, and execute Murmur wallets (proxies)
- Develop a standalone library to implement the Murmur protocol
- Implement a "thin" and permissionless API to outsource computation
- Build a Javascript wrapper around the API to allow easy usage from Javascript-based webapps

### Repositories 

We have opted to use external repos rather than adding the code directly to the hackathon submission repo. Apart from some items in the [pallets]() repo, all work completed was done as part of this hackathon.

- [murmur - Polkadot Hackathon 2024](https://github.com/ideal-lab5/murmur/tree/polkadot-hackathon-2024)
    - We did an initial PoC of this idea ~6 months ago, but with very limited functionality and no testing. This is encapsulated in the first *two* commits to the repo made last March. The code prior to the hackathon consisted of building of OTP codes and MMRs, but with no great functionality, structure, or optimizations. Reviewers can inspect the repo state pre-hackathon participation by inspecting the history here: https://github.com/ideal-lab5/murmur/commits/polkadot-hackathon-2024/?after=49f9d1e97c2d1b40dd88295c8cf4231cb408a2f3+69. Only work completed after commit hash 9444bb070caff547b518cfc5decc7aa43ee06d72 should be considered for judging. 
- [murmur-dapp - Polkadot Hackathon 2024](https://github.com/ideal-lab5/murmur-dapp/tree/polkadot-hackathon-2024)
- [murmur-api - Polkadot Hackathon 2024](https://github.com/ideal-lab5/murmur-api/tree/polkadot-hackathon-2024)
- [murmur.js - Polkadot Hackathon 2024](https://github.com/ideal-lab5/murmur.js/tree/polkadot-hackathon-2024)
- Pallets:
    - [murmur pallet - Polkadot Hackathon 2024](https://github.com/ideal-lab5/pallets/tree/polkadot-hackathon-2024/pallets/murmur)
    - [modified proxy pallet - Polkadot Hackathon 2024](https://github.com/ideal-lab5/pallets/tree/polkadot-hackathon-2024/pallets/proxy)
- [murmur-bots - Polkadot Hackathon 2024](https://github.com/ideal-lab5/murmur-bots/tree/polkadot-hackathon-2024)

### Components 

The Murmur protocol is intended to be flexible and can be implemented in a variety of ways to fit the context. In this section we detail the various components and discuss how they connect to one another.

![components](https://murmur.idealabs.network/assets/images/murmur_stack.drawio-e5c20247f27d24307e4be17aab544159.png)

#### The Ideal Network
Briefly, we provide some background on the Ideal Network. This work should not be considered for judgement within the hackathon. *It is prior work on which the Murmur protocol builds*.

The Ideal Network (IDN) is a Substrate-based blockchain that enables **publicly verifiable on-chain randomness** and **timelock encryption** for substrate based chains. Judges should note that this is **not** part of our submission, though it plays an integral part in enabling our solution. Developed in conjunction with the web3 foundation (via the Decentralized Futures program), Ideal Labs has been engaged in development of the Ideal Network as a substrate-native, trustless, unbiased, and interoperable randomness beacon. To clarify, timelock encryption is a cryptographic mechanism that allows any length messages to be encrypted for future blocks in consensus (where the output of the randomness beacon acts as the decryption key). 

**Rust Compatibility**

The murmur-core library, and it's corresponding murmur-lib implementation (using BLS377 with type III pairings), allow for the solution to easily be used in rust. The release build of this library is able to handle the generation and encryption of 1000 OTPs in under 4 seconds.

**Javascript Compatibility**

The murmur.js library allows for Murmur to be used in javascript. Presently, this functions as an HTTP connector to the murmur-api, though in the future we will investigate javascript binding rather than relying on the API.

The visualization below depicts dependencies and flow of data of each component of Murmur's architecture.

![arch](https://murmur.idealabs.network/assets/images/murmur_connections.drawio(1)-4783283a08a2398947a580adf3b5e2a1.png)

[murmur-core](https://github.com/ideal-lab5/murmur/tree/polkadot-hackathon-2024/core)
The basis of the murmur "stack" is the murmur-core crate, which encapsulates the logic for constructing and proving things about the MMR data required for murmur wallets.

[murmur-lib](https://github.com/ideal-lab5/murmur/tree/polkadot-hackathon-2024/lib)

This is an implementation of the murmur protocol over BLS377 using type III pairings.

[murmur-api](https://github.com/ideal-lab5/murmur-api/tree/polkadot-hackathon-2024)

The murmur-api is a Rust-based web service designed to facilitate the use of murmur-lib. It is an HTTP API with an open-read database, allowing users to export MMR data and maintain full control over their Murmur wallets. This API primarily serves as a convenience to externalize OTP code generation and ensure adequate entropy when constructing seeds for OTP codes. In the future, we aim to deprecate this component.

[murmur.js](https://github.com/ideal-lab5/murmur.js/tree/polkadot-hackathon-2024)

This is an HTTP connector to the murmur-api. It encapsulates communication with the API as a javascript-based wrapper, facilitating creation, inspection, and execution of Murmur wallets. It relies on axios and polkadot.js to communicate the the murmur-api and the IDN, respectively.

### Pallets 

> IMPORTANT: Pertaining to participation in Polkadot 2024 Hackathon | Bangkok, the core consensus modules of the Ideal Network and the Randomness Beacon pallet should not be considered for evaluation, as it was developed outside the scope of this hackathon.

The Murmur pallet is the core pallet that enables Murmur wallets. Specifically, it takes the role of a 'prover' in the Murmur protocol, where it is responsible for registering uniquely named Murmur proxies and acting as an extension to the proxy pallet, where it verifies execution parameters prior to dispatching them. Specifically, this works with our modified Proxy pallet, which allows virtually uncallable proxies to be defined with no delegate. This proxy type can only be used via the Murmur pallet's proxy extrinsic, which requires valid proof of future OTP codes.

![new-pallets](https://murmur.idealabs.network/assets/images/murmur_pallets.drawio-299ac7dc90339ba68cd6f046d89b5366.png)

- [murmur pallet - Polkadot Hackathon 2024](https://github.com/ideal-lab5/pallets/tree/polkadot-hackathon-2024/pallets/murmur)
- [modified proxy pallet - Polkadot Hackathon 2024](https://github.com/ideal-lab5/pallets/tree/polkadot-hackathon-2024/pallets/proxy)

## Examples

**Rust**
- [murmur-cli](https://github.com/ideal-lab5/murmur/blob/polkadot-hackathon-2024/lib/src/bin/murmur/main.rs): a terminal-based way to use Murmur as a standalone client.

**Javascript**
The murmur.js library can be used in various javascript based contexts. For example, the murmur-dapp is a next.js application that demonstrates usage the library in a browser-based context, while the murmur-bots functions in a node.js environment. It includes bots that allow server/chat specific Discord and Twitch bots to be created.
- [murmur-dapp](https://github.com/ideal-lab5/murmur-dapp/tree/polkadot-hackathon-2024): A basic dapp to create Murmur wallets and execute balance transfers. It demonstrates the simplicity of integrating Murmur into a webapp (see: [browser integration guide](https://murmur.idealabs.network/docs/quick_start/browser)).
- [discord bot](https://murmur.idealabs.network/docs/quick_start/discord): A Discord bot that handles dispatches discord messages as calls to the Murmur API and the Ideal Network, allowing server-specific, in-app wallets to be created and used from Discord.
- [twitch bot](https://murmur.idealabs.network/docs/quick_start/twitch): A Twith bot that handles dispatches Twitch chat messages as calls to the Murmur API and the Ideal Network, allowing stream-specific, in-app wallets to be created and used from Twitch chat.



## Schedule

All work completed as part of this hackathon was tracked [here](https://github.com/orgs/ideal-lab5/projects/8) (request permission to view).

## Team Info

| Name| Description | Github | LinkedIn |
|---|---|---|---|
|Tony Riemer| Lead protocol engineer, Math at University of Wisconsin, Former S.E. Fannie Mae & Capital One, PBA Alumni | https://github.com/driemworks | https://www.linkedin.com/in/tony-riemer/ |
| Carlos Montoya | Serialial Entrepreneur, 4x CTO with exit, M.S. Information Technology, Carnegie Mellon, PBA Alumni | https://github.com/carloskiron | https://www.linkedin.com/in/cmonvel/ |
| Coleman Irby | 10+ years software engineering experience, B.S. Electrical Engineering from University of Mississippi, Physics graduate student at Univ. of Mississipp | https://github.com/colemanirby | https://www.linkedin.com/in/coleman-irby-229b13103/ |
| Juan Girini | 10+ years leading engineering teams, Former core engineer at Parity, B.S. Information Systems Engineering, UTN, PBA Alumni | https://github.com/juangirini | https://www.linkedin.com/in/juan-girini/ |

## Material for Demo

1. Demo Video
 - [Part 1 - Overview](https://youtu.be/kWeHdbYi8ps) - A brief video to explain the demo and the protocol. This is not the demo itself and it *does* exceed 6 minutes.
 - [Part 2 - Live Demo](https://www.youtube.com/watch?v=MNTS5NZ7aTk)
2. [Slideshow](https://docs.google.com/presentation/d/1DBJlYNwL7BI1K97rqthsp-LTVJiR4GC05XK6pIfeWQ8/edit?usp=sharing)
