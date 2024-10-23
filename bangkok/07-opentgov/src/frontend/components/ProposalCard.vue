<!-- components/ProposalCard.vue -->
<template>
  <a :href="telegramLink" target="_blank" rel="noopener noreferrer" class="block">
    <div class="bg-gray-800 rounded-lg p-6 text-white hover:bg-gray-900 transition-all duration-200 transform hover:scale-[1.02] blueBorder">
      <div class="border-b-2 border-gray-700 pb-2 mb-4">
        <h2 class="text-xl font-bold">🗳 Referendum #{{ proposal.post_id }}</h2>
        <p class="font-semibold yellow">{{ proposal.title }}</p>
      </div>

      <div class="space-y-4">
        <section>
          <h3 class="text-lg font-semibold mb-2">ℹ️ Overview</h3>
          <ul class="list-disc list-inside">
            <li>Status: <span class="font-bold">{{ proposal.status }}</span> 🗳️</li>
            <li>Track: <span class="font-bold">{{ proposal.topic_name }}</span> 🛤</li>
            <li>Requested: <span class="font-bold">{{ proposal.formattedAmount }}</span> 💰</li>
          </ul>
        </section>

        <section>
          <h3 class="text-lg font-semibold mb-2">👤 Proposer</h3>
          <p class="break-all">→ {{ proposal.proposer_name }}</p>
        </section>

        <section>
          <h3 class="text-lg font-semibold mb-2">📝 Description</h3>
          <p class="text-sm">{{ truncateDescription(proposal.description) }}</p>
        </section>

        <section>
          <h3 class="text-lg font-semibold mb-2">📊 Current Tally</h3>
          <ul class="list-disc list-inside">
            <li>✅ Ayes: <span class="font-bold">{{ proposal.formattedAye }}</span></li>
            <li>❌ Nays: <span class="font-bold">{{ proposal.formattedNay }}</span></li>
          </ul>
        </section>
      </div>
    </div>
  </a>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  proposal: {
    type: Object,
    required: true
  }
})

const telegramLink = computed(() => `https://t.me/opentgov/${props.proposal.post_id}`)

const truncateDescription = (desc) => {
  const maxLength = 500
  desc = desc.replace(/<\/?[^>]+(>|$)/g, '')
  desc = desc.replace(/&nbsp;/g, '');
  return desc.length > maxLength ? desc.slice(0, maxLength) + '...' : desc
}


</script>
