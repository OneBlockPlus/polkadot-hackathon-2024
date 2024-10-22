<template>
  <q-page class="row">
    <main-component active></main-component>
  </q-page>
</template>

<script setup lang="ts">
import MainComponent from 'components/MainComponent.vue';

defineOptions({
  name: 'IndexPage',
});
</script>
