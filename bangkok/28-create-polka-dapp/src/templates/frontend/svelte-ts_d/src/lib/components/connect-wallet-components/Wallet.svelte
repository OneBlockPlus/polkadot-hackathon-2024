<script lang='ts'>
import { createEventDispatcher } from 'svelte';
import type { BaseWallet } from "@polkadot-onboard/core";
import useConnectedWalletStore from "../../store/useConnectWalletStore";

    export let wallet: BaseWallet; // Receive wallet as a prop


const connectWalletHandler = async () => {
   $useConnectedWalletStore.connectWallet(wallet);
  };

</script>

<div>
    <div class="wallet-option">
        {#if wallet?.metadata?.iconUrl}
        <img
          width={25}
          height={25}
          src={wallet.metadata.iconUrl}
          alt="wallet icon"
        />
        {/if}

      <div>{`${wallet.metadata.title}`}</div>

      <button type="button" on:click={connectWalletHandler}>
        Connect Wallet
      </button>
    </div>
</div>

<style>
  /* Add your styles here */
</style>