# **Polkattest**

## **Goal**

The goal of this project is to provide an infrastructure that enables the verification (attestation) of off-chain events, bringing them on-chain to leverage the benefits of blockchain technology, such as immutability, transparency, and decentralized security.

## **Category**

- **Category 3**: (Chain) Building a blockchain based on Polkadot SDK
  - **Attestation Chain**

## **Repository Link**

[Full Project GitHub Repository](https://github.com/PsyLabsWeb3/Polkadot-Attestations)

## **Problem**

Without attestations on Polkadot, verifying off-chain events in a secure and decentralized manner becomes challenging. Off-chain data lacks immutability, making it susceptible to tampering, fraud, or manipulation. This creates issues of trust and transparency for users and organizations, as off-chain verification methods often rely on centralized entities, which can introduce bias, single points of failure, and data silos. Additionally, there is no seamless way to bring verifiable, tamper-proof records on-chain, limiting the ability to leverage the security, decentralization, and transparency that blockchain offers.

## **Solution Overview**

The solution creates a comprehensive **Attestations Ecosystem** with key components. It includes:

- **Pallet-Attestations** for managing attestations on-chain.
- **Polkattest Chain**, a blockchain ensuring immutability and decentralized security.
- A **React Template** providing an easy interface for developers to interact with the blockchain.
- **Supplyttest**, showcasing attestation use cases in supply chain verification.

Together, these components enable secure, decentralized attestation integration into real-world applications using blockchain technology.

---

### **1. Attestation Pallet**

The **Pallet-Attestations** is a custom Substrate pallet for creating, storing, and verifying schemas and attestations on-chain. It enables users to define schemas for off-chain events, generate attestations, and store them securely on the blockchain. The pallet provides functions for managing schemas and attestations, ensuring immutability.

- [Attestation Pallet GitHub Repository](#) TBA

---

### **2. Polkattest Chain**

The **Polkattest Chain** is a Substrate-based blockchain built to support decentralized attestation services using the integrated Pallet-Attestations. This chain allows users to create, manage, and verify attestations securely on-chain, benefiting from blockchain's immutability and decentralized trust. In addition to the attestation pallet, it includes other core Substrate pallets like **pallet-balances** for managing token transfers and account balances.

- [Polkattest Chain GitHub Repository](#) TBA

---

### **3. Attestation Frontend Template**

The **Attestation Frontend Template** is a customizable React-based interface for interacting with the **Polkattest Chain** and its **Pallet-Attestations**. It enables users to create, manage, and verify attestations on-chain. Developers can easily modify the UI while accessing core blockchain features like schema creation and attestation management. Built with React and Chakra UI, the template provides a responsive and accessible experience for real-world attestation applications.

- [Attestation Frontend Template GitHub Repository](#) TBA

---

### **4. Supplyttest Dapp**

**Supplyttest** is a decentralized application (dApp) designed for supply chain attestations. It enables suppliers to verify and attest processes, tests, and other key information throughout the supply chain. These attestations are recorded immutably on-chain, ensuring transparency, traceability, and secure access for clients who require verification. By using Supplyttest, clients can trust the accuracy of the information provided, while suppliers benefit from a tamper-proof record of their operations, offering a higher level of accountability and compliance in supply chain management.

- [Supplyttest Dapp GitHub Repository](#) TBA

---

## **How it works**

TBA

## **Team**

TBA

## **Demo**

TBA
