# Relay Console

Relay Console is the official frontend interface for DoTLink, an IoT SDK that bridges the Internet of Things (IoT) with the Polkadot ecosystem. This web application provides a user-friendly interface for managing DoTLink accounts, tracking transactions, and ordering relay devices.

## Features

- 🔐 *Account Management*
  - Secure account generation
  - Mnemonic phrase management

- 📊 *Transaction Dashboard*
  - Real-time transaction monitoring
  - Historical transaction data

- 🛍️ *Device Management*
  - Order new relay devices

## Tech Stack

- *Framework*: Next.js
- *Language*: JavaScript
- *Styling*: SCSS
- *API Integration*: REST

## Prerequisites

Before you begin, ensure you have installed:

- Node.js 14.0 or later
- npm or yarn
- Git

## Getting Started

1. Clone the repository:
bash
git clone https://github.com/your-org/relay-console.git
cd relay-console


2. Install dependencies:
bash
npm install
# or
yarn install


3. Set up environment variables:
bash
cp .env.example .env.local

Edit .env.local with your configuration:

NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_POLKADOT_NETWORK=your_network


4. Run the development server:
bash
npm run dev
# or
yarn dev


5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure


relay-console/
├── components/       # Reusable UI components
├── pages/           # Next.js pages
├── public/          # Static assets
├── styles/          # Global styles
├── lib/            # Utility functions
├── types/          # TypeScript type definitions
└── contexts/       # React contexts


## Configuration

## Available Scripts

- npm run dev: Start development server
- npm run build: Build production application
- npm run start: Start production server


## Contributing

We welcome contributions to the Relay Console! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## Integration with DoTLink

Relay Console works in conjunction with the DoTLink SDK. For full functionality, ensure you have:

1. A running DoTLink backend instance
2. Proper API endpoint configuration
3. Valid Polkadot network settings

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
