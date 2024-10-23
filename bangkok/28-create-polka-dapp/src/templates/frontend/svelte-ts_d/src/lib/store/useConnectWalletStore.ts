import { create } from "zustand";
// import { createEventDispatcher } from "svelte";
import type { Account, BaseWallet } from "@polkadot-onboard/core";
import { ApiPromise, WsProvider } from "@polkadot/api";
import zustandToSvelte from "./zustandToSvelte";

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
}

// const dispatch = createEventDispatcher();

const useConnectedWalletStore = zustandToSvelte(
  create<ConnectedWalletState>((set) => ({
    connectedWallet: null,
    isWalletConnected: false,
    connectWallet: async (wallet: BaseWallet) => {
      try {
        await wallet.connect();

        const accounts = await wallet.getAccounts();
        // const WS_PROVIDER = import.meta.env.VITE_WS_PROVIDER;
        const WS_PROVIDER = "wss://westend-rpc.polkadot.io";
        const provider = new WsProvider(WS_PROVIDER);
        const api = await ApiPromise.create({ provider });

        set({
          connectedWallet: wallet,
          accounts,
          isWalletConnected: true,
          api,
        });

        // dispatch("walletConnected", {
        //   connectedWallet: wallet,
        //   accounts,
        //   isWalletConnected: true,
        //   api,
        // });
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

      // dispatch("walletDisconnected");
    },
    connectedAccount: null,
    connectAccount: async (account: Account) => {
      try {
        set({ connectedAccount: account });

        // dispatch("accountConnected", {
        //   connectedAccount: account,
        //   address: account.address,
        // });
      } catch (error) {
        console.log(error);
      }
    },
    disconnectAccount: () => {
      set({ connectedAccount: null });

      // dispatch("accountDisconnected");
    },
    accounts: [],
    api: null,
  }))
);

export default useConnectedWalletStore;
