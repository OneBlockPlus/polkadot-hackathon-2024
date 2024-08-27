<!--个性推荐页面-->
<template>
  <div class="container">
    <Carousel></Carousel>
    <!--Recommended Playlists-->
    <div class="songList">
      <div class="title">
        <span class="font-weight">Recommended Playlists</span>
        <i class="iconfont icon-arrow-right-bold" ></i>
      </div>
      <!--Playlist Cards-->
      <SongCard :loading="loading" type="playList" :playList="personalizedList"></SongCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Carousel from "@/components/Carousel/index.vue"
import SongCard from "@/components/Card/SongCard/index.vue"
import {ref, reactive} from "vue"
import {useRouter} from "vue-router"
import {personalized} from "@/api/recommend/index.ts"

const router = useRouter()
let loading =ref(false)

//Get Recommended Playlists
let personalizedList = ref()
const getPersonalized = ()=>{
  loading.value =true
  personalized().then((res:any)=>{
    if(res.code===200){
      loading.value =false
      personalizedList.value = res.result
    }
  })
}
getPersonalized()

</script>
<style scoped lang="less">
.container{
  width:100%;
}
.title{
  margin-top: 18px;
  margin-bottom: 18px;
  width: 300px;
  cursor: pointer;
}
</style>