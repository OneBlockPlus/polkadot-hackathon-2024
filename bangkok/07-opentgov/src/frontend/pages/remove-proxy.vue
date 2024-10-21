<template>
    <div class="flex flex-col justify-center items-center h-screen bg-gray-800 text-white p-8">
      <NuxtImg class="my-4" src="/img/logo.png"></NuxtImg>
      <h1 class="text-4xl font-extrabold yellow mb-8 text-center">Remove Governance Proxy</h1>
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
  import WalletSelector from '~/components/WalletSelector.vue';

  const walletAddress = ref('');
  const walletConnected = ref(false);
  const showWalletSelector = ref(false);
  const selectedWalletName = ref('');

  const API_BASE_URL = 'http://localhost:3001';

  const api = ref(null);
  const { $supabase } = useNuxtApp();

  onMounted(async () => {
    const provider = new WsProvider('wss://rpc.polkadot.io');
    api.value = await ApiPromise.create({ provider });
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

    const extrinsic = api.value.tx.proxy.removeProxy(proxyAddress, 'Governance', 0);
    try {
      const injected = await window.injectedWeb3[selectedWalletName.value].enable('opentgov');
      const accounts = await injected.accounts.get();

      if (!accounts.some(account => account.address === walletAddress.value)) {
        console.error('Connected wallet address not found in available accounts');
        return;
      }

      const signResult = await extrinsic.signAndSend(walletAddress.value, { signer: injected.signer });
      console.log('Extrinsic signed and sent successfully', signResult);

      // Send update request to backend
      const response = await fetch(`${API_BASE_URL}/api/remove-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: telegramId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      const result = await response.json();
      console.log('User status updated successfully:', result);
      alert('Proxy removed successfully!');
      window.location.href = 'http://localhost:3000';
    } catch (error) {
      console.error('Error signing extrinsic:', error);
    }
  }

  function closeWalletSelector() {
    showWalletSelector.value = false;
  }
  </script>

  <style scoped>

  </style>