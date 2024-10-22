import type { Account, BaseWallet } from "@polkadot-onboard/core";
import { createStore } from "zustand/vanilla";
import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  type ChainConfig,
  chainsConfig,
  getApiForChain,
} from "@/configs/chainsConfig";

export type WalletState = {
  connectedWallet: BaseWallet | null;
  isWalletConnected: boolean;
  connectedAccount: Account | null;
  accounts: Account[];
  api: ApiPromise | null;
  currentChain: ChainConfig | null;
};

export type WalletActions = {
  connectWallet: (wallet: BaseWallet) => void;
  disconnectWallet: () => void;
  connectAccount: (account: Account) => void;
  disconnectAccount: () => void;
  changeChain: (chainConfig: ChainConfig) => void;
};

export type WalletStore = WalletState & WalletActions;

export const defaultInitState: WalletState = {
  connectedWallet: null,
  isWalletConnected: false,
  connectedAccount: null,
  accounts: [],
  api: null,
  currentChain: null,
};

export const createWalletStore = (
  initState: WalletState = defaultInitState
) => {
  return createStore<WalletStore>()((set) => ({
    ...initState,
    connectWallet: async (wallet: BaseWallet) => {
      try {
        await wallet.connect();
        const account = await wallet.getAccounts();
        const DEFAULT_CHAIN = chainsConfig[0];
        const WS_PROVIDER = DEFAULT_CHAIN.wsUrl;
        const provider = new WsProvider(WS_PROVIDER);
        const api = await ApiPromise.create({ provider });

        set({
          connectedWallet: wallet,
          accounts: account,
          isWalletConnected: true,
          api: api,
          currentChain: DEFAULT_CHAIN,
        });
      } catch (error) {
        console.log(error);
      }
    },
    disconnectWallet: () => {
      set({
        connectedWallet: null,
        accounts: [],
        isWalletConnected: false,
        connectedAccount: null,
        api: null,
      });
    },
    connectAccount: async (account: Account) => {
      try {
        set({ connectedAccount: account });
      } catch (error) {
        console.log(error);
      }
    },
    disconnectAccount: () => {
      set({ connectedAccount: null });
    },
    changeChain: async (chainConfig: ChainConfig) => {
      const api = await getApiForChain(chainConfig);
      set({ api: api, currentChain: chainConfig });
    },
  }));
};
