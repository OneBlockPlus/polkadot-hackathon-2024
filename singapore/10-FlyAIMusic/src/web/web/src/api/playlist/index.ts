// @ts-ignore
import request from '@/utils/request'
// @ts-ignore
import {uidType} from '@/types/global'

// 获取歌单详情信息  传入歌单Id
export function getPlaylistDetail(query:{id:number}) {
    return  request('/playlist/detail?timestamp='+new Date().getTime(),query)
}
//获取歌单所有歌曲列表 传入歌单Id、
export function getPlaylistTrack(query:{id:number}) {
    return  request('/playlist/track/all?timestamp='+new Date().getTime(),query)
}
//传入歌单 id 可获取歌单的所有收藏者
export function getPlaylistSubscribers(query:{id:number}) {
    return  request('/playlist/subscribers?limit=30&timestamp='+new Date().getTime(),query)
}
//收藏/取消收藏歌单
//说明 : 调用此接口 , 传入类型和歌单 id 可收藏歌单或者取消收藏歌单.t : 类型,1:收藏,2:取消收藏 id : 歌单 id
export function playlistSubscribe(query:{t:1|2,id:number}) {
    return  request('/playlist/subscribe?timestamp='+new Date().getTime(),query)
}

// 歌单分类: 调用此接口,可获取歌单分类,包含 category 信息
export function catList(query:{t:1|2,id:number}) {
    return  request('/playlist/catlist?timestamp='+new Date().getTime(),query)
}

