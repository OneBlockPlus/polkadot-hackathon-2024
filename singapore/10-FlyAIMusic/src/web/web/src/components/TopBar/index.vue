<!--头部区域-->
<template>
  <div class="container header">
    <div class="left">
      <img class="logo" src="@/assets/img/logo.png" style="width: 50px;">
      <h1>FlyAIMusic</h1>
    </div>
    <div class="center">
      <!--左右切换按键-->
      <div class="switch">
        <el-icon :size="14" color="rgba(255, 255, 255, 0.8)" @click="router.back()">
          <ArrowLeft></ArrowLeft>
        </el-icon>
        <el-icon :size="14" color="rgba(255, 255, 255, 0.8)" @click="router.go(1)">
          <ArrowRight></ArrowRight>
        </el-icon>
      </div>
      <SearchInput></SearchInput>
    </div>
    <!--用户头像、名字部分-->
    <div class="right" @click="connectWallet">
      <el-avatar :size="31" :src="userStore.accountInfo?userStore.accountInfo.avatarUrl:avatarImg" shape="circle"/>
      <span v-if="userStore.accountInfo" class="username">{{
          userStore.accountInfo.nickname
        }}</span>
      <span v-else class="username">Connect Wallet</span>
    </div>
  </div>
  <Login :visible="loginVisible" @getVisible="getVisible"></Login>

</template>


<script lang="ts" setup>
import Login from "@/components/Login/index.vue"
import SearchInput from '@/components/TopBar/compoments/SearchInput.vue'
import {ref, watch, toRef, reactive} from "vue"
import {ArrowLeft, ArrowRight,} from '@element-plus/icons-vue';
import {useUser} from '@/store/user'
import {useRouter} from "vue-router";
import avatarImg from '@/assets/img/avatar.png'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';
import {InjectedAccountWithMeta} from "@polkadot/extension-inject/types";

//变量
const router = useRouter() //创建路由
const userStore = useUser() //创建store
let loginVisible = ref(false)//登录组件控件
let accounts = ref<InjectedAccountWithMeta[]>([]);

//
//监听仓库登陆状况
watch(() => userStore.accountInfo, (newVal: object) => {

  if (newVal) {
    //有登陆状态了
    loginVisible.value = false
  }
})

// 点击头像想登录
let handleLogin = () => {
  loginVisible.value = !userStore.accountInfo

  if (userStore.accountInfo) {
    router.push({
      name: 'personal',
      query: {
        uid: userStore.accountInfo.userId
      }
    })
  }
}
//获取登录子组件的对话框显示情况
const getVisible = (e: boolean) => {
  loginVisible.value = e
}
//
const connectWallet = async () => {
  // Enable the Polkadot.js extension
  const extensions = await web3Enable('Polkadot Wallet Login1');
  console.log(extensions.length);
  if (extensions.length === 0) {
    return;
  }

  // Get all accounts from the extension
  const allAccounts = await web3Accounts();
  accounts.value = allAccounts;

  //
  if(allAccounts.length > 0){
    const account = allAccounts[0];
    userStore.accountInfo = {
      userId  :  account.address,
      nickname :  account.meta.name
    }
    handleLogin();
  }

};
</script>

<style lang="less" scoped>
@height: 46px; //顶栏高度
@color: rgba(255, 255, 255, 0.86);
@transparent: rgba(0, 0, 0, 0.05);

.container {
  height: @height;
  background-color: @theme;
  position: relative;
  line-height: @height;
}

.left {
  position: absolute;
  left: @left;
  height: 100%;
  display: flex;
  cursor: pointer;

  .logo {
    height: 46px;
    margin-top: 2px;
  }

  h1 {
    font-size: 18px;
    color: @color;
    margin-left: 10px;
  }
}

:deep(.label) {
  line-height: 20px;

}

.center {
  flex: 1;
  position: absolute;
  display: flex;
  left: 220px;
  min-width: 700px;
  height: 100%;

  .switch {
    line-height: @height;

    :deep(.el-icon) {
      cursor: pointer;
      background-color: @transparent;
      width: 25px;
      height: 25px;
      border-radius: 50%
    }

    .el-icon:first-child {
      margin-right: 10px;
    }
  }


}

.right {
  //background-color: #fff;
  cursor: pointer;
  position: absolute;
  right: 0;
  height: 100%;
  display: flex;
  line-height: @height;

  :deep(.el-avatar--circle) {
    min-width: 31px
  }

  :deep(.el-avatar) {
    margin-top: 7px;
  }

  .username {
    font-size: 14px;
    color: @color;
    margin-left: 9px;
    width: 100px;
    .long-text
  }

  .username:hover {
    color: #fff
  }
}

//下拉栏
.el-dropdown {
  margin-top: 9px;
}


:deep(.red) {
  color: red !important;
  //background-color: red;
}

:deep(.font-weight) {
  font-size: 16px;
}

:deep(.item-container) {
  margin-left: 20px;
  display: flex;
  flex-direction: column;

  span:last-child {
    color: @lightFontColor
  }
}
:deep(.el-avatar){
  border:1px solid @lightTheme
}
</style>
