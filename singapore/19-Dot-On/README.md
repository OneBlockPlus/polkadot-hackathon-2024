# Dot-On 
## Introduction
Doton is an infrastructure built between the Ton and Polkadot ecosystems. MiniApps developed based on Doton allow users to interact directly with data and assets on Polkadot using their native Ton wallet, enabling users to hold diverse Polkadot assets while maintaining the native Ton MiniApp experience.
Doton's vision is to help Polkadot ecosystem developers gain access to the traffic within the MiniApp ecosystem.

## Architecture
3 components will be delivered:

1. Mini App in Telegram
User uses this interface to operate polkadot chain, all operations will be combined into 1 payload and signed by Ton Wallet inside Telegram.
2. Mini App backend
Backend receives user payload and signature, forward to polkadot smart contract.
3. Polkadot Smart Contract
It verifies user payload and signature, if validated, it will carry on user's operation on user's behalf.


# Dot and Ton

## Introduction

Native MiniApp have a better UX then EVM MiniApps. If you look into Catizen-Ton and Catizen-Mantle. The number of users and the average user recharge amount for the Ton native MiniApp are both significantly higher than those for the Mantle version.

Doton is an infrastructure built between the Ton and Polkadot ecosystems. MiniApps developed based on Doton allow users to interact directly with data and assets on Polkadot using their native Ton wallet, enabling users to hold diverse Polkadot assets while maintaining the native Ton MiniApp experience.

Principles:
1. Keep MiniApp with native Ton UX;
2. Users never touch keys or any mnemonics;
3. Decentralized, with no 3rd party key management;
4. Security, only user could control his assets;

Doton's vision is to help Polkadot ecosystem developers gain access to the traffic within the MiniApp ecosystem.


## Features planned for the Hackathon
- [x] Substrate onchain operation wrapping into Ton proof
- [x] Vault management demo MiniApp
- [x] Ton proof signature
- [x] Substrate onchain verification for Ton Proof
- [x] Vault transfer

## Architect
To manage Substrate onchain assets through MiniApp have 3 step
* User Operation generation
* Wrap it into a Ton proof
* Sign Ton proof in MiniApp frontend by using Ton wallet that telegram embedded 
* Verify the proof(ED25519) onchain
* Transfer has been made

![Architecture](https://github.com/user-attachments/assets/246fc331-ec96-4420-a091-d37f91e9511a)


## Schedule

Milestone1: Complete the account Factory on Substrate EVM ecosystem
Milestone2: Release generic SDKs for MiniApp developers
Milestone3: Develop paymaster services for Polkadot ecosystem

## Team info

Leo Jiang
* 16 year development experience, 5 years in blockchain and a decade in information security software.

Pocky 
* Frontend developer

## Material for Demo
[Deck](https://docsend.com/view/jxqw4rjwzpnqd4wt)
