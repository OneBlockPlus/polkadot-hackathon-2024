<template>

  <div v-infinite-scroll="handleInfiniteOnLoad"
       :class="props.dropdownRefresh?'scroll':''"
       :infinite-scroll-disabled="scrollDisabled"
       :infinite-scroll-distance="300"
       :infinite-scroll-immediate-check="false"
       :infinite-scroll-watch-disabled="scrollDisabled">


    <div class="event-list">

      <!--  用户动态页面通用组件。动态详情也可用-->
      <ul>
        <li v-for="(v,i) in props.eventList" v-if="v?.type!==56" :class="props.mode==='转发'?'forward':''" class="item">
          <div class="user-info">
            <el-avatar :size="55"
                       :src="v.user.avatarUrl"
                       @click="jumpPerson(v.user.userId)"></el-avatar>
            <div class="user-right">
              <div>
                <span class="user-name" @click="jumpPerson(v.user.userId)">{{ v.user.nickname }}</span>
                <span>{{ getEventType(v.type) }}</span>
              </div>
              <span class="time">{{ dayjs(v.showTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
            </div>
          </div>
          <div class="main-content">
            <div class="msg1">
              <!--            文字内容-->
              <span class="description">{{ v.mainInfo.msg }}</span>
              <!--            分享的单曲-->
              <SongContent v-if="v.type===18&&v.mainInfo.song" :songInfo="v.mainInfo.song"></SongContent>
              <!--            分享的歌单-->
              <PlayListContent :playListInfo="v.mainInfo.playlist" v-if="v.type===13&&v.mainInfo.playlist"></PlayListContent>

              <!--            分享的博客-->
              <div v-if="(v.type === 17 || v.type === 28)&&v.mainInfo.djRadio" class="item-content">
                <el-image :src="v.mainInfo.djRadio.img80x80" alt="" style="width: 40px;height: 40px;"/>
                <div class="content-right">
                  <div class="name">
                    <div class="tag">音乐播客</div>
                    {{ v.mainInfo.djRadio.name }}
                  </div>
                  <span class="artist">by {{ v.mainInfo.djRadio.dj.nickname }}</span>
                </div>
              </div>
              <!--            分享的专辑-->
              <AlbumContent v-if="v.type===19&&v.mainInfo.album" :albumInfo="v.mainInfo.album"></AlbumContent>

              <!--              分享的mv-->
              <MvContent v-if="v.type === 41 || v.type === 21" :mvInfo="v?.mainInfo?.mv"></MvContent>
              <!--            图片内容-->
              <ImgContent :imgList=v.pics></ImgContent>
              <!--              转发的内容-->
              <div v-if="v.type===22&&v?.mainInfo?.event">
                <EventList :eventList="[v?.mainInfo?.event]" :userInfo="v.user" mode="转发"></EventList>
              </div>
            </div>
          </div>

        </li>
      </ul>
    </div>
    <div v-loading="props.loading" class="loading-box" element-loading-text="数据加载中~"></div>
    <el-empty v-show="props.eventList?.length===0&&!props.loading" description="暂时没有数据哦~(｡•ˇ‸ˇ•｡)"/>
  </div>

</template>

<script setup>
import {ref, reactive, defineProps, watch} from "vue"
import EventList from '@/components/EventList/index.vue'
import dayjs from "dayjs";


import {useRouter} from "vue-router"
import ImgContent from "@/components/EventList/components/ImgContent.vue";
import MvContent from "@/components/EventList/components/MvContent.vue";
import SongContent from "@/components/EventList/components/SongContent.vue";
import AlbumContent from "@/components/EventList/components/albumContent.vue";
import PlayListContent from "@/components/EventList/components/PlayListContent.vue";

const router = useRouter()
const emit = defineEmits(['loadData', 'handleJump',])
const props = defineProps({
  //是否开启数据的下拉刷新
  dropdownRefresh: {
    type: Boolean,
    default: () => false
  },
  loading: {
    type: Boolean,
    default: () => false
  },
  //动态类型
  mode: {
    type: String,
    default: () => '列表'
  },
  //动态数据
  eventList: {
    type: Array,
    default: () => []
  },
  //用户信息
  userInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
let scrollDisabled = ref(false) //无线下拉滚动控制器（是否禁止

//分辨动态类型
const getEventType = (t) => {
  if (t === 18) return '分享单曲'
  if (t === 19) return '分享专辑'
  if (t === 17 || t === 28) return '分享博客'
  if (t === 22) return '转发'
  // TODO:4
  if (t === 39) return '发布视频'
  if (t === 13) return '分享歌单'
  // TODO:2
  if (t === 24) return '分享专栏文章'

  if (t === 41 || t === 21) return '分享MV'
  if (t === 35) return '发布动态'
}
//处理msg文字信息
const msgFormatter = (str) => {
  //不存在转发信息
  if (str.indexOf('@') === -1) return str
  //存在是转发的信息(获得转发中的人物名称)
  let start = str.indexOf('@')
  let userNameList = []
  while (start > -1) {
    let end = str.indexOf('：', start)
    userNameList.push()
    start = str.indexOf("@", start + 1);
  }
}
//提取字符串（例如：A_EV_2_29939163408_1613676397）中的id
const idFormatter = (str) => {
  let startIndex = str.lastIndexOf('_')
  return str.slice(startIndex + 1, str.length)
}
//无限加载
const handleInfiniteOnLoad = () => {
  scrollDisabled.value = true
  // 加载数据列表
  console.log('滑到了底部，加载新数据')
  emit('loadData')
}
//跳转到个人页面
const jumpPerson = (id) => {
  router.push({
    name: 'personal',
    query: {
      uid: id
    }
  })
}
//因为props.playList期间会被重新赋值。所以要这样监听
watch(() => [...props.eventList], (newVal) => {
  // const loadingInstance = ElLoading.service({target:})

  if (props.dropdownRefresh) {
    if (props.eventList.length > 0) {
      //   数据更新后，可再次运行触发load事件
      scrollDisabled.value = false
    } else {
      scrollDisabled.value = true
    }
  }
})
</script>

<style lang="less" scoped>

.scroll {
  height: calc(100vh - 46px - 60px - 152px - 57px) !important;
  //padding-bottom: 20px;

}

//通用样式
ul {
  //margin-top: 40px;

  .item:last-child {
    border-bottom: 0;
  }

  .item {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid @lightTheme;
    padding-top: 10px;
    padding-bottom: 10px;

    .user-info {
      height: 55px;

      display: flex;

      .user-right {
        margin-left: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;

        .time {
          font-size: 13px;
          color: @lightFontColor;
        }

        .user-name {
          margin-right: 10px;
        }
      }
    }

    .main-content {
      margin-left: 65px;


      .msg1 {
        margin-top: 10px;
      }


    }
  }
}

//转发页面样式
.forward {
  background-color: @shallowTheme;
  height: 100%;
  font-size: 13px;
  border-radius: 5px;
  padding-left: 20px;
  margin-top: 10px;

  .user-info {
    height: auto !important;
  }

  .time {
    height: 0;
    display: none;
  }

  :deep(.el-avatar) {
    width: 0;
    height: 0;
  }

  .main-content, .user-right {

    margin-left: 0 !important;
  }

  .item-content {
    background-color: #fff !important;
  }
}

</style>
