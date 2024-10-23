<template>
  <div class="song-view">
    <!--    <el-empty v-show="videoList?.length===0" description="暂时没有歌曲哦~(｡•ˇ‸ˇ•｡)"/>-->

    <MvCard :dropdownRefresh="false" :loading="loading" :mvList="videoList" @loadData="loadData">
      <template #tag="row">

        <div style="margin-top: 5px;margin-right: 5px;" v-if="row.row?.type===0" class="tag">mv</div>
      </template>
    </MvCard>

  </div>
</template>

<script setup>
import MvCard from "@/components/Card/MvCard/index.vue"
import {useUser} from '@/store/user'
import {ref, reactive} from "vue"
import {cloudSearch} from "@/api/search/index.ts";
import {useRoute, useRouter} from "vue-router";
import {mvCollection} from "@/api/mv/index.ts";

const route = useRoute()
const props = defineProps({})
const userStore = useUser() //创建store
let videoList = ref([])
let loading = ref(false)


const getVideo = () => {
  loading.value = true

  mvCollection().then(res => {
    loading.value = false

    videoList.value = res.data

  })
}
getVideo()

</script>

<style lang="less" scoped>
.video-view {
  margin-top: -20px;
  //padding-bottom: 510px;
  height: 100%;
  padding-bottom: 130px;

  :deep(.el-pagination) {
    display: flex;
  }
}

:deep(.el-table) {
  margin-top: 0;
}
</style>