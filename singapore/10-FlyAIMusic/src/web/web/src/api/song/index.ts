// @ts-ignore
import request from '@/utils/request'

//喜欢音乐列表: 调用此接口 , 传入用户 id, 可获取已喜欢音乐 id 列表(id 数组)
export function getLikelist(query: { uid: number }) {
    return request('/likelist?timestamp=' + new Date().getTime(), query)
}

//喜欢音乐: 调用此接口 , 传入音乐 id, 可喜欢该音乐;like: 布尔值 , 默认为 true 即喜欢 , 若传 false, 则取消喜欢
export function likeSong(query: { id: number, like: boolean }) {
    return request('/like?timestamp=' + new Date().getTime(), query)
}

//获取音乐 url: 使用歌单详情接口后 , 能得到的音乐的 id, 但不能得到的音乐 url, 调用此接口, 传入的音乐 id( 可多个 , 用逗号隔开 ), 可以获取对应的音乐的 url,未登录状态或者非会员返回试听片段(返回字段包含被截取的正常歌曲的开始时间和结束时间)
export async function songUrl(query: { id: string | number }) {
    return request('/song/url?timestamp=' + new Date().getTime(), query)
}

//获取歌曲详情 : 调用此接口 , 传入音乐 id(支持多个 id, 用 , 隔开), 可获得歌曲详情(dt为歌曲时长)
export function songDetail(query: { ids: string | number }) {
    return request('/song/detail', query)
}

// 获取歌词 : 调用此接口 , 传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )
export function songLyric(query: { id: string | number }) {
    return request('/lyric?timestamp=' + new Date().getTime(), query)
}

//获取用户播放记录: 登录后调用此接口 , 传入用户 id, 可获取用户播放记录
export function playRecord(query: { uid: string | number }) {
    return request('/user/record?type=1&timestamp=' + new Date().getTime(), query)
}
