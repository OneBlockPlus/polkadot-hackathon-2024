<!--歌单/歌手等所有正方形的卡片公用组件-->
<template>
  <div

      v-infinite-scroll="handleInfiniteOnLoad"
      :class="props.dropdownRefresh?'scroll':''"
      :infinite-scroll-disabled="scrollDisabled"
      :infinite-scroll-distance="300"
      :infinite-scroll-immediate-check="false"
      :infinite-scroll-watch-disabled="scrollDisabled"
  >
    <!--card2为卡片不需要悬停显示播放器元素-->

    <div class="card-list">
      <div
          v-for="v in props.playList"
          class="card"
          @click="jumpDetail(v.id,v)">
        <div class="cover-img">
          <!--播放量图标-->
          <div v-if="v.playCount" class="play-count">
            <span class="iconfont icon-bofang" @click="playAll(v.id)"></span>
            {{ useNumberFormat(v.playCount) }}
          </div>
          <div class="img">
            <el-image lazy :class="route.name==='artist'?'cover':''" :src="v.coverImgUrl||v.picUrl" fit="fit"
                      style=" width: 100%;height: 100%;
"
            />
          </div>
        </div>
        <span>{{ v.name }}</span>
      </div>
    </div>
    <div v-loading="props.loading" class="loading-box" element-loading-text="数据加载中~"></div>
    <el-empty v-show="props.playList?.length===0&&!props.loading" description="暂时没有数据哦~(｡•ˇ‸ˇ•｡)"/>
  </div>

  <el-pagination
      v-if="props.showPagination"
      v-model:current-page="currentPage"
      :hide-on-single-page="Number(props.playList.length)<30"
      :page-size="30"
      :pager-count="9"
      :total="Number(props.total)"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentChange"
  />
</template>

<script lang="ts" setup>
import {ref, reactive, defineProps, defineEmits, watch} from "vue"
import {useNumberFormat} from "@/hooks/useNumberFormat"
import type {PropType} from "vue"
import {useRoute, useRouter} from "vue-router"
import emptyMusic from '@/assets/img/emptyMusic.jpg'
import {ElMessage} from "element-plus";
import {useSong} from '@/store/song.ts'


//变量
const route = useRoute()
const emit = defineEmits(['loadData', 'handleJump', 'currentChange'])
const router = useRouter()
let currentPage = ref(1)//当前页码

const props = defineProps({
  loading: {
    type: Boolean,
    default: () => false
  },
  //卡片类型，是歌单卡片还是歌手卡片
  type: {
    type: String,
    default: () => 'playList'
  },
  //是否开启数据的下拉刷新
  dropdownRefresh: {
    type: Boolean,
    default: () => false
  },
  //是否展示分页
  showPagination: {
    type: Boolean,
    default: () => false
  },
  // 数据总量
  total: {
    type: Number,//
    default: () => 0
  },
  playList: {  //数据列表
    type: Array as PropType<CardList>,
    default: () => []

  },
})

let info = ref({}) //歌手信息
const songStore = useSong()
let scrollDisabled = ref(false) //无线下拉滚动控制器（是否禁止
//方法
//无限加载
const handleInfiniteOnLoad = () => {
  scrollDisabled.value = true
  // 加载数据列表
  console.log('滑到了底部，加载新数据')
  emit('loadData')
}
//切换页码
const handleCurrentChange = () => {
  emit('currentChange', currentPage.value)
}
const jumpDetail = (id: number, row) => {
  console.log(route.name)
  if (props.type === 'artist') {
//专门处理跳转事件
    emit('handleJump', row)
  } else if (props.type === 'album') {
    router.push({
      name: 'albumDetail',
      query: {
        id
      }
    })
  } else {
    //跳转到歌单详情页面
    router.push({
      name: 'musicListDetail',
      query: {
        id
      }
    })
  }
}

//因为props.playList期间会被重新赋值。所以要这样监听
watch(() => [...props.playList], (newVal) => {
  console.log('监听到数据变化', props.playList.length)
  // const loadingInstance = ElLoading.service({target:})

  if (props.dropdownRefresh) {
    if (props.playList.length > 0) {
      //   数据更新后，可再次运行触发load事件
      scrollDisabled.value = false
      console.log('滚动开启')
    } else {
      scrollDisabled.value = true
      console.log('滚动禁用')
    }
  }
})


</script>

<style lang="less" scoped>
@cardWidth: 14.4vw;
@cardHeight: 14.4vw;
//如果是无限滚动。必须要限定高度
.scroll {
  height: calc(100vh - 46px - 60px - 152px - 57px) !important;
  padding-bottom: 20px;

}

.card-list {
  //display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
  margin-bottom: 20px;
  overflow-x: hidden !important;
  //height: 500px;

  justify-content: space-between;

  grid-template-columns: repeat(auto-fill, 18.1%);
  //grid-template-columns: repeat(auto-fill,221px);
  width: 100%;
  display: grid;
}

.card2:nth-child(5n),
.card:nth-child(5n) {
  margin-right: 0;
}

.card2,
.card {
  margin-bottom: 20px !important;
  //margin-right: 1.7% !important;
  position: relative;
  width: 14.4vw;
  cursor: pointer;
  min-width: 166px;
  min-height: 210px;
  margin-left: 0 !important;

  .play-count {
    position: absolute;
    right: 9px;
    color: @white;
    font-size: 11px;
    display: flex;

    .icon-bofang:before {
      color: @white;
      font-size: 11px;
    }

    .icon-bofang {
      height: 17px;
      line-height: 12px;
    }
  }

  .img {
    min-width: 166px;
    min-height: 166px;
    height: @cardHeight;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;


  }

  .cover {
    width: auto;
    border-radius: 10px;
    //margin-left: -25px;
  }

  span {
    margin-top: 4px;
    .long-text2;
    color: @fontColor;
  }
}

.el-row {
  margin-bottom: 20px;
  padding-right: 24px;
}

</style>
