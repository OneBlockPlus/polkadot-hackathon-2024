// @ts-ignore
import request from '@/utils/request'


// 获取视频分类列表
// 说明 : 调用此接口 , 可获取视频分类列表
export function catList() {
    return request('/video/group/list')
}
//获取视频播放地址  : 调用此接口 , 传入视频 id,可获取视频播放地址
export function videoUrl(query: { id: number }) {
    return request('/video/url', query)
}
// 获取点赞过的视频
// 说明 : 调用此接口, 可获取获取点赞过的视频
export function myLike() {
    return request('/playlist/mylike?timestamp=' + new Date().getTime())
}
// 资源点赞( MV,电台,视频)
// 说明 : 调用此接口 , 可对 MV,电台,视频点赞
export function resourceLike(query) {
    return request('/resource/like?timestamp=' + new Date().getTime(), query)
}

// 获取视频标签/分类下的视频
// 说明 : 调用此接口 , 传入标签/分类id,可获取到相关的视频,分页参数只能传入 offset
export function videoList(query: { id: number | String, offset: number | String }) {
    return request('/video/group?timestamp=' + new Date().getTime(),query)
}
//相关视频: 调用此接口 , 可获取相关视频 .传入视频id
export function allVideo(query: { id: number }) {
    return request('/related/allvideo?timestamp=' + new Date().getTime(), query)
}

// 视频详情: 调用此接口 , 可获取视频详情
export function videoDetail(query: { id: number }) {
    return request('/video/detail', query)
}
//收藏视频
export function videoSub(query) {
    return request('/video/sub?timestamp=' + new Date().getTime(), query)
}

