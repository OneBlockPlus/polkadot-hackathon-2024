<template>
  <el-menu
      router
      :default-active="activeName"
      width="100px"
  >
    <el-menu-item index="/discover/recommend">
      <el-icon>
        <Headset/>
      </el-icon>
      <span>Explore</span>
    </el-menu-item>
<!--    <el-menu-item  index="/video">-->
<!--      <el-icon>-->
<!--        <VideoPlay/>-->
<!--      </el-icon>-->
<!--      <span>视频</span>-->
<!--    </el-menu-item>-->
<!--    <el-menu-item index="/favourite">-->
<!--      <el-icon>-->
<!--        <Star/>-->
<!--      </el-icon>-->
<!--      <span>收藏</span>-->
<!--    </el-menu-item>-->
<!--    <el-menu-item   index="/dailyRecommend">-->
<!--      <i class="iconfont icon-good"></i>-->
<!--    <span>每日推荐</span>-->
<!--    </el-menu-item>-->
    <el-menu-item v-if="userStore.accountInfo?.userId" index="/playRecord">
      <el-icon>
        <Clock/>
      </el-icon>
      <span>Recently Played</span>
    </el-menu-item>
    <el-menu-item-group v-if="userStore.playList" title="创建的歌单">
      <el-menu-item
          v-for="v in userStore.playList.createList"
          @click="jumpDetail(v.id)"
          :index="'/musicListDetail?id='+v.id"
      >
        <i class="iconfont icon-gedan"></i>
        <span>{{ v.name }}</span>
      </el-menu-item>
    </el-menu-item-group>
    <el-menu-item-group v-if="userStore.playList" title="收藏的歌单">
      <el-menu-item
          v-for="v in userStore.playList.collectList"
          @click="jumpDetail(v.id)"
          :index="'/musicListDetail?id='+v.id"
         >
        <i class="iconfont icon-gedan"></i>
        <span>{{ v.name }}</span>
      </el-menu-item>
    </el-menu-item-group>
    <el-menu-item-group title="NFT">
      <el-menu-item  index="/discover/create-nft">
        <el-icon>
          <CirclePlusFilled/>
        </el-icon>
        <span>Create</span>
      </el-menu-item>
      <el-menu-item  index="/web3/Marketplace">
        <el-icon>
          <School/>
        </el-icon>
        <span>Marketplace</span>
      </el-menu-item>
      <el-menu-item  index="/web3/Community">
        <el-icon><User /></el-icon>
        <span>Community</span>
      </el-menu-item>
      <el-menu-item  index="/web3/Artists">
        <el-icon>
          <Mic/>
        </el-icon>
        <span>Artists</span>
      </el-menu-item>
      <el-menu-item  index="/discover/u-pro">
        <el-icon>
          <Star/>
        </el-icon>
        <span>
Artist Details</span>
      </el-menu-item>
      <el-menu-item  index="/web3/user-details">
        <el-icon><Avatar /></el-icon>
        <span>User Details</span>
      </el-menu-item>
<!--      <el-menu-item  index="/discover/create-nft">-->
<!--        <el-icon>-->
<!--        </el-icon>-->
<!--        <span>NFT详情</span>-->
<!--      </el-menu-item>-->
    </el-menu-item-group>
  </el-menu>
</template>

<script lang="ts" setup>
import {useRoute,useRouter} from "vue-router";
import {ref, watch, reactive} from 'vue'
import {Headset, VideoPlay, Clock, Star,Avatar,CirclePlusFilled,School,User,Mic} from '@element-plus/icons-vue';
import {useUser} from "@/store/user"
import {ElMessage} from 'element-plus'


const userStore = useUser()
const route = useRoute()
const router = useRouter()
//菜单默认选第一个
let activeName = ref( "/" + route.fullPath.split("/")[1])


//方法
const jumpDetail = (id:number)=>{
  router.push({
    name:'musicListDetail',
    query:{
      id
    }
  })
}
// 监听路由变化.路由地址是什么菜单的active才能是什么
watch(()=>route.fullPath,(newVal)=>{
  //处理最大一级路由名称 ，与el-menu的index匹配。当在页面切换tab的时候，不让menu的active变化
  activeName.value = "/" + route.fullPath.split("/")[1];

})
</script>

<style lang="less" scoped>
.el-menu {
  height: calc(100vh - 97px);
  border-right: solid 1px @lightTheme;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 30px;
}

.el-menu-item.is-active {
  font-weight: 700;
  background-color: @shallowTheme;
}

.el-menu-item {
  width: 207px;
  color: @fontColor;
  height: 45px;
  line-height: 45px;

  span {
    width: 160px;
    .long-text

  }
}

.el-menu-item:hover {
  background-color: @shallowTheme;
}



</style>
