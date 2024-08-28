<!--歌单、视频卡片公用组件-->
<template>
  <div v-infinite-scroll="handleInfiniteOnLoad"
       :class="props.dropdownRefresh?'scroll':''"
       :infinite-scroll-disabled="scrollDisabled"
       :infinite-scroll-distance="300"
       :infinite-scroll-immediate-check="false"
       :infinite-scroll-watch-disabled="scrollDisabled">


    <div class="list">

      <div
          v-for="v in props.mvList"
          class="card"
          @click="jumpDetail(v.data||v)"
      >
        <!--封面-->
        <div class="cover-img">

          <el-image
              lazy
              :src="v?.data?.coverUrl||v.imgurl||v?.cover||v?.coverUrl"
              fit="cover"
              style="width: 18vw;
              height: 11vw;
              min-width: 214px !important;
              min-height: 130px;"
          />
          <!--覆盖层图标-->
          <div class="info-icon">
            <span><i
                class="iconfont icon-bofang"></i>{{ useNumberFormat(v?.data?.playTime || v.playCount || v?.playTime) }}</span>
            <span>{{ useDurationFormat(v?.data?.durationms || v.duration || v?.durationms) }} </span>
          </div>
        </div>
        <div   class="text" style="font-size: 16px;display: flex">
          <slot :row="v" name="tag"></slot>
          {{ v?.data?.title || v.name || v?.title }}
        </div>

        <span style="color: #cfcfcf">{{ v?.data?.creator?.nickname || v?.creator?.nickname || v?.artistName }}</span>
      </div>
    </div>
    <div v-show="props.loading" v-loading="props.loading" class="loading-box" element-loading-text="数据加载中~"></div>
    <el-empty v-show="props.mvList?.length===0&&!props.loading" description="暂时没有数据哦~(｡•ˇ‸ˇ•｡)"/>

  </div>
</template>

<script lang="ts" setup>
import {ref, reactive, defineProps, defineEmits, watch} from "vue"


const emit = defineEmits(['loadData', 'handleJump'])
import {useNumberFormat} from "@/hooks/useNumberFormat"
import {useDurationFormat} from '@/hooks/useDurationFormat.ts'
import {useRouter, useRoute} from 'vue-router'

const props = defineProps({
  loading: {
    type: Boolean,
    default: () => false
  },

  mvList: {  //数据列表
    type: Array,
    default: () => []
  },
  //是否开启数据的下拉刷新
  dropdownRefresh: {
    type: Boolean,
    default: () => false
  },
})
let scrollDisabled = ref(false) //无线下拉滚动控制器（是否禁止
const router = useRouter()
const route = useRoute()
//进入mv详情页(传入mvID)

const jumpDetail = (row) => {
  // 可能会有个type字段，值为0则表示为mv

  router.push({
    name: 'mvDetail',
    query: {
      id: row.id || row.vid,
      type: row.type?(row.type === 0 ? 'mv' : 'video'):(route.name.includes('ideo')?'video':'mv')
    }
  })
}

//方法
//无限加载
const handleInfiniteOnLoad = () => {
  scrollDisabled.value = true
  // 加载数据列表
  console.log('滑到了底部，加载新数据1')
  emit('loadData')
}
//因为props.mvList期间会被重新赋值。所以深度监听
watch(() => [...props.mvList], (newVal) => {
  console.log('监听到数据变化', props.mvList.length)
  if (props.dropdownRefresh) {
    if (props.mvList.length > 0) {
      //   数据更新后，可再次运行触发load事件
      scrollDisabled.value = false
      console.log('滚动开启')
    } else {
      scrollDisabled.value = true
      console.log('滚动禁用')
    }
  }
}, {deep: true})
</script>

<style lang="less" scoped>

//如果是无限滚动。必须要限定高度
.scroll {
  height: calc(100vh - 46px - 60px - 65px) !important;
  padding-bottom: 20px;
  //overflow: auto;


}

.list {
  width: 100%;
  display: grid;
  //background-color: red;
  flex-wrap: wrap;
  justify-content: space-between;
  overflow: auto;
  grid-template-columns: repeat(auto-fill, 23.3%);
  grid-template-columns: repeat(auto-fill, 22%);




  .card:last-child {
    margin-bottom: 80px !important;
    //background-color: red;
  }

  .card {
    //margin-top: 20px;
    //margin-bottom: 10px;
    //margin-bottom: 20px;
    margin-bottom: 20px;
    cursor: pointer;
    min-width: 214px !important;
    display: flex;
    flex-direction: column;
    width: 18vw;
    line-height: 25px;

    span {
      .long-text
    }

    span:last-child {
      font-size: 13px;
    }

    .cover-img {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      width: 18vw;
      height: 11vw;
      min-width: 214px !important;
      min-height: 130px;

      margin-bottom: 10px;
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
  }
}

</style>