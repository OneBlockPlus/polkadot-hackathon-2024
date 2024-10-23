import { writable, type Writable } from "svelte/store";
import { getContext, setContext } from "svelte";
import walletAggregator from "../../configs/walletProviderAggregator";
import type { BaseWallet } from "@polkadot-onboard/core";

const initialWaitMs = 5; // the default is set to 5ms to give extensions enough lead time to inject their providers
const walletAggregatorConfig = walletAggregator; // initialize this with your WalletAggregator instance

export async function setWallets() {
  const walletsData = await walletAggregatorConfig.getWallets();
  const wallets = writable<BaseWallet[]>(walletsData);
  setContext("useWallets", wallets);
}

export function getWallets() {
  return getContext<BaseWallet[] | undefined>("useWallets");
}
