<!-- components/LeftSection.vue -->
<template>
  <div class="flex flex-col justify-center items-center h-full bg-gray-800 text-white p-8">
    <div class="mb-4">
      <NuxtImg src="/img/logo.png"></NuxtImg>
    </div>
    <p class="text-4xl font-extrabold yellow my-4">
      Opent<span class="underline blueDecoration decoration-dotted">gov</span>
    </p>
    <p class="text-2xl mb-4 text-center">
      <span class="font-bold italic blue">Your daily dose of Polkadot governance</span>
      <br>
      🗳️ Discuss, vote, and influence proposals directly via Telegram
    </p>
    <form @submit.prevent="submitForm" class="w-full max-w-sm">
      <div class="flex items-center py-2">
        <a href="https://t.me/opentgov" target="_blank" class="mx-auto">
        <button class="flex-shrink-0 blueBg hover:bg-yellow-500 text-2xl text-white py-3 px-4 font-extrabold rounded mx-auto" type="button">
          ✨ JOIN US
        </button>
      </a>
      </div>
    </form>
    <p class="mt-4 text-sm text-center" v-if="stats">
     <b class="blue text-md">{{ stats.proposalCount }}</b> proposals tracked
     <br>
     <b class="blue text-md">{{ stats.userCount }}</b> voters registered
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref(null)

const fetchStats = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/stats')
    const result = await response.json()
    if (result.success) {
      stats.value = result.data
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>
