# Project zkLogin
## basic information
- Project name: zkLogin
- Project Start Date (month and year): September 2024
##  Demo Video
Link: https://youtu.be/PLHt-VaENNM

## Deck
Link: [Deck Link](./doc/zkLoginDeck.pdf)

## Logo
![image](https://hackmd.io/_uploads/B1XsWBSeJg.png)

## Background
> This project has not participated in any other hackathons, has not applied for any Web3 Foundation Grant, and has not received any funding.

- Traditional EOA wallets are controlled by a single private key, meaning that the user must carefully safeguard their mnemonic phrase and private keys, or they could face serious security issues.
- And, traditional EOAs are not user-friendly for typical Web2 users. They have to learn extra cryptographic concepts related to blockchain, and they must carefully consider every situation where they use their private key. This will increasesthe learning curve for web2 users to use Blockchain.
- Account Abstraction (AA) is an innovative concept introduced to address the challenges associated with managing cryptographic keys on a blockchain.`AA` aims to simplify the user experience (UX) in Web3 applications, allowing users to interact with the system without needing to worry about every blockchain things.And bring them with a familiar and user-friendly interface.
- Chains like `TON` and `STARKNET` have already integrated AA natively at the architectural level, providing seamless support.In contrast, the `Ethereum` ecosystem has explored various approaches to improve account management, including `Social Logins`, `Passkeys`, and `Email Logins`. These efforts have yielded significant results, with millions of users onboarded and substantial progress in AA implementation. 
![AA-related statistics](https://hackmd.io/_uploads/S1Uhpvm1Jg.png)
The adoption is now showing exponential growth in both transaction volume and user base, demonstrating the potential of AA in driving Web3's next phase of expansion.
> For more statistics about AA, please check [here](https://dune.com/sixdegree/account-abstraction-overview)
> 
![Growth of the user base](https://hackmd.io/_uploads/BkDX0w7yJe.png)

However, the development of AA in the Polkadot is still lagging behind.


## Introduction
![Sign In With Google](https://hackmd.io/_uploads/Bk1_hHBxJx.png)

The zkLogin project aims to simplify the user interact experience, enable large-scale onboarding of Web2 users, create a decentralized and privacy-preserving authentication system using zero-knowledge proofs (zk). Traditional authentication systems often require users to remember complex private keys or mnemonic phrases. zkLogin leverages zero-knowledge tools to enable users to prove their identity without revealing any sensitive information, ensuring both security and privacy.

zkLogin provides the ability for Users to send transactions from a Polkadot address using an OAuth credential, without publicly linking the two.

This is one of the simplest ways to onboard Users onto the blockchain. zkLogin allows users to log in to Web3 applications using existing Web2 Authentication Providers like `Google`, eliminating the need for users to remember or record private keys.

zkLogin provides great convenience for end users without compromising security. It connects the responses from Web2 Authentication Providers to specific Polkadot accounts using ephemeral keypairs and zero-knowledge cryptography. When using zkLogin, the only data submitted to the blockchain is the zero-knowledge proof, a temporary signature and some auxiliary data, eliminating the need to submit any user information to the blockchain. Additionally, Web2 Authentication Providers are unaware that users are using the blockchain, ensuring privacy.

##  Performance Comparison With EOAs


| Comparative Angle | zkLogin | EOAs |
| -------- | -------- | -------- |
| Privacy Protection | Utilizes **zero-knowledge proofs** to authenticate users **without revealing any sensitive information**, such as passwords or private keys. This ensures that users’ identities and personal data remain private during the authentication process. | Relies on public/private key pairs for identity verification. While the public key is visible on the blockchain, the private key must be kept secret. If a user's private key is exposed, their account and assets can be compromised. |
| Security Against Attacks | Designed to be resilient **against replay attacks** and **social engineering** attempts. Since it does not require sensitive information to be shared, attackers cannot easily exploit user credentials, even if they intercept authentication data. | Vulnerable to various attacks, including phishing and key exposure. If an attacker gains access to a user's private key, they can fully control the associated account and assets. Users must manage their private keys carefully to mitigate risks. |
| Under what circumstances will the account be compromised | Before the `expiration time`, the user **simultaneously** loses the `temporary private key`, `JWT Token`, and `salt` | Loss of private key or mnemonic phrase |
| User Experience | Offers a **passwordless login** experience, simplifying the authentication process. Users do not need to remember complex passwords, which enhances convenience and reduces the risk of password-related security breaches. | Users are responsible for managing their private keys and recovery phrases, which can be cumbersome. Mismanagement or loss of these keys can lead to irreversible loss of access to funds. |
| Scalability | Facilitates shared authentication **across multiple applications**. This means users can authenticate with various services without repeatedly entering sensitive information, streamlining the overall user experience. | Typically requires separate authentication for each service, increasing management complexity. Users must handle multiple keys, which can be challenging to maintain securely. |


## Technology Architecture
![Brief Workflow](https://hackmd.io/_uploads/r1vIzTQJkx.png)

> For more technical details, please check the [zkLogin_zh_CN](./doc/zkLogin_zh_CN.md), or [zkLogin_en_US](./doc/zkLogin_en_US.md)


## How can zkLogin benefits Polkadot
**1. Seamless integration of Relaychains & Parachains**

zkLogin works as a runtime pallet, allowing any relaychain or parachain to directly interact with zkLogin by simply adding this runtime pallet.

**2. Fully compatible with polkadot{.js}**

The construction of zkLogin tx bodies is identical to the native Polkadot tx bodies.This is very friendly to existing tools, because they(such as polkadot{.js}) do not require any modifications.

**3. Enhance Privacy and Security in the Polkadot Ecosystem**

The zkLogin solution, built upon zero-knowledge proofs, offers users a height level of privacy and security. User authentication information is not required to be stored in plaintext on the blockchain, which safeguard their privacy.

**4. Bring Mass Adoption For Polkadot Ecosystem**

The introduction of zkLogin significantly enhances the accessibility and lowers the entry barriers for users engaging with Polkadot and its parachains. Users can easily and securely manage their authentication information, enhancing the overall user experience.

And zkLogin also reduces the development complexity for DApp developers, allowing any project to quickly integrate zkLogin and attract a large number of Web2 users.

**5. Address the lack of 'zero-knowledge technology' and 'account abstraction' applications**

Currently, the Polkadot ecosystem lacks specific use cases that leverage 'zero-knowledge technology' and 'account abstraction (AA) technology'.


## Things planned to be done during the hackathon

Blockchain:
- [Runtime Pallet](./src/zkLogin(substrate)/)
    - [x] zkLogin Runtime Pallet: work as a runtime pallet, handling zkLogin transactions, allowing to be added to relaychain or parachains. 
    - [x] zkLogin primitives: providing fundamental functions like zkProof Decode, and zkProof verification.


Wallet:
- [Chrome Extension(`Kless`)](./src/Kless(wallet)/)
    - [x] User Identity Authentication: connect to a Web2 OAuth provider(`Google`) to provide user authentication verification.
    - [x] Multiple zkLogin accounts management: enable users to control unlimted zkLogin addresses with one Google account
    - [x] zkProof Generation : to unlock and manage User accounts, process `Google JWT` and user privacy information into zkProofs.
    - [x] zkLogin-compatible transactions construction: constructing zkLogin-compatible extrinsic with the calldata received from dapp
    - [x] zkLogin Account Activity Monitor: provide real-time supervision of user account details.
    - [x] Customize zkProof expiration date: enable users to enhance the security of their accounts with customizing the expiration date


Zero Knowledge Related:
- [ZK Circuits](./src/circuit/)
    - [x] Implemented ZK Ciruit code: provide security and privacy, generated zkProof from the `Google JWT` and user privacy data for on-chain verification.


## Team info
JonathanXu
- ZK Researcher&Developer: Math and Computer background. Over 4 years of research experience in the zero-knowledge (zk) field, familiar with various zk algorithms and tools. 
- BlockChain Developer Engineer: Worked in the blockchain industry for 3+ years, with expertise in ecosystems such as Ethereum, Solana, Polkadot, etc. good at Rust, Solidity, Node.js, and Anchor development.
- Github: [@jonathanxuu](https://github.com/jonathanxuu)
- Email: jonathanxx997@gmail.com

Zak
- UI Designer&Wallet Developer: Over 5 years of front-end experience, good at vue, react and nodejs. Place great importance on the user experience of the product.
- Email: zakimote@163.com

## Bounty To Participate
- Biforst

Implementing `zkLogin` can significantly onboard Web2 users to the Bifrost ecosystem, greatly aiding its promotion in DeFi and beyond. The `zkLogin` implementation can be extended to various application scenarios, allowing users to quickly get started, much like they do with Web2 financial products.

## Material for Demo
1. Docs
    - Chinese Version: [zkLogin_zh_CN](./doc/zkLogin_zh_CN.md) 
    - English Version: [zkLogin_en_US](./doc/zkLogin_en_US.md)
2. [Demo Video](https://youtu.be/PLHt-VaENNM)
3. [Deck](./doc/zkLoginDeck.pdf)