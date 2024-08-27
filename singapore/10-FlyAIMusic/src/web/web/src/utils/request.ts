import axios from 'axios';
import {ElMessage} from 'element-plus'

import {useUser} from '@/store/user'

// 创建axios实例对象
const service = axios.create({
    baseURL:'/api',
    // baseURL: 'http://localhost:3000',
    // baseURL:'http://www.codeman.ink/api',
    timeout: 60000, // 请求超时时间毫秒
    withCredentials: true,//跨域请求时携带cookie
})
//请求拦截器
service.interceptors.request.use(config => {
        //请求是正确的
        return config
    }, //参数二，对错误请求做什么
    error => {
        //返回一个失败状态promise
        console.log('请求是错误的')
        return Promise.reject(new Error('请求出错，错误是' + error))
    },)

//响应拦截器，对于响应过滤
service.interceptors.response.use(res => {
    return res.data
}, (err) => {
    const code = err.response.data.code
    const msg = err.response.data.message ? err.response.data.message : null
    console.log('请求错误响应了')
    ElMessage(msg)
    if(msg === '需要登录'){
        // cookie过期了，删除个人信息
        const userStore = useUser() //获取store

        userStore.accountInfo = null

    }
    return Promise.reject(new Error('出错了' + err))
})

// 导出axios实例对象 ,封装好就可以直接传参使用。
export default function (url: string, data?: any, method = 'get') { //请求url必填
    return service({
        url, method, [method.toLocaleLowerCase() === 'get' ? 'params' : 'data']: data //方法名转化为小写，get对应params，post对应data
    })
}
