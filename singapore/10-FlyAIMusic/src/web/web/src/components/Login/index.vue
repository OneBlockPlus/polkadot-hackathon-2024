<template>

  <el-dialog
      v-model="props.visible"
      :before-close="handleClose"
      :close-on-click-modal="false" :fullscreen="false"
      class="loginDialog"
      width="350"
  >

    <Phone v-if="phoneLogin==true" ref="phoneRef" @isPassword="isPassword"></Phone>
    <keep-alive>
      <QRcode v-if="phoneLogin==false" :dialogVisible="dialogVisible" @isPassword="isPassword"></QRcode>
    </keep-alive>
  </el-dialog>

</template>


<script lang="ts" setup>
import Phone from "@/components/Login/loginMethod/Phone.vue"
import QRcode from "@/components/Login/loginMethod/QRcode.vue"
import {ref, defineProps, defineEmits, toRef, watch} from "vue"
import {useUser} from '@/store/user'
import {useSong} from '@/store/song'
import {getUserPlaylist} from "@/api/user/index"
import {usePlaylist} from '@/hooks/usePlaylist'
import {ElMessage} from "element-plus";
import {playRecord} from "@/api/song/index"



// 变量
const phoneRef = ref()
const userStore = useUser() //创建store
const songStore = useSong() //创建store
let phoneLogin = ref(true) //登陆方式
const props = defineProps({// 获取父组件传值
  visible: {
    type: Boolean,
    default: false,
  }
})
let dialogVisible = ref(false) //登陆对话框状态
const emit = defineEmits<{ (event: string, value: boolean): void }>() // 与父组件同步visible

/* 定义方法 */
//方法
const init =()=>{
  //有cookie就能直接登录
  userStore.getAccount()
  // cookie不存在，清除信息
  if( document.cookie.indexOf('__csrf')!==0){
    userStore.clearAccount()
  }
}
init()
const handleClose = () => {
  phoneLogin.value = true //登陆方式
  //关闭对话框，一定要让父组件知道。否则父组件那边的visible一直是true
  emit('getVisible', false)

  //清除密码填写框
  if (phoneRef.value) {
    phoneRef.value.resetForm()
  }
}
const isPassword = (v: boolean) => { //获取登录方式
  phoneLogin.value = v
  dialogVisible.value = true
}


//获取用户歌单信息
const getPlayList = () => {
  getUserPlaylist({uid: userStore.accountInfo.userId}).then((res2: any) => {
    if (res2.code === 200) {
      //储存分类后的账户列表（区分创建歌单与收藏歌单）
      userStore.playList = usePlaylist(res2.playlist, userStore.accountInfo.nickname)
    }
  })
}


//监听对话框状态
watch(()=>props.visible,(newVal)=>{
  dialogVisible.value =newVal
  console.log('对话框状态变化',dialogVisible.value)

})
watch(() => userStore.accountInfo, (newVal) => {
  if (newVal) {

    getPlayList()

  }else{

     userStore.clearAccount()
  }
})
</script>

<style lang="less" scoped>
:global(.loginDialog .el-dialog__body ) {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 5px 50px 50px;
}


</style>
