<template>
  <div class="song-view"  >
    <!--    <el-empty v-show="videoList?.length===0" description="No songs available for now~(｡•ˇ‸ˇ•｡)"/>-->

    <MvCard :loading="loading"  :dropdownRefresh="true" @loadData="loadData"  :mvList="videoList">
    </MvCard>

  </div>
</template>

<script setup>
import MvCard from "@/components/Card/MvCard/index.vue"
import {useUser} from '@/store/user'
import {ref, reactive} from "vue"
import {cloudSearch} from "@/api/search/index.ts";
import {useRoute,useRouter} from "vue-router";

const route =useRoute()
const props =defineProps({
})
const userStore = useUser() // create store
let videoList =ref([])
let loading =ref(false)
let videoQuery =reactive({ // request parameters for search results
  type:1014,// type
  limit:30,// return quantity limit
  offset:0,// offset (30 * page number minus one)
  keywords:route.query.keyWords||'',// keywords
})

const getVideo =()=>{
  loading.value =true

  cloudSearch(videoQuery).then(res=>{
    loading.value =false
    if(!res.result.videos) return false

    videoList.value.push(...res.result.videos)

  })
}

// load more data
const loadData = () => {
  if (videoList.value.length > 0) {
    videoQuery.offset += 30
  }
  getVideo()
}
</script>

<style lang="less" scoped>
.video-view{
  margin-top: -20px;
  //padding-bottom: 510px;
  height: 100%;
  padding-bottom: 130px;

  :deep(.el-pagination){
    display: flex;
  }
}
:deep(.el-table){
  margin-top: 0;
}
</style>