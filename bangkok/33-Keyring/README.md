# Project Keyring

**Name:** Keyring

**Creation Date:** 2024-Jan

**Background:**

- Website: https://keyring.so/
- Github: https://github.com/keyring-so
- Web3 Grants / other hackathons: No

**Logo:**

![Keyring Logo](./doc/keyring_logo.png)

## Project Overview

Secure and handy hardware wallet solution for Web3 Citizens. 

Keyring hardware wallet brings the financial card experience to blockchain. It allows users to transfer or teleport assets, staking the native token, interact with DApps, etc.

By improving the user experience and providing affordable hardware wallets, Keyring aims to bring more users to the blockchain world. More people can gain the confidence to enjoy the benefits of self-custodianship in a secure, user-friendly manner.

The main features of Keyring including,
- High Security with EAL5+
- Mobile and Desktop Wallet App
- Support EVM and Substrate blockchains
- Contactless NFC Connection

![Keyring Features](./doc/keyring_features.png)

## Planed and Implemented Features in Hackathon

- [x] ED25519 implementation for Javacard
- [x] SLIP-0010 implementation for Javacard
- [x] Support native functionalities of Polkadot/Substrate based blockchain, including:
  - [x] transfer native token
  - [x] teleport assets between relay chain and system parachain
  - [x] staking via nomination pool
- [x] Substrate based EVM compatible blockchain integration
  - [x] send and receive assets
  - [x] interact with DApp with WalletConnect

## Demonstration Resources

1. Website: https://keyring.so/
2. Demo Video: https://youtu.be/Yg6R3WulmMU
3. Slides: https://docs.google.com/presentation/d/1XWeGgnagaEGo-I1CV0H-20eLT2fUjre4RUOYco3xO24/edit?usp=sharing
4. Source code:
   - Javacard applets: https://github.com/keyring-so/applets
   - Desktop wallet app: https://github.com/keyring-so/keyring-desktop

## Technical Architecture

Using Javacard 3.0.4 to build firmware for secure element, and implement the ED25519 and SLIP-0010 on it. 

The desktop wallet app communicates with the Javacard applets via smartcard reader, using ISO-7816 standard.
The mobile wallet app communicates with the Javacard applets via NFC, using ISO-14443 standard.

Tech stack used,
- Golang Wails framework
- React and React Native


## Team info

- Kaichao, researcher and developer, 10 years software development and 5 years blockchain development.
- Echo, product design and hardware engineer, 8 years hardware development, 2 years blockchain research

