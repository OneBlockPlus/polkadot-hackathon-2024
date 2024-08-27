// @ts-ignore
import request from '@/utils/request'

//推荐页面的benner图片
export function getBanner() {
    return  request('/banner?timestamp='+new Date().getTime())
}

// 获取每日推荐歌曲: 调用此接口 , 可获得每日推荐歌曲 ( 需要登录 )
export function recommendSongs() {
    return  request('/recommend/songs?timestamp='+new Date().getTime())
}

// 推荐歌单 : 调用此接口 , 可获取推荐歌单
export function personalized() {
    return  request('/personalized?timestamp='+new Date().getTime())
}
// 获取精品歌单: 调用此接口 , 可获取精品歌单
// 可选参数 : cat: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为 "全部",可从精品歌单标签列表接口获取(/playlist/highquality/tags)
// limit: 取出歌单数量 , 默认为 50
// before: 分页参数,取上一页最后一个歌单的 updateTime 获取下一页数据
export function highquality(query:{limit:number,before?:number}) {
    return  request('/top/playlist/highquality?timestamp='+new Date().getTime(),query)
}

// 歌单 ( 网友精选碟 ): 调用此接口 , 可获取网友精选碟歌单
// order: 可选值为 'new' 和 'hot', 分别对应最新和最热 , 默认为 'hot'
// cat: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为 "全部",可从歌单分类接口获取(/playlist/catlist)
// limit: 取出歌单数量 , 默认为 50
// offset: 偏移数量 , 用于分页 , 如 :( 页数 -1)*50
export function topPlayList(query:{cat:number,offset:number}) {
    return  request('/top/playlist?timestamp='+new Date().getTime(),query)
}

// 所有榜单 : 调用此接口,可获取所有榜单的歌单
export function topList() {
    return  request('/toplist?timestamp='+new Date().getTime())
}