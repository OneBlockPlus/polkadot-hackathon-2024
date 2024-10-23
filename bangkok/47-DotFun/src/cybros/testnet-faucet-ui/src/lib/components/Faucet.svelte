<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import Form from "$lib/components/Form.svelte";
  import Error from "$lib/components/screens/Error.svelte";
  import FrequentlyAskedQuestions from "$lib/components/screens/FrequentlyAskedQuestions.svelte";
  import Success from "$lib/components/screens/Success.svelte";
  import type { NetworkData } from "$lib/utils/networkData";
  import { operation, testnet } from "$lib/utils/stores";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  export let faq: string;
  export let network: NetworkData;

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    testnet.set(network);
  });
</script>

<main>
  <div class="flex items-center justify-center mt-16 mb-4 md:my-16">
    <Card>
      {#if !$operation}
        <Form network={-1} />
      {:else}
        <div in:fly={{ y: 30, duration: 500 }}>
          {#if $operation.success}
            <Success hash={$operation.hash} />
          {:else}
            <Error error={$operation.error} />
          {/if}
        </div>
      {/if}
    </Card>
  </div>
  <FrequentlyAskedQuestions {faq} />
</main>

<style lang="postcss">
  main {
    @apply mx-auto my-0 md:p-8;
    max-width: 720px;
    text-align: center;
  }

  @media (min-width: 768px) {
    main {
      min-height: 90vh;
    }
  }
</style>
