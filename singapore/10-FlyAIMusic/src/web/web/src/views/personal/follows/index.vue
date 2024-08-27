<!--User's Followers/Follows-->
<template>
  <div class="content-view">
    <!--<el-backtop/>-->

    <span class="font-weight">{{ route.query.userName }}'s {{ route.name === 'follows' ? 'Follows' : 'Followers' }}</span>
    <UserList :loading="loading" :description="closed?'The user has set permissions~(｡•ˇ‸ˇ•｡)':route.name==='follows'?'No follows yet~(｡•ˇ‸ˇ•｡)':'No followers yet~(｡•ˇ‸ˇ•｡)'" :total="total" :userList="userList"
              @pageChange="getOffset"></UserList>

  </div>
<!--还有38min-->
</template>

<script lang="ts" setup>
import {ref, reactive} from "vue"
import UserList from "@/components/UserList/index.vue"
//可获取路由名称，判断是粉丝页面还是关注的人页面
import {useRoute} from "vue-router"
import {getUserFolloweds, getUserFollows} from "@/api/user/index"
import {uidType} from '@/types/global.d.ts'
import {ElMessage} from 'element-plus'
import avatarImg from '@/assets/img/avatar.png'
import {UserInfo} from "@/types/user";
let loading =ref(false)
//变量
let total = ref(0) //数据总条数
const offset = ref<number>() //用户列表偏移量
const route = useRoute()
let userList = ref([])//粉丝/关注的人列表
let closed =ref(false) //用户设置了权限
//获取用户粉丝列表
const getFolloweds = (v: { uid: uidType, offset: any }) => {
  total.value = Number(route.query.followeds)
  loading.value =true
  getUserFolloweds(v).then((res: any) => {
    if (res.code === 200) {
      loading.value =false
      closed.value =false

      userList.value = res.followeds
    }else if(res.code===400){
      userList.value =[]
      loading.value =false

      closed.value =true
    }
  })
}


//获取关注列表
const getFollows = (v: { uid: uidType, offset: any }) => {
  loading.value =true
  total.value = Number(route.query.follows)
  getUserFollows(v).then((res: any) => {
    if (res.code === 200) {
      loading.value =false
      closed.value =false
      userList.value = res.follow

    }else if(res.code===400){
      userList.value =[]
      closed.value =true
    }
  })
}
const getData = () => {
  //粉丝或关注页面
  if (route.query.uid) {
    if (route.name === 'followeds') {
      getFolloweds({uid: route.query.uid, offset: offset.value})
    } else if (route.name === 'follows') {
      getFollows({uid: route.query.uid, offset: offset.value})
    }
  }
}
getData()
//获取用户列表组件的分页的页数
const getOffset = (pageNum: any) => {
  offset.value = (pageNum - 1) * 30
  getData()
}

</script>

<style lang="less" scoped>
.content-view {
  height: calc(100% - 59px);
  position: relative;
  .pagination;
}
</style>