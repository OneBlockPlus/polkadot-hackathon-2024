<template>
  <div class="song-container item-content" @click="handleSong">
    <div class="cover">
      <el-image
          :src="props.songInfo.img80x80||props.songInfo?.xInfo?.img80x80||props.songInfo?.album.img80x80"
          alt="" style="width: 40px;height: 40px;"/>
      <div class="bofang">
        <img alt="" src="@/assets/img/播放器-播放_44.png">
      </div>
    </div>

    <div class="content-right">
      <span>{{ props.songInfo.name }}</span>
      <div class="artist-row"> <span v-for="(artist,i) in  props.songInfo.artists" class="artist">{{
          i === 0 ? artist.name : '/ ' + artist.name
        }}&nbsp;</span></div>
    </div>
  </div>
</template>

<script setup>
import {VideoPlay} from "@element-plus/icons-vue"
import {ref, reactive, defineProps, watch} from "vue"
import {useSongDetail} from '@/hooks/useSongDetail.ts'

const props = defineProps({
  songInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
//播放音乐
const handleSong = () => {
  useSongDetail(props.songInfo.id)
}
</script>

<style lang="less" scoped>
.cover {
  width: 40px;
  height: 40px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  .bofang {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    position: absolute;
    background-color: @white;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 18px;
      height: 18px;
    }
  }

  :deep(.el-icon) {
    background-color: rgba(255, 255, 255, 0.76);
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    left: 50%;
    top: 50%;
  }
}
</style>
