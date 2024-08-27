<!--轮播图组件-->
<template>
  <el-carousel :interval="7000" type="card" height="200px">
    <el-carousel-item v-for="v in bannerData" :key="v.targetId
">
      <a class="target"
          @click="jump(v.targetType,v.targetId)"
          :href="v.url" target="_blank"
      ><i :style="{background:v.titleColor==='red'?'#cc4a4a':'#4a79cc' }">{{v.typeTitle}}</i><img :src="v.imageUrl" alt=""></a>
    </el-carousel-item>
  </el-carousel>
</template>

<script lang="ts" setup>
import {ref, reactive} from "vue"
import {useRouter} from "vue-router";
import {getBanner} from "@/api/recommend/index"
import {BannerData} from "@/types/recommend.d.ts"

//变量
const bannerData = ref<BannerData>()
const router = useRouter()

//方法
//获取到banner数据
const getBannerData = ()=>{
  getBanner().then((res:any)=>{
    if(res.code===200)
    bannerData.value = res.banners
  })
}
getBannerData()
//点击banner图片跳转
const jump = (type:number,id:number)=>{
  console.log(type,id)

  // type:3000数字专辑（有自己的url），1000歌单，1新歌推荐/新歌首发
  if(type===1000){
    router.push({
      name:'musicListDetail',
      query:{
        id
      }
    })
  }else if(type===1){
    // TODO:这里根据歌曲歌曲id播放歌曲
  }
}
</script>

<style scoped lang="less">
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  text-align: center;
}
.el-carousel__item{
  border-radius: 8px;

}
.target{
  height: 100%;
  width: 100%;
  position: relative;
  i{
    z-index:9999;
    position: absolute;
    bottom: -92px;
    right: 0;
    padding-left: 5px;
    padding-right: 5px;
    font-size: 12px;
    color:@white;
    border-top-left-radius: 8px;
  }
}

:deep(.el-carousel__indicators--outside button){
  background-color: @theme;
}

</style>
