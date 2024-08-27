<!--二维码登陆：原理是用定时器调用检查 刷码登陆 的接口，来获取用户是都刷码登陆的状态-->
<template>
  <div class="login-content">
    <span class="label">扫码登陆</span>
    <div class="img">
      <img :src="ORcodeImg" alt="">
      <!--二维码过期遮盖层-->
      <!--<div class="cover"></div>-->
    </div>
    <div class="down">使用<a href="https://music.163.com/#/download" target="_blank">网易云音乐APP</a>扫码登陆</div>
    <div class="change" @click="handleChange">
      使用密码登陆 >
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ElMessage} from 'element-plus'
import {ref, reactive, defineEmits, defineProps, watch, onDeactivated, onActivated, toRef} from "vue"
import loadingImg from '@/assets/img/loding.png'
import {useUser} from '@/store/user'
import {getUserDetail} from "@/api/user/index"
import {
  qrCodeLoginKey,
  qrCodeLoginImg,
  qrCodeLoginCheck
} from '@/api/login/index'
import {getAccount, getUserPlaylist} from '@/api/user/index.ts'


//变量
const emit = defineEmits(['isPassword'])
let ORcodeImg = ref(loadingImg)//二维码图片地址
const userStore = useUser() //获取store
let interval: any = null;
const props = defineProps({
  dialogVisible: {
    type: Boolean
  }
})

//方法
// 切换登陆方式
const handleChange = () => {
  emit('isPassword', true)
}

//监听对话框情况,清理定时器
watch(() => props.dialogVisible, (newVal) => {
  console.log('对话框变化对话框状态', newVal)
  if (!newVal) {
    //对话框关闭
    console.log('对话框关闭')
    clearInterval(interval)
    interval =null
  } else {
    getOR()
  }
})




//获取登录二维码，验证是否刷二维码
const getOR = async () => {
  //获取key
  let ORkey = await qrCodeLoginKey() //await必须搭配async一起用，避免回调地狱
  //根据key获取二维码
  let ORImg = await qrCodeLoginImg(ORkey.data.unikey)
  ORcodeImg.value = ORImg.data.qrimg
  //定时器隔一段时间检查是否刷了二维码。
  interval =null;


    interval = window.setInterval(() => {
      // if(!userStore.account || !props.dialogVisible) return false
      console.log('调用定时器',props.dialogVisible)
      qrCodeLoginCheck(ORkey.data.unikey).then((res: any) => {
        //二维码过期
        if (res.code === 800) {
          window.clearInterval(interval)
          interval = null;
          getOR()

        } else if (res.code === 803) {
          document.cookie = res.cookie
          window.clearInterval(interval)
          interval = null;
          ElMessage('喵~登陆成功(´▽`)ﾉ ')
          //有cookie就能直接登录
          userStore.getAccount()
        }
      })
    }, 1500)

}
getOR()
//切换到密码登陆组件
onDeactivated(() => {
  clearInterval(interval)
})
//切换回二维码登陆
onActivated(() => {
  if (interval) {
    getOR()
  }
})

</script>

<style lang="less" scoped>
.login-content {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .img {
    margin-top: 20px;
    width: 180px;
    height: 180px;
    position: relative;

    .cover {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      z-index: 2;
    }
  }

  .label {
    font-size: 22px;
  }

  a {
    color: #1467a6;
  }

  .down {
    margin-top: 10px;
    width: 100%;
    text-align: center;
  }

  .change {
    font-size: 13px;
    margin-top: 30px;
    cursor: pointer;
  }
}
</style>
