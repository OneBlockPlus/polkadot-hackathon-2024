import { Entries } from '@/types';

import EnkryptSVG from './assets/enkrypt.svg?react';
import PolkadotSVG from './assets/polkadot.svg?react';
import SubWalletSVG from './assets/subwallet.svg?react';
import TalismanSVG from './assets/talisman.svg?react';

const WALLET = {
  'polkadot-js': { name: 'Polkadot JS', SVG: PolkadotSVG },
  'subwallet-js': { name: 'SubWallet', SVG: SubWalletSVG },
  talisman: { name: 'Talisman', SVG: TalismanSVG },
  enkrypt: { name: 'Enkrypt', SVG: EnkryptSVG },
};

const WALLETS = Object.entries(WALLET) as Entries<typeof WALLET>;

export const WALLET_ID_LOCAL_STORAGE_KEY = 'wallet';

export { WALLET, WALLETS };
