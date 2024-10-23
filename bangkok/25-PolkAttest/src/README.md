<div align="center">
  <img src="https://chocolate-liquid-ferret-925.mypinata.cloud/ipfs/Qmc1shPtBLALzcLuvgNHNox68izCWSPR3MU9GE7zf4rXgU" width="120px" alt="Polkattest">
</div>

# Polkattest

### Attestation hub for the Polkadot Ecosystem

## Problem Statement

### Limited Interoperability of Data Systems

Different industries and businesses use fragmented data storage solutions, many of which are not interoperable, making it difficult to share or verify information across platforms.

The lack of standardization and secure data sharing limits collaboration, increases costs, and introduces bottlenecks in cross-industry transactions.

### Resistance to Innovation and Adoption

Many businesses are hesitant to adopt blockchain technology due to a lack of understanding, concerns over complexity, and perceived high implementation costs.

This resistance slows the modernization of data management, leaving industries stuck with outdated processes that fail to meet the demands of a digital economy.

### Vulnerability to Data Tampering and Fraud

Without a decentralized solution, the verification process remains opaque, with no way to ensure that data hasn't been modified post-verification.

This lack of security can lead to financial losses, reputational damage, and a lack of trust from consumers, partners, and regulators.

---

## Introduction to Polkattest

Polkattest is a Substrate-based blockchain integrating a custom Pallet Attestations alongside frame pallets such as **Smart Contracts, Balance, and Treasury**. It enables secure, immutable records known as **Attestations**, fostering trust and reducing the risk of data tampering.

Through **ink! Smart Contracts**, Polkattest powers an entire ecosystem of dApps focused on attestations, including voting systems, Polkadot treasury fund attestations, RAW data attestations, etc.

---

## Use Cases

### On-Chain Events:

- **Asset transfers**
- **Governance votes**
- **Reputation systems**
- **DAOs fund management**

### Off-Chain Events:

- **Supply chain data**
- **Event attendance**
- **Healthcare records**
- **Digital notary services**
- **Repairs History**

---

## Schema: The Foundation of Attestations

A **schema** is a predefined structure that defines the format and type of data to be attested on the blockchain. Think of it as a **template** that specifies fields like names, numbers, or dates, ensuring the consistency and validity of the attestation data.

Schemas also support **ink! contracts**, enabling complex logic attached to attestations, which unlocks new possibilities in areas such as **decentralized identity** or **automated token minting**.

<div align="center">
  <img src="https://chocolate-liquid-ferret-925.mypinata.cloud/ipfs/QmbK5kfk8UKJaLCPKqxsPQ3X2j9LodcYxD9eNSEAQxDnAh" width="500px" alt="Polkattest">
</div>

## What Are Attestations?

**Attestations** are cryptographically signed records that confirm a specific action or claim was made, ensuring that the data is tamper-proof and stored immutably on-chain. 
While Polkattest provides the infrastructure to record these attestations on the blockchain securely, it does not verify the authenticity of the data or events themselves. Instead, we serve as a tool for creating immutable, transparent records, enabling users to store and access their own proofs on a decentralized system without intermediaries.

<div align="center">
  <img src="https://chocolate-liquid-ferret-925.mypinata.cloud/ipfs/Qma38SXstKFFWJFXcScJPx5brjh6WmFiaCrC37JXkZGg4k" width="500px" alt="Polkattest">
</div>
---

## Attached Contracts

**Attached contracts** allow developers to embed custom logic within attestations. This functionality opens the door to **innovative dApps** that go beyond basic verification by supporting features like:

- **Automatic payments**
- **Token minting**
- **Access control triggered by attestations**

These features enable advanced use cases in areas like **governance, supply chain tracking, and decentralized identity systems**.

<div align="center">
  <img src="https://chocolate-liquid-ferret-925.mypinata.cloud/ipfs/QmPp5uvKTD1hLQGcB2wYVjV2uiu4Kuj1uXs94wr2LgVctU" width="500px" alt="Polkattest">
</div>

---

## Technology Architecture

![alt text](https://chocolate-liquid-ferret-925.mypinata.cloud/ipfs/QmT5tmWEdwJEMmezMQQSqPYMfnFJmuyDDvnqs2kRriDtCx)

---

## Deliverables

**Blockchain**

- [x] [Pallet-Attestations v0.1.0](https://github.com/PsyLabsWeb3/Polkadot-Attestations/tree/main/pallets/pallet-attestations-v-0.1.0)
- [x] [Pallet-Attestations v0.2.0 Beta (Attached Contracts)](https://github.com/PsyLabsWeb3/Polkadot-Attestations/tree/main/pallets/pallet-attestations-v-0.2.0-beta)
- [x] [Polkattest Contracts Parachain Node](https://github.com/PsyLabsWeb3/Polkadot-Attestations/tree/main/polkattest-node)
- [x] [Adding Pallet Utility](https://github.com/PsyLabsWeb3/Polkadot-Attestations/tree/main/polkattest-node)
- [x] [Adding Pallet Treasury](https://github.com/PsyLabsWeb3/Polkadot-Attestations/tree/main/polkattest-node)

**Frontend**

- [x] [Home](https://github.com/PsyLabsWeb3/Polkadot-Attestations/blob/main/frontend/src/components/pages/Home.tsx)
- [x] [Create Schema](https://github.com/PsyLabsWeb3/Polkadot-Attestations/blob/main/frontend/src/components/pages/CreateSchema.tsx)
- [x] [Select Schema to Attest](https://github.com/PsyLabsWeb3/Polkadot-Attestations/blob/main/frontend/src/components/pages/SelectSchemaToAttest.tsx)
- [x] [Attest](https://github.com/PsyLabsWeb3/Polkadot-Attestations/blob/main/frontend/src/components/pages/Attest.tsx)
- [x] [Search Schemas or Attestations by ID](https://github.com/PsyLabsWeb3/Polkadot-Attestations/blob/main/frontend/src/components/pages/SearchById.tsx)
- [x] [User Dashboard](https://github.com/PsyLabsWeb3/Polkadot-Attestations/blob/main/frontend/src/components/pages/UserDashboard.tsx)
- [x] [Scan](https://github.com/PsyLabsWeb3/Polkadot-Attestations/blob/main/frontend/src/components/pages/Scan.tsx)
- [x] [Implement IPFS](https://github.com/PsyLabsWeb3/Polkadot-Attestations/blob/main/frontend/src/utils/pinataManager.ts)

---

## Team Members

### _Robin_

- PM and UX/UI.
- Polkadot Evangelist.
- [GitHub](https://github.com/robinhodl69) | [Email](mailto:jaramillo.jesusj@gmail.com) | [Linkedin](https://www.linkedin.com/in/jaramillojesuslini/)

### _Iván_

- FullStack Blockchain developer with 3+ years of experience.
- UI/UX Designer.
- Brussels ETH GLOBAL VARA 2024 winner.
- [GitHub](https://github.com/TerratekMusic) | [Email](mailto:hello@psylabs.io) | [Linkedin](https://www.linkedin.com/in/ivan-avila-4b5689202/)

### _Rafa_

- Background in software engineering with 6+ years as a backend specialist with blockchain experience.
- Skilled in Service Oriented Architecture and Rust development.
- [GitHub](https://github.com/RafaelAcuna) | [Email](mailto:rafa.acuna.96@gmail.com) | [Linkedin](https://www.linkedin.com/in/rafael-acuna)

### _Luchex_

- Full Stack Developer focused on frontend and smart contracts.
- Passionate about blockchain, DeFi, and NFTs, with experience developing smart contracts in Solidity and Rust.
- [GitHub](https://github.com/lucianog2000) | [Email](mailto:lucianog2000@gmail.com) | [Linkedin](https://www.linkedin.com/in/luciano-garcia-btc/)

### _Santi_

- Software Development Student.
- This is my first project in Web3.
- [GitHub](https://github.com/Santipblover) | [Email](mailto:santiagobenjamingarcia@gmail.com) | [Linkedin](https://www.linkedin.com/in/santiago-garcia-789b1721b/)

---

## Additional Resources

- **[Pitch Deck + Demo Video](https://www.figma.com/proto/fGFOIj2dArXnPm60Zfmum1/Polkattest?node-id=394-33&node-type=canvas&t=thGtlKG9d5kYN4HO-1&scaling=contain&content-scaling=fixed&page-id=394%3A31&starting-point-node-id=394%3A33&share=1)**
- **[Polkattest Node Docs](https://lucianog2000.github.io/docs-polkattest-node/doc/pallet_attestations/)**
