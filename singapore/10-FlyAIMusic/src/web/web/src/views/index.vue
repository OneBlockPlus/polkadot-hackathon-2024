<!--页面入口文件-->
<template>
  <el-container>
  <el-header>
  <TopBar></TopBar>
  </el-header>
  <el-aside>
    <Menu></Menu>
  </el-aside>
  <el-main>
<!--设置动态不相同的key，组件切换会销毁/重建（会消耗一定性能），但是可以解决push同一个地址不同参数时不会重新渲染router-view的问题-->

      <router-view :key="route.fullPath"></router-view>
  </el-main>
<el-footer>
  <BottomControl></BottomControl>
</el-footer>


  </el-container>
</template>


<script lang="ts" setup>
import TopBar from "@/components/TopBar/index.vue"
import BottomControl from "@/components/BottomControl/index.vue"
import Menu from "@/components/Menu/index.vue"
import {useRoute} from "vue-router"
const route = useRoute()


</script>

<style scoped lang="less">
.el-container{
  width: 100%;
}
.el-header{
  padding: 0!important;
  height: 46px;
  width:100%;
  }
.el-main{
  overflow: hidden;
  position: absolute;
  top: 46px;
  left: 200px;
  padding: 0;
  width: calc(100% - 200px); /*减去越多，越窄*/
  min-width: 990px;
  height: calc(100vh - 47px);
}
.el-footer{
  padding: 0;
}
.el-aside{
  width: 200px;
  }
//回到顶部组件
:deep(.el-backtop){
  z-index:9999999999999;
}
</style>
