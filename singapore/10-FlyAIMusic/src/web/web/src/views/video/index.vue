<template>
  <div class="content ">
    <NavBar :tabsData="tabsData"></NavBar>
    <div class="content-view  no-scroll">
      <el-backtop/>
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NavBar from "@/components/NavBar/index.vue";
import {ref, reactive} from "vue"
import {useUser} from "../../store/user";
import {ElMessage} from 'element-plus'
import {useRouter} from 'vue-router'
const router =useRouter()
const userStore = useUser() //创建store

const tabsData = reactive([{
      label: '视频',
      value: 'videoList',
    }, {
      label: 'MV',
      value: 'mvList',
    }
    ]
)
const init = () => {
  if (!userStore.accountInfo) {
    ElMessage('请先登录哦~(｡•ˇ‸ˇ•｡)')
    router.replace("/index");
  }
}
init()
</script>

<style lang="less" scoped>

//最外层容器不要滚动的页面样式
.no-scroll{
  height: auto!important;
  overflow-y: auto;
  padding-right: 0;
}
</style>
