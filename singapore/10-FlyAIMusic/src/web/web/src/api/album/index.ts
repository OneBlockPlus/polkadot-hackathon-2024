//专辑相关
// @ts-ignore
import request from '@/utils/request'

//获取歌手专辑 : 调用此接口 , 传入歌手 id, 可获得歌手的所有专辑
export function artistAlbum(query: { id: number }) {
    return request('/artist/album', query)
}

// 获取专辑内容: 调用此接口 , 传入专辑 id, 可获得专辑详情
export function albumDetail(query: { id: number }) {
    return request('/album', query)
}
//收藏/取消收藏专辑
export function albumCollect(query) {
    return request('/album/sub?timestamp=' + new Date().getTime(), query)
}
//已收藏的专辑列表
export function albumCollectList(query) {
    return request('/album/sublist?timestamp=' + new Date().getTime(), query)
}
//获得专辑评论
export function albumComment(query) {
    return request('/comment/album?timestamp=' + new Date().getTime(), query)
}
