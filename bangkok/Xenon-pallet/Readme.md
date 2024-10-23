# Xenon DID Pallet

A multi-chain Decentralized Identity (DID) pallet for Substrate-based blockchains, enabling cross-chain identity management and verification.

#### youtube video - https://youtu.be/dKYHCrf5dIk?si=EKxhMmzDWJ6-J_SK

#### Demo - https://ni8crawler18.github.io/Xenon-pallet/

## Features

- **Decentralized Identity Management**: Create and manage DIDs on-chain
- **Multi-chain Support**: Link multiple blockchain addresses to a single DID
- **Flexible Key Management**: Support for multiple key types (Ed25519, Sr25519, Secp256k1, X25519)
- **Service Registry**: Associate services with DIDs
- **Chain-agnostic**: Compatible with any blockchain that can be identified by a chain ID

## Installation

Add the following to your runtime's `Cargo.toml`:

```toml
[dependencies]
pallet-xenon = { version = "1.0.0", default-features = false }
```

## Configuration

Include the following in your runtime:

```rust
parameter_types! {
    pub const MaxLinkedChains: u32 = 10;
    pub const MaxPublicKeys: u32 = 5;
    pub const MaxServices: u32 = 10;
}

impl pallet_xenon::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type Currency = Balances;
    type MaxLinkedChains = MaxLinkedChains;
    type MaxPublicKeys = MaxPublicKeys;
    type MaxServices = MaxServices;
    type WeightInfo = pallet_xenon::weights::WeightInfo;
}
```

## Usage

### Creating a DID

```rust
// Create a new DID document
XenonPallet::create_did(origin)?;
```

### Linking a Chain

```rust
// Link an Ethereum address to your DID
XenonPallet::link_chain(
    origin,
    "ethereum".as_bytes().to_vec(),
    1,  // Ethereum chain ID
    eth_address.as_bytes().to_vec()
)?;
```

### Unlinking a Chain

```rust
// Remove a linked chain
XenonPallet::unlink_chain(origin, 1)?;  // Unlink Ethereum chain
```

## Security

- All operations require signature verification
- Chain address format validation
- Bounded collections to prevent DoS attacks
- Controller-based access control

## License

The pallet is not licensed and can be modified by developers of polkadot ecosystem to create new Dapps.

## Contributing

look on https://github.com/Ni8crawler18/Xenon-pallet/ to create an issue or contribute.