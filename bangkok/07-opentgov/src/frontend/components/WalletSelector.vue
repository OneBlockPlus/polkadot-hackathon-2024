<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" @click.self="closeModal">
    <div class="bg-gray-800 p-8 rounded-lg shadow-lg text-white">
      <h2 class="text-3xl font-extrabold yellow mb-6">Select a Wallet</h2>
      <div class="flex flex-col space-y-4">
        <button
          @click="selectWallet('polkadot-js')"
          class="blueBg hover:bg-yellow-500 text-xl text-white py-3 px-6 font-bold rounded transition duration-300"
        >
          Polkadot.js
        </button>
        <button
          @click="selectWallet('talisman')"
          class="blueBg hover:bg-yellow-500 text-xl text-white py-3 px-6 font-bold rounded transition duration-300"
        >
          Talisman
        </button>
        <button
          @click="selectWallet('subwallet-js')"
          class="blueBg hover:bg-yellow-500 text-xl text-white py-3 px-6 font-bold rounded transition duration-300"
        >
          Subwallet
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['walletSelected', 'close']);

function selectWallet(walletName) {
  emit('walletSelected', walletName);
}

function closeModal() {
  emit('close');
}
</script>

<style scoped>

</style>
