<script lang='ts'>
import useConnectedWalletStore from "../../store/useConnectWalletStore";
import type { Account } from "@polkadot-onboard/core";

export let account: Account; // Receive account as a prop

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
</script>

      <div class="account-item">
        <div class="account-name">{shorten(account?.name)}</div>
        <div>{shorten(account?.address)}</div>
        <div>
          <button
            type="button"
            on:click={() => {
              $useConnectedWalletStore.connectAccount(account);
            }}
          >
            Connect Account
          </button>
        </div>
      </div>

<style>
  /* Add your styles here */
</style>