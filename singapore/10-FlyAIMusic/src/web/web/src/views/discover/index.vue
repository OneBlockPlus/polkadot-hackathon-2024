<template>
  <div class="content">
  <NavBar :tabsData="tabsData"></NavBar>
  <!-- Remove scrolling from the outermost container for pages that need infinite scrolling -->
  <div :class="route.name==='artist'?'content-view no-scroll':'content-view'">
    <el-backtop/>
    <router-view></router-view></div>
  </div>

</template>

<script lang="ts" setup>
import NavBar from "@/components/NavBar/index.vue";
import {ref, reactive} from "vue"
import {useRoute} from 'vue-router'
const route =useRoute()
const tabsData = reactive([{
  label:'Personalized recommendation',
  value:'recommend',
},{
      label:'Song list',
      value:'songListIndex',
    },{
      label:'The charts',
      value:'ranking',
    },{
      label: 'Artist',
      value: 'artist',
    },
    ]
)

</script>

<style scoped lang="less">
// Style for pages where the outermost container should not scroll
.no-scroll{
  height: auto!important;
  overflow-y: auto;
  padding-right: 0;
}
</style>