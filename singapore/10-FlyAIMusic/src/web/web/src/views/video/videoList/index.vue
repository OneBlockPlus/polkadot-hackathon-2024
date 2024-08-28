<template>
  <!--种类选择栏-->
  <div class="container">
    <!--种类选择栏-->
    <SortTool :kinds="kinds" @selectCat="selectCat"></SortTool>
<div style="margin-top: 20px;">
  <MvCard :loading="loading" @handleJump ='handleJump' :dropdownRefresh="true" @loadData="loadData"  :mvList="mvList">
  </MvCard>
</div>

  </div>

</template>

<script lang="ts" setup>
import {ref, reactive} from "vue"
import SortTool from "@/components/SortTool/index.vue"
import MvCard from "@/components/Card/MvCard/index.vue"
import {catList,videoList} from "@/api/video/index.ts";
//类型
let kinds = ref()  //类型列表
let queryParams = reactive({
  offset:0, //偏移量 （页数-1）*50
  id:58100, //歌单类型id
})
let loading =ref(false)
let mvList =ref([]) //mv源数据
//选择了类型
const selectCat = (cat)=>{
  queryParams.offset =0
  queryParams.id = cat.id
  mvList.value=[] //不要给数组重新赋值，因为监听不到了
  getMvList()
  // getTopList()
}
//方法
//获取歌单种类
const getCatList = () => {

  catList().then((res: any) => {
    if (res.code === 200) {
      kinds.value = res.data
      queryParams.id =res.data[0].id
    }
  })
}
getCatList()

//选择了类型

// //加载更多歌手数据
const loadData =()=>{
  if(mvList.value.length>0){
    queryParams.offset += 30
  }
    getMvList()
}
// //获得列表
const getMvList = () => {
  loading.value =true

  videoList(queryParams).then((res: any) => {
    if (res.code === 200 ) {
      loading.value =false

      mvList.value.push(...res.datas)
      //如果mv数量太少，会导致元素无法触底而无法有无限滚动监听.所以再多要点数据
      if(res.hasmore&&mvList.value.length<12){
        queryParams.offset+=30
        getMvList()
      }
    }
  })
}

</script>

<style scoped lang="less">
.container{
  //margin-left: -10px;

}
</style>
