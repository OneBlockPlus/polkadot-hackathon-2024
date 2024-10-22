# 🔄 Project Relay

![Relay Logo](https://cdn.leonardo.ai/users/ca40e806-f75b-4356-aba3-8fe01fc6dc34/generations/e11b8779-5bf4-4dfc-a6c2-1365cfbd39b9/Leonardo_Phoenix_Create_a_sleek_darkthemed_logo_for_Relay_a_bl_0.jpg)

## 🌟 Introduction
Project Relay is an innovative solution that bridges the Internet of Things (IoT) with the Polkadot ecosystem, enabling seamless cryptocurrency payments for shop owners using DOT and other parachain assets. Our project consists of three main components:

1. **Dotlink** 🔌: A Polkadot-enabled IoT SDK for microcontrollers
2. **Relayconsole** 🖥️: A user-friendly frontend for account management and device control
3. **Relay-api** ⚙️: An intermediary server for handling transactions (to be phased out in future versions)

At the core of our project is a Polkadot-enabled microcontroller (RFID device) integrated with our Dotlink IoT SDK, designed to revolutionize point-of-sale systems for shop owners.

## Problem Statement
Small business owners face significant barriers in adopting cryptocurrency payments, especially within the Polkadot ecosystem, due to technical complexity and security concerns. While IoT technology shows promise for secure, decentralized payments, existing solutions either require extensive expertise or compromise security through centralization. Project Relay bridges this gap by offering shop owners a secure, user-friendly solution to accept Polkadot-based payments through IoT devices and split-key security, making cryptocurrency transactions as simple as traditional payment methods.

## 📚 Official GitBook Documentation
- [Architecture and Roadmap](https://relay-4.gitbook.io/architecture-and-roadmap)
- [Relay API Manual](https://relay-4.gitbook.io/architecture-and-roadmap/relay-api-manual)

## 🎥 Demo Materials

1. [**Demo Video** 📹](https://youtu.be/mUKZ5OHjil8)

2. [**Presentation** 📊](https://www.canva.com/design/DAGUUo3xttE/rfLqSz5kEDVIgn2BrrgZkg/edit?utm_content=DAGUUo3xttE&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)


## 🛠️ Workflow
![Relay Workflow](https://relay-4.gitbook.io/~gitbook/image?url=https%3A%2F%2F3350247068-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FmKH6AuDh7t8iGaxe7Xsd%252Fuploads%252F7BK8IKJfEtF41wSfd8Wx%252FArchitecture%2520Overview.png%3Falt%3Dmedia%26token%3D3a36e80f-3ccd-4872-832d-2b96dcb0ad23&width=768&dpr=4&quality=100&sign=8c7ca175&sv=1)

## ✨ Features

### 🛠️ Dotlink IoT SDK
![image](https://github.com/user-attachments/assets/225c35e1-4d03-4d98-8e77-27e3ae7ad6c9)

- Rasberry Pi implementation
- Secure communication with Polkadot relay chain and parachains
- Basic transaction creation and sending capabilities
- Modular design for future expansion to other platforms

### 🖥️ Relayconsole Frontend
![image](https://github.com/user-attachments/assets/f261a1e2-7125-4b12-b522-209668d2709d)

- User registration and account management
- NFC card details generation
- Consumer device ordering interface
- Transaction history and monitoring
- [Frontend Deployment 💻](https://relay-console.vercel.app/)

### ⚙️ Relay-api Server
- Secure handling of partial mnemonics/keys
- Integration with Polkadot network for balance checks and transaction storing

*Note: Trxns take place safely on authenticated IOT Devices

### 📱 RFID-based Payment Flow
- Seamless customer experience using NFC technology
- Secure split-key approach for transaction authorization
- Integration with merchant devices (RPi)

### 🎯 Demo Implementation
- Full end-to-end demonstration of a payment scenario
- Showcase of user registration, NFC card creation, and transaction processing

## 🏗️ Architecture

### 🔌 Dotlink (IoT SDK)
- Core library for IOT devices (RPI and JS)
- Handles communication with RFID/NFC cards
- Interacts with Relay-api for transaction storing, otp. etc
- Future direct integration with Polkadot network

### 🖥️ Relayconsole (Frontend)
- React-based web application
- User authentication and account management
- NFC card management and device ordering
- Transaction history and reporting

### ⚙️ Relay-api (Backend Server)
- Node.js server with Express framework
- Handles partial mnemonic storage and reconstruction
- Integrates with Polkadot.js for network interactions
- Processes and submits transactions to the Polkadot network

### 🔄 Data Flow
1. User registers on Relayconsole, receives key and account details
2. Merchant's RPI device is pre-configured with Dotlink SDK and merchant's public address
3. Customer taps NFC card on merchant's device for payment
4. RPI retrieves partial keys, transaction amount and reconstructs key for transaction, creates and signs transaction
6. Transaction is submitted to Polkadot network
7. Confirmation is sent back to RPI and reflected on Relayconsole

## 📅 Schedule

### 📍 Week 1
- Set up development environments for all components
- Implement basic Dotlink SDK functionalities
- Create Relayconsole frontend skeleton
- Develop core Relay-api server functions

### 📍 Week 2
- Complete Dotlink SDK implementation for ESP32
- Implement user registration and NFC card generation in Relayconsole
- Develop secure mnemonic handling in Relay-api
- Begin integration testing between components

### 📍 Week 3
- Finalize Relayconsole features (device ordering, transaction history)
- Implement full transaction flow in Relay-api
- Conduct comprehensive testing of the entire system
- Create demonstration materials (video, presentation)

### 📍 Week 4
- Polish user interface and experience
- Perform security audits and optimizations
- Prepare detailed documentation
- Record final demo video and prepare presentation

## 👥 Team Information

1. **Abhiraj Mengade** 👨‍💻
   - Role: IoT & Dotlink SDK
   - Expertise: Embedded systems, MicroPython, IoT protocols

2. **Jay Shitre** 🎨
   - Role: Frontend Developer & UX Designer
   - Expertise: React, UI/UX design, web3 integration

3. **Haoyang Li** 🔗
   - Role: Backend Developer & Blockchain Integration Specialist
   - Expertise: Node.js, Polkadot ecosystem, cryptography

Our team is excited to present Project Relay and demonstrate how it can revolutionize cryptocurrency payments in the retail sector using Polkadot technology. We believe our solution offers a unique blend of security, usability, and innovation that will contribute significantly to the adoption of blockchain technology in everyday transactions.
