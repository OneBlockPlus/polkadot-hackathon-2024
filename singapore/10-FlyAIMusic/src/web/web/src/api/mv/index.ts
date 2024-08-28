// @ts-ignore
import request from '@/utils/request'

// 获取 mv 数据: 调用此接口 , 传入 mvid ( 在搜索音乐的时候传 type=1004 获得 ) , 可获取对应 MV 数据 , 数据包含 mv 名字 , 歌手 , 发布时间 , mv 视频地址等数据 , 其中 mv 视频 网易做了防盗链处理 , 可能不能直接播放 , 需要播放的话需要调用 ' mv 地址' 接口
export function mvDetail(query: { mvid: number }) {
    return request('/mv/detail', query)
}

// mv 地址: 调用此接口 , 传入 mv id,可获取 mv 播放地址
export function getMvUrl(query: { id: number }) {
    return request('/mv/url', query)
}


// 获取 mv 点赞转发评论数数据: 调用此接口 , 传入 mvid ( 在搜索音乐的时候传 type=1004 获得 ) , 可获取对应 MV 点赞转发评论数数据
export function mvCount(query: { mvid: number }) {
    return request('/mv/detail/info?timestamp=' + new Date().getTime(), query)
}

//所有收藏的mv
export function mvCollection() {
    return request('/mv/sublist?timestamp=' + new Date().getTime())
}
//收藏/取消收藏mv
export function mvCollect(query) {
    return request('/mv/sub?timestamp=' + new Date().getTime(),query)
}
//获得所有mv
export function mvAll(query) {
    return request('/mv/all?timestamp=' + new Date().getTime(),query)
}


