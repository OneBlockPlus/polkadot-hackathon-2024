<template>
  <div class="content-view">
    <text class="font-weight">Search {{route.query.keyWords}}</text>
    <NavBar @tabClick="tabClick" :isRoute="false" :tabsData="tabsData"></NavBar>
    <div class="tab-content">
<!--      Song-->
      <SongTab v-if="tabName==='song'" ></SongTab>
<!--      Artist-->
      <ArtistTab v-if="tabName==='artist'" ></ArtistTab>
<!--      Album-->
      <AlbumTab v-if="tabName==='album'"></AlbumTab>
      <VideoTab v-if="tabName==='video'"></VideoTab>
      <PlayListTab v-if="tabName==='songList'"></PlayListTab>
      <UserTab v-if="tabName==='user'"></UserTab>
    </div>

  </div>
</template>

<script setup>
import NavBar from "@/components/NavBar/index.vue";
import SongTab from '@/views/search/compoments/SongTab.vue'
import ArtistTab from '@/views/search/compoments/ArtistTab.vue'
import AlbumTab from '@/views/search/compoments/AlbumTab.vue'
import VideoTab from '@/views/search/compoments/VideoTab.vue'
import PlayListTab from '@/views/search/compoments/PlayListTab.vue'
import UserTab from '@/views/search/compoments/UserTab.vue'
import {ref, reactive} from "vue"
import {useRouter,useRoute} from "vue-router";
import {searchMultimatch} from "@/api/search/index.ts";

const router =useRouter()
const route =useRoute()

const tabsData = reactive([{
  value: 'song',
  label: 'Song',
}, {
  value: 'artist',
  label: 'Artist',
}, {
  value: 'album',
  label: 'Album',
}, {
  value: 'video',
  label: 'Video',
}, {
  value: 'songList',
  label: 'Playlist',
}, {
  value: 'user',
  label: 'User',
},])
let dataList =ref([]) // Search results
let tabName =ref('song') // Tab name
// Methods
// Tab switch
const tabClick =(v)=>{
  tabName.value =v.paneName
  console.log(v)
}


</script>

<style lang="less" scoped>
.content-view{
  height: 100%;
}
:deep(.el-tabs){
  padding-left: 0;
}
.tab-content{
  margin-top: 20px;
}
</style>