import {UserInfo} from '@/types/user.d.ts'
import {PlaylistInfo} from '@/types/playlist.d.ts'
import {SongInfo} from '@/types/song.d.ts'
//歌单详情
export type PlaylistDetailRes = {
    code:number,
    playlist:PlaylistInfo[],
    commentCount?:number,
}

type SongListRes = {
    code:number,
    songs:SongInfo[],
}
