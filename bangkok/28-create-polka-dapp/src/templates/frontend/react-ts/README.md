# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Also using the `zustand` package to implement a nice Wallet Hook available all through the app, using the `useConnectWalletStore` function.

## Extra Setup

1. Create new `.env` file using the `.env.example` template and fill in the variables.
2. Check out and edit as you like the configs for the possible polkadot wallet extensions in the file `./src/configs/extensionConnectConfig.tsx`.
3. Check and edit as you like the configs for WalletConnect in the file `./src/providers/walletProviderAggregator.tsx`

### Dependencies

- @polkadot-onboard/core
- @polkadot-onboard/injected-wallets
- @polkadot-onboard/react
- @polkadot-onboard/wallet-connect
- zustand
