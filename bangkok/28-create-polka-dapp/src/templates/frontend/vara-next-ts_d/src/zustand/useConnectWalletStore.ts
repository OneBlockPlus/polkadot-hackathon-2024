import { create } from "zustand";
import type { Account, BaseWallet } from "@polkadot-onboard/core";
import { GearApi } from "@gear-js/api";

interface ConnectedWalletState {
  connectedWallet: BaseWallet | null;
  isWalletConnected: boolean;
  connectWallet: (wallet: BaseWallet) => void;
  disconnectWallet: () => void;
  connectedAccount: Account | null;
  connectAccount: (account: Account) => void;
  disconnectAccount: () => void;
  accounts: Account[];
  gearApi: GearApi | null;
}

const useConnectedWalletStore = create<ConnectedWalletState>()((set) => ({
  connectedWallet: null,
  isWalletConnected: false,
  connectWallet: async (wallet: BaseWallet) => {
    try {
      await wallet.connect();

      const accounts = await wallet.getAccounts();
      // const WS_PROVIDER = process.env.WS_PROVIDER;

      const WS_PROVIDER = "wss://testnet.vara.network";
      const gearApi = await GearApi.create({
        providerAddress: WS_PROVIDER,
      });

      set({
        connectedWallet: wallet,
        accounts,
        isWalletConnected: true,
        gearApi,
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
      gearApi: null,
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
  gearApi: null,
}));

export default useConnectedWalletStore;
