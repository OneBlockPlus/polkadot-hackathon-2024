import {UserInfo} from '@/types/user.d.ts'
import {SongInfo} from "./song";
//每个歌单信息
export type PlaylistInfo = {
    id:number;//歌单id
    name?:string,
    coverImgUrl?:string, //歌单封面
    playCount?:number, //播放数量
    createTime?:number, //创建时间
    trackCount?:number, //歌单内歌曲数量
    description?:string, //歌单描述
    creator?:UserInfo, //歌单创建者信息
    commentCount?:number,//歌单评论数量
    subscribed?:boolean,
    tracks?:SongInfo[]//歌单内单曲
}

//歌单收藏者接口res
export interface SubscribersRes{
code:number;
total:number;
    subscribers:UserInfo[]
}
