<script lang='ts'>
import useConnectedWalletStore from "../../store/useConnectWalletStore";

let showDialog = false;

const shorten = (str: string | undefined) => {
  if (!str) return str;
  const size = 10;
  let result = str;
  if (str && str.length > 2 * size) {
    const start = str.slice(0, size);
    const end = str.slice(-size);
    result = `${start}...${end}`;
  }
  return result;
};

const toggleShowDialog = () => {
    showDialog = !showDialog;
}

</script>

    <div>
      <div class="connected-account">
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
            toggleShowDialog();
          }}
        >
          <div>{shorten($useConnectedWalletStore.connectedAccount?.address)}</div>
        </button>
      </div>
         {#if showDialog}
        <dialog open>
          <div class="disconnect-buttons-container">
            <button
              type="button"
              on:click={() => {
                $useConnectedWalletStore.disconnectAccount();
              }}
            >
              Disconnect Account
            </button>
            <button
              type="button"
              on:click={() => {
                $useConnectedWalletStore.disconnectWallet();
              }}
            >
              Disconnect Wallet
            </button>
          </div>
        </dialog>
        {/if}
    </div>

<style>
  /* Add your styles here */
</style>