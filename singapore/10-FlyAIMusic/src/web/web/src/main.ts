
import '@/assets/css/global.less' //全局样式
import '@/assets/css/base.css' //样式初始化
import 'element-plus/es/components/message/style/css'
import infiniteScroll from 'vue3-infinite-scroll-better'

// @ts-ignore
import axios from '@/utils/request'
import store from './store/index'
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.use(store)
app.use(infiniteScroll)
app.mount('#app')
app.config.globalProperties.$axios = axios //配置axios的全局引用
