
import axios from 'axios';

// 基本配置
const instance = axios.create({
    baseURL: '/api', // 根据实际情况修改API地址
    timeout: 10000 // 设置超时时间，单位为ms
});

// 请求拦截器
instance.interceptors.request.use(config => {
    return config;
}, error => {
    console.log(error);
    return Promise.reject(error);
});

// 响应拦截器
instance.interceptors.response.use(response => {
    const data = response.data;

    if (response && response.status !== 200) { // 根据接口返回的状态码判断是否有错误
        alert(`Error code ${response.status}`); // 自定义错误提示
        return Promise.reject(new Error("error"));
    } else {
        return data;
    }
}, error => {
    console.log(error);
    return Promise.reject(error);
});

export default instance;
