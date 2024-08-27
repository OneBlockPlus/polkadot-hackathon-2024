//获得歌曲详情，并播放
import {songDetail} from '@/api/song/index.ts'
import {useSong} from "../store/song";

export function useSongDetail(id) {
    const songStore = useSong()
    songDetail({ids: id}).then(res => {
        songStore.currentSong = res.songs[0]
        //添加到当前播放列表
        if (!songStore.playList.some(v => v.id == id)) {
            songStore.playList.push(songStore.currentSong)
        }
    })

}