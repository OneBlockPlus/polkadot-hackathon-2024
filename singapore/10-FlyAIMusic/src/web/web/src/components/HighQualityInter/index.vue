<!--精品歌单入口组件-->
<!--TODO:写跳转到精品歌单页面-->
<template>
  <div class="high-quality">
<!--    遮盖层-->
    <img :src="highqualityInfo?.coverImgUrl" alt="" class="mask">
    <div class="song-img">
      <img :src="highqualityInfo?.coverImgUrl" alt="">
    </div>
    <div class="song-info">
      <div class="label">
        <el-icon><GoldMedal /></el-icon>
        <span class="label-text">精品歌单</span>
      </div>
      <span class="info-text">{{ highqualityInfo?.name }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, reactive} from "vue"
import {GoldMedal} from "@element-plus/icons-vue"
import {highquality} from "@/api/recommend/index.ts"

//获取精品歌单的第一首歌
let highqualityInfo = ref()
const getHighquality = ()=>{
  highquality({limit:1}).then((res:any)=>{
    if(res.code===200){
      highqualityInfo.value = res.playlists[0]
    }
  })
}
getHighquality()
</script>

<style scoped lang="less">
.high-quality{
  margin-bottom: 20px;
  margin-top: 10px;
  position: relative;
  width:100%;
  height: 175px;
  padding:14px;
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  .mask{
    position: absolute;
    z-index:-1;
    width: 100%;
    height: 175px;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    content: '';
    display: inline-block;
    background-position: center center;
    border-radius: 8px;
    filter: blur(60px)  brightness(70%); //增加毛玻璃、变暗的滤镜
  }

  .song-img {
    z-index:3;
    width: 148px;
    height: 148px;
    img{
      border-radius: 8px;
    }
  }
  .song-info{
    margin-top: 21px;
    margin-left: 10px;
    //background-color: red;
    width:300px;
    height: 200px;
    .label{
      @color: #ddaa69;
      margin-bottom: 20px;
      text-align: center;
      color: @color;
      width: 118px;
      height: 32px;
      border-radius: 26px;
      border: 1px solid @color;
      line-height: 31px;
      .label-text{
        margin-bottom: 12px!important;
      }
      .el-icon{
        vertical-align: -25%;
        margin-right: 5px;
        color: @color;
        font-size: 20px;
      }
    }
    .info-text{
      color: #ededed;
    }
  }
}

</style>
