<!--Discover Music - Playlist Home-->
<template>
  <div class="container">
    <!--High-Quality Playlist Entrance-->
    <HighQualityInter></HighQualityInter>
    <!--Category Selection Bar-->
    <SortTool  :kinds="kinds" @selectCat="selectCat"></SortTool>
    <SongCard :loading="loading" type="playList" :playList="playList"></SongCard>
    <!--Pagination-->
    <el-pagination
        background
        v-show="playList.length>=50"
        v-model:current-page="pageParams.pageNum"
        :hide-on-single-page="pageParams.total<50"
        :total="pageParams.total"
        v-model:page-size="pageParams.pageSize"
        :pager-count="9"
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref,reactive} from "vue"
import HighQualityInter from "@/components/HighQualityInter/index.vue"
import SortTool from "@/components/SortTool/index.vue"
import SongCard from "@/components/Card/SongCard/index.vue"
import {catList} from "@/api/playlist/index"
import {topPlayList} from "@/api/recommend/index.ts"
import type {PlaylistInfo} from '@/types/playlist.d.ts'


// Variables
let loading =ref(false)

let kinds = ref()  // Type list
let queryParams = reactive({
  offset:0, // Offset (page number - 1) * 50
  cat:'Chinese', // Playlist type
})
let playList =ref<PlaylistInfo[]>([{  name:'',
  coverImgUrl:'',
  playCount:0,
}]) // Playlist list
let pageParams = reactive({
  total:51,
  pageNum:1, // Current page number
  pageSize:50
})

// Get playlist categories
const getCatList = () => {
  catList().then((res: any) => {
    if (res.code === 200) {
      kinds.value = res.sub
    }
  })
}
getCatList()

// Get recommended playlists
const getTopList =()=>{
  playList.value =[]
  loading.value =true
  topPlayList(queryParams).then((res:any)=>{
    if(res.code===200){
      loading.value =false
      pageParams.total = res.total
      playList.value = res.playlists
    }
  })
}
getTopList()
// Select category
const selectCat = (cat:string)=>{
  queryParams.cat = cat.name
  getTopList()
}
// Click pagination
const handleCurrentChange = (val:number)=>{
  let content = document.querySelector('.content-view') as Element
  content.scrollTop = 0;
  queryParams.offset = (val-1)*50
  getTopList()
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  position: relative;
  .pagination;

  .el-pagination {
    padding-bottom: 30px;
    margin-bottom: 40px;
  }
}
</style>