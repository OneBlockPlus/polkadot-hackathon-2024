//定义容器
import { defineStore } from 'pinia'
export const useSong = defineStore('useSong',{ //参数一：容器名称，参数二：容器内容,参数三（可选）,可搭配插件的persist实现状态持久化）
    // @ts-ignore
    state:()=> {
        return {
           currentSong: {},//当前播放的歌曲信息（不把歌曲音源的url放在这里，因为从这里打开会被限制报403）
           playList:[],//播放列表
           playListId:null,//歌单id
           playState:false, //音乐播放状态
        }
    },
    actions: {}
},{
    persist: true //属性值设置为true,那么状态会被储存到localStorage,刷新浏览器也不会丢失状态
})
