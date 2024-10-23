// @ts-ignore
import request from '@/utils/request'
// @ts-ignore
import {uidType} from '@/types/global.d.ts'

// 获取用户动态
export function getUserEvent(query) {
    return  request('/user/event?timestamp='+new Date().getTime(),query)
}