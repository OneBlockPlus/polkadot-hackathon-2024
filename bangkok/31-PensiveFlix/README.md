# PensiveFlix

<img src="./doc/PensiveFlixLogo.jpg" alt="PensiveFlix" style="width: 25%;" />

## What is PensiveFlix

​	**PensiveFlix** is an open-source NFT platform designed to address the needs of paid knowledge sharing and digital rights verification. By leveraging privacy computing technology, it safeguards users' intellectual property within a trusted environment. NFT holders have the authority to manage the ownership of this intellectual property. The platform consists of a blockchain built on Substrate and an application protected by privacy computing technology.

## Problem

​	For convenience and efficiency, many internet users now choose to enhance their knowledge by learning online. As the demand for knowledge continues to grow, intellectual property owners are becoming increasingly aware of the need to protect their knowledge. Against this backdrop, paid knowledge-sharing platforms are becoming more common. However, current platforms for knowledge protection face the following shortcomings:

* 😰**Poor security**: As seekers of knowledge protection services, intellectual property owners are required to unconditionally trust all the terms of centralized knowledge-sharing platforms and upload their content to these platforms. This means that the platform also has absolute control over the knowledge.
* 😰**High costs of copyright protection**: Intellectual property owners often need to pay significant fees for protecting their rights. These costs are typically charged by knowledge-sharing platforms for services like custodial storage and encryption of the owner's content. Additionally, these platforms may impose extra fees on the intellectual property that the owners sell.
* 😰**Unused knowledge cannot be resold**: For users, owning knowledge products that are no longer needed but left idle on a platform is wasteful. They are unable to get a refund or resell the purchased content to others.
* 😰**Numerous and incompatible platforms**: Users have diverse knowledge needs, and for those seeking knowledge from various sources, the existence of numerous knowledge-sharing platforms increases the complexity of obtaining information. Users may need to download multiple applications to access knowledge available across different platforms.

## Introduction

​	PensiveFlix was created specifically for the paid knowledge-sharing sector, offering a new solution for intellectual property protection. It consists of a blockchain built on Substrate (named Gringotts), which supports NFT minting, and a specialized player (PensiveFlix) running within TEE environment.

​	The entire process of paid knowledge-sharing is protected within PensiveFlix, cutting out intermediaries from the transaction. This not only reduces the trust costs for both knowledge owners and consumers but also lowers costs for both parties. Also, unlike other web3 knowledge platforms, PensiveFlix completely blocks the possibility of illegal copying of digital copies of knowledge owners.

​	PensiveFlix integrates the infrastructure capabilities of the Polkadot ecosystem, uses the CESS network to store encrypted user knowledge content, and can use Polkadot's XCM protocol through the Unique network to help the NFT of the entire Polkadot ecosystem.

<img src="./doc/PensiveFlixIntroduce.png" alt="introduce"  />

==================Bounty Application: Unique Network==================

==================Bounty Application: CESS Network==================

## Features planned for the Hackathon

- [x] Users can purchase NFTs through the NFT marketplace and access the encrypted content, such as images, to view them using **PensiveFlix**.
- [x] PensiveFlix supports more format through PAVP technology, such as PDF, Word, Blu-ray movies, and more.
- [ ] PensiveFlix is not limited to standard digital assets; it will support AI model data NFTs. PensiveFlix includes federated learning capabilities, allowing users to train AI models in a trusted environment.

## Architect

​	The structure of the fully functioning PensiveFlix program is as follows:

<img src="./doc/PensiveFlixStructure.png" alt="PensiveFlixArchitect"/>

* **PensiveFlix**: A TEE-protected program

  **Bridge Program**: The bridge program is a backend service that helps PensiveFlix synchronize data such as pallets from the Gringotts chain.

  **Chain RPC (optional)**: Provides on-chain data; it is not necessary to run locally, as other Chain RPC nodes can be used.

​	The system and business processes of PensiveFlix are illustrated in the diagram below:

<img src="./doc/PensiveFlixArchitect.png" alt="PensiveFlixArchitect"/>

* **Overall Business Process**:

  ​	As NFT merchants on PensiveFlix, knowledge owners*(Author Side)* only need to encrypt their content in a trusted local environment provided by PensiveFlix*(step 1)*. Once the knowledge is encrypted, the file can be uploaded to decentralized storage infrastructures like CESS*(step 2)*. During the NFT minting process, the file link and other relevant information are added, then you will completing the intellectual property sale*(step 3)*. Any user can download the encrypted file*(step 5)*, but PensiveFlix only allows NFT holders*(step 4)* to play the encrypted content*(step 6)*. 

  ​	Additionally, from a business perspective, knowledge owners can mint NFTs based on different contracts, leveraging PensiveFlix's capabilities. This means they can define various business logic scenarios, such as whether to allow buyers to resell, implement a "burn after reading" feature, subscription-based columns, and more.

* **System Workflow**:

  ​	PensiveFlix has a globally unique Masterkey, randomly generated within a TEE environment. This key is used as part of the encryption mechanism for users' content and is stored within each instance of PensiveFlix. The Masterkey is protected locally by TEE’s Measure encryption. Measure is a hash calculated by the TEE for the protected program, and because each version of PensiveFlix has different code, the Measure value will vary, ensuring that only PensiveFlix can use the Masterkey. No other entity can access or use the Masterkey. During version updates, the new version inherits operational data securely from the old version using ***"Trusted Channel"*** technology. Additionally, PensiveFlix instances can synchronize Masterkey information with each other using this ***"Trusted Channel"***.

  Developers will publicly release version information by posting the corresponding PensiveFlix Measure on the Gringotts chain's pallet during each version release. A newly launched instance of PensiveFlix can interact securely with the chain using the ***"Trusted Off-chain Message Synchronization Mechanism"***.
  
  When users play content via PensiveFlix, audio and video streams are rendered to the user's playback devices using ***Protected Audio Video Path (PAVP)*** technology. This prevents unauthorized devices from hijacking the audio and video stream content.

### Trusted Off-chain Message Synchronization Mechanism:

<img src="./doc/OffChainMq.png" alt="PensiveFlixArchitect"/>

​	

### Trusted Channel:

​	The Trusted Channel is a secure communication bridge between two PensiveFlix programs, enhanced by the attestation algorithms provided by TEE. This communication method, combined with the Trusted Off-chain Message Synchronization Mechanism, helps both parties verify each other's identity. Once both sides confirm the legitimacy of each other’s identity, they will agree on a symmetric key and use TLS to encrypt the communication content, ensuring that the information is not leaked. Below is the data handover process during a user's version update.

<img src="./doc/TrustedChannel.png" alt="PensiveFlixArchitect"/>

* **Step 1**: The old PensiveFlix generates a challenge using the attestation algorithm. The challenge includes the current block height, timestamp, and a data structure generated by the algorithm.

  **Step 2**: The new PensiveFlix generates a symmetric key and includes it in the algorithm to create a proof. The proof is then returned and contains the Measure value.

  **Step 3**: The old PensiveFlix receives the proof and verifies it, checking whether the Measure value from the new PensiveFlix is correct. If the Measure is correct, the old PensiveFlix encrypts the data using the symmetric key and sends it.



### Protected Audio Video Path(PAVP):

​	PAVP is a set of technologies creating a "Protected Environment,that is used to enforce digital rights management (DRM) protections on content,It provides a "wall" against outside copying,where within the walls,content can be processed without making the content available to unapproved software.

​	For TEE technologies, such as Intel's, there is a system based on HDMI using HDCP (High-bandwidth Digital Content Protection) to safeguard the data within the TEE from being stolen. This is done through an authentication process that secures the entire video transmission channel, preventing unauthorized access or theft of the content.

<img src="./doc/PAVP.png" alt="PensiveFlixArchitect"/>

## Advantages

### Bottleneck Kill

PensiveFlix addresses the following critical pain points in the knowledge payment sector:

* 🥳**It reduces the cost of copyright protection**: while ensuring knowledge dissemination, content owners can earn significant revenue by minting and selling NFTs at a low transaction fee. They can also securely store their encrypted knowledge content on any storage infrastructure of their choice, free from platform constraints.
* 🥳**Strong Security**: Utilizing privacy computing capabilities, PensiveFlix encrypts knowledge content locally, keeping the security of this content on the user's machine without any third party holding the original content.
* 🥳**Flexible Business Model**: NFT merchants can choose their sales model when minting NFTs, including whether allow buyers can resell or lend the NFT, the expiration time of the NFT, and whether it is set to self-destruct after viewing etc.
* 🥳**Simplicity of Use**: Requiring only a Polkadot-based account, NFT merchants can publish their works as easily as posting a video on a social platform, with just one click to mint and list, avoiding the complexities of registration and personal privacy information requirements, along with excessive centralized user agreements.
* 🥳**True Knowledge Preservation**: Knowledge will not be lost but will exist indefinitely. Anyone can download and retain the encrypted knowledge, making PensiveFlix potentially the largest knowledge preservation platform in human history.

### Benefits For Polkadot

​	Knowledge payment is a very popular topic today, with numerous thriving platforms emerging in the industry. As a knowledge payment platform, PensiveFlix:

* 😆Acts as a practical application of a decentralized DApp, promoting traditional internet users' understanding and participation in the Web3 ecosystem.
* 😆Offers significant advantages over traditional knowledge payment platforms, attracting a large number of Web2 users to the Polkadot ecosystem.
* 😆The audience willing to pay for knowledge generally possesses a higher level of education, potentially bringing more talent into the Web3 field and creating new possibilities for Web3.



## Team info

| Name        | Role                         |
| ----------- | ---------------------------- |
| DemosChiang | Product Manager&Full Stack   |
| Billw       | Full Stack                   |
| Liheng Chen | PhD,Privacy computing expert |
| Bolun Zhang | PhD,AI experts               |



## Material for Demo

1. Demo Video [link to Youtube]:Todo
2. PPT [link to google doc]:Todo