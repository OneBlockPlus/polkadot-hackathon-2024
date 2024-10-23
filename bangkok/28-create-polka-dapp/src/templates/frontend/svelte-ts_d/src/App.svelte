<script lang="ts">
  import svelteLogo from './assets/svelte.svg'
  import polkadotLogo from '/images/polkadot-logo.svg'
  import viteLogo from '/vite.svg'
  import typescriptLogo from './assets/typescript.svg'
  import useConnectedWalletStore from './lib/store/useConnectWalletStore'
  import useWalletsStore from './lib/store/useWalletsStore'
  import Header from "./lib/components/Header.svelte";
  import { setWallets } from './lib/components/contexts/wallets.context';
  import { onMount } from 'svelte';

  const api = $useConnectedWalletStore.api
  const connectedAccount = $useConnectedWalletStore.connectedAccount
  const connectedWallet = $useConnectedWalletStore.connectedWallet

  let balance: number;
  let chainToken: string;
  let chain: string;

  // setWallets()

    async function getChainData() {
      if (!api) return;
      const [_chain, _nodeName] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
      ]);
      chain = `${_chain} - ${_nodeName}`;

      if (connectedAccount?.address) {
         chainToken = api.registry.chainTokens[0];
        api.query.system.account(
          connectedAccount?.address,
          (res: { data: { free: { toHuman: () => number; }; }; }) => {
            balance = res.data.free.toHuman()
          }
        );
      }
    }

  async function signTransaction() {
    try {
      if (api && connectedAccount?.address && connectedWallet?.signer) {
        const signer = connectedWallet.signer;
        const decimals = api.registry.chainDecimals[0];

        await api.tx.system
          .remark("Hello World")
          .signAndSend(connectedAccount.address, { signer }, () => {
            // do something with result
          });
      }
    } catch (err) {
      alert("Error signing transaction");
      console.log(err);
    }
  }
  // biome-ignore lint/suspicious/noConfusingLabels: <explanation>
  // biome-ignore lint/correctness/noUnusedLabels: <explanation>
    $: {
    if(api) {
      getChainData()
    }
  }

  onMount(() => {
      $useWalletsStore.setWallets()
  })
</script>
      <Header />
    <main class="page-body">
      <div class="logos-container">
      <img src={typescriptLogo} class="logo" alt="Svelte Logo" />

        <h1>+</h1>

      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />

        <h1>+</h1>

      <img src={viteLogo} class="logo" alt="Svelte Logo" />

        <h1>+</h1>

        <img src={polkadotLogo} alt="Polkadot" class="logo" />
      </div>

      {#if $useConnectedWalletStore.connectedWallet?.isConnected}
        <div class="sample-transaction">

          {#if $useConnectedWalletStore.connectedAccount?.address}
            <p class="balance-label">
              Balance: {balance} {chainToken}
            </p>     
            
          <button
            type="button"
            on:click={() => {
              signTransaction();
            }}
          >
            Sign Transaction
          </button>
          {/if}


          <p class="chain-label">{chain}</p>
        </div>
        {:else}
        <div>
          <h4>Connect your Wallet</h4>
        </div>
      {/if}
      <p class="instructions">
        Make Changes to <code>/src/App.svelte</code>
      </p>
    </main>

<style>
  .logo {
    height: 6em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
</style>
