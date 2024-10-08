# Project Relay

## Introduction
Project Relay is an innovative solution that bridges the Internet of Things (IoT) with the Polkadot ecosystem, enabling seamless cryptocurrency payments for shop owners using DOT and other parachain assets. Our project consists of three main components:

1. **Dotlink**: A Polkadot-enabled IoT SDK for microcontrollers.
2. **Relayconsole**: A user-friendly frontend for account management and device control.
3. **Relay-api**: An intermediary server for handling transactions (to be phased out in future versions).

At the core of our project is a Polkadot-enabled microcontroller (RFID device) integrated with our Dotlink IoT SDK, designed to revolutionize point-of-sale systems for shop owners.

## Features planned for the Hackathon

1. **Dotlink IoT SDK:**
   - ESP32 MicroPython implementation
   - Secure communication with Polkadot relay chain and parachains
   - Basic transaction creation and sending capabilities
   - Modular design for future expansion to other platforms

2. **Relayconsole Frontend:**
   - User registration and account management
   - NFC card details generation
   - Consumer device ordering interface
   - Transaction history and monitoring

3. **Relay-api Server:**
   - Secure handling of partial mnemonics/keys
   - Transaction reconstruction and submission
   - Integration with Polkadot network for balance checks and transaction processing

4. **RFID-based Payment Flow:**
   - Seamless customer experience using NFC technology
   - Secure split-key approach for transaction authorization
   - Integration with merchant devices (ESP32)

5. **Demo Implementation:**
   - Full end-to-end demonstration of a payment scenario
   - Showcase of user registration, NFC card creation, and transaction processing
  

![image](https://github.com/user-attachments/assets/e39b5c2e-1807-4dc3-b16a-9d103b6624b7)


## Architecture

Our project architecture consists of three main components working together to provide a secure and efficient payment solution:

1. **Dotlink (IoT SDK):**
   - Core library for ESP32 devices (MicroPython)
   - Handles communication with RFID/NFC cards
   - Interacts with Relay-api for transaction processing
   - Future direct integration with Polkadot network

2. **Relayconsole (Frontend):**
   - React-based web application
   - User authentication and account management
   - NFC card management and device ordering
   - Transaction history and reporting

3. **Relay-api (Backend Server):**
   - Node.js server with Express framework
   - Handles partial mnemonic storage and reconstruction
   - Integrates with Polkadot.js for network interactions
   - Processes and submits transactions to the Polkadot network

**Data Flow:**
1. User registers on Relayconsole, receives key and account details
2. Merchant's ESP32 device is pre-configured with Dotlink SDK and merchant's public address
3. Customer taps NFC card on merchant's device for payment
4. ESP32 sends partial key, transaction amount, and merchant address to Relay-api
5. Relay-api reconstructs key for transaction, creates and signs transaction
6. Transaction is submitted to Polkadot network
7. Confirmation is sent back to ESP32 and reflected on Relayconsole

## Schedule

Week 1:
- Set up development environments for all components
- Implement basic Dotlink SDK functionalities
- Create Relayconsole frontend skeleton
- Develop core Relay-api server functions

Week 2:
- Complete Dotlink SDK implementation for ESP32
- Implement user registration and NFC card generation in Relayconsole
- Develop secure mnemonic handling in Relay-api
- Begin integration testing between components

Week 3:
- Finalize Relayconsole features (device ordering, transaction history)
- Implement full transaction flow in Relay-api
- Conduct comprehensive testing of the entire system
- Create demonstration materials (video, presentation)

Week 4:
- Polish user interface and experience
- Perform security audits and optimizations
- Prepare detailed documentation
- Record final demo video and prepare presentation

## Team Information

Our team consists of three dedicated developers with diverse skills in IoT, blockchain, and full-stack development:

1. **Abhiraj Mengade**
   - Role: IoT & Dotlink SDK
   - Expertise: Embedded systems, MicroPython, IoT protocols

2. **Jay Shitre**
   - Role: Frontend Developer & UX Designer
   - Expertise: React, UI/UX design, web3 integration

3. **Haoyang Li**
   - Role: Backend Developer & Blockchain Integration Specialist
   - Expertise: Node.js, Polkadot ecosystem, cryptography

## Material for Demo

1. **Demo Video**: 
   [Link to YouTube video showcasing the full payment flow]

2. **Presentation**: 
   [Link to Google Slides presentation detailing project architecture, features, and future plans]

3. **Live Demo** (if possible):
   - Interactive demonstration of user registration on Relayconsole
   - NFC card creation and loading process
   - Simulated payment scenario using ESP32 device
   - Real-time transaction monitoring on Relayconsole

Our team is excited to present Project Relay and demonstrate how it can revolutionize cryptocurrency payments in the retail sector using Polkadot technology. We believe our solution offers a unique blend of security, usability, and innovation that will contribute significantly to the adoption of blockchain technology in everyday transactions.
