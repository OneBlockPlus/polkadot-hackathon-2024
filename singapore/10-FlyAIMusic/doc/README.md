# Music NFT Platform

A decentralized platform for creating, trading, and collecting music NFTs powered by Vue.js and Polkadot.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Frontend](#frontend)
- [Backend](#backend)
- [Smart Contracts](#smart-contracts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Music NFT Platform is a revolutionary marketplace that allows artists to create and sell their music as Non-Fungible Tokens (NFTs) while enabling fans to collect, trade, and earn royalties from these digital assets.

## Features

- User authentication and wallet integration
- NFT creation and minting for music tracks
- NFT marketplace for buying and selling music NFTs
- Royalty distribution system for artists and collectors
- User profiles and artist showcases
- Discover and explore new music NFTs
- Real-time notifications for platform activities

## Architecture

### Frontend
- Vue.js 3 with Composition API
- Vuex for state management
- Vue Router for navigation
- Tailwind CSS for styling
- Axios for API requests

### Backend
- Polkadot blockchain
- Substrate framework for custom chain development
- IPFS for decentralized storage of music files and metadata

### Smart Contracts
- ink! for writing smart contracts on Polkadot

## Prerequisites

- Node.js (v14+)
- Yarn or npm
- Rust and Cargo
- Substrate and ink! development environment
- IPFS node (local or remote)

## Installation

1. Clone the repository:
git clone https://github.com/your-username/music-nft-platform.git
cd music-nft-platform
Copy
2. Install frontend dependencies:
cd frontend
yarn install
Copy
3. Set up the Substrate node:
cd ../substrate-node
cargo build --release
Copy
4. Compile smart contracts:
cd ../contracts
cargo +nightly contract build
Copy
## Usage

1. Start the Substrate node:
cd substrate-node
./target/release/node-template --dev
Copy
2. Deploy smart contracts to the local node (instructions in the contracts folder)

3. Start the frontend development server:
cd frontend
yarn serve
Copy
4. Access the application at `http://localhost:8080`

## Frontend

The frontend is built with Vue.js 3 and uses the following structure:
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── views/
│   ├── router/
│   ├── store/
│   ├── services/
│   ├── utils/
│   ├── App.vue
│   └── main.js
├── tests/
└── package.json
Copy
Key components include:
- NFT Creation
- Marketplace
- User Profile
- Wallet Integration
- Discover Page

## Backend

The backend is powered by a custom Substrate chain with the following modules:

- NFT Module: Handles NFT creation, ownership, and transfers
- Marketplace Module: Manages listings, sales, and auctions
- Royalty Module: Calculates and distributes royalties
- Identity Module: Manages user profiles and verification

## Smart Contracts

Smart contracts are written in ink! and include:

- NFTContract: Implements ERC-721 standard for NFTs
- MarketplaceContract: Handles buying, selling, and auction logic
- RoyaltyContract: Manages royalty calculations and distributions

## Testing

1. Run frontend tests:
cd frontend
yarn test:unit
Copy
2. Run Substrate chain tests:
cd substrate-node
cargo test
Copy
3. Run smart contract tests:
cd contracts
cargo +nightly test
Copy
## Deployment

1. Build the frontend for production:
cd frontend
yarn build
Copy
2. Deploy the Substrate node to a cloud provider or dedicated server

3. Deploy smart contracts to the live Polkadot network

4. Set up IPFS nodes for decentralized storage

Detailed deployment instructions can be found in the `DEPLOYMENT.md` file.

## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.
