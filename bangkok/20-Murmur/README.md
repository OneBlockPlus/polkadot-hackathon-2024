# Murmur

Murmur is a protocol that enables keyless crypto wallets, powered by timelock encryption.

## Introduction

**Murmur** is a novel protocol that allows users to create and use a non-custodial crypto wallet without a secret key or mnemonic. The wallet allows users to use a secure OTP (one time passcode) generator in order to authenticate with their wallet. Our protocol, inspired by [Hours of Horus](https://eprint.iacr.org/2021/715), leverages **timelock encryption** and a secure OTP code generator to enable a secure, time-based, keyless crypto wallet. It allows users to seed a wallet which:

- requires time-based OTP codes to execute
- can be called from *any* origin
- supports any action a standard wallet can perform

We envision this protocol as having the potential to enable new ways to interact with crypto wallets by furthering account abstraction capabilities. For example, it could be an effective mechanism to onboard web2 users to web3 platforms by providing them a secure and seamless experience. 

The Ideal Network (IDN) is a Substrate-based blockchain that enables **publicly verifiable on-chain randomness** and **timelock encryption** for substrate based chains. Developed in conjunction with the web3 foundation (via the Decentralized Futures program), Ideal Labs has been engaged in development of the Ideal Network as a substrate-native, trustless, unbiased, and interoperable randomness beacon. To clarify, timelock encryption is a cryptographic mechanism that allows any length messages to be encrypted for future blocks in consensus (where the output of the randomness beacon acts as the decryption key). 

## Features Planned for the Hackathon

- Develop: Modified proxy pallet 
- Develop: Murmur Client Library (wasm compatible)
- Develop: Browser Extension for creating and managing Murmur wallets
- Develop: Demonstrate integration of Murmur into an application

## Architecture

## Schedule

## Team Info

| Name| Description | Github | LinkedIn |
|---|---|---|---|
|Tony Riemer| Lead protocol engineer, Math at University of Wisconsin, Former S.E. Fannie Mae & Capital One, PBA Alumni | https://github.com/driemworks | https://www.linkedin.com/in/tony-riemer/ |
| Carlos Montoya | Serialial Entrepreneur, 4x CTO with exit, M.S. Information Technology, Carnegie Mellon, PBA Alumni | https://github.com/carloskiron | https://www.linkedin.com/in/cmonvel/ |
| Coleman Irby | 10+ years software engineering experience, B.S. Electrical Engineering from University of Mississippi, Physics graduate student at Univ. of Mississipp | https://github.com/colemanirby | https://www.linkedin.com/in/coleman-irby-229b13103/ |
| Juan Girini | 10+ years leading engineering teams, Former core engineer at Parity, B.S. Information Systems Engineering, UTN, PBA Alumni | https://github.com/juangirini | https://www.linkedin.com/in/juan-girini/ |

## Material for Demo

1. Demo Video
2. Slideshow
3. Ideally a live demo