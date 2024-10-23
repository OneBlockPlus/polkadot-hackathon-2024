# Omni-ZK-Verifier

The Omni-ZK-Verifier is a zk-proof contract for verification of omniverse transactions developed based on [sp1-contract](https://github.com/succinctlabs/sp1-contracts).

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
