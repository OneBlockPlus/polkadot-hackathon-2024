# IP Pallet 🔐

A blockchain-based intellectual property management system supporting NFT minting, licensing, and purchase contracts with flexible payment options.

## 📋 Overview

The IP Pallet enables comprehensive intellectual property rights management through NFTs with support for:

- License and purchase contract creation
- One-time and periodic payment schedules
- Automatic payment tracking and penalties
- NFT escrow system
- Exclusive and non-exclusive licensing

## ⚙️ Features

### NFT Management
- Mint NFTs representing intellectual property
- Store IP metadata (name, description, filing date, jurisdiction)
- Track ownership and transfers

### Licensing
- Create exclusive/non-exclusive license offers
- Configure flexible payment terms
- Automatic license expiration
- Penalty system for missed payments

### Purchases
- Create purchase offers with escrow
- Support installment payments
- Automatic ownership transfer on completion
- Contract termination on payment default

### Payment System
- One-time payments
- Periodic payment schedules
- Late payment penalties (20%)
- Payment tracking and verification

## 🛠️ Installation

Add this to your runtime's `Cargo.toml`:

```toml
[dependencies]
pallet-ip_pallet = { version = "0.2.0", default-features = false }
```

### Runtime Configuration

```rust
parameter_types! {
    pub const MaxNameLength: u32 = 64;
    pub const MaxDescriptionLength: u32 = 256;
}

impl pallet_ip_pallet::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type Currency = Balances;
    type OfferId = u32;
    type ContractId = u32;
    type NFTId = u32;
    type Index = u32;
    type MaxNameLength = MaxNameLength;
    type MaxDescriptionLength = MaxDescriptionLength;
}
```

## 📖 Usage

### Minting NFTs

```rust
// Create a new IP NFT
ip_pallet::mint_nft(
    origin,
    name,
    description,
    filing_date,
    jurisdiction
)?;
```

### Creating License Offers

```rust
// Create a license offer
ip_pallet::offer_license(
    origin,
    nft_id,
    payment_type,
    is_exclusive,
    duration
)?;
```

### Creating Purchase Offers

```rust
// Create a purchase offer
ip_pallet::offer_purchase(
    origin,
    nft_id,
    payment_type
)?;
```

### Managing Contracts

```rust
// Accept a license
ip_pallet::accept_license(origin, offer_id)?;

// Make periodic payments
ip_pallet::make_periodic_payment(origin, contract_id)?;

// Complete purchase after all payments
ip_pallet::complete_purchase(origin, contract_id)?;
```

## 🔍 Storage Items

- `Nfts`: Maps NFT IDs to their metadata and ownership info
- `NextNftId`: Counter for generating unique NFT IDs
- `Offers`: Storage for all active license/purchase offers
- `Contracts`: Storage for all active contracts
- `NFTContracts`: Maps NFTs to their active contracts
- `EscrowedNfts`: Tracks NFTs in escrow during purchases

## 📝 Events

The pallet emits events for all major operations including:

- NFT minting and transfers
- Offer creation
- Contract creation and updates
- Payments and penalties
- Contract completion/termination

## ⚠️ Errors

Common error conditions handled by the pallet:

- Invalid input lengths
- Unauthorized operations
- NFT not found/already in escrow
- Payment failures
- Contract state violations

## 🧪 Testing

Run the test suite:

```bash
cargo test
```

## 📄 License

Licensed under the [Apache License, Version 2.0](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.