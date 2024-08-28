// @ts-ignore
import request from '@/utils/request'
// @ts-ignore
import {uidType} from '@/types/global.d.ts'

// 获取账号信息
export function getAccount() {
  return  request('/user/account?timestamp='+new Date().getTime(),)
}

//获取用户详情,传入用户uid
export function getUserDetail(params: { uid:uidType}) {
    return  request('/user/detail',params)
}
//获取用户歌单，收藏，mv, dj的数量
export function getUserSubcount() {
    return  request('/user/subcount')
}
//获取用户粉丝列表,传入用户uid
export function getUserFolloweds(params: { uid:uidType}) {
    return  request('/user/followeds?limit=30&timestamp='+new Date().getTime(),params)
}
//获取用户关注列表,传入用户uid
export function getUserFollows(params: { uid:uidType}) {
    return  request('/user/follows?limit=30&timestamp='+new Date().getTime(),params)
}
//获取用户歌单 需要传入用户id
export function getUserPlaylist(params: { uid:uidType}) {
    return  request('/user/playlist?timestamp='+new Date().getTime(),params)
}
//关注/取消关注用户:登录后调用此接口 , 传入用户 id, 和操作 t,可关注/取消关注用户 (1为关注,其他为取消关注)
export function userFollow(params: { id:uidType,t:0|1}) {
    return  request('/follow?timestamp='+new Date().getTime(),params)
}
