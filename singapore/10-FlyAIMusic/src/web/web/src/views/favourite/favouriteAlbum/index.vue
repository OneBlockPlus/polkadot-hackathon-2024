<template>
  <div class="album-view">
    <text>Favourite Albums ({{albumList.length}})</text>

    <SongCard
        :loading="loading"
        @handleJump='handleJump'
        :dropdownRefresh="true"
        :playList="albumList"
        :total="total"
        type="album"  @loadData="loadData"></SongCard>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import SongCard from "@/components/Card/SongCard/index.vue"
import {albumCollectList} from "@/api/album/index.ts";
let loading =ref(false)

const route = useRoute()
const router = useRouter()
let total = ref(0)// Total number of songs

let albumQuery = reactive({ // Request parameters for search results

  limit: 30,// Return quantity limit
  offset: 0,// Offset (30 * page number minus one)

})
let albumList =ref([]) // Album data
// Load more artist data
const loadData = () => {
  if (albumList.value.length > 0) {
    albumQuery.offset += 30
  }
  getData()
}

// Get artist list
const getData = () => {
  loading.value =true
  albumCollectList(albumQuery).then(res => {
    loading.value =false
    if(!res.data) return false
    albumList.value.push(...res.data)
    total.value = res.count
  })
}
// getData()
</script>

<style lang="less" scoped>
.album-view {
  position: relative;
  //padding-bottom: 130px;
  //margin-left: -10px;
}
:deep(.scroll){

  //height: 100%!important;
}
</style>