  <!--mv details page-->
<template>
  <div class="content-view">
    <el-backtop/>
    <div class="left">
      <span class="font-weight">{{ route.query.type == 'mv' ? 'MV' : 'Video' }} Details</span>
      <div class="mv">
        <video :height="472" :src="mvUrl" :width="840" controls></video>
      </div>
      <div class="avatar" @click="handleJump">
        <el-avatar
            :size="50"
            :src="route.query.type==='mv'?mvInfo?.artists[0].img1v1Url:mvInfo?.creator.avatarUrl"
        ></el-avatar>
        <span>{{ route.query.type === 'mv' ? mvInfo?.artists[0].name : mvInfo?.creator.nickname }}</span>
      </div>
      <span class="font-weight name">{{ route.query.type === 'mv' ? mvInfo?.name : mvInfo?.title }}</span>
      <div class="attribute">
        <span>Published: {{ useTimestampFormat(mvInfo?.publishTime) }}</span>
        <span>Plays: {{ useNumberFormat(mvInfo?.playTime||mvInfo?.playCount) }} times</span>
      </div>
      <div class="tag-list">
        <i v-for="v in mvInfo?.videoGroup" :key="v.id" class="tag2" style="margin-right: 10px;">{{ v.name }}</i>
      </div>

      <OptionBtn  :mvInfo="mvInfo"></OptionBtn>
      <Comment ref="commentRef" :commentsAll="commentsAll" :likeQuery="likeQuery" :showInput="true"
               @addCommentCount="addCommentCount"
               @pageChange="commentPageChange"></Comment>
    </div>
    <div v-if="mvList?.length>0" class="right">
      <span class="font-weight">Related Recommendations</span>
      <div class="mv-list">
        <ul>
          <li v-for="v in mvList" @click="toVideo(v?.vid)">
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Comment from "@/components/Comment/index.vue"
import OptionBtn from '@/views/mvDetail/components/OptionBtn.vue'
import {reactive, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {videoDetail, videoUrl, allVideo, myLike} from '@/api/video/index.ts'
import {getMvUrl, mvDetail} from '@/api/mv/index.ts'
import {useNumberFormat} from "@/hooks/useNumberFormat"
import {useDurationFormat} from '@/hooks/useDurationFormat.ts'
import {videoComment, mvComment} from "@/api/comment/index.ts"
import {useTimestampFormat} from "../../hooks/useTimestampFormat";

import {ElMessage} from "element-plus";
import {useArtistInfo} from "../../hooks/useArtistInfo";

const router = useRouter()
const route = useRoute()

let likeQuery = reactive({
  cType: 0,
  id: 0,
})

let getCommentQuery = reactive({
  id: 0,
  offset: 0,
  time: 0
})
let mvInfo = ref()
let mvUrl = ref()
let mvList = ref()
let commentsAll = reactive({
  comments: <any>[],
  hotComments: <any>[],
  commentCount: 0
})

const handleJump = () => {
  if (route.query.type === 'mv') {
    toArtist(mvInfo.value.artists[0])
  } else {
    toPerson(mvInfo.value.creator.userId)
  }
}

const toPerson = (id: number) => {
  router.push({
    name: 'personal',
    query: {
      uid: id
    }
  })
}

const toArtist =async (v) => {
  let info =await useArtistInfo(v)
  await router.push({
    name: 'artistDetail',
    query: {
      info: JSON.stringify(info)
    }
  })
}

const getMvDetail = () => {
  mvDetail({mvid: route.query.id}).then((res: any) => {
    if (res.code === 200) {
      mvInfo.value = res.data
      handleMvUrl()
    }
  })
}

const getVideoDetail = () => {
  videoDetail({id: route.query.id}).then((res: any) => {
    if (res.code === 200) {
      mvInfo.value = res.data
      getVideoUrl()
      getallVideo()
    }
  })
}

const dataInit = () => {
  if (route.query.type === 'mv') {
     likeQuery.cType = 1
    getMvDetail()
  } else {
      likeQuery.cType = 5
    getVideoDetail()
  }
}
dataInit()

const getVideoUrl = () => {
  videoUrl({id: mvInfo.value.vid}).then((res: any) => {
    if (res.code === 200) {
      mvUrl.value = res.urls[0].url
    }
  })
}

const handleMvUrl = () => {
  getMvUrl({id: mvInfo.value.id}).then((res: any) => {
    if (res.code === 200) {
      mvUrl.value = res.data.url
    }
  })
}

const getallVideo = () => {
  allVideo({id: route.query.type === 'mv' ? mvInfo.value.id : mvInfo.value.vid}).then((res: any) => {
    if (res.code === 200) {
      if (res.datas && res.datas.length > 0) {
        mvList.value.push(...res.datas)
      }
    }
  })
}

const toVideo = (id: number, e: any) => {
  e.stopPropagation()
  router.push({
    name: 'mvDetail',
    query: {
      id: id,
      type: 'video'
    }
  })
}

const commentPageChange = (pageNum: number) => {
  getCommentQuery.offset = (pageNum - 1) * 30
  getComment()
}

const getComment = async () => {
  commentsAll.comments = []
 likeQuery.id = getCommentQuery.id = route.query.id
  let res = null;
  if (route.query.type == 'mv') {
    res = await mvComment(getCommentQuery)
  } else {
    res = await videoComment(getCommentQuery)
  }
  commentsAll.hotComments = res.hotComments
  commentsAll.comments = res.comments
  commentsAll.commentCount = res.total

  if (mvInfo.value?.commentCount >= 5000) {
    getCommentQuery.time = res.comments[res.comments?.length - 1]?.time
  }
}
getComment()
</script>

<style lang="less" scoped>
.content-view {
  display: flex;
  height: calc(100% - 69px);
  overflow-x: hidden;
}

.left {
  .mv {
    width: 840px;
    height: 472px;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .avatar {
    margin-bottom: 20px;
    display: flex;
    align-content: center;

    span:last-child {
      margin-left: 20px;
      margin-top: 10px;
      cursor: pointer;
    }
  }

  .name {
    font-size: 26px;
  }

  .attribute {
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 13px;
    color: #bdbdbd;

    span {
      margin-right: 20px;
    }
  }
}

.right {
  flex: 0.35;

  .mv-list {
    margin-top: 20px;

    li {
      display: flex;
      height: 90px;
      margin-bottom: 10px;
      cursor: pointer;

      .cover-img {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        min-width: 150px;
        width: 150px;
        margin-right: 20px;

        .info-icon {
          .icon-bofang:before {
            font-size: 10px;
          }

          color: @white;
          font-size: 12px;
          height: 100%;
          width: 100%;
          right: 10px;
          top: 0;
          position: absolute;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;

          span {
            display: inline-block;
          }
        }
      }

      .list-info {
        display: flex;
        flex-direction: column;
        padding-top: 10px;
        padding-bottom: 10px;
        justify-content: space-between;

        .list-name {
          .long-text2;
        }

        .source {
          color: @fontColor2;
          font-size: 12px;
        }
      }
    }
  }
}
:deep(.el-avatar){
  border:1px solid @lightTheme
}
</style>
