<template>
  <div class="song-view"  >
<!--    <el-empty v-show="songList?.length===0" description="暂时没有歌曲哦~(｡•ˇ‸ˇ•｡)"/>-->

    <SongList
        :showLoading="showLoading"
        :showPagination="true"
        :total="total"
        @currentChange="currentChange"
        :songList="songList"
        :userId="userStore.accountInfo?.userId"
    ></SongList><!-- :playListId="playlistDetail.id"-->

  </div>
</template>

<script setup>
import SongList from "@/components/SongList/index.vue"
import {useUser} from '@/store/user'
import {ref, reactive} from "vue"
import {cloudSearch} from "@/api/search/index.ts";
import {useRoute,useRouter} from "vue-router";

const route =useRoute()
const props =defineProps({
})
let showLoading =ref(true)
const userStore = useUser() //创建store
let songList =ref([])
let total =ref(0)//歌曲总量
let songQuery =reactive({ //获取搜索结果请求参数
  type:1,//类型
  limit:30,//返回数量限制
  offset:0,//偏移量 （30*页码减一)
  keywords:route.query.keyWords||'',//关键词
})
//页码变化变化事件
const currentChange=(v)=>{
  songQuery.offset =(v-1)*songQuery.limit
  getSong()
  let content = document.querySelector('.song-view')
  content.scrollTop = 0;
}
const getSong =()=>{


  cloudSearch(songQuery).then(res=>{
    showLoading.value =false
    songList.value =res.result.songs
    total.value =res.result.songCount

  })
}
getSong()
</script>

<style lang="less" scoped>
.song-view{
  margin-top: -20px;
  //padding-bottom: 510px;
  height: 100%;
  padding-bottom: 130px;

   :deep(.el-pagination){
 display: flex;
  }
}
:deep(.el-table){
  margin-top: 0;
}
</style>
