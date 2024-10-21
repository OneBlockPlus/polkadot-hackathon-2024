<template>
  <div class="flex h-screen">
    <LeftSection class="w-1/2 fixed left-0 top-0 h-full" />
    <RightSection class="w-1/2 ml-auto overflow-y-auto h-full" />
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Opentgov - Polkadot governance made easy',
  ogTitle: 'Opentgov',
  description: 'Empowering voters to engage with Polkadot openGov via telegram',
  ogDescription: 'Empowering voters to engage with Polkadot openGov via telegram',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
})

import LeftSection from '~/components/LeftSection.vue'
import RightSection from '~/components/RightSection.vue'
</script>

<style scoped>

</style>