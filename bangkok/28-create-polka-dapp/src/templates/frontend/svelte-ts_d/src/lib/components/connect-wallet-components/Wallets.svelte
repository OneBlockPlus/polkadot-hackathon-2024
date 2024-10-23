<script lang='ts'>
import Wallet from "./Wallet.svelte";
import walletAggregator from "../../configs/walletProviderAggregator"
import { onMount } from 'svelte';
import type { BaseWallet } from "@polkadot-onboard/core";
  import useWalletsStore from "../../store/useWalletsStore";

let wallets: BaseWallet[] | undefined;
const initialWaitMs = 5000;
async function getWallets() {
      const timeoutId = setTimeout(async () => {
      const wallets = await walletAggregator.getWallets();
    }, initialWaitMs);

    return () => clearTimeout(timeoutId)
}

onMount(() => {
    getWallets()
});

</script>

<div class="wallets">
    {#if !$useWalletsStore.wallets || $useWalletsStore.wallets.length === 0}
        <div>No wallets available</div>
    {:else}
        {#each $useWalletsStore.wallets as wallet}
            <Wallet wallet={wallet} />
        {/each}
    {/if}
</div>

<style>
  /* Add your styles here */
</style>