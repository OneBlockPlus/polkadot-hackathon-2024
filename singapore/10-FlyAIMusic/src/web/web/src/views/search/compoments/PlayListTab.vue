<template>
  <div class="playList-view">


    <SongCard :dropdownRefresh="true"
              :loading="loading"
              :playList="playList"
              :total="total"
              type="playList"
              @handleJump='handleJump' @loadData="loadData"></SongCard>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {cloudSearch} from "@/api/search/index.ts";
import SongCard from "@/components/Card/SongCard/index.vue"

const route = useRoute()
const router = useRouter()
let total = ref(0)//歌曲总量
let loading = ref(false)
let playListQuery = reactive({ //获取搜索结果请求参数
  type: 1000,//类型
  limit: 30,//返回数量限制
  offset: 0,//偏移量 （30*页码减一)
  keywords: route.query.keyWords || '',//关键词
})
let playList = ref([]) //专数据
//加载更多歌手数据
const loadData = () => {
  if (playList.value.length > 0) {
    playListQuery.offset += 30
  }
  getData()
}

//获得歌手列表
const getData = () => {

  loading.value = true

  cloudSearch(playListQuery).then(res => {

    loading.value = false
    if (!res.result.playlists) return false

    playList.value.push(...res.result.playlists)
    total.value = res.result.playlistCount

  })
}
getData()
</script>

<style lang="less" scoped>
.playList-view {
  position: relative;
  padding-bottom: 130px;

}

:deep(.scroll) {

  height: 100% !important;
}
</style>
