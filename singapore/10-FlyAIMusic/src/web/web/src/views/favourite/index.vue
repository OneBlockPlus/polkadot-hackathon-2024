<template>
  <div class="container">
    <NavBar :tabsData="tabsData"></NavBar>
      <div class="content-view">
    <el-backtop/>
      <router-view></router-view></div>
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
const tabsData = reactive([
      {
        label:'Album',
        value:'favouriteAlbum',
      },{
    label:'Video',
    value:'favouriteVideo',
  },{
    label: 'Singer',
    value: 'favouriteSinger',
  }
    ]
)
const init = () => {
  if (!userStore.accountInfo) {
    ElMessage('Please log in first~(｡•ˇ‸ˇ•｡)')
    router.replace("/index");
  }
}
init()
</script>

<style scoped lang="less">
.content-view{
  height: 100%;
  //background-color: red;
}
.container{

  height: calc(100vh - 60px - 50px - 46px);
}
</style>