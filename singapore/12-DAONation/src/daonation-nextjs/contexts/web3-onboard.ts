import injectedModule from '@subwallet-connect/injected-wallets';
import { init } from '@subwallet-connect/react';
import subwalletPolkadotModule from '@subwallet-connect/subwallet-polkadot';
import { TransactionHandlerReturn } from '@subwallet-connect/core/dist/types';
import { WalletFilters } from '@subwallet-connect/injected-wallets/dist/types';
import { Chain } from '@subwallet-connect/common';
import PolkadtConfig from './json/polkadot-config.json';

// Initialize the provider
const filter: WalletFilters = {
  'Polkadot{.js}': true,
  'Detected Wallet': false,
  MetaMask: false
};

const injected = injectedModule({ filter: filter });

const subWalletP = subwalletPolkadotModule();
const polkadotInfo: Chain = {
  namespace: 'substrate',
  id: '9ce87712b99b3eb57396cc8621db8900ac983c712236f48fb70ad28760be3f6a',
  label: 'Polkadot',
  token: 'DOT',
  decimal: 12,
  rpcUrl: PolkadtConfig.chain_rpc
};

export default init({
  theme: 'dark',
  connect: {
    autoConnectLastWallet: true,
    autoConnectAllPreviousWallet: false
  },
  accountCenter: {
    desktop: {
      enabled: false
    },
    mobile: {
      enabled: false
    }
  },

  wallets: [injected, subWalletP],
  // An array of Chains that your app supports

  chains: [],
  chainsPolkadot: [polkadotInfo],

  appMetadata: {
    name: 'DAOnation'
  },
  notify: {
    desktop: {
      enabled: true,
      transactionHandler: (transaction): TransactionHandlerReturn => {
        if (transaction.eventCode === 'txConfirmed') {
          return {
            autoDismiss: 0
          };
        }
      },
      position: 'topLeft'
    }
  }
});
