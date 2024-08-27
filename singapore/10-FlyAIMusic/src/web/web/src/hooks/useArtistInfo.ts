//传入歌手id,名字，调用通过关键字搜索歌手接口。获得歌手信息


import {cloudSearch} from "../api/search";

export const useArtistInfo = (info: { id: number | string, name: string }) => {
    let artistQuery = ({ //获取搜索结果请求参数
        type: 100,//类型
        limit: 20,//返回数量限制
        offset: 0,//偏移量 （30*页码减一)
        keywords: info.name,//关键词
    })
    console.log('传入的参数',info)
  return  cloudSearch(artistQuery).then(res => {
        if (!res.result.artists) return false
        let artist = res.result.artists.filter(v => {

            return v.name === info.name && v.id == info.id
        })

        return artist[0]
    })
}
