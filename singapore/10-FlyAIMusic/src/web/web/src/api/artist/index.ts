// @ts-ignore
import request from '@/utils/request'

// 歌手分类列表: 调用此接口,可获取歌手分类列表
// limit : 返回数量 , 默认为 30
// offset : 偏移数量，用于分页 , 如 : 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0 initial: 按首字母索引查找参数,如 /artist/list?type=1&area=96&initial=b 返回内容将以 name 字段开头为 b 或者拼音开头为 b 为顺序排列, 热门传-1,#传 0
// type 取值:-1:全部1:男歌手2:女歌手3:乐队
// area 取值:  -1:全部7华语96欧美8:日本16韩国0:其他
export function artistList(query: {
    type: number, //分类
    area: number, //语种
    initial: string, //按字母筛选
    offset: number//   (页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
}) {
    return request('/artist/list' , query)
}

// 获取歌手详情: 调用此接口 , 传入歌手 id, 可获得获取歌手详情 (布置为何这个接口变了
export function artistDetail(query: { id: number }) {
    return request('/artist/detail' , query)
}

// 获取歌手描述 : 调用此接口 , 传入歌手 id, 可获得歌手描述
export function artistDesc(query: { id: number }) {
    return request('/artist/desc?timestamp=' + new Date().getTime(), query)
}

// 歌手热门 50 首歌曲: 调用此接口,可获取歌手热门 50 首歌曲 ,传入歌手id
export function topSong(query: { id: number }) {
    return request('/artist/top/song' , query)
}

//收藏的歌手列表 : 调用此接口,可获取收藏的歌手列表
export function artistSublist(query) {
    return request('artist/sublist?timestamp=' + new Date().getTime(),query)
}

//收藏/取消收藏歌手 : 调用此接口,可收藏歌手
// id : 歌手 id;t:操作,1 为收藏,其他为取消收藏
export function artistSub(query: { id: number; t: number }) {
    return request('artist/sub?timestamp=' + new Date().getTime(), query)
}

//获取歌手 mv: 调用此接口 , 传入歌手 id, 可获得歌手 mv 信息 ,(输入歌手id)
export function artistMv(query: { id: number, limit: number }) {
    return request('artist/mv?timestamp=' + new Date().getTime(), query)
}
