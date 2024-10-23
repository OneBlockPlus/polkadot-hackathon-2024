//评论相关接口

// 获取评论的通用参数
// 必选参数 : id:资源id
// 可选参数 : limit: 取出评论数量 , 默认为 20
// offset: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)*20, 其中 20 为 limit 的值
// before: 分页参数,取上一页最后一项的 time 获取下一页数据(获取超过 5000 条评论的时候需要用到)
// @ts-ignore
import request from '@/utils/request'
// @ts-ignore
import {GetCommentQuery,CommentLikeQuery,SendCommentQuery} from "@/types/comment.d.ts"


//歌单评论
export function playlistComment(query:GetCommentQuery) {
    return  request('/comment/playlist?timestamp='+new Date().getTime(),query)
}
//歌曲评论
export function songComment(query:GetCommentQuery) {
    return  request('/comment/music?timestamp='+new Date().getTime(),query)
}
//评论点赞
export function commentLike(query:CommentLikeQuery) {
    return  request('/comment/like?timestamp='+new Date().getTime(),query)
}
//发送/删除评论
export function sendComment(query:SendCommentQuery) {
    return  request('/comment?timestamp='+new Date().getTime(),query)
}

//视频评论 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该 视频 的所有评论 ( 不需要登录 )
export function videoComment(query:GetCommentQuery) {
    return request('/comment/video?timestamp=' + new Date().getTime(), query)
}
//mv 评论  : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该 mv 的所有评论 ( 不需要 登录 )
export function mvComment(query:GetCommentQuery) {
    return request('/comment/mv?timestamp=' + new Date().getTime(), query)
}