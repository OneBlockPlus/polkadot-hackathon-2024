<!--Ranking Page-->
<template>
 <span class="label">
   Official List
 </span>
  <div
      v-for="(v,i) in playList"
      :key="v?.id"
      class="ranking-card"
  >
    <div class="img" @click="jumpDetail(v.id)">
      <img :src="v?.coverImgUrl" alt=""></div>
    <div class="song-list">
      <ul>
        <li
            v-for="(v2 ,i2) in v.songs"
            v-show="i2<5"
            :tabindex="v2.id"
            @dblclick="changeSong(v2,v.id,v.songs)">
          <div class="list-left">
            <span class="index">{{ i2 + 1 }}</span>
            <span class="song-name">{{ v2?.name }}</span>
          </div>
          <div class="list-right">
               <span
                   v-for="(v3,i3) in v2.ar"
                   :key="v.id"
                   class="artist-name" @click="toArtist(v3)">{{
                   v2.ar.length > 1 && i3 !== 0 ? '/' : ''
                 }}{{ v3.name }}</span>
          </div>
        </li>
      </ul>
      <div class="more" @click="jumpDetail(v.id)">View All
        <i class="iconfont icon-arrow-right-bold"></i></div>
    </div>
  </div>
  <span class="label">
  Global List
 </span>
  <SongCard :loading="loading" type="playList" :playList="restList"></SongCard>
</template>

<script lang="ts" setup>
import {ref} from "vue"
import SongCard from "@/components/Card/SongCard/index.vue"
import {topList} from "@/api/recommend/index.ts"
import {useRouter} from "vue-router"
import type {PlaylistInfo} from '@/types/playlist.d.ts'
import {getPlaylistTrack} from '@/api/playlist/index'
import {SongInfo} from "../../../../types/song";
import {useSong} from '@/store/song.ts'
import {useArtistInfo} from "../../../../hooks/useArtistInfo";

let loading =ref(false)

let playList = ref() //Top 4 playlists
let restList = ref<PlaylistInfo>()//Rest of the playlists
const router = useRouter()
let songList = ref() //Songs in each playlist
const songStore = useSong()

const getTopList = () => {
  loading.value =true
  topList().then((res: any) => {
    if (res.code === 200) {
      loading.value =false
      songList.value = []
      playList.value = res.list.slice(0, 4)
      getSongList()
      restList.value = res.list.splice(4)
    }
  })
}
getTopList()

const toArtist =async (v) => {
  let info =await useArtistInfo(v)
  await router.push({
    name: 'artistDetail',
    query: {
      info: JSON.stringify(info)
    }
  })
}

const getSongList = () => {
  playList.value.forEach((v: PlaylistInfo) => {
    getPlaylistTrack({id: v.id}).then((res: any) => {
      if (res.code === 200) {
        v.songs = res.songs
      }
    })
  })
}

const jumpDetail = (id: number) => {
  router.push({
    name: 'musicListDetail',
    query: {
      id
    }
  })
}

const changeSong = (row: SongInfo, id: number, songs: any) => {
  songStore.currentSong = row
  if (songStore.playListId !== id) {
    songStore.playList = songs
  }
}
</script>

<style lang="less" scoped>
.song-list {
  width: 100%;

  li {
    cursor: pointer;
    display: flex;
    line-height: 37px;
    font-size: 14px;
    height: 37px;
    justify-content: space-between;
    color: @lightFontColor;
    padding: 0 20px;

    .index {
      margin-right: 12px;
    }

    .song-name {
      color: @fontColor
    }
  }

  li:nth-child(odd) {
    background-color: @shallowTheme;
  }

  li:hover {
    background-color: @pink;
  }

  li:focus {
    background-color: @pink;
  }
}

.label {
  display: inline-block;
  color: @fontColor;
  font-size: 20px;
  margin-bottom: 20px !important;
}

.ranking-card {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 0 0 50px;

  .img {
    width: 185px;
    height: 185px;
    margin-right: 30px;
    cursor: pointer;

    img {
      width: 185px;
      height: 185px;
      border-radius: 8px;
    }

  }

  .song-list {
    height: 100%;
    width: 100%;

    ul {
      height: 186px;
      overflow: hidden;
      border-radius: 8px;
    }

    .more {
      width: 90px;
      cursor: pointer;
      margin-top: 6px;
      color: @lightFontColor;
      font-size: 14px;
    }
  }
}

</style>
