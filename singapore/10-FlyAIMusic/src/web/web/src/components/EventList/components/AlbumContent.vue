<template>
  <div class="album-container item-content" @click="handleAlbum">
    <el-image :src="props.albumInfo.picUrl" alt="" style="width: 40px;height: 40px;"/>
    <div class="content-right">
      <div class="name">
        <div class="tag">专辑</div>
        {{ props.albumInfo.name }}
      </div>
      <div class="artist-row">
                   <span v-for="(artist,i) in  props.albumInfo.artists" class="artist">{{
                       i === 0 ? artist.name : '/' + artist.name
                     }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>

import {ref, reactive, defineProps, watch} from "vue"
import {useRouter} from "vue-router"

const router = useRouter()

const props = defineProps({
  albumInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const handleAlbum = () => {
  router.push({
    name: 'albumDetail',
    query: {
      id:props.albumInfo.id
    }
  })
}
</script>

<style lang="less" scoped>

</style>
