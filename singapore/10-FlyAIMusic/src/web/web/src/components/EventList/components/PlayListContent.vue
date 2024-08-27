<template>
  <div class="playList-container item-content" @click="handlePlayList">
    <el-image :src="props.playListInfo.coverImgUrl" alt="" style="width: 40px;height: 40px;"/>
    <div class="content-right">
      <div class="name">
        <div class="tag">歌单</div>
        {{ props.playListInfo.name }}
      </div>
      <span class="artist">{{ props.playListInfo.creator.nickname }}</span>
    </div>
  </div>
</template>

<script setup>

import {ref, reactive, defineProps, watch} from "vue"
import {useRouter} from "vue-router"

const router = useRouter()

const props = defineProps({
  playListInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const handlePlayList = () => {
  router.push({
    name: 'musicListDetail',
    query: {
      id: props.playListInfo.id
    }
  })
}
</script>

<style lang="less" scoped>

</style>
