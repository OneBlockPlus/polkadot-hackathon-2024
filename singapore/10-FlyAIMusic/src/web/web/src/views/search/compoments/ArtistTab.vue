<template>
  <div class="artist-view">

    <SongCard
        :loading="loading"
        :dropdownRefresh="true"
        :playList="artistList"
        :total="total"
        type="artist" @handleJump='handleJump' @loadData="loadData"></SongCard>

  </div>
</template>

<script setup>
import SongCard from "@/components/Card/SongCard/index.vue"
import {reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {cloudSearch} from "@/api/search/index.ts";

let artistList = ref([]) //歌手列表
let total = ref(0)//歌曲总量
const route = useRoute()
const router = useRouter()
let loading =ref(false)
let artistQuery = reactive({ //获取搜索结果请求参数
  type: 100,//类型
  limit: 30,//返回数量限制
  offset: 0,//偏移量 （30*页码减一)
  keywords: route.query.keyWords || '',//关键词
})
//加载更多歌手数据
const loadData = () => {
  if (artistList.value.length > 0) {
    artistQuery.offset += 30
  }
  getData()
}
//跳转到歌手详情页
const handleJump = (row) => {
  //跳转到歌手详情页
  router.push({
    name: 'artistDetail',
    query: {
      info: JSON.stringify(row)
    }
  })
}
//获得歌手列表
const getData = () => {
  loading.value =true
  cloudSearch(artistQuery).then(res => {
    loading.value =false
    if(!res.result.artists) return false
    artistList.value.push(...res.result.artists)
    total.value = res.result.artistCount
  })

}

</script>

<style lang="less" scoped>
.artist-view {
  position: relative;
  padding-bottom: 20px;

}
:deep(.scroll){

  height: 100%!important;
}
</style>
