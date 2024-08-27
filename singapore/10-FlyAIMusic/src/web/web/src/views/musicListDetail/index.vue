<!--歌单列表详情-->
<template>
  <div class="content-view">
    <el-backtop/>
    <div class="top">
      <div class="img">
        <img v-if="playlistDetail?.coverImgUrl.length>0" :src="playlistDetail?.coverImgUrl" alt="">
      </div>
      <div class="info">
        <div class="label">
          <div class="tag">Playlist</div>
          <span class="font-weight">{{ playlistDetail?.name }}</span>
        </div>
        <div class="user">
          <el-avatar :size="30" :src="playlistDetail?.creator?.avatarUrl"
                     @click="toPersonal(playlistDetail?.creator?.userId)"></el-avatar>
          <span class="user-name"
                @click="toPersonal(playlistDetail?.creator?.userId)">{{ playlistDetail.creator?.nickname }}</span>
          <span class="date">{{ playlistDetail.createTime ? useTimestampFormat(playlistDetail.createTime) : '' }}</span>
        </div>
        <div class="control">
          <button class="pink-btn" @click="playAll">
            <i class="iconfont icon-bofang"></i>
            <span>Play All</span>
          </button>
          <button
              :class="userStore?.accountInfo?.userId===playlistDetail.creator?.userId?'white-btn btn-disabled':'white-btn'"
              @click="handleSubscribe">
            <el-icon v-if="playlistDetail.subscribed">
              <Finished/>
            </el-icon>
            <el-icon v-else>
              <CirclePlus/>
            </el-icon>
            <span>{{ playlistDetail.subscribed ? 'Subscribed' : 'Subscribe' }}</span>
          </button>
          <button class="pink-btn" @click="pay">
            <i class="iconfont icon-bofang"></i>
            <span>Buy</span>
          </button>
        </div>
        <div class="attribute">
          <span>Tags: <i v-if="playlistDetail.tags?.length===0">No Tags</i><i v-for="v in playlistDetail?.tags" v-else>{{
              v
            }}</i> </span>
          <span>Songs: {{ playlistDetail.trackCount }} &nbsp;&nbsp;Plays: {{
              playlistDetail.playCount ? useNumberFormat(playlistDetail.playCount) : ''
            }}</span>
          <span style="display: flex;">Description: <TextCollapse :text="playlistDetail?.description"></TextCollapse></span>
        </div>
      </div>
    </div>
    <div class="tabs">
      <el-tabs v-model="activeName" @tab-click="clickTab">
        <el-tab-pane :name="1" label="Song List">
        </el-tab-pane>
        <el-tab-pane :label="playlistDetail.commentCount?'Comments ('+playlistDetail.commentCount+')':'Comments'" :name="2">
          <Comment ref="commentRef" :commentsAll="commentsAll" :likeQuery="likeQuery" :showInput="true"
                   @addCommentCount="addCommentCount"
                   @pageChange="commentPageChange"></Comment>
        </el-tab-pane>
        <el-tab-pane :name="3" label="Subscribers">
        </el-tab-pane>
      </el-tabs>
      <SongList
          v-show="activeName===1"
          :dropdownRefresh="false"
          :loading="songLoading"
          :playListId="playlistDetail.id"
          :songList="songList"
          :userId="userStore.accountInfo?.userId"
          @loadData="loadData"
      ></SongList>
      <UserList v-if="activeName===3" :loading="loading" :total="total" :userId="playlistDetail?.creator?.userId"
                :userList=userList
                description="No subscribers yet~(｡•ˇ‸ˇ•｡)" @pageChange="subscriberPageChange"></UserList>
    </div>
  </div>
</template>
<script lang="ts" setup>
import SongList from "@/components/SongList/index.vue"
import Comment from "@/components/Comment/index.vue"
import UserList from "@/components/UserList/index.vue"
import TextCollapse from '@/components/TextCollapse/index.vue'
import {ref, reactive} from "vue"
import {useRouter, useRoute} from "vue-router";
import type {TabsPaneContext} from 'element-plus'
import avatarImg from '@/assets/img/avatar.png'
import {getPlaylistDetail, getPlaylistTrack} from '@/api/playlist/index'
import {useNumberFormat} from "@/hooks/useNumberFormat"
import {useTimestampFormat} from '@/hooks/useTimestampFormat'
import {PlaylistInfo} from "@/types/playlist.d.ts";
import {PlaylistDetailRes, SongListRes} from "@/views/musicListDetail/index.d.ts";
import type {Song} from "@/types/playlist.d"
import type {CommentRes, CommentType, GetCommentQuery} from "@/types/comment.d.ts"
import {playlistComment} from "@/api/comment/index"
import {getPlaylistSubscribers, playlistSubscribe} from '@/api/playlist/index.ts'
import {ElMessage} from 'element-plus'
import {UserInfo} from "@/types/user";
import {SubscribersRes} from "@/types/playlist";
import {CirclePlus, Check, Finished} from "@element-plus/icons-vue"
import {useUser} from '@/store/user'
import {useSong} from '@/store/song'
import {SongInfo} from "@/types/song.d.ts"
import { ApiPromise, WsProvider } from '@polkadot/api';
//变量
const router = useRouter()
const route = useRoute()
const total = ref(0) //收藏者总数
const userStore = useUser() //创建store
const songStore = useSong() //创建store
const commentRef = ref() //评论组件ref
let loading = ref(false)
let songLoading = ref(true) //列表loading

let likeQuery = ref({ //给评论点赞的参数
  id: Number(route.query.id), //歌单id
  cType: 2//评论类型
})
let userList = ref<UserInfo[]>([{
  avatarUrl: avatarImg,
  signature: '',
  nickname: ''
}])
//歌单所有歌曲请求参数
let trackQuery = reactive({
  id: 0,

  offset: 0
})
const activeName = ref(1)
const subscribeQuery = reactive({//收藏、取消收藏歌单
  t: <1 | 2>0,//1:收藏。2取消收藏
  id: Number(route.query.id),
})
const subscribersQuery = reactive({ //获取收藏者请求参数
  id: Number(route.query.id),//歌单id
  offset: <number>0 //偏移量
})
const getCommentQuery = reactive<GetCommentQuery>({ //获取评论的参数
  id: Number(route.query.id),
  offset: <number>0,
  time: 0
})
const playlistDetail = ref<PlaylistInfo>({
  id: Number(route.query.id), //歌单id
  coverImgUrl: '',
  createTime: 0,
  trackCount: 0,
  description: '',
  creator: {},
  tags: [],
  subscribed: false//歌单是否被收藏
})
let songList = ref<Song[]>([]) //歌曲列表
let commentsAll = reactive<CommentRes>({ //热评、所有评论
  comments: <CommentType[]>[{}],
  hotComments: <CommentType[]>[{}],
  commentCount: <number>0
})

//方法

// 购买NFT
const pay = async () => {
  const provider = new WsProvider('ws://47.106.245.127:9944'); // Polkadot public RPC endpoint
  const api = await ApiPromise.create({provider});

  // Example: Fetch the account balance
  // const {data: {free: balance}} = await api.query.system.account(selectedAccount.address);
  // console.log(`Balance of ${selectedAccount.meta.name}: ${balance}`);
}
//获取歌单详情数据
const getDetail = () => {
  songLoading.value = true
  getPlaylistDetail({id: route.query.id}).then((res: PlaylistDetailRes) => {
    if (res.code === 200) {
      songLoading.value = false
      playlistDetail.value = res.playlist
      songList.value = res.playlist.tracks
      console.log('Playlist Details', playlistDetail)
      commentsAll.commentCount = res.playlist.commentCount
      getSubscribers()
      getComment()
    }
  })
}
getDetail()
//加载更多数据
// const loadData = () => {
//   if (songList.value.length > 0) {
//     trackQuery.offset += 100
//   }
//   getTrack()
// }
//获取歌单所有歌曲列表

// const getTrack = async () => {
//   songLoading.value = true
//   trackQuery.id = Number(route.query.id)
//   getPlaylistTrack(trackQuery).then((res: SongListRes) => {
//     if (res.code === 200) {
//       songLoading.value = false
//       songList.value.push(...res.songs)
//       //更新播放歌单
//
//
//     } else if (playlistDetail.value.tracks?.length > 0) {
//       songList.value = playlistDetail.value.tracks
//     } else {
//       ElMessage('Failed to fetch songs~(｡•ˇ‸ˇ•｡)')
//     }
//   })
// }

//获取歌单评论
const getComment = () => {
  playlistComment(getCommentQuery).then((res: CommentRes) => {
    commentsAll.hotComments = res.hotComments
    commentsAll.comments = res.comments
    console.log('Comments', res)
    if (playlistDetail.value.commentCount >= 5000) {
      getCommentQuery.time = res.comments[res.comments?.length - 1]?.time
    }
  })
}
//获取歌单所有收藏者
const getSubscribers = () => {
  userList.value = []
  loading.value = true
  getPlaylistSubscribers(subscribersQuery).then((res: SubscribersRes) => {
    loading.value = false
    if (res.code === 200) {
      console.log('Playlist Subscribers', res)
      userList.value = res.subscribers
      total.value = res.total
    }
  })
}
//切换Tab标签页
const clickTab = (tab: TabsPaneContext) => {
  if (tab.index === '1') {
    commentRef.value.inputFocus()
    getComment()
  }
}
//获得收藏者列表偏移量
const subscriberPageChange = (pageNum: number) => {
  subscribersQuery.offset = (pageNum - 1) * 30
  getSubscribers()
}

// ========== 评论 ==========
//获得评论的偏移量
const commentPageChange = (pageNum: number) => {
  getCommentQuery.offset = (pageNum - 1) * 30
  getComment()
}
//发送评论成功后评论数量+1
const addCommentCount = () => {
  playlistDetail.value.commentCount++ //评论数量+1
}

//收藏/取消收藏歌单
const handleSubscribe = () => {
  if (!userStore.accountInfo) {
    ElMessage('Please log in first~(｡•ˇ‸ˇ•｡)')
    return false
  }
  subscribeQuery.t = playlistDetail.value.subscribed ? 2 : 1
  playlistSubscribe(subscribeQuery).then((res: any) => {
    if (res.code === 200) {
      playlistDetail.value.subscribed = !playlistDetail.value.subscribed
    }
  })
}
//点击创建者跳转个人页
const toPersonal = (uid: number) => {
  router.push({
    name: 'personal',
    query: {
      uid
    }
  })
}

//全部播放
const playAll = () => {
  //重新替换播放列表
  songStore.playListId = playlistDetail.value.id
  songStore.playList = songList.value
  songStore.currentSong = songList.value[0]
}

</script>

<style lang="less" scoped>
.content-view {
  height: calc(100% - 60px);
  overflow-x: hidden;
  position: relative;
  .pagination;
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

/*去掉tabs底部的下划线*/
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

:deep(.el-avatar) {
  border: 1px solid @lightTheme
}
</style>
