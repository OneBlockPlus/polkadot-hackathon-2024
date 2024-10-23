# Tool Auth Server

## Run

```bash
pnpm run server
```

## Test Procedure

1. Create activated device:

- repo
  `dephy-id-evm/examples/public-vendor`
- cmd

```bash
pnpm run cli create-activated-device \
--rpc $BASE_SEPOLIA_RPC_URL \
--privatekey $PRIVATE_KEY \
--device {device address} \
--receiver {receiver address}
```

2. Owner list device to Marketplace

- repo
  `dephy-condiuts`
- prepare
  set `ownerPrivateKey` and `list params` in `script/Marketplace/List.s.sol`
- cmd

```bash
forge script script/Marketplace/List.s.sol --rpc-url base_sepolia --broadcast
```

3. Tenant rent device from Marketplace

- repo
  `dephy-condiuts`
- prepare
  set `tenantPrivateKet` and `rent params` in `script/Marketplace/Rent.s.sol`
- cmd

```bash
forge script script/Marketplace/Rent.s.sol --rpc-url base_sepolia --broadcast
```

4. Add Identity for tenant

- repo
  `dephy-condiuts`
- prepare
  set `operatorPrivateKey`, `prefix` and `digest` in `script/Marketplace/Rent.s.sol`
- cmd

```bash
forge script script/AccessIdentities/AddIdentity.s.sol --rpc-url base_sepolia --broadcast
```

5. Run auth server

- repo
  `dephy-condiuts/tools/auth-server`
- cmd

```bash
DEVICE={device address} pnpm run server
```
