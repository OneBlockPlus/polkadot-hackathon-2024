# Omni-ZK-Verifier

The Omni-ZK-Verifier is a zk-proof contract for verification of omniverse transactions developed based on [sp1-contract](https://github.com/succinctlabs/sp1-contracts).

## Prerequisites

Foundry:

## Install Env

You'd better copy the directory out of this repo, and make a new git project for it with

```
git init
```

Install 5 libs described in `.gitmodules`, notice that all the 5 libs are in the `/lib` sub directory, such as

```
git submodule add https://github.com/OpenZeppelin/openzeppelin-foundry-upgrades lib/openzeppelin-foundry-upgrades
```

Install all dependencies

```
forge install
```

## Usage

### Build

```shell
forge build
```

### Test

```shell
forge test
```

### Format

```shell
forge fmt
```

### Deploy

```shell
forge script script/Verifier_Deploy.s.sol:DeployVerifierScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Upgrade

```shell
forge script script/Verifier_Deploy.s.sol:UpgradeVerifierScrip --rpc-url <your_rpc_url> --private-key <your_private_key>
```
