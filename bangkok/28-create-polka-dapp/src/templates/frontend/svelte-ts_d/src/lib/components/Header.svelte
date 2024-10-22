<script lang='ts'>
import ConnectedAccount from "./connect-wallet-components/ConnectedAccount.svelte";
import ConnectAccountButton from "./connect-wallet-components/ConnectAccountButton.svelte";
import ConnectWalletButton from "./connect-wallet-components/ConnectWalletButton.svelte";
import useConnectedWalletStore from "../store/useConnectWalletStore";

</script>
<header class="header">
    <h2>create-polka-dapp</h2>

    <div>
        {#if $useConnectedWalletStore.connectedWallet?.isConnected}

            {#if $useConnectedWalletStore.connectedAccount}
                <ConnectedAccount />
            {:else}
                <ConnectAccountButton />
                
            {/if}
        {:else}
            <ConnectWalletButton />
        {/if}
    </div>
</header>

<style>
  /* Add your styles here */
</style>