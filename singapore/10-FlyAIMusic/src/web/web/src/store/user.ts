//定义容器
import {defineStore} from 'pinia'
import {getAccount} from '@/api/user/index.ts'

export const useUser = defineStore('useUser', { //参数一：容器名称，参数二：容器内容,参数三（可选）,可搭配插件的persist实现状态持久化）
    // @ts-ignore
    state: () => {
        return {
            accountInfo: null,//账号信息 （账号，头像等）
            playList: null,//账户歌单
            likedIds: null,//用户所有喜欢的音乐id
        }
    },
    actions: {
        //账号信息清理
        async clearAccount() {
            console.log('清除账号信息')
            this.accountInfo = null
            this.playList = null
            this.likedIds = null
        },
        async getAccount() {
            await getAccount().then((res: any) => {
                if (res.code === 200) {
                    this.accountInfo = res.profile
                }
            })
        }
    }
}, {
    persist: true //属性值设置为true,那么状态会被储存到localStorage,刷新浏览器也不会丢失状态
})
