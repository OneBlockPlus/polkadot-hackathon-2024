# PensiveFlix Blockchain


**PensiveFlix** is an open-source decentralized digital asset protection tools designed to address the current NFT market's inability to effectively protect users' digital assets. It leverages TEE (Trusted Execution Environment) technology to create an encryption and decryption mechanism within a trusted environment to safeguard users' digital assets. The platform consists of a blockchain built on Substrate and applications protected by TEE technology.

## Native Build

### Dependencies

<details><summary>Expand</summary>

- System dependencies
  - Ubuntu (tested with 22.04)
  ```bash
  apt install -y build-essential git clang curl libssl-dev llvm libudev-dev make protobuf-compiler
  ```


- Rust

  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

- Substrate dependencies:

   ```bash
   rustup update nightly
   rustup target add wasm32-unknown-unknown --toolchain nightly
   ```

</details>

### Scripts for running a local dev network

This directory contains the convenient scripts to quickly start a local dev network.


Make sure you are in the root of the git repo.

Build projects:

```bash
make
```

Start a dev testnet:

```bash
./scripts/run/node.sh
# run the following commands in 2 terminal windows or tmux panes
./scripts/run/node.sh
./scripts/run/pflix.sh
```

Now you have full node at `ws://localhost:9944`, and pflix at `http://localhost:17777`.

