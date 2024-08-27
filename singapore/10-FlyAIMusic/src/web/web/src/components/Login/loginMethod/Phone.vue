<!--密码、电话号登陆-->
<template>
  <div class="login-content">
    <img alt="" class="logoLarge" src="@/assets/img/logo.png">
    <el-form ref="formRef" :model="loginParams" :rules="loginRules" class="loginForm">
      <el-form-item
          prop="phone"
      >
        <el-input
            v-model="loginParams.phone"
            :prefix-icon="Iphone"
            placeholder="请输入手机号"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
            v-model="loginParams.password"
            :prefix-icon="Lock"
            placeholder="请输入密码"
        />
      </el-form-item>
    </el-form>
    <div class="tool">
      <el-checkbox label="自动登录" size="large"/>
      <span @click="handleChange">扫码登陆</span>
    </div>
    <div class="submit">
      <el-button class="login-btn" type="primary" @click="handleLogin">
        登录
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, reactive, defineEmits, getCurrentInstance, defineExpose} from "vue"
import {getAccount} from '@/api/user/index.ts'
import {ElMessage} from 'element-plus'
import {Iphone, Lock} from '@element-plus/icons-vue';
import {phoneLogin} from '@/api/login/index';
import {loginRules} from '@/utils/rules'
import {useUser} from '@/store/user'
import {closeLoading, showLoading} from "@/plugins/lodaing";
import {getUserDetail} from "@/api/user/index"


/*变量*/
const userStore = useUser() //获取store
const formRef = ref() //表单ref
const emit = defineEmits(['isPassword', 'isLogin'])
let loginParams = reactive({ /*登陆表单*/
  password: <string>'',
  phone: <number | string>'',
})
const instance: any = getCurrentInstance() //获取组件实例对象


/*方法*/
// 切换登陆方式
const handleChange = () => {
  resetForm()
  emit('isPassword', false)
}
//获取账户信息
const userAccount = () => {
  getAccount().then((res: any) => {
    if (res.code === 200) {
      userStore.accountInfo = res.profile
    }
  })
}

//初始化表单方法
const resetForm = () => {
  formRef.value.resetFields()
}
//暴露方法
defineExpose({resetForm})
//登陆
const handleLogin = () => {
  instance.refs.formRef.validate().then(() => {
    //表单验证通过
    phoneLogin(loginParams).then((res: any) => {
      showLoading('登陆中......')
      if (res.code === 200) {
        closeLoading()
        ElMessage('喵~登陆成功(´▽`)ﾉ ')
        //获取用户详情信息
        userAccount()
        resetForm()
      } else {
        closeLoading()
        ElMessage(res.msg)
      }
    })
  })
}

</script>

<style lang="less" scoped>
.login-content {
  text-align: center;
  margin-top: 10px;
  width: 100%;
}

.logoLarge {
  width: 65px;
  height: 65px;
  margin-bottom: 45px;
}

.el-button, .submit {
  width: 100%
}

.submit {
  margin-top: 45px;
  margin-bottom: 20px;
}

:deep(.el-form-item__content) {
  margin-left: 0 !important;
  width: 100%;
}

:deep(.el-checkbox__label), :deep(.is-checked) {
  color: @fontColor !important;
}

.tool {
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 12px !important;
  margin-top: -15px;

  span {
    display: inline-block;
    margin-top: 10px;
    cursor: pointer;
    color: #1467a6;
  }
}

.loginForm {
  width: 100%;
}


</style>
<style lang="less">
.el-button:focus {
  background-color: @theme;
  border: none;
}

.el-button:hover {
  border: none;
  background-color: @lightTheme;
}
</style>
