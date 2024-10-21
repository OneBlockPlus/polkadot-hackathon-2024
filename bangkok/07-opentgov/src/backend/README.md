# OpenTGov Backend

## Description

OpenTGov Backend is the server-side component of opentgov, a platform for engagement with Polkadot's OpenGov through a Telegram bot interface. It handles user registration, proposal fetching, voting, and interaction with the Polkadot blockchain.

## Features

- User registration and management
- Proposal fetching and updating
- Voting on OpenGov referenda
- Telegram bot integration
- Polkadot blockchain interaction
- Supabase database integration

## Prerequisites

- Node.js (v14 or later recommended)
- npm or yarn
- Supabase account
- Telegram Bot Token
- Polkadot node access

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/mar1/opentgov/
   cd backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```
   BOT_TOKEN=your_telegram_bot_token
   CHANNEL_ID=your_telegram_channel_id
   SUBSCAN_API=your_subscan_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   FRONTEND_URL=your_frontend_url
   PORT=3001
   POLKADOT_NODE_URL=wss://rpc.polkadot.io
   PEOPLE_CHAIN_URL=wss://sys.ibp.network/people-polkadot
   ```

## Project Structure

The project follows a modular structure:

- `src/`
  - `app.js`: Main application file
  - `config/`: Configuration files
  - `controllers/`: Request handlers
  - `routes/`: API route definitions
  - `services/`: External service interactions
  - `middleware/`: Custom middleware functions

## Usage

To start the server:
> npm start

The server will start on the port specified in your `.env` file (default: 3001).

## API Endpoints

- `POST /api/users`: Register a new user
- `GET /api/proposals`: Fetch proposals
- `POST /api/votes`: Submit a vote
- `GET /api/votes/history/:telegramId`: Get voting history for a user

## Telegram Bot Commands

- `/start`: Begin the registration process
- `/vote <proposal_id> <aye/nay> <balance> [conviction]`: Submit a vote

## Database Schema

The project uses Supabase with the following main tables:

1. `users`: Stores user information
2. `referendums`: Stores proposal data
3. `votes`: Records user votes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Acknowledgements

- OneBlock Hackathon
- Polkadot Network
- Telegram Bot API
- Supabase
