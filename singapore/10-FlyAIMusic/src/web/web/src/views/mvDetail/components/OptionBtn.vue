<template>
  <div class="btn">
    <!--    只有video可点赞-->
    <button v-if="route.query.type === 'video'" class="white-btn" @click="handleResourceLike">
      <i v-if="resourceLikeQuery.t===1" class="iconfont icon-good"></i>
      <i v-else class="iconfont icon-dianzan"></i>
      <span>{{ resourceLikeQuery.t === 1 ? 'Like' : 'Liked' }}</span>
    </button>

    <button class="white-btn" @click="handleCollect">
      <i :class="collectQuery.t === 1?'iconfont icon-xihuan':'iconfont icon-xihuan is-xihuan'"></i>
      <span>{{ collectQuery.t === 1 ? 'Collect' : 'Collected' }}</span>
    </button>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { resourceLike, videoSub } from "@/api/video/index.ts";
import { ElMessage } from "element-plus";
import { myLike } from '@/api/video/index.ts'
import { useRoute } from "vue-router";
import { mvCollection, mvCollect } from "@/api/mv/index.ts";

const route = useRoute()
const props = defineProps({
  // 视频/mv信息
  mvInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
let resourceLikeQuery = reactive({ //视频点赞参数
  type: 0, //资源类型（mv还是视频）
  t: 1, //1为点赞，0为取消
  id: 0, //资源id
})
let collectQuery = reactive({
  id: 0, //videoid
  mvid: 0, //mvid,
  t: 1, //1为收藏，0为取消
}) //mv收藏参数

const handleResourceLike = () => {
  resourceLike(resourceLikeQuery).then(res => {
    if (res.code == 200) {
      ElMessage('Operation successful (´▽`)ﾉ ')
      resourceLikeQuery.t = (resourceLikeQuery.t == 1 ? 0 : 1)
    }
  })
}

//获取点赞过的视频
const getMyLike = async () => {
  //默认点赞状态为给视频点赞
  resourceLikeQuery.t = 1
  let res = await myLike()
  console.log('Liked videos', res)
  res.data.feeds.some(v => {
    //视频标题
    let title = props.mvInfo.title
    //看该视频是否包含在点过赞的视频内
    if (title?.includes(v.mlogBaseData.text)) {
      console.log('This video is already liked')
      //已经点过赞，参数设置为取消点赞
      resourceLikeQuery.t = 0
      return true
    }
  })
  console.log('Like status:', resourceLikeQuery.t !== 1)
}
//基础数据获取的获取
const dataInit = () => {
  if (route.query.type === 'video') {
    // video页面
    resourceLikeQuery.type = 5
    resourceLikeQuery.id = resourceLikeQuery.mvid = route.query.id
    collectQuery.id = route.query.id

    getMyLike()
  } else {
    // MV页面
    collectQuery.mvid = route.query.id
    setTimeout(() => {
      getCollection()
    })

  }
}
dataInit()
//收藏/取消收藏mv
const handleCollect = () => {
  if (route.query.type === 'video') {
    //收藏video
    videoSub(collectQuery).then(res => {
      if (res.code === 200) {
        ElMessage('Operation successful (´▽`)ﾉ ')
        collectQuery.t = (collectQuery.t == 1 ? 0 : 1)
      }

    })
  } else {
    //收藏mv
    mvCollect(collectQuery).then(res => {
      if (res.code === 200) {
        ElMessage('Operation successful (´▽`)ﾉ ')
        collectQuery.t = (collectQuery.t == 1 ? 0 : 1)
      }
    })
  }

}
//获取用户收藏
const getCollection = () => {
  collectQuery.t = 1

  mvCollection().then(res => {
    //视频标题
    let title = props.mvInfo.name || props.mvInfo.title

    res.data.some(v => {
      console.log(v.title)
      //看该视频是否包含在点过赞的视频内
      if (title?.includes(v.title)) {
        console.log('This MV is already collected')
        //已经点过赞，参数设置为取消点赞
        collectQuery.t = 0
        return true
      }
    })
  })
}
getCollection()
</script>

<style lang="less" scoped>
.btn {
  margin-top: 14px;
}

.icon-xihuan {
  font-size: 12px;
}

//已收藏
.is-xihuan {
  color: @theme;
}
</style>