import { create } from "zustand";
// import { createEventDispatcher } from "svelte";
import type { Account, BaseWallet } from "@polkadot-onboard/core";
import { ApiPromise, WsProvider } from "@polkadot/api";
import zustandToSvelte from "./zustandToSvelte";
import walletAggregator from "../configs/walletProviderAggregator";
interface WalletsStat {
  wallets: BaseWallet[];
  setWallets: () => void;
  api: ApiPromise | null;
}
const initialWaitMs = 5;

const useWalletsStore = zustandToSvelte(
  create<WalletsStat>((set) => ({
    wallets: [],
    setWallets: async () => {
      const timeoutId = setTimeout(async () => {
        const wallets = await walletAggregator.getWallets();
        set({ wallets });
      }, initialWaitMs);
      return () => clearTimeout(timeoutId);
    },
    api: null,
  }))
);

export default useWalletsStore;
