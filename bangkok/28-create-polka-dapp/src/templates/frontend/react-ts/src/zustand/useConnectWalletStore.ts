import { create } from "zustand";
import type { Account, BaseWallet } from "@polkadot-onboard/core";
import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  type ChainConfig,
  chainsConfig,
  getApiForChain,
} from "../configs/chainsConfig";

interface ConnectedWalletState {
  connectedWallet: BaseWallet | null;
  isWalletConnected: boolean;
  connectWallet: (wallet: BaseWallet) => void;
  disconnectWallet: () => void;
  connectedAccount: Account | null;
  connectAccount: (account: Account) => void;
  disconnectAccount: () => void;
  accounts: Account[];
  api: ApiPromise | null;
  currentChain: ChainConfig | null;
  changeChain: (chain: ChainConfig) => void;
}

const useConnectedWalletStore = create<ConnectedWalletState>()((set) => ({
  connectedWallet: null,
  isWalletConnected: false,
  connectWallet: async (wallet: BaseWallet) => {
    try {
      await wallet.connect();

      const accounts = await wallet.getAccounts();
      const DEFAULT_CHAIN = chainsConfig[0];

      const WS_PROVIDER = DEFAULT_CHAIN.wsUrl;
      const provider = new WsProvider(WS_PROVIDER);
      const api = await ApiPromise.create({ provider });

      set({
        connectedWallet: wallet,
        accounts,
        isWalletConnected: true,
        api,
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
  connectedAccount: null,
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
  accounts: [],
  api: null,
  currentChain: null,
  changeChain: async (chainConfig: ChainConfig) => {
    const api = await getApiForChain(chainConfig);
    set({ api: api, currentChain: chainConfig });
  },
}));

export default useConnectedWalletStore;
