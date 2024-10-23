<script lang='ts'>
  import { writable, derived } from 'svelte/store';
  import type { BaseWallet, WalletAggregator } from '@polkadot-onboard/core';
  import walletAggregator from '../configs/walletProviderAggregator';

  const initialWaitMs = 5; // the default is set to 5ms to give extensions enough lead time to inject their providers
  const walletAggregatorConfig = walletAggregator; // initialize this with your WalletAggregator instance

  export const useWallets = writable<BaseWallet[] | undefined>(undefined);

  // This function mimics the useEffect from the original React code
  const fetchWallets = async () => {
    const timeoutId = setTimeout(async () => {
      const walletsData = await walletAggregatorConfig.getWallets();
      useWallets.set(walletsData);
    }, initialWaitMs);

    return () => clearTimeout(timeoutId);
  };

  fetchWallets();
</script>