<script lang='ts'>
import Wallets from "./Wallets.svelte";
    let showWallets = false;

    const toggleShowWallets = () => {
        showWallets = !showWallets;
    }

</script>

    <div>
      <button
        type="button"
        on:click={() => {
          toggleShowWallets()
        }}
      >
        {showWallets ? "Hide Wallets" : "Show Wallets"}
      </button>

        {#if showWallets}
            <dialog open>
              <Wallets />
            </dialog>
        {/if}

    </div>

<style>
  /* Add your styles here */
</style>