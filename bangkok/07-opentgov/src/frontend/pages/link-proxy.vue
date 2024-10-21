<template>
  <div class="flex flex-col justify-center items-center h-screen bg-gray-800 text-white p-8">
    <NuxtImg class="my-4" src="/img/logo.png"></NuxtImg>
    <h1 class="text-4xl font-extrabold yellow mb-8 text-center">Create a Governance Proxy</h1>
    <div v-if="!walletConnected" class="mb-6">
      <button @click="showWalletSelector = true" class="blueBg hover:bg-yellow-500 text-2xl text-white py-3 px-6 font-extrabold rounded">
        Connect Wallet
      </button>
    </div>
    <div v-else class="text-center">
      <p class="text-xl mb-4">Wallet connected: <span class="font-bold italic blue">{{ walletAddress }}</span></p>
      <button @click="signExtrinsic" class="blueBg hover:bg-yellow-500 text-2xl text-white py-3 px-6 font-extrabold rounded">
        Sign Extrinsic
      </button>
    </div>
    <WalletSelector
      v-if="showWalletSelector"
      @walletSelected="connectWallet"
      @close="closeWalletSelector"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN } from 'bn.js'
import WalletSelector from '~/components/WalletSelector.vue';

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/@talismn/connect-ui@1.1.3/index.min.css'
    }
  ]
});

const walletAddress = ref('');
const walletConnected = ref(false);
const showWalletSelector = ref(false);

// Add a new ref to store the selected wallet name
const selectedWalletName = ref('');

const API_BASE_URL = 'http://localhost:3001';

const api = ref(null);
const { $supabase } = useNuxtApp();

onMounted(async () => {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  api.value = await ApiPromise.create({ provider });

  // Check if injectedWeb3 is available
  if (window.injectedWeb3) {
    console.log('injectedWeb3 is available');
  } else {
    console.error('injectedWeb3 is not available');
  }
});

async function connectWallet(walletName) {
  try {
    if (window.injectedWeb3 && window.injectedWeb3[walletName]) {
      const injected = await window.injectedWeb3[walletName].enable('opentgov');
      const accounts = await injected.accounts.get();
      if (accounts.length > 0) {
        walletAddress.value = accounts[0].address;
        walletConnected.value = true;
        showWalletSelector.value = false;
        // Store the selected wallet name
        selectedWalletName.value = walletName;
      } else {
        console.error('No accounts found');
      }
    } else {
      console.error(`${walletName} is not available`);
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
  }
}

async function signExtrinsic() {
  if (!api.value) {
    console.error('API not initialized');
    return;
  }

  const telegramId = new URLSearchParams(window.location.search).get('telegramId');
  if (!telegramId) {
    console.error('Telegram ID not found in URL');
    return;
  }

  const { data: userData, error } = await $supabase
    .from('users')
    .select('proxy_address')
    .eq('telegram_id', telegramId)
    .single();

  if (error || !userData) {
    console.error('Error fetching user data:', error);
    return;
  }

  const proxyAddress = userData.proxy_address;

  const extrinsic = api.value.tx.proxy.addProxy(proxyAddress, 'Governance', 0);
  try {
    console.log('Wallet address:', walletAddress.value);
    console.log('Selected wallet provider:', selectedWalletName.value);

    const injected = await window.injectedWeb3[selectedWalletName.value].enable('opentgov');
    console.log('Injected web3 enabled');

    const accounts = await injected.accounts.get();
    console.log('Available accounts:', accounts);

    if (!accounts.some(account => account.address === walletAddress.value)) {
      console.error('Connected wallet address not found in available accounts');
      return;
    }

    const signResult = await extrinsic.signAndSend(walletAddress.value, { signer: injected.signer });
    console.log('Extrinsic signed and sent successfully', signResult);

    // Send update request to backend
    const response = await fetch(`${API_BASE_URL}/api/update-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramId: telegramId,
        userStatus: 2,
        voterAddress: walletAddress.value
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user data');
    }

    const result = await response.json();
    console.log('User data updated successfully:', result);
    // Display a success alert
    alert('Proxy linked successfully!');

    // After the user clicks OK on the alert, redirect to the home page
    window.location.href = 'http://localhost:3000';
  } catch (error) {
    console.error('Error signing extrinsic:', error);
    // You might want to show an error message to the user here
  }
}

function closeWalletSelector() {
  showWalletSelector.value = false;
}
</script>

<style scoped>

</style>
