# Bolarity Blockchain

Bolarity is a cutting-edge blockchain platform built on the Substrate framework, uniquely centered around **multi-VM interoperability**. It allows seamless interaction between EVM and WASM contracts, providing a versatile and powerful environment for decentralized application (dApp) development.

## Key Features

### - **Built on Substrate**  

  Bolarity is constructed using Substrate, a modular and flexible framework designed for creating customized blockchains. This foundation ensures that Bolarity benefits from Substrate's robust architecture, including its modularity, upgradability, and security features.

### - **BABE Consensus Protocol**  

  Bolarity utilizes the Blind Assignment for Blockchain Extension (BABE) as its consensus protocol. BABE is a well-known consensus mechanism used in Substrate-based chains that ensures the blockchain remains secure and efficient.

### - **Ethereum Compatibility via Frontier**  

  Through integration with the Frontier project, Bolarity is Ethereum-compatible, allowing users to deploy and interact with EVM (Ethereum Virtual Machine) smart contracts. This compatibility ensures that developers familiar with Ethereum can seamlessly migrate or develop new dApps on Bolarity.

### - **WASM Contract Support**  

  In addition to supporting EVM contracts, Bolarity also supports the deployment and execution of WASM (WebAssembly) smart contracts. This dual-contract environment offers developers the flexibility to choose the most suitable technology for their needs.

### - **Unified Ethereum Address Format**  

  Bolarity standardizes account management by using the Ethereum address format across the platform. Whether interacting with EVM or WASM contracts, users operate with a consistent address format, simplifying account management and interoperability.

### - **Interact with WASM Contracts via MetaMask**  

  Bolarity extends the capabilities of Ethereum-compatible wallets like MetaMask to interact not only with EVM contracts but also with WASM contracts. This feature enhances the user experience by allowing users to manage assets and execute transactions across different contract types using familiar tools.

### - **Interoperability between EVM and WASM Contracts**  

  With Bolarity, EVM and WASM contracts can call each other, enabling a highly interoperable contract environment. This unique capability opens up new possibilities for dApp development, allowing smart contracts to leverage the strengths of both virtual machines.


## Build & Run

To build the chain, execute the following commands from the project root:

```sh
$ cargo build --release
```

To execute the chain, run:

```sh
$ ./target/release/bolarity-node --dev
```

The output shows the following logs:

```sh
2024-08-26 15:30:29 Bolarity Network    
2024-08-26 15:30:29 ✌️  version 0.0.0-514637b0c08    
2024-08-26 15:30:29 ❤️  by , 2024-2024    
2024-08-26 15:30:29 📋 Chain specification: Development    
2024-08-26 15:30:29 🏷  Node name: callous-drop-0622    
2024-08-26 15:30:29 👤 Role: AUTHORITY    
2024-08-26 15:30:29 💾 Database: RocksDb at /var/folders/3_/3pbw51y932b1y9r2fwcsrpn00000gn/T/substrate1DaeGS/chains/dev/db/full    
2024-08-26 15:31:12 🔨 Initializing Genesis block/state (state: 0x3bec…c2a8, header-hash: 0x6829…c4b5)    
2024-08-26 15:31:12 👴 Loading GRANDPA authority set from genesis on what appears to be first startup.    
2024-08-26 15:31:12 👶 Creating empty BABE epoch changes on what appears to be first startup.    
2024-08-26 15:31:12 Using default protocol ID "sup" because none is configured in the chain specs    
2024-08-26 15:31:12 🏷  Local node identity is: 12D3KooWHsXb3G1ugtmxLMzETnFMxfJSyigngKmL3sAPpsNfQrWA    
2024-08-26 15:31:12 Running libp2p network backend    
2024-08-26 15:31:12 💻 Operating system: macos    
2024-08-26 15:31:12 💻 CPU architecture: aarch64    
2024-08-26 15:31:12 📦 Highest known block at #0    
2024-08-26 15:31:12 〽️ Prometheus exporter started at 127.0.0.1:9615    
2024-08-26 15:31:12 Running JSON-RPC server: addr=127.0.0.1:9944, allowed origins=["*"]    
2024-08-26 15:31:13 👶 Starting BABE Authorship worker    
2024-08-26 15:31:18 🙌 Starting consensus session on top of parent 0x6829167c2d07e972e36d9419e198d7db40f155d6d80546385de16843f59dc4b5    
2024-08-26 15:31:18 🎁 Prepared block for proposing at 1 (26 ms) [hash: 0x1307046189c3b0f36cb89158f7c37f9d7b73aeccb0cfc15d649ea443c4ac976f; parent_hash: 0x6829…c4b5; extrinsics (1): [0xde09…d02f]    
2024-08-26 15:31:18 🔖 Pre-sealed block for proposal at 1. Hash now 0xac831bf3fe6c2e56b742061e7ff31709500c73b5c2e47ba905d81a85dbf7911b, previously 0x1307046189c3b0f36cb89158f7c37f9d7b73aeccb0cfc15d649ea443c4ac976f.    
2024-08-26 15:31:18 👶 New epoch 0 launching at block 0xac83…911b (block slot 287442913 >= start slot 287442913).    
2024-08-26 15:31:18 👶 Next epoch starts at slot 287443013    
2024-08-26 15:31:18 💤 Idle (0 peers), best: #1 (0xac83…911b), finalized #0 (0x6829…c4b5), ⬇ 0 ⬆ 0    
2024-08-26 15:31:18 🏆 Imported #1 (0x6829…c4b5 → 0xac83…911b)    
2024-08-26 15:31:23 💤 Idle (0 peers), best: #1 (0xac83…911b), finalized #0 (0x6829…c4b5), ⬇ 0 ⬆ 0    
2024-08-26 15:31:24 🙌 Starting consensus session on top of parent 0xac831bf3fe6c2e56b742061e7ff31709500c73b5c2e47ba905d81a85dbf7911b    
2024-08-26 15:31:24 🎁 Prepared block for proposing at 2 (8 ms) [hash: 0x79da8cb0b2a513ae8f1ed424cc63c3ebac670cffbbf925f75d55f5cb11fc3463; parent_hash: 0xac83…911b; extrinsics (1): [0xd358…bfdf]    
2024-08-26 15:31:24 🔖 Pre-sealed block for proposal at 2. Hash now 0x56dc035f217054e4d472a827bd8e8f2f6e2d4d90239eb595747b017239e8c073, previously 0x79da8cb0b2a513ae8f1ed424cc63c3ebac670cffbbf925f75d55f5cb11fc3463.    
2024-08-26 15:31:24 🏆 Imported #2 (0xac83…911b → 0x56dc…c073)    
2024-08-26 15:31:28 💤 Idle (0 peers), best: #2 (0x56dc…c073), finalized #0 (0x6829…c4b5), ⬇ 0 ⬆ 0    
2024-08-26 15:31:30 🙌 Starting consensus session on top of parent 0x56dc035f217054e4d472a827bd8e8f2f6e2d4d90239eb595747b017239e8c073    
2024-08-26 15:31:30 🎁 Prepared block for proposing at 3 (8 ms) [hash: 0x95e8d60c91965ab3702acfc8a78c860d0a6c6b11a2d6f3b56f24a633102e6ce3; parent_hash: 0x56dc…c073; extrinsics (1): [0x4e8b…912d]    
2024-08-26 15:31:30 🔖 Pre-sealed block for proposal at 3. Hash now 0xb937f23ff7231bcc7603386d097a3e83491e1def2887ddc4887a0cf9f15feeff, previously 0x95e8d60c91965ab3702acfc8a78c860d0a6c6b11a2d6f3b56f24a633102e6ce3.    
2024-08-26 15:31:30 🏆 Imported #3 (0x56dc…c073 → 0xb937…eeff)    
2024-08-26 15:31:33 💤 Idle (0 peers), best: #3 (0xb937…eeff), finalized #1 (0xac83…911b), ⬇ 0 ⬆ 0    
2024-08-26 15:31:36 🙌 Starting consensus session on top of parent 0xb937f23ff7231bcc7603386d097a3e83491e1def2887ddc4887a0cf9f15feeff    
2024-08-26 15:31:36 🎁 Prepared block for proposing at 4 (8 ms) [hash: 0x731fa79e85c7903a535750697d85467378d761743f36bd9237573a51a8660188; parent_hash: 0xb937…eeff; extrinsics (1): [0x7852…1121]    
2024-08-26 15:31:36 🔖 Pre-sealed block for proposal at 4. Hash now 0x2abb49b670855d1eca64bd8cd14fe96e6d7e8a42576363b3877190a11aee7257, previously 0x731fa79e85c7903a535750697d85467378d761743f36bd9237573a51a8660188.    
2024-08-26 15:31:36 🏆 Imported #4 (0xb937…eeff → 0x2abb…7257)    
```

## Usage

The default port for the template node is set to `http://127.0.0.1:9944`. Once the node is operational, you can conduct your own tests, including connecting to Ethereum wallets or interacting with smart contracts. Additionally, there are several predefined accounts with test tokens available for immediate use.

- Alith:
    * Public Address: 0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac
    * Private Key: 0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133
- Baltathar:
    * Public Address: 0x3Cd0A705a2DC65e5b1E1205896BaA2be8A07c6e0
    * Private Key: 0x8075991ce870b93a8870eca0c0f91913d12f47948ca0fd25b49c6fa7cdbeee8b
- Charleth:
    * Public Address: 0x798d4Ba9baf0064Ec19eB4F0a1a45785ae9D6DFc
    * Private Key: 0x0b6e18cafb6ed99687ec547bd28139cafdd2bffe70e6b688025de6b445aa5c5b
- Dorothy:
    * Public Address: 0x773539d4Ac0e786233D90A233654ccEE26a613D9
    * Private Key: 0x39539ab1876910bbf3a223d84a29e28f1cb4e2e456503e7e91ed39b2e7223d68
- Ethan:
    * Public Address: 0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB
    * Private Key: 0x7dce9bc8babb68fec1409be38c8e1a52650206a7ed90ff956ae8a6d15eeaaef4
- Faith:
    * Public Address: 0xC0F0f4ab324C46e55D02D0033343B4Be8A55532d
    * Private Key: 0xb9d2ea9a615f3165812e8d44de0d24da9bbd164b65c4f0573e1ce2c8dbd9c8df

## Testing

The project includes a set of test scripts to help you verify the functionality of the EVM and WASM contract interactions within the Bolarity network. These scripts are located in the `test/` directory.

### Test Scripts Overview

- **deploy_evm_contract.js**: Deploys an Ethereum-compatible smart contract on the Bolarity network.
- **deploy_wasm_contract.js**: Deploys a WASM smart contract on the Bolarity network.
- **evm_call_wasm.js**: Demonstrates how to call the `transfer` method of a WASM contract from an EVM contract.
- **evm_call_wasm_echo.js**: Demonstrates the ability to pass and return various data formats (e.g., strings, integers, arrays) from EVM calling WASM contracts.
- **wasm_call_evm.js**: Demonstrates how to call the `transfer` method of a EVM contract from an WASM contract.
- **wasm_call_evm_echo.js**: Demonstrates the ability to pass and return various data formats (e.g., strings, integers, arrays) from WASM calling EVM contracts.

### Running the Tests

To run the tests, navigate to the `test/` directory and execute the desired script using Node.js. For example:

```bash
npm install
node test/deploy_evm_contract.js
```
Remember to first deploy contracts and then update the contract addresses in the test scripts before running them.