<!-- Album Detail Page -->
<template>
  <div class="content-view">
    <el-backtop/>
    <div class="top">
      <div class="img">
        <img v-if="detailData?.blurPicUrl?.length>0" :src="detailData?.blurPicUrl" alt="">
      </div>
      <div class="info">
        <div class="label">
          <div class="tag">Album</div>
          <span class="font-weight">{{ detailData?.name }}</span>
        </div>

        <div class="control">
          <!-- Play All -->
          <button class="pink-btn" @click="playAll">
            <i class="iconfont icon-bofang"></i>
            <span>Play All</span>
          </button>
          <!-- Collect Album -->
          <!-- If it's the user's own album, disable the button -->
          <button
              :class="userStore.accountInfo.userId===detailData.creator?.userId?'white-btn btn-disabled':'white-btn'"
              @click="handleAlbumCollect">
            <el-icon v-if="collectQuery.t==0">
              <Finished/>
            </el-icon>
            <el-icon v-else>
              <CirclePlus/>
            </el-icon>
            <span>{{ collectQuery.t == 1 ? 'Collect' : 'Collected' }}</span>
          </button>
        </div>

        <div class="attribute">
          <span>Artist:
            <span v-for="(a,i) in  detailData?.artists">{{ i === 0 ? a.name : ' / ' + a.name }}</span>
          </span>
          <span>Release Date: {{
              useTimestampFormat(detailData?.publishTime)
            }}</span>
          <span>Company: {{
              detailData?.company ? detailData?.company : 'None'
            }}</span>
        </div>
      </div>
    </div>
    <div class="tabs">
      <el-tabs v-model="activeName" @tab-click="clickTab">
        <el-tab-pane :name="1" label="Song List">
          <SongList
              :loading="loading"
              :playListId="detailData.id"
              :songList="songList"
              :userId="userStore.accountInfo.userId"
          ></SongList>
        </el-tab-pane>
        <el-tab-pane :label="'Comments ('+commentsAll?.commentCount+')'" :name="2">
          <Comment ref="commentRef" :commentsAll="commentsAll" :likeQuery="likeQuery" :showInput="true"
                   @addCommentCount="addCommentCount"
                   @pageChange="commentPageChange"></Comment>
        </el-tab-pane>
        <el-tab-pane :name="3" label="Album Details">
          <el-empty v-if="detailData?.description.length==0" description="No details available~(｡•ˇ‸ˇ•｡)"/>
         <div style="margin-top: 20px;">
           <h3>Album Introduction</h3>
           <div style="margin-top: 10px;" class="description">{{detailData?.description}}</div>
         </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
import SongList from "@/components/SongList/index.vue"
import Comment from "@/components/Comment/index.vue"
import {ref, reactive, watch} from "vue"
import {useRouter, useRoute} from "vue-router";
import type {TabsPaneContext} from 'element-plus'
import {usetimeFormat} from "@/hooks/usetimeFormat.ts"

import avatarImg from '@/assets/img/avatar.png'
import {PlaylistInfo} from "@/types/playlist.d.ts";
import type {Song} from "@/types/playlist.d.ts"
import type {CommentRes, CommentType, GetCommentQuery} from "@/types/comment.d.ts"
import {UserInfo} from "@/types/user";
import {CirclePlus, Check, Finished} from "@element-plus/icons-vue"
import {useUser} from '@/store/user'
import {useSong} from '@/store/song'
import {albumDetail} from '@/api/album/index.ts'
import {albumCollect, albumCollectList, albumComment} from "../../api/album";
import {useTimestampFormat} from "../../hooks/useTimestampFormat";

// Variables
const router = useRouter()
const route = useRoute()
let loading =ref(true)
const total = ref(0) // Total number of collectors
const userStore = useUser() // Create store
const songStore = useSong() // Create store
const commentRef = ref() // Comment component ref
let likeQuery = ref({ // Parameters for liking comments
  id: Number(route.query.id), // Album ID
  cType: 3 // Comment type
})
let collectQuery = reactive({
  id: 0,
  t: 1, // 1 for collect, 0 for cancel
}) // Collect parameters
let userList = ref<UserInfo[]>([{
  avatarUrl: avatarImg,
  signature: '',
  nickname: ''
}])

const activeName = ref(1)

const getCommentQuery = reactive<GetCommentQuery>({ // Parameters for getting comments
  id: 0,
  offset: <number>0,
  time: 0
})
const detailData = ref<PlaylistInfo>({
  id: Number(route.query.id), // Album ID
  coverImgUrl: '',
  createTime: 0,
  trackCount: 0,
  description: '',
  creator: {},
  tags: [],
  subscribed: false // Whether the album is collected
})
let songList = ref<Song[]>([]) // Song list
let commentsAll = reactive<CommentRes>({ // Hot comments, all comments
  comments: <CommentType[]>[{}],
  hotComments: <CommentType[]>[{}],
  commentCount: <number>0
})

// Methods
// Get album details
const getAlbum = () => {
  loading.value = true
  if (route.query.id) {
    albumDetail({id: route.query.id}).then((res: any) => {
      loading.value = false

      console.log('Album details', res)
      detailData.value = res.album
      songList.value = res.songs
      getCollection()
      getComment()
    })
  }
}
getAlbum()
// Collect/Cancel collect album
const handleAlbumCollect = () => {
  collectQuery.id = route.query.id
  albumCollect(collectQuery).then(res => {
    if (res.code === 200) {
      collectQuery.t = collectQuery.t == 1 ? 0 : 1
    }
  })
}
// Get collect album list
const getCollection = () => {
  collectQuery.t = 1
  albumCollectList({limit: 10000}).then(res => {
    let title = detailData.value?.name
    res.data.some(v => {
      // Check if the album is in the collect list
      if (title === v.name) {
        // Already collected, set parameters to cancel collect
        console.log('Album is collected')
        collectQuery.t = 0
        return true
      }
    })
  })
}

// Get comments
const getComment = () => {
  getCommentQuery.id = route.query.id
  albumComment(getCommentQuery).then((res: CommentRes) => {
    console.log('Album comments',res)
    commentsAll.hotComments = res.hotComments
    commentsAll.comments = res.comments
    commentsAll.commentCount = res.total
    if (detailData.value.commentCount >= 5000) {
      getCommentQuery.time = res.comments[res.comments?.length - 1]?.time
    }
  })
}
// Switch tab
const clickTab = (tab: TabsPaneContext) => {
  if (tab.index === '1') {
    commentRef.value.inputFocus()
  }
}

// ========== Comments ==========

// Get comment offset
const commentPageChange = (pageNum: number) => {
  let content = document.querySelector('.content-view') as Element
  content.scrollTop = 450;
  getCommentQuery.offset = (pageNum - 1) * 30

  getComment()
}
// Add 1 to comment count after sending comment
const addCommentCount = () => {
  commentsAll.commentCount++ // Add 1 to comment count
}
// Click creator to go to personal page
const toPersonal = (uid: number) => {
  router.push({
    name: 'personal',
    query: {
      uid
    }
  })
}

// Play all
const playAll = () => {
  // Replace playlist
  songStore.playListId = detailData.value.id
  songStore.playList = songList.value
  songStore.currentSong = songList.value[0]
}

</script>

<style lang="less" scoped>
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
    }

    .user {
      margin-top: 10px;
      height: 30px;
      line-height: 30px;
      display: flex;
      font-size: 13px;

      span {
        margin-right: 10px;
        color: @fontColor2;
      }

      .user-name {
        color: #7a91c2;
        cursor: pointer;
      }
    }

    .attribute {
      display: flex;
      flex-direction: column;
      color: @fontColor2;
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;

      .description {
        .long-text;
        width: 700px;
      }

      i {
        margin-right: 5px;
      }
    }

    .font-weight {
      font-size: 24px;
    }
  }

  .img {
    min-width: 180px;
    height: 180px;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 10px;
  }

}

.control {
  margin-top: 15px;
  margin-bottom: 10px;
  position: relative;

  .white-btn {
    .el-icon {
      font-size: 18px;
      position: absolute;
      color: #979797;
    }

    span {
      margin-left: 25px;
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
  //margin-top: -8px;
}

:deep(.el-tabs__item.is-active) {
  .font-weight
}

:deep(.el-tabs__item) {
  font-size: 16px;
  color: @fontColor;

}

/* Remove tabs bottom border */
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

</style>