<template>

  <div class="mv-cover" @click="handleMv">
    <el-image
        :src="props.mvInfo.imgurl16v9"
    />
    <!--覆盖层图标-->
    <div class="info-icon">
      <div class="top">
        <div class="tag">MV</div>
        <div class="long-text name">{{ props.mvInfo.name }} <span
            style="color:#a2a2a2;font-size: 12px">-{{ props.mvInfo.artistName }}</span></div>
      </div>
      <div class="middle">
        <img alt="" src="@/assets/img/播放.png">

      </div>
      <div class="bottom">
        <span> <i class="iconfont icon-bofang"></i>{{ useNumberFormat(props.mvInfo.playCount) }} </span>
        <span>{{ useDurationFormat(props.mvInfo.duration) }} </span>
      </div>
    </div>
  </div>

</template>

<script setup>
import {ref, reactive, defineProps, watch} from "vue"
import {useNumberFormat} from "@/hooks/useNumberFormat"
import {useDurationFormat} from '@/hooks/useDurationFormat.ts'
import {VideoPlay} from "@element-plus/icons-vue"
import {useRoute, useRouter} from 'vue-router'

const router = useRouter()

const props = defineProps({
  mvInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const handleMv = () => {
  router.push({
    name: 'mvDetail',
    query: {
      id: props.mvInfo.id,
      type: 'mv'
    }
  })
}
</script>

<style lang="less" scoped>
//mv内容
.mv-cover {

  position: relative;
  border-radius: 8px;
  overflow: hidden;
  width: 366px;
  cursor: pointer;
  margin-bottom: 10px;
  height: 200px;
  color: @white;
  font-size: 12px;

  .info-icon {
    padding: 10px;
    position: absolute;
    z-index: 2;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    line-height: 12px;
    width: 366px;


    flex-direction: column;
    justify-content: space-between;

    .top {

      display: flex;
      flex-direction: row;
      flex-wrap: nowrap !important;
      font-size: 14px;
      align-items: center;
      width: 366px !important;

      .name {
        width: 310px;
      }

      .tag {
        color: @white;
        border-color: @white;
        margin-right: 5px;
      }
    }

    .middle {
      margin-left: auto;
      margin-right: auto;
      color: rgba(223, 223, 224, 0.78);
      font-weight: 300;
    }

    .bottom {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
  }

  .icon-bofang:before {
    font-size: 10px;
  }
}
</style>
