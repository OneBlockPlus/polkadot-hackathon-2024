<!--每日推荐页面-->
<template>
  <div class="content-view">
    <!--<el-backtop target=".content-view" :right="100" :bottom="100"  visibility-height="200"/>-->
    <el-backtop/>
    <div class="top">
      <div class="img">
        <!--这里要计算出当天时间-->
        <i class="day font-weight">{{dayjs().format('YYYY-MM-DD').slice(-2)}}</i>
        <img alt="" src="@/assets/img/dailyRecommend.png">
      </div>
      <div class="info">
        <span class="font-weight">Daily Song Recommendation</span>
        <span class="text" style="font-size: 14px;">Generated based on your music taste, updated at 6:00 AM daily</span>
      </div>
    </div>
    <div class="control">
      <button class="pink-btn"  @click="playAll">
        <i class="iconfont icon-bofang"></i>
        <span>Play All</span>
      </button>
      <button class="white-btn">
        <i class="iconfont icon-xihuan"></i>
        <span>Favorite All</span>
      </button>

    </div>

    <!--    TODO:全部收藏按钮功能-->
    <SongList
        :dropdownRefresh="false"
        :loading="loading"
        :songList="songList"
        :userId="userStore.accountInfo?.userId"

    ></SongList>

  </div>
</template>

<script lang="ts" setup>
import {ref, reactive} from "vue"
import SongList from "@/components/SongList/index.vue"
import {ElMessage} from 'element-plus'
import {useRouter} from 'vue-router'
import {recommendSongs} from "../../api/recommend";
import dayjs from "dayjs";
import {useUser} from '@/store/user'
import {useSong} from '@/store/song'


let loading = ref(true)
let songList = ref([])
const songStore = useSong() //创建store
const router = useRouter()
const userStore = useUser() //创建store
//获得每日推荐歌曲
const getSongs = () => {
  loading.value = true
  recommendSongs().then(res => {
    if (res.code === 200) {
      loading.value = false
      songList.value = res.data.dailySongs
    }
  })
}
//全部播放
const playAll = () => {
  //重新替换播放列表
  songStore.playListId = 0
  songStore.playList = songList.value
  songStore.currentSong = songList.value[0]
}
const init = () => {
  if (!userStore.accountInfo) {
    ElMessage('Please log in first~(｡•ˇ‸ˇ•｡)')
    router.replace("/index");
  } else {
    getSongs()
  }
}
init()

</script>

<style lang="less" scoped>

.content-view {
  height: calc(100% - 68px);

}

.top {
  display: flex;

  .info {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    margin-left: 10px;
  }

  .img {
    width: 100px;
    height: 100px;
    position: relative;

    .day {
      text-align: center;
      display: inline-block;
      left: 25px;
      top: 45px;
      color: @theme;
      position: absolute;
      z-index: 3;
      font-size: 40px;
    }
  }

}

.control {
  margin-top: 20px;

  margin-bottom: -20px;

}

</style>