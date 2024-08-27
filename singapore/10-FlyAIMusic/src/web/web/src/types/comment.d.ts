import {UserInfo} from "@/types/user";

export type CommentRes = {
    code?: number, comments: Comment, hotComments: Comment,
}
export type CommentType = {
    liked: boolean, commentId: number,//评论id
    likedCount: number,//点赞数
    content: string, time: number, user: UserInfo, //评论者信息
    beReplied?: {  //被回复的评论
        content: string, time: number, user: UserInfo, //评论者信息
    }
    
}
export type GetCommentQuery = {
    id: number, time?: number, //评论条数过多时传递
    offset?: number,//用于分页，页数-1
    before?: number,//分页参数,取上一页最后一项的 time 获取下一页数据(获取超过 5000 条评论的时候需要用到)
}
//评论点赞请求参数
export type CommentLikeQuery = {
    id:number,//资源id
    cid: number|string,//评论id
    t: 0 | 1, //是否点赞 , 1 为点赞 ,0 为取消点赞
    type: number|string, // 0: 歌曲，1: mv， 2: 歌单， 3: 专辑， 4: 电台节目， 5: 视频， 6: 动态， 7: 电台
}
// 发送评论
export type SendCommentQuery = {
    type: number|string, // 0: 歌曲，1: mv， 2: 歌单， 3: 专辑， 4: 电台节目， 5: 视频， 6: 动态， 7: 电台
    t:1|2,//1:发送 2：回复
    id:number,//资源id
    content:string|number,//要发送的内容 、 内容 id,可通过 /comment/mv 等接口获取
    commentId: string|number//回复的评论 id (回复评论时必填)
}
