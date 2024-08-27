<!--User Play History-->
<template>
  <div class="content-view">
    <span class="font-weight">Recently Played</span>
    <span class="total">Total 100 Songs</span>
    <SongList
        :songList="recordList"
        :userId="userStore.accountInfo.userId"
    ></SongList>
  </div>
</template>

<script lang="ts" setup>
import SongList from "@/components/SongList/index.vue"
import {ref, reactive, watch} from "vue"
import {playRecord} from "@/api/song/index"
import {useUser} from "../../store/user";
import {useSong} from "../../store/song"
import {Song} from "@/types/playlist.d.ts"
import {ElMessage} from "element-plus";


//Get user's recent play history
const userStore = useUser()
let recordList =ref([])
const getRecord = () => {
  if (userStore.accountInfo.userId) {
    playRecord({uid: userStore.accountInfo.userId}).then((res: any) => {
      if (res.code === 200) {
        recordList.value = res.weekData.map((v: any) => {
          return v.song
        })
      } else {
        ElMessage('Oops, failed to get recent plays~(｡•ˇ‸ˇ•｡)')
      }
    })
  }
}
getRecord()
//Update list when the current song changes
const songStore = useSong()
watch(songStore?.currentSong, () => {
  if(!songStore?.currentSong.id) return false
  getRecord()
})
</script>

<style scoped>
.total {
  color: #999999;
  margin-left: 20px;
}

.content-view {
  height: calc(100% - 60px);
  overflow-x: hidden;
}
</style>