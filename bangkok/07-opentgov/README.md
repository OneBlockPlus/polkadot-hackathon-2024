# Project opentgov

## Logo

![OpenTGov Logo](https://opentgov.com/img/logo.png)

## Introduction

[OpenTGov](https://opentgov.com) is a new Telegram platform built for voting & participating in Polkadot's OpenGov.

It aims at improving participation, transparency and discussion of DOT stakeholders regarding on-chain referendums.

More than only discovering new spending proposals or tracking them, DOT stakeholders will be able to directly vote in telegram using the bot, in a trustless-way thanks to the governance proxy.

It empowers users to participate in on-chain governance, vote on referenda, and stay informed about the latest proposals.

## Demo

1. [Demo Video](https://youtu.be/wJlao-N8hS0)
2. [PPT](https://docs.google.com/presentation/d/1FI8S-IR1fqjmPzIvPLbv_OnJ0DNwR4ac-76htlK64Zg/edit?usp=sharing)
3. [Telegram Channel](https://t.me/opentgov)
4. [Telegram Bot](https://t.me/opentgov_bot)
5. [Web Interface](https://opentgov.com)
6. [Github Repo](https://github.com/mar1/opentgov)

## Features planned for the Hackathon

- [x] Tracking and indexing on-chain proposals.
- [x] Creating a wrapper to connect to the Telegram API
- [x] Automation of new posts per track/chan
- [x] Automation of updating posts with voting infos
- [x] Custodial solution with proxy wallet creation to allow on-chain vote from the app
- [x] Front-end displaying current votes and activities on the Telegram channels
- [ ] Automated X posts with new proposals

## Features developed during the Hackathon

- 🤖 Telegram Bot Integration: Interact with Polkadot governance directly through Telegram
- 🗳️ Easy Voting: Vote on referenda with simple commands
- 📊 Real-time Proposal Tracking: Stay updated on the latest governance proposals
- 🔐 Secure Proxy Setup: Easily set up and manage your voting proxy
- 📱 Web Interface: View proposals and stats through a sleek web frontend
- 🔄 Automatic Data Updates: Regular fetching and updating of on-chain data

## Architecture

OpenTGov consists of two main components:

1. Backend: Node.js server handling bot logic, blockchain interactions, governance proxy creation and data management
2. Frontend: Nuxt.js web application for displaying proposals and statistics

![OpenTGov Architecture](https://www.imghost.net/ib/hLV7gC7ybKjXLyW_1729535387.png)

### Backend

The backend is built with Express.js and includes the following key components:

- Telegram Bot Service: Handles user interactions and commands
- Polkadot API Integration: Interacts with the Polkadot blockchain
- Database Service: Manages user data and proposal information using Supabase
- Vote Controller: Handles vote submission and retrieval
- Proposal Controller: Manages proposal data fetching and updates

### Frontend

The frontend is a Nuxt.js application with the following features:

- Responsive Design: Built with Tailwind CSS for a mobile-friendly interface
- Real-time Updates: Displays the latest proposal information
- Wallet Integration: Allows users to connect their Polkadot wallets (polkajs, talisman & subwallet)
- Proxy Management: Interfaces for setting up and removing governance proxies

## Usage

### Telegram Bot Commands

- `/start`: Begin the registration process
- `/vote <proposal_id> <aye/nay> <balance> [conviction]`: Submit a vote
- `/history`: View your voting history
- `/delete`: Remove your proxy

### Web Interface

Visit `https://opentgov.com` to access the web interface, where you can:

- View the latest proposals
- See voting statistics
- Filter proposals by status
- Set up and manage your governance proxy
- Join the Telegram channel

## 🛠️ Tech Stack

- Backend:
  - Node.js
  - Express.js
  - Polkadot.js
  - Supabase
  - node-telegram-bot-api

- Frontend:
  - Nuxt.js
  - Vue.js
  - Tailwind CSS
  - Polkadot.js
  - Ethers.js

## Documentation

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account
- Telegram Bot Token
- Polkadot node access

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/mar1/opentgov.git
   cd opentgov
   ```

2. Install dependencies for both backend and frontend:

   ```
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory with the necessary configurations (refer to the backend README for details).

4. Start the backend server:

   ```
   cd backend && npm start
   ```

5. Start the frontend development server:

   ```
   cd frontend && npm run dev
   ```

For more detailed information about each component, please refer to the individual README files in the `backend` and `frontend` directories in the `src` folder.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Team info

| name         | role         | GitHub |
| ----------- | ----------- | -----------  |
| Marin  | Fullstack developer  | [mar1](https://github.com/mar1)   |
