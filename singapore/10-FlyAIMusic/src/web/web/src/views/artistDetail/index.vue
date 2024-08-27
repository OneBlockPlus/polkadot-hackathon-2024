<!-- Artist Detail -->
<template>
  <div class='content-view'>
    <el-backtop/>
    <div class="top">
      <div class="img">
        <!-- Calculate the current date here -->

        <img v-show="artistInfo?.picUrl.length>0" :src="artistInfo?.picUrl" alt="">
      </div>
      <div class="info">
        <div class="label">
          <span class="font-weight">{{ artistInfo?.name }}</span>
        </div>
        <div class="alias">
          <span v-for="(v,i) in  artistInfo?.alias">{{ i === 0 ? v : '、' + v }}</span>
        </div>
        <div class="control">
          <!--  Favorite -->
          <button
              class="white-btn"
              @click="handleSub">
            <i v-if="isSub" class="iconfont icon-xihuan"></i>
            <i v-else>
              <el-icon>
                <CirclePlus/>
              </el-icon>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </i>

            <span>{{ isSub ? 'Favorited' : 'Favorite' }}</span>
          </button>
          <!--          Personal Page-->
<!--          <button v-if="userId" class="white-btn" @click='toPersonal'>-->
<!--            <i class="iconfont icon-link"></i>-->
<!--            Personal Page-->
<!--          </button>-->

        </div>
        <div class="attribute">
          <span v-show=" artistInfo?.musicSize">Songs: {{ artistInfo?.musicSize }} </span>
          <span v-show=" artistInfo?.albumSize">Albums: {{ artistInfo?.albumSize }}</span>
          <span  v-show=" artistInfo?.mvSize">MVs: {{ artistInfo?.mvSize }}</span>
        </div>
      </div>
    </div>

    <div class="tabs">
      <el-tabs v-model="activeName" @tab-click="clickTab">
        <el-tab-pane :name="1" label="Albums">
          <div
              v-for="(v,i) in albumList"
              v-show="v?.songs.length>0"
              :key="v?.id"
              class="ranking-card"
          >
            <!-- Cover -->
            <div class="img" @click="jumpDetail(v.id)">
              <el-image style="border-radius: 8px;" :src="v?.picUrl " alt="" /></div>
            <!-- Song List -->
            <div class="song-list">
              <div class="label">{{ v.name }}</div>

              <ul>
                <li
                    v-for="(v2 ,i2) in v.songs"
                    v-show="moreShow&&i===0?true:i2<10"
                    :tabindex="v2.id"
                    @dblclick="changeSong(v2,v.id,v.songs)">
                  <div class="list-left">
                    <span class="index">{{ i2 + 1 }}</span>
                    <span class="song-name">{{ v2?.name }}</span>
                    <i v-if="v2.fee===1" class="tag vip-tag">VIP</i>
                    <i v-if="v2.mv!==0" class="tag mv-tag">MV</i>
                    <i v-if="v2?.sq" class="tag mv-tag">SQ</i>

                  </div>
                  <div class="list-right">
                    <span>{{ useDurationFormat(v2.dt) }}</span>
                  </div>
                </li>
              </ul>
              <div v-show="i===0&&v.songs.length>10&&!moreShow?true:(i!==0&&v.songs.length>10)" class="more"
                   @click="jumpDetail(v.id,i)">View All
                <i class="iconfont icon-arrow-right-bold"></i></div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane :name="2" label="MV" />
        <el-tab-pane :name="3" label="Artist Detail">
          <DescriptionTab :description="description"></DescriptionTab>
        </el-tab-pane>
      </el-tabs>
      <MvTab v-if="activeName==2"></MvTab>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ref, reactive} from "vue"
import {CirclePlus} from "@element-plus/icons-vue"
import {useRoute, useRouter} from "vue-router";
import {PlaylistInfo} from "@/types/playlist.d.ts";
import {useUser} from '@/store/user'
import {useSong} from '@/store/song'

// New
import {albumDetail, artistAlbum} from '@/api/album/index.ts'
import {artistDetail, topSong} from '@/api/artist/index.ts'
import {SongInfo} from "@/types/song";
import topSongsLogo from '@/assets/img/topSongsLogo.png'
import {useDurationFormat} from '@/hooks/useDurationFormat.ts'
import {artistSublist, artistMv, artistSub} from "@/api/artist";
import MvTab from '@/views/artistDetail/components/MvTab.vue'
import DescriptionTab from '@/views/artistDetail/components/DescriptionTab.vue'
import {artistDesc} from "../../api/artist";
// Variables
const router = useRouter()
const route = useRoute()
const userStore = useUser() // Create store
const songStore = useSong() // Create store
let loading =ref(false)
const activeName = ref(1)
const playlistDetail = ref<PlaylistInfo>({
  id: Number(route.query.id), // Playlist ID
  coverImgUrl: '',
  createTime: 0,
  trackCount: 0,
  description: '',
  creator: {},
  tags: [],
  subscribed: false// Playlist is favorited or not
})
let isSub = ref(false) // Artist is favorited or not


// New
let artistInfo = ref() // Artist info
let albumList = ref<PlaylistInfo[]>([
  {
    name: 'Top 50 Songs',
    picUrl: topSongsLogo,
    songs: []
  }
]) // Artist albums
let artistSubQuery = reactive({ // Favorite/Unfavorite artist request parameters
  id: 0,
  t: 1 // 1 is favorite, 0 is unfavorite
})
let description = reactive({ // Artist description
  briefDesc: '',// Main introduction
  introduction: [],// Various experiences and achievements
})


// Methods

// Click creator to go to personal page
const toPersonal = () => {
  router.push({
    name: 'personal',
    query: {
      uid: userId.value
    }
  })
}


// New code
// Get artist detail
let userId = ref(null) // Signed artist
const getAristDetail = () => {
  artistInfo.value = JSON.parse(route.query.info)

  userId.value   = artistInfo.value.id

  setTimeout(() => {
    getTopSong()
    getArtistSublist()
    getAlbum()
    getDesc()
  }, 0)
  console.log('Artist info',artistInfo.value)
  // Interface changed
  // if (route.query.id) {
  //   artistDetail({id: route.query.id}).then((res: any) => {
  //     if (res.code === 200) {
  //       artistInfo.value = res.data.artist
  //       mvQuery.id = artistInfo.value.id
  //       console.log('Artist detail info', res)
  //       if (res.data.user?.userId) {
  //         userId.value = res.data.user.userId
  //       }
  //       getTopSong()
  //       getArtistSublist()
  //     }
  //   })
  // }
}
getAristDetail()
// Get artist description
const getDesc = () => {
  artistDesc({id: artistInfo.value.id}).then((res: any) => {
    if (res.code === 200) {
      description.briefDesc = res.briefDesc
      description.introduction = res.introduction
    }
  })
}
// Get artist's top 50 songs
const getTopSong = () => {
  topSong({id: artistInfo.value.id}).then((res: any) => {
    if (res.code === 200) {
      albumList.value[0].songs = res.songs
    }
  })
}
// Get artist albums
const getAlbum = () => {
  artistAlbum({id: artistInfo.value.id}).then((res: any) => {
    if (res.code === 200) {
      albumList.value.push(...res.hotAlbums)
      getSongs()
    }
  })
}
// Get songs in each artist album
const getSongs = () => {
  albumList.value!.forEach((v: PlaylistInfo, i: number) => {
    if (i !== 0) {
      albumDetail({id: v.id}).then((res: any) => {
        if (res.code === 200) {
          v.songs = res.songs
        }
      })
    }

  })
}
// Jump to playlist detail page
let moreShow = ref(false)
const jumpDetail = (id: number, i: number) => {
  // Only non-top 50 songs can be jumped to
  if (i !== 0) {
    router.push({
      name: 'albumDetail',
      query: {
        id
      }
    })
  } else {
    moreShow.value = true
  }
}

// Switch song
const changeSong = (row: SongInfo, id: number, songs: any) => {
  songStore.currentSong = row
  // If playlist ID changes, it means playing songs from another playlist, replace the entire playlist
  if (songStore.playListId !== id) {
    songStore.playList = songs
  }
}

// Get favorited artists list
const getArtistSublist = () => {
  artistSublist().then((res: any) => {
    if (res.code === 200) {
      isSub.value = res.data.some((v: any) => v.id === artistInfo.value.id)
    }
  })
}
// Favorite/Unfavorite artist
const handleSub = () => {
  artistSubQuery.id = artistInfo.value.id
  artistSubQuery.t = isSub.value ? 0 : 1
  artistSub(artistSubQuery).then((res: any) => {
    if (res.code === 200) {
      isSub.value = !isSub.value
    }
  })
}



</script>

<style lang="less" scoped>
// Outer container without scrolling for the page style (mv part needs to be done with infinite scroll)

.content-view {
  height: calc(100% - 60px);
  overflow-x: hidden;

}

.top {
  display: flex;

  .info {
    display: flex;
    flex-direction: column;
    margin-left: 10px;

    .label {
      display: flex;
      //margin-top: 20px;
    }

    .alias {
      color: @fontColor2;
      font-size: 13px;
      margin-top: 10px;
    }

    .attribute {
      display: flex;
      color: @fontColor2;
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;
      margin-top: 10px;

      .description {
        .long-text;
        width: 700px;
      }

      span {
        margin-right: 20px;
      }
    }

    .font-weight {
      font-size: 24px;
    }
  }

  .img {
    min-width: 180px;

    width: 180px;
    height: 180px;
    border-radius: 8px;
    overflow: hidden!important;
    margin-right: 10px;

    .el-image {
      width: auto;
      margin-left: -20px;
    }
  }

}

.control {
  margin-top: 10px;
  margin-bottom: 10px;
  position: relative;

  .white-btn {
    .el-icon {
      font-size: 18px;
      position: absolute;
      color: #979797;
    }


  }

}

.el-tabs {
  left: 0px;
  top: 10px;
  padding-top: 10px;
  position: relative;
  background-color: #fff;
  width: 100%;
  z-index: 999;
}

:deep(.el-tabs__item.is-active) {
  .font-weight
}

:deep(.el-tabs__item) {
  font-size: 16px;
  color: @fontColor;
}

/* Remove the underline from tabs */
:deep(.el-tabs__nav-wrap:after) {
  position: static !important;
}

:deep(.el-tabs__active-bar) {
  transition: none;
  height: 3px;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__content) {
  margin-top: 30px; // Content top height!
}

.ranking-card {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 0 0 50px;

  height: auto;

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

    .label {
      font-weight: 700;
      font-size: 20px;
      margin-bottom: 15px;
    }

    ul {
      border-radius: 8px;

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
          color: @fontColor;
          margin-right: 10px;
          .long-text;
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