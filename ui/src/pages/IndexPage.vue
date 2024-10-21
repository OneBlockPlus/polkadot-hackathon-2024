<template>
  <q-page class="row">
    <example-component active></example-component>
  </q-page>
</template>

<script setup lang="ts">
import ExampleComponent from 'components/ExampleComponent.vue';

defineOptions({
  name: 'IndexPage',
});
</script>
