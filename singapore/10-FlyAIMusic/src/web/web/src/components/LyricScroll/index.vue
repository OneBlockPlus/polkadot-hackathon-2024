<!--歌词滚动抽屉页面-->
<template>
  <div>

    <el-drawer
        v-model="props.lyricShow"
        :close-on-click-modal="false"
        :modal="false"
        direction="btt"
        size="100%"

    >

      <i class="iconfont icon-arrow-down-bold" style="position: fixed" @click="handleClose"></i>
      <div v-if="songStore.currentSong?.id" class="center">
        <div class="song">
          <div class="cover">
            <div class="top">
              <img alt="" src="@/assets/img/LyricSroll/needle.png" style="width: 123px;">
            </div>
            <img alt="" class="img" src="@/assets/img/LyricSroll/disc.png">
            <div class="rotate360 cover-img" style="">
              <img :src="songStore.currentSong?.al.picUrl" alt="">
            </div>
          </div>
          <div class="song-info">
            <span class="title">{{ songStore.currentSong.name }}</span>
            <div class="artist">
           <span
               v-for="(v,i) in songStore.currentSong.ar"
               :key="v.id" class="artist-name"
               @click="toArtist(v)">
         {{ songStore.currentSong.ar.length > 1 && i !== 0 ? '/' : '' }}{{ v.name }}
     </span>
            </div>
            <div v-loading="!songStore.currentSong.lyric" element-loading-text="歌词加载中~"
                 style="margin-top: 30px;"></div>

            <div class="lyric-content">
              <div   class="placeholder"></div>
              <span
                  v-for="(v2,i2) in songStore.currentSong.lyric"
                  v-if="songStore.currentSong.lyric"
                  :class="i2 ===lyricIndex?'active-lyric lyric-item':'lyric-item'">
              {{ v2.content }}{{ "ㅤ" }}</span>

            </div>

          </div>
        </div>
        <button v-show="!commentLoading" class="pink-btn" @click="handleComment">
          <i class="iconfont icon-ziyuan"></i>
          发表评论
        </button>
        <Comment ref="commentRef" :commentsAll="commentsAll" :dialogVisible=dialogVisible :likeQuery="likeQuery"
                 :loading="commentLoading"
                 @addCommentCount="addCommentCount" @dialogChange="dialogChange"
                 @pageChange="commentPageChange"></Comment>
      </div>
      <div v-else class="empty">暂无播放音乐</div>
    </el-drawer>
  </div>

</template>

<script lang="ts" setup>
import Comment from "@/components/Comment/index.vue"
import {useSong} from '@/store/song.ts'
import {ref, reactive, defineEmits, defineProps, watch, onUpdated, Ref} from "vue"
import type {CommentRes, CommentType, GetCommentQuery} from "@/types/comment.d.ts"
import {songComment} from "@/api/comment/index"
import {PlaylistInfo} from "@/types/playlist.d.ts";
import {LyricInfo} from "@/types/song.d.ts";
import {useRouter, useRoute} from "vue-router";
import {useArtistInfo} from "../../hooks/useArtistInfo";

// ========== 变量 ==========
const router = useRouter()
const route = useRoute()
let placeholderHeight = 0;
const props = defineProps({
  lyricShow: { //歌词抽屉显示
    type: Boolean,
    default: false
  },
  currentTime: { //当前播放进度，单位：秒
    type: Number,
    default: 0
  }
})
const songStore = useSong()
let lyricIndex = ref(0);//正播到哪句歌词的索引号
const commentRef = ref() //评论组件ref
const getCommentQuery = reactive<GetCommentQuery>({ //获取评论的参数
  id: 0,
  offset: <number>0,
  time: 0
})
let dialogVisible = ref(false)//单曲发表评论对话框
let likeQuery = ref({ //给评论点赞的参数
  id: 0, //歌曲id
  cType: 0//评论类型(单曲)
})
let commentLoading = ref(true)
let playlistDetail = ref<PlaylistInfo>({
  id: 0, //歌曲id
  coverImgUrl: '',
  createTime: 0,
  trackCount: 0,
  description: '',
  creator: {},
  tags: [],
  subscribed: false//歌曲是否被收藏
})
let commentsAll = reactive<CommentRes>({ //热评、所有评论
  comments: <CommentType[]>[],
  hotComments: <CommentType[]>[],
  commentCount: <number>0
})

const emit = defineEmits<{
  (e: String, show: Boolean): void
}>()

//方法
// 关闭歌词抽屉
const handleClose = () => {
  emit('getLyricShow', false)
}
//跳转到歌手页
const toArtist = async (v) => {
  handleClose()
  //歌手信息
  let info = await useArtistInfo(v)
  await router.push({
    name: 'artistDetail',
    query: {
      info: JSON.stringify(info)
    }
  })
}
//打开发表评论对话框
const handleComment = () => {
  dialogVisible.value = true
}
//获取歌曲评论
const getComment = () => {
  getCommentQuery.id = songStore.currentSong.id
  commentLoading.value = true
  commentsAll.hotComments = []
  commentsAll.comments = []
  commentsAll.commentCount = 0
  songComment(getCommentQuery).then((res: CommentRes) => {
    if (res.code === 200) {
      commentLoading.value = false

      commentsAll.hotComments = res.hotComments
      commentsAll.comments = res.comments
      commentsAll.commentCount = res.total
      // console.log('获取到的评论', res)
      if (playlistDetail.value.commentCount >= 5000) {
        getCommentQuery.time = res.comments[res?.comments?.length - 1].time
      }
    }

  })
}
//获得评论的偏移量
const commentPageChange = (pageNum: number) => {
  getCommentQuery.offset = (pageNum - 1) * 30
  getComment()
  document.querySelector('.el-drawer__body')!.scrollTop = 550;
}
//单曲发表评论对话框关闭
const dialogChange = (v: boolean) => {
  dialogVisible.value = v
}
//发送评论成功后评论数量+1
const addCommentCount = () => {
  playlistDetail.value.commentxCount++ //评论数量+1
}


// ========== 歌词滚动 ==========
//获取当前句歌词索引号
const lyricCurrentIndex = () => {
  if (songStore.currentSong.lyric) {
    // console.log('校准滚动位置')
    songStore.currentSong.lyric.some((v: LyricInfo, i: number) => {
      //判断遍历到歌词的时间段若符合，且后一句歌词的时间不符合，则当前的索引就是正确的当前句歌词索引号
      if (i + 1 !== songStore.currentSong.lyric.length) { //非最后一句歌词
        if (v.time <= props.currentTime + 0.5 && songStore.currentSong.lyric[i + 1].time > props.currentTime) {
          lyricIndex.value = i
          if (props.lyricShow) {
            // console.log('情况111')
            lyricScroll()
          }

          return true
        }
      } else {
        //最后一句歌词已结束

        lyricIndex.value = songStore.currentSong.lyric.length-1
        // console.log('是最后一句歌词', songStore.currentSong.lyric.length, lyricIndex.value)
        lyricScroll()
      }

    })
  }
}
//歌词滚动方法(传入歌词索引号)

const lyricScroll = () => {
  setTimeout(()=>{
    //获取歌词内容
    let lyricContent = document.querySelector(' .lyric-content') as any
    //获取歌词item
    let lyricArr = document.querySelectorAll('.lyric-item') as any
    // placeholder的高度
    if (placeholderHeight == 0) {
      placeholderHeight = lyricArr[0]?.offsetTop - lyricContent?.offsetTop;
    } else {
      placeholderHeight = lyricArr[0]?.offsetTop - 130
    }

    if (lyricIndex.value + 1 >= 0 && lyricIndex.value && lyricArr[lyricIndex.value + 1]) {
      // console.log('情况2',lyricArr)
      let distance = lyricArr[lyricIndex.value + 1].offsetTop - lyricContent.offsetTop;
      lyricContent.scrollTo({
        behavior: "smooth",
        top: distance - placeholderHeight,
      });
    }else if(lyricArr[lyricIndex.value]){
      //是最后一句歌词已结束（？）
      let distance = lyricArr[lyricIndex.value].offsetTop - lyricContent.offsetTop;
      lyricContent.scrollTo({
        behavior: "smooth",
        top: distance - placeholderHeight,
      });
    }
  })

}
//唱片转动
const recordRotate = () => {
  if (!props.lyricShow) return false
  //计算出唱片应该旋转多少圈
  setTimeout(() => {
    let count = songStore.currentSong.dt * 100 / 40 //播放时常秒数/动画周期秒数
    let coverImg = document.querySelector('.rotate360');
    coverImg.style.animationIterationCount = count
    coverImg.style.animationPlayState = 'running'
  }, 100)

}
//唱片暂停旋转
const RotatePaused = () => {
  if (!props.lyricShow) return false
  setTimeout(() => {
    let coverImg = document.querySelector('.rotate360');
    coverImg.style.animationPlayState = 'paused'
  }, 100)
}
//监听当前歌曲的变化,歌词索引号初始化
watch(() => songStore.currentSong, (newVal) => {
  likeQuery.value.id = playlistDetail.value.id = songStore.currentSong.id
  lyricIndex.value = 0
  //若是切换歌曲
  if (newVal.id) {

    recordRotate()
    getComment()
  }
})
//监听歌词抽屉打开，检查调整歌词显示
watch(() => props.lyricShow, (newVal: boolean) => {
  if (newVal && songStore.playState) {
    lyricCurrentIndex()
    recordRotate()
    getComment()
  }
})
//监听播放进度变化而变化当前句歌词

watch(() => props.currentTime, (newVal: number, oldVal: number) => {

  //若新旧进度差异超过1.2，则代表拖动了进度条，需要校准歌词

  if (Math.abs(newVal - oldVal) >= 1.2) {
    lyricCurrentIndex()
  } else if (songStore.currentSong.lyric && songStore.currentSong.lyric[lyricIndex.value + 1]?.time <= newVal + 0.3) { //进度条自己动的时候，到达下一句歌词时间段则歌词索引号自增(并且避免空歌词那一条作为歌词索引)
    lyricIndex.value += 1
    lyricScroll()
  }

})

//监听路由变化，如果去了其他页面，则关掉歌词抽屉
watch(() => route.name, (newVal) => {
  handleClose()
})
//监听音乐播放状态
watch(() => songStore.playState, (newVal) => {
  if (!newVal) {
    RotatePaused()
  } else {
    recordRotate()

  }
})
</script>

<style lang="less" scoped>
@keyframes rotate360 {
  100% {
    transform: rotate(360deg);
  }
}

:global(.el-drawer__header) {
  padding: 6px;
  margin-bottom: 0;
}

:global(.el-icon.el-drawer__close) {
  height: 0;
  width: 0;
}

:deep(.el-pagination) {
  padding-bottom: 80px;
}

:global(.el-drawer.btt, .el-drawer.ttb) {
  background-image: linear-gradient(to top, #fff, @pink) !important;
  width: 100%;
  height: 100%;
  min-width: 1140px;
  padding-bottom: 50px;
}

.icon-arrow-down-bold:before {
  font-size: 26px;
  margin-left: 30px;
  margin-top: 5px;
  color: #676a71;
}

.center {
  margin: 0 auto;
  width: 800px;

  .song {
    margin-bottom: 70px;
    display: flex;
    height: 460px;
    align-items: center;
    //歌曲封面
    .cover {
      position: relative;
      width: 280px;
      height: 280px;

      .top {
        top: -52px;
        left: 122px;
        position: absolute;
        z-index: 5;
        width: 100px;
        height: 100px;
      }

      > img {
        position: absolute;
        z-index: 2;
        width: 100%;
        height: 100%;
      }

      //旋转360°
      .rotate360 {
        animation-name: rotate360; //动画名称
        animation-timing-function: linear; //运动曲线（平滑）
        animation-duration: 40s; //动画完成一周期消耗时间
        animation-play-state: paused; //动画是暂停还是继续
        animation-iteration-count: 0; //动画被播放次数
      }

      .cover-img {

        top: 40px;
        left: 40px;
        width: 200px;
        height: 200px;
        position: absolute;
        border-radius: 50%;
        overflow: hidden;
      }
    }

    //歌词列
    .song-info {
      display: flex;
      flex-direction: column;
      text-align: center;
      height: 100%;
      margin-left: 70px;
      width: 370px;

      .artist {
        margin: 10px auto;
        color: #919191;
        max-width: 300px;
        .long-text;
        max-height: 22px;
        text-align: center;
        display: flex;
        min-height: 25px;
      }

      .title {
        font-size: 26px;
      }

      //歌词滚动内容
      .lyric-content {
        margin-top: 15px;
        position: relative;
        overflow-y: scroll;
        height: 400px;
        scrollbar-width: none; /* firefox */
        -ms-overflow-style: none; /* IE 10+ */

        .placeholder {
          height: 200px;
        }

        .active-lyric {
          font-weight: 700;
          font-size: 18px;
          color: #000 !important;
        }

        .lyric-item {
          color: @fontColor2;
          display: block;
          margin-top: 20px;
          //margin-bottom: 20px;
        }
      }

      .lyric-content::-webkit-scrollbar,
      .lyric-view::-webkit-scrollbar {
        display: none; /* Chrome Safari */
      }
    }
  }

  .pink-btn {
    bottom: 80px;
    position: fixed;
    z-index: 3;
    color: @fontColor2;
    background-color: @pink;
    left: 50%;
    transform: translateX(-50%);

    .iconfont {
      font-size: 16px;
    }
  }
}

:global(.el-dialog) {
  border-radius: 8px !important;
}

:global(.el-dialog__body) {
  padding-top: 10px;
}

.font-weight {
  text-align: center;
  margin-bottom: 20px;
}

.empty {

  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 50%;
  font-size: 22px;
  color: @fontColor2;
}
</style>
