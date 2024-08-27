<template>

  <div class="mv-view"  >

    <MvCard :loading="loading"  :dropdownRefresh="true" @loadData="loadData"  :mvList="mvList">
    </MvCard>

  </div>
</template>

<script setup>
import MvCard from "@/components/Card/MvCard/index.vue"
import {useUser} from '@/store/user'
import {ref, reactive} from "vue"
import {cloudSearch} from "@/api/search/index.ts";
import {useRoute,useRouter} from "vue-router";
import {mvCollection} from "@/api/mv/index.ts";
import {artistMv} from "@/api/artist/index.ts";

const route =useRoute()
const props =defineProps({
})
const userStore = useUser() //创建store
let mvList =ref([])
let loading =ref(true)
let mvQuery = reactive({ //歌手mv请求参数
  id: 0,
  limit: 30,
  offset:0
})

//加载更多mv数据
const loadData =()=>{
  if(mvList.value.length>0){
    mvQuery.offset += 30
  }
  getMvList()
}

const getMvList = () => {
  loading.value =true
  console.log(loading.value)
  artistMv(mvQuery).then((res) => {
    if (res.code === 200 ) {
      loading.value =false

      mvList.value.push(...res.mvs)
      console.log('获取到的mv列表', mvList.value)
    }
  })
}
const getId =()=>{
  mvQuery.id = JSON.parse(route.query.info).id
}
getId()
</script>

<style lang="less" scoped>
.mv-view{

  //padding-bottom: 510px;

  margin-top: 10px;
  height: 100%;

  //overflow:auto;
  :deep(.el-pagination){
    display: flex;
  }
}
:deep(.el-table){
  margin-top: 0;
}
:deep(.scroll){
  height: 100px !important;
}
</style>
