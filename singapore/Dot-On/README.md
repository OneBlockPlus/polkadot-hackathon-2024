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


