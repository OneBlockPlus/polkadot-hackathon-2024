<!-- components/FilterTags.vue -->
<template>
  <div class="flex justify-center space-x-2 mb-6">
    <button
      v-for="tag in tags"
      :key="tag"
      @click="$emit('filter', tag)"
      :class="[
        'px-4 py-2 rounded-full text-md font-medium',
        activeTag === tag
          ? 'blueBg text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      ]"
    >
      {{ tag }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  activeTag: {
    type: String,
    required: true
  }
})

const tags = ref(['Newest', 'Hottest', 'Ongoing', 'Ended'])

defineEmits(['filter'])
</script>