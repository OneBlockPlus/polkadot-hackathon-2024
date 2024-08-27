<template>
  <!--歌单评论文本框-->
  <div class="comment-ipt" v-if="props.showInput">

    <el-input
        ref="inputRef"
        v-model="sendCommentQuery.content"
        :placeholder="placeholder"
        resize="none"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 3 }"
        maxlength="140"
        show-word-limit
    />

    <button  class="white-btn" @click="handleSendComment">评论</button>
  </div>
<!--单曲评论文本框(对话框形式)-->
  <el-dialog
      v-model="props.dialogVisible"
      width="450"
      :before-close="commentClose"
  >
    <div class="font-weight">歌曲：{{songStore.currentSong.name}}</div>
    <el-input
        ref="inputRef2"
        v-model="sendCommentQuery.content"
        type="textarea"
        class="commentArea"
        maxlength="140"
        resize="none"
        :autosize="{ minRows: 5, maxRows: 5 }"
        show-word-limit
        :placeholder="placeholder"
    ></el-input>
    <button  @click="handleSendComment" class="pink-btn submit">发布</button>
  </el-dialog>

  <div v-show="props.loading" v-loading="props.loading" class="loading-box" element-loading-text="评论加载中~"></div>
  <el-empty v-show="props.commentsAll?.comments?.length===0&&!props.loading" description="暂时没有数据哦~(｡•ˇ‸ˇ•｡)"/>
  <div class="comment-content"  v-show="props.commentsAll?.comments?.length>0">
    <div v-for="type in 2"  class="comment-list">
      <div v-if="type===1&&props.commentsAll.hotComments?.length" class="font-weight">热门评论</div>
      <div v-if="type===2" class="font-weight">最新评论</div>
      <ul>
        <li v-for="(v,i) in (type===1?commentsAll?.hotComments:commentsAll?.comments)">
          <el-avatar :size="55" :src="v.user?.avatarUrl?.length>0?v.user.avatarUrl:avatarImg "
              @click="toPersonal(v.user?.userId)"></el-avatar>
          <div class="text">
            <div class="comment">
              <span class="user-name" @click="toPersonal(v.user?.userId)">{{ v.user?.nickname }}&nbsp;:&nbsp;</span>
              <span class="comment-content"> {{ v.content }}</span>
            </div>
            <!--被回复的信息-->
            <div v-if="v.beReplied?.length>0" class="beReplied">
              <div v-if="v.beReplied[0].content?.length>0" class="beReplied-content">
              <span  class="user-name" @click="toPersonal(v.beReplied[0].user.userId)">@{{
                  v.beReplied[0].user.nickname
                }}&nbsp;:&nbsp;</span> {{ v.beReplied[0].content}}
              </div>
              <!--原评论已被删除-->
              <div v-else style="text-align: center;color: #636363"> 该评论已删除</div>
            </div>
            <!--底部小按钮-->
            <div class="bottom">
              <span>{{ v.time ? useTimestampFormat(v.time) : '' }}</span>
              <div class="tool">
                <i
                    :class="v.liked?'iconfont icon-good liked':'iconfont icon-good'"
                    @click="handleLiked(v.commentId,v.liked,i,type)">
                  {{ v.likedCount }}</i>
                <i class="iconfont icon-zhuanfa"></i>
                <!--回复-->
                <i @click="clickReply(v.commentId,v.user.nickname)" class="iconfont icon-pinglun"></i>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!--分页-->
    <el-pagination
        v-model:current-page="offset"
        :hide-on-single-page="Number(props.commentsAll.commentCount)<30"
        :page-size="30"
        :pager-count="9"
        :total="Number(props.commentsAll.commentCount)"
        background
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
    />

  </div>

</template>

<script lang="ts" setup>
import {ref, nextTick,reactive, defineProps, PropType, toRef, defineEmits,defineExpose} from "vue"
import {CommentRes, CommentType, CommentLikeQuery,SendCommentQuery} from "@/types/comment";
import {useTimestampFormat} from "@/hooks/useTimestampFormat"
import avatarImg from '@/assets/img/avatar.png'
import {useRouter} from "vue-router";
import {commentLike,sendComment} from "@/api/comment/index"
import {ElMessage} from 'element-plus'
import {useSong} from "@/store/song.ts"
import {useUser} from "@/store/user";

//变量
const inputRef = ref()//评论框ref（歌单）
const inputRe2 = ref()//评论框ref（单曲）
const props = defineProps({
  loading:{
    type:Boolean,
    default:()=>false
  },
  commentsAll: {
    type: Object as PropType<CommentRes>,

  },
  //是否展示评论文本框
  showInput:{
   type:Boolean,
    default:()=>false,
  },
  likeQuery: { //什么类型的评论 0: 歌曲，1: mv， 2: 歌单， 3: 专辑， 4: 电台节目， 5: 视频， 6: 动态， 7: 电台
    default: {
      cType: 0,//评论资源类型
      id: 0,//资源id
    }
  },
  dialogVisible:{ //歌曲评论对话框
    default:false
  }
})
const userStore = useUser() //获取store
const songStore = useSong()
const placeholder = ref('请留下你的评论~')
const commentsAll = toRef(props, 'commentsAll')
const commentLikeQuery = reactive<CommentLikeQuery>({ //评论点赞请求参数
  id: 0, //资源id
  cid: 0,
  t: 0,
  type: props.likeQuery.cType
})
const offset = ref(1)
const router = useRouter()
const emit = defineEmits(['pageChange','addCommentCount','dialogChange'])
const sendCommentQuery = reactive<SendCommentQuery>({ //发送评论的回复请求参数
  type: props.likeQuery.cType, // 0: 歌曲，1: mv， 2: 歌单， 3: 专辑， 4: 电台节目， 5: 视频， 6: 动态， 7: 电台
  t:1|2,//1:发送，2:回复
  id:0,//资源id
  content:'',//要发送的内容
  commentId:0//回复的评论 id (回复评论时必填)
})

//方法
//点击分页
const handleCurrentChange = (page: number) => {
  let content = document.querySelector('.content-view') as Element
  // content.scrollTop = 0;
  emit('pageChange', page)
}
//点击用户头像跳转个人页
const toPersonal = (userId: number | string) => {
  router.push({
    name: 'personal',
    query: {
      uid: userId
    }
  })
}
//评论点赞
const handleLiked = (cid: number, liked: boolean, i: number, type: 1 | 2) => {
  if (!userStore.accountInfo) {
    ElMessage('请先登录哦~(｡•ˇ‸ˇ•｡)')
    return false
  }
  commentLikeQuery.cid = cid;
  commentLikeQuery.id = props.likeQuery.id;
  commentLikeQuery.t = liked ? 0 : 1; //判断想点赞还是取消点赞
  commentLike(commentLikeQuery).then((res: any) => {
    if (res.code === 200) {
      //判断是热评点赞还是普通评论点赞，响应式设置点赞图标状态
      if (type === 1) {
        commentsAll.value.hotComments[i].liked = !liked
        commentLikeQuery.t === 0 ? commentsAll.value.hotComments[i].likedCount-- : commentsAll.value.hotComments[i].likedCount++
      }
      if (type === 2) {
        commentsAll.value.comments[i].liked = !liked
        commentLikeQuery.t === 0 ? commentsAll.value.comments[i].likedCount-- : commentsAll.value.comments[i].likedCount++
      }
    }else{
      ElMessage('呜呜，点赞失败了哦~(｡•ˇ‸ˇ•｡)')
    }
  })
}
//评论框获得焦点
const inputFocus = ()=>{
  nextTick(()=>{

      inputRef.value.focus()


  })
}
//点击回复小图标
const clickReply = (commentId:number,nickname:string)=>{
  placeholder.value= `回复 ${nickname} : `
  sendCommentQuery.commentId = commentId
  sendCommentQuery.t= 2
  //评论组件是用于歌曲而不是歌单
  if(props.likeQuery.cType==0){
    emit('dialogChange',true)
  }else{
    inputFocus()

  }
}

//发送、回复评论
const handleSendComment = ()=>{
  if (!userStore.accountInfo) {
    ElMessage('请先登录哦~(｡•ˇ‸ˇ•｡)')
    return false
  }

  sendCommentQuery.id = props.likeQuery.id;
  if(sendCommentQuery.content?.length>0){
    //判断是回复还是发送
    sendCommentQuery.commentId==0?sendCommentQuery.t=1:sendCommentQuery.t=2
    sendComment(sendCommentQuery).then((res:any)=>{
      console.log('评论结果',res)
      if(res.code===200){
        sendCommentQuery.content = ''
        ElMessage('发送成功~(´▽`)ﾉ')
        res.comment.liked = false
        res.comment.likedCount = 0
        emit('dialogChange',false)
        commentsAll.value.comments.unshift(res.comment) //手动追加评论数组
        if(sendCommentQuery.t==2){
          getSource()
        }
        emit('addCommentCount') //评论数量+1
        //请求参数初始化
        sendCommentQuery.content = ''
        sendCommentQuery.id = 0
        sendCommentQuery.commentId = 0
        sendCommentQuery.t= 1
        placeholder.value= '请留下你的评论~'
      }
    })
  }
}
//回复时，找出被回复的评论
const getSource =()=>{

  //普通评论内找
  commentsAll.value.comments.some((v:any)=>{
    //找出是哪个评论被回复，把该评论加入到被评论的对象中
    if(v.commentId ===sendCommentQuery.commentId){
      console.log('找到了是哪条评论',v)
      commentsAll.value.comments[0].beReplied = []
      commentsAll.value.comments[0]?.beReplied.unshift(v)
      return true
    }
  })
  //热门评论中找
  if(commentsAll.value.comments[0].beReplied = [].length==0){
    commentsAll.value.hotComments.some((v:any)=>{
      //找出是哪个评论被回复，把该评论加入到被评论的对象中
      if(v.commentId ===sendCommentQuery.commentId){
        console.log('找到了是哪条评论',v)
        commentsAll.value.comments[0].beReplied = []
        commentsAll.value.comments[0]?.beReplied.unshift(v)
        return true
      }
    })
  }

  //热评内找
}
//发表评论对话框关闭
//发表评论对话框关闭之前
const commentClose =()=>{
  sendCommentQuery.content = '';
 placeholder.value = '请留下你的评论~'
  emit('dialogChange',false)
}
//暴露方法
defineExpose({inputFocus})
</script>

<style lang="less" scoped>
.comment-ipt{
  margin-top: 30px;
display: flex;
flex-direction: column;
  align-items: flex-end;

  .el-textarea__inner{
    height: 83px!important;
  }
  .white-btn{
    width: 83px;
    margin-top: 20px;
  }
}

.comment-content {
  .pagination;
  position: relative;
  width: 100%;
  padding-bottom: 100px;
}

.comment-list {
  margin-top: 20px;
  ul {
    margin-top: 10px;
    li {
      border-bottom: 1px solid @lightTheme;
      padding: 20px 0 10px;
      display: flex;
      width: 100%;
      :deep(.el-avatar) {
        min-width: 55px;
        min-height: 55px;
        max-width: 55px;
        max-height: 55px;
      }

      .text {
        display: flex;
        flex-direction: column;
        width: 100%;

        justify-content: space-between;
        margin-left: 10px;
        .comment {
          //min-height: 40px;
          //max-height: 100px;
        }

        .beReplied {
          padding: 10px;
          background-color: #fef7fb;
          width: 100%;
          border-radius: 8px;
        }

        .bottom {
          color: @lightFontColor;
          margin-top: 5px;
          font-size: 13px !important;
          display: flex;
          flex-direction: row;
          justify-content: space-between;

          .tool {
            position: absolute;
            z-index:9;
            right: 0;
            .liked {
              color: #ed0404;
            }

            i {
              cursor: pointer;
              display: inline-block;
              font-size: 13px;
              margin-left: 20px !important;
            }
          }
        }
      }
    }

    li:last-child {
      border: 0;
    }
  }
}

.el-pagination {
  margin-top: 40px;
}
.submit{
  margin-top: 20px;
}
.el-dialog__body{
  .font-weight{
    margin-bottom: 10px;
  }
}
:deep(.el-avatar){
  border:1px solid @lightTheme
}
</style>
