<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Dark Factory </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'MainLayout',
});

import { useMeta } from 'quasar';

useMeta({
  // JS tags
  script: {
    snarkjs: {
      // type: 'application/javascript',
      src: '/snarkjs.min.js',
    },
  },
});
</script>
