# PensiveFlix

<img src="./doc/PensiveFlixLogo.jpg" alt="PensiveFlix" style="width: 25%;" />

## What is PensiveFlix

​	**PensiveFlix** is an open-source decentralized digital asset protection tools designed to address the current NFT market's inability to effectively protect users' digital assets. It leverages TEE (Trusted Execution Environment) technology to create an encryption and decryption mechanism within a trusted environment to safeguard users' digital assets. The platform consists of a blockchain built on Substrate and applications protected by TEE technology.

## Problem

​	As the NFT market and technology continue to develop, and as users' awareness of intellectual property rights continues to grow,more and more content creators are benefiting from their creations through NFT-based platforms. However, the current NFT-based projects faces the following problems:

* 😰**Poor Security**: Content creators need to send their digital assets to third-party platforms, where these platforms host the content. This poses a significant security risk to the digital assets of content creators.
* 😰**Piracy Issues**: Although NFT technology offers protection in terms of ownership and transaction transparency, problems such as piracy and plagiarism still persist. Digital copies of works can still be freely copied or shared on other non-blockchain platforms.
* 😰**Incomplete Decentralization**: Some NFT-based platforms cannot achieve full decentralization in the true sense. They still rely on certain centralized services to perform certain operations in order to control user behavior and implement complex functionalities.
* 😰**Overwhelming**: There are too many projects,The variety of features and platforms in different NFT-based projects can be overwhelming for users, requiring them to spend significant time on browsing and reading. They also need to remain cautious of data leaks or phishing attacks.

## Introduction

​	PensiveFlix is a security tool designed to support the NFT market, offering a new solution for intellectual property protection. It consists of a blockchain built on Substrate that supports NFT minting (called Gringotts) and a specialized player (PensiveFlix) that operates within a TEE environment.

​	PensiveFlix leverages its TEE technology to comprehensively protect the entire process of NFTs, from minting to usage, through its security features, preventing the possibility of users' digital assets being illegally copied or misused. Additionally, the tamper-proof nature of TEE regulates the behavior of content creators (hereafter referred to as "creators") and buyers (hereafter referred to as "customers"), ensuring that end users faithfully execute the corresponding business logic. Numerous NFT-based projects can develop on PensiveFlix to gain decentralized capabilities.

​	PensiveFlix integrates the infrastructure capabilities of the Polkadot ecosystem, uses the CESS network to store encrypted user digital assets, and can use Polkadot's XCM protocol through the Unique network to help the NFT of the entire Polkadot ecosystem.

<img src="./doc/PensiveFlixIntroduce.png" alt="introduce"  />

==================Bounty Application: Unique Network==================

==================Bounty Application: CESS Network==================

## Features planned for the Hackathon

- [x] Author use PensiveFlix to encrypt files and mint NFTs, while users purchase and use the NFTs.
- [ ] PensiveFlix supports more format through PAVP technology, such as PDF, Word, Blu-ray movies, and more.
- [ ] PensiveFlix supports other NFT platforms to develop applications on top of it, enabling more innovative use cases in the NFT space.

## Architect

​	The structure of the fully functioning PensiveFlix program is as follows:

<img src="./doc/PensiveFlixStructure.png" alt="PensiveFlixArchitect"/>

* **[PensiveFlix](./src/chain/standalone/teeworker/pflix/src/main.rs)**: A TEE-protected program
* **[Bridge Program](./src/chain/standalone/teeworker/enfrost/src/main.rs)**: The bridge program is a backend service that helps PensiveFlix synchronize data such as pallets from the Gringotts chain.
* **Chain RPC (optional)**: Provides on-chain data; it is not necessary to run locally, as other Chain RPC nodes can be used.

​	Taking a typical NFT marketplace built on PensiveFlix as an example, the system and business processes are shown in the following diagram:

<img src="./doc/PensiveFlixArchitect.png" alt="PensiveFlixArchitect"/>

* **Overall Business Process**:

  ​	As NFT seller on PensiveFlix, content creator*(Author Side)* only need to encrypt their content in a trusted local environment provided by PensiveFlix*(step 1)*. Once the knowledge is encrypted, the file can be uploaded to decentralized storage infrastructures like CESS*(step 2)*. During the NFT minting process, the file link and other relevant information are added, then you will completing the intellectual property sale*(step 3)*. Any user can download the encrypted file*(step 5)*, but PensiveFlix only allows NFT holders*(step 4)* to play the encrypted content*(step 6)*. 

  ​	Additionally, from a business perspective, content creator can mint NFTs based on different contracts, leveraging PensiveFlix's capabilities. This means they can define various business logic scenarios, such as whether to allow buyers to resell, implement a "burn after reading" feature, subscription-based columns, and more.

* **System Workflow**:

  ​	PensiveFlix has a globally unique Masterkey, randomly generated within a TEE environment. This key is used as part of the encryption mechanism for users' content and is stored within each instance of PensiveFlix. The Masterkey is [protected locally by TEE’s Measure encryption](./src/chain/standalone/teeworker/pflix/gramine-build/ceseal.manifest.template#L48). Measure is a hash calculated by the TEE for the protected program, and because each version of PensiveFlix has different code, the Measure value will vary, ensuring that only PensiveFlix can use the Masterkey. No other entity can access or use the Masterkey. During version updates, the new version [inherits operational data securely](./src/chain/standalone/teeworker/handover/src/main.rs#L90) from the old version using ***"Trusted Channel"*** technology. Additionally, PensiveFlix instances can [synchronize Masterkey](./src/chain/pallets/tee-worker/src/lib.rs#L609) information with each other using this ***"Trusted Channel"***.

  Developers will publicly release version information by posting the corresponding PensiveFlix Measure on the Gringotts chain's pallet during each version release. A newly launched instance of PensiveFlix can interact securely with the chain using the ***"Trusted Off-chain Message Synchronization Mechanism"***.
  
  When users play content via PensiveFlix, audio and video streams are rendered to the user's playback devices using ***Protected Audio Video Path (PAVP)*** technology. This prevents unauthorized devices from hijacking the audio and video stream content.

### [Trusted Off-chain Message Synchronization Mechanism](./src/chain/crates/pfx/src/pflix_service.rs#L636):

**Motivation:**

In general, when using architectures that combine TEE (Trusted Execution Environment) and blockchain, the TEE is typically used as an off-chain worker. This is because off-chain workers are outside the security consensus of the blockchain, requiring a separate trusted security mechanism. Among these mechanisms, using TEE technology is a relatively feasible solution. However, in the process of design and practical application, ensuring that the input to the TEE is secure, trustworthy, and simple to handle remains a significant challenge.
<img src="./doc/OffChainMq.png" alt="PensiveFlixArchitect"/>

**​How:**

We have participated in some industry designs, adopting a solution in the TEE similar to a blockchain light client. In the current design, PensiveFlix does not interact directly with the blockchain within the TEE environment. Instead, it uses a bridge to synchronize block data to it. In this way, PensiveFlix does not rely directly on external inputs but uses a bridge running internally on the same machine. However, the astute reader might ask: Does this ensure security and trustworthiness? If that were the case, it would be akin to "covering one's ears while stealing a bell." In reality, for PensiveFlix to function, it inevitably has to interact with external sources. Ensuring security and trustworthiness cannot rely on specific inputs but must depend on secure and trustworthy algorithms.

Specifically, PensiveFlix uses Polkadot's GRANDPA algorithm [internally to verify and synchronize blocks](./src/chain/crates/pfx/src/light_validation/mod.rs). On top of that, it has designed a mechanism for interaction between PensiveFlix blockchain nodes and PensiveFlix TEE nodes, referred to as [PFLX-MQ](./src/chain/pallets/mq/src/lib.rs). PFLX-MQ can be roughly divided into two parts: an on-chain message-handling pallet and an off-chain message processor. Physically, PFLX-MQ does not require an additional connection, instead utilizing the connection established for block data synchronization. Logically, PFLX-MQ uses a customized topic messaging mechanism to [publish](./src/chain/pallets/mq/src/lib.rs#L166) and [subscribe](./src/chain/pallets/mq/src/lib.rs#L155) to messages.

### [Trusted Channel](./src/chain/standalone/teeworker/pflix/src/handover.rs#L10):

​	The Trusted Channel is a secure communication bridge between two PensiveFlix programs, enhanced by the attestation algorithms provided by TEE. This communication method, combined with the Trusted Off-chain Message Synchronization Mechanism, helps both parties verify each other's identity. Once both sides confirm the legitimacy of each other’s identity, they will agree on a symmetric key and use TLS to encrypt the communication content, ensuring that the information is not leaked. Below is the data handover process during a user's version update.

<img src="./doc/TrustedChannel.png" alt="PensiveFlixArchitect"/>

* **Step 1**: The old PensiveFlix generates a challenge using the attestation algorithm. The challenge includes the current block height, timestamp, and a data structure generated by the algorithm.
* **Step 2**: The new PensiveFlix generates a symmetric key and includes it in the algorithm to create a proof. The proof is then returned and contains the Measure value.
* **Step 3**: The old PensiveFlix receives the proof and verifies it, checking whether the Measure value from the new PensiveFlix is correct. If the Measure is correct, the old PensiveFlix encrypts the data using the symmetric key and sends it.



### Protected Audio Video Path(PAVP):

​	PAVP is a set of technologies creating a "Protected Environment,that is used to enforce digital rights management (DRM) protections on content,It provides a "wall" against outside copying,where within the walls,content can be processed without making the content available to unapproved software.

​	For TEE technologies, such as Intel's, there is a system based on HDMI using HDCP (High-bandwidth Digital Content Protection) to safeguard the data within the TEE from being stolen. This is done through an authentication process that secures the entire video transmission channel, preventing unauthorized access or theft of the content.

<img src="./doc/PAVP.png" alt="PensiveFlixArchitect"/>

## Advantages

### Bottleneck Kill

PensiveFlix addresses the following critical pain points in the NFT space:

* 🥳**Prevention of Piracy**: Since user behavior is regulated by PensiveFlix, users are unable to pirate or plagiarize digital assets.
* 🥳**Low Credit Cost**: The encryption of digital assets by creators occurs securely and reliably on their local devices, preventing the possibility of digital asset leakage.
* 🥳**Fully Decentralized**: With a decentralized design, users' digital assets and operations occur securely on their local devices without relying on external centralized services.
* 🥳**Simplified Process**: As a security tool, PensiveFlix supports other NFT projects to develop on its foundation, allowing them to implement the required complex business logic without relying on centralized services. For users, only one tool is needed to enjoy the benefits brought by NFT technology.

### Why Polkadot

​	PensiveFlix thrives within the Polkadot ecosystem, complementing each other perfectly:

* 😆As a tool, PensiveFlix aims to have greater adaptability to support more on-chain NFT assets, and Polkadot, with its strong cross-chain capabilities, is a perfect fit for this.
* 😆The integrated design and development philosophy enhances security while simplifying usage, attracting more Web2 and Web3 users to enter the Polkadot ecosystem.
* 😆It promotes the development of Polkadot infrastructure projects.For example, CESS network, unique network.



## Team info

| Name        | Role                         |
| ----------- | ---------------------------- |
| DemosChiang | Product Manager&Full Stack   |
| Billw       | Full Stack                   |
| Liheng Chen | PhD,Privacy Computing Expert |
| Bolun Zhang | PhD,AI Experts               |



## Material for Demo

1. Demo Video [link to Youtube](https://youtu.be/5x5vzuhJtls)
2. PPT [link to google doc](https://docs.google.com/presentation/d/1uGR_dN6oBdwS-_YRtmtUWsYlamCAswxNF2SCqUYljZ8/edit?usp=sharing)
