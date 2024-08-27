import {reactive, ref} from "vue";
// @ts-ignore
import {PlaylistInfo} from "@/types/playlist.d.ts"

//处理后端返回的playlist数据，
//参数1：后端未处理的playlist,参数2：用户名  //返回分类后的用户歌单
export const usePlaylist = (playlist: PlaylistInfo[], nickname: string) => {
    let playlistData = reactive({
        createList: <PlaylistInfo>[],  //创建歌单
        collectList: <PlaylistInfo>[] //收藏歌单
    })
    playlist.forEach((v: PlaylistInfo) => {
        if (v.creator.nickname === nickname) {
            playlistData.createList.push(v)
        } else {
            playlistData.collectList.push(v)
        }
    })
    return playlistData
}
