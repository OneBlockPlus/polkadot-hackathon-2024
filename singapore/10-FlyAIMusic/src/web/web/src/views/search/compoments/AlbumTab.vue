<template>
  <div class="album-view">

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
import {cloudSearch} from "@/api/search/index.ts";
import SongCard from "@/components/Card/SongCard/index.vue"

const route = useRoute()
const router = useRouter()
let total = ref(0)//歌曲总量
let loading =ref(false)
let albumQuery = reactive({ //获取搜索结果请求参数
  type: 10,//类型
  limit: 30,//返回数量限制
  offset: 0,//偏移量 （30*页码减一)
  keywords: route.query.keyWords || '',//关键词
})
let albumList =ref([]) //专辑数据
//加载更多歌手数据
const loadData = () => {
  if (albumList.value.length > 0) {
    albumQuery.offset += 30
  }
  getData()
}

//获得歌手列表
const getData = () => {
  loading.value =true
  cloudSearch(albumQuery).then(res => {
    loading.value =false
    if(!res.result.albums) return false
    albumList.value.push(...res.result.albums)
    total.value = res.result.albumCount
  })
}
// getData()
</script>

<style lang="less" scoped>
.album-view {
  position: relative;
  padding-bottom: 130px;
}
:deep(.scroll){

  height: 100%!important;
}
</style>
