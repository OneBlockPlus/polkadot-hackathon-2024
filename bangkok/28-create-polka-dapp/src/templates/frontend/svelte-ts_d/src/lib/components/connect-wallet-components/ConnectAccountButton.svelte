<script lang='ts'>
import useConnectedWalletStore from "../../store/useConnectWalletStore";
import AccountItem from "./AccountItem.svelte";

let showAccounts = false;

const toggleShowAccounts = () => {
    showAccounts = !showAccounts;
}

</script>

    <div>
        {#if $useConnectedWalletStore.accounts.length === 0}
           <div>You have No Account</div>;
          {:else}
    <div>
        <div class="show-accounts">
            {#if $useConnectedWalletStore.connectedWallet?.metadata?.iconUrl}
                            <img
              width={25}
              height={25}
              src={$useConnectedWalletStore.connectedWallet.metadata.iconUrl}
              alt="wallet icon"
            />
            {/if}

          <button
            type="button"
            on:click={() => {
              toggleShowAccounts();
            }}
          >
            {showAccounts ? "Hide Accounts" : "Show Accounts"}
          </button>
        </div>

        {#if showAccounts}
          <dialog open>
            <div class="accounts-list">
            {#each $useConnectedWalletStore.accounts as account (account.address)}
                <AccountItem account={account} />
            {/each}
            </div>
          </dialog>            
        {/if}
    </div>
        {/if}
    </div>

<style>
  /* Add your styles here */
</style>