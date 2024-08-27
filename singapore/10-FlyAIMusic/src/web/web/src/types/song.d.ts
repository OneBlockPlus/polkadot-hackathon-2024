// 歌曲列表内每项
export interface SongInfo{
    name:string;//歌名
    id:number;//歌曲id
    ar:[{name:string}]; //歌手名字
    al:{
        name:string,//专辑名字
        picUrl:string;//歌曲封面
    }
    dt?:number;//时长
    fee?:0|1|4|8;  /*0: 免费或无版权 1: VIP 歌曲 4: 购买专辑 8: 非会员可免费播放低音质，会员可播放高音质及下载*/
}
//处理后的歌词信息
export interface LyricInfo {
    content:string;
    time:number; //时间节点（单位：秒！）
}
