
<template>

  <router-view></router-view>
</template>
<script setup lang="ts">

import { onMounted } from 'vue'

onMounted(() => {
  //修改element主题颜色
  document.body.style.setProperty('--el-color-primary', '#e6c1d4'); //主要色
  document.body.style.setProperty  ('--el-color-primary-light-9', '#efd5e2');  //高亮色
  document.body.style.setProperty('--el-color-primary-light-3', '#efd5e2');
  })

</script>
<style scoped>

</style>
