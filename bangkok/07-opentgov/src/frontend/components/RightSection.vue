<!-- components/RightSection.vue -->
<template>
  <div class="p-8">
    <FilterTags :activeTag="activeFilter" @filter="setFilter" />
    <div class="grid grid-cols-2 gap-4">
      <ProposalCard
        v-for="proposal in filteredProposals"
        :key="proposal.id"
        :proposal="proposal"
        :telegramLink="getTelegramLink(proposal.post_id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ethers } from 'ethers'
import ProposalCard from './ProposalCard.vue'
import FilterTags from './FilterTags.vue'


const activeFilter = ref('Newest')

const proposals = ref([])

function calculateVotePercentages(ayes, nays) {
    // Calculate total votes
    ayes = parseInt(ayes)
    nays = parseInt(nays)
    const total = ayes + nays;

    // Calculate percentages
    const ayePercentage = ((ayes / total) * 100).toFixed(2); // rounding to 2 decimal places
    const nayPercentage = ((nays / total) * 100).toFixed(2); // rounding to 2 decimal places

    return {
        ayePercentage: `${ayePercentage}%`,
        nayPercentage: `${nayPercentage}%`,
    };
}


const formatAmount = (amount, assetId) => {
  if (assetId === null) {
    return `${parseInt(ethers.formatUnits(amount, 10)).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} DOT`
  } else if (parseInt(assetId) === 1984 || parseInt(assetId) === 1337) {
    return `${parseInt(ethers.formatUnits(amount, 6)).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} USD`
  }
  // Default case, shouldn't normally happen
  return `${amount} (Unknown Asset)`
}

const getTelegramLink = (postId) => {
  return `https://t.me/opentgov/${postId}`
}

onMounted(async () => {
  const { $supabase } = useNuxtApp()

  let { data, error } = await $supabase
    .from('referendums')
    .select('*')

  if (error) {
    console.error(error)
  } else {
    // Apply formatAmount for each proposal
    proposals.value = data.map(proposal => ({
      ...proposal,
      formattedAmount: formatAmount(proposal.requestedAmount, proposal.assetId),
      formattedAye: calculateVotePercentages(proposal.ayes,proposal.nays).ayePercentage,
      formattedNay: calculateVotePercentages(proposal.ayes,proposal.nays).nayPercentage,
    }))
  }
})
const setFilter = (filter) => {
  activeFilter.value = filter
}

const filteredProposals = computed(() => {
  switch (activeFilter.value) {
    case 'Newest':
      return [...proposals.value].sort((a, b) => b.post_id - a.post_id)
    case 'Ongoing':
      return proposals.value.filter(p => p.status === 'Deciding')
    case 'Ended':
      return proposals.value.filter(p => p.status === 'Closed')
    default:
      return proposals.value
  }
})
</script>
