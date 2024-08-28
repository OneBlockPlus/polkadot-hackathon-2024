<!--用户列表组件-->
<template>
  <div class="userList-content">

    <ul v-if="props.userList.length>0" class="collectors">
      <li v-for="(v,i) in props.userList" @click="handleClick(v)">
        <el-avatar :size="80" :src="v.avatarUrl?v.avatarUrl:avatarImg "></el-avatar>
        <div class="text">
          <div>  <span>{{ v.nickname }}</span>
            <div v-if="v.gender" class="gender">
              <!--0未填写，1男性，2女性-->
              <el-icon v-show="v.gender===2">
                <Female/>
              </el-icon>
              <el-icon v-show="v.gender===1">
                <Male/>
              </el-icon>
            </div>
          </div>

          <div v-if="v.signature" class="signature ">{{ v.signature }}</div>
          <div v-if="v.playlistCount" class="info">
            <div>歌单：{{ v.playlistCount }}</div>

            <div>粉丝：{{ v.followeds }}</div>
          </div>
        </div>
      </li>
    </ul>
    <div class="loading-box"  v-loading="props.loading" element-loading-text="数据加载中~"></div>
    <el-empty v-show="props.userList?.length===0&&!props.loading" :description="props.description"/>
    <!--分页-->
    <!--ps:total必须是数字，但是通过路由传来的数字会变成字符串，需要转化-->

    <el-pagination
        v-show="props.total>30&&!props.loading"
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :hide-on-single-page="props.total<30"
        :pager-count="9"
        :total="props.total"
        background
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
    />
  </div>

</template>

<script lang="ts" setup>
import {ref, reactive, defineProps, defineEmits} from "vue"
import {useRouter} from "vue-router";
import avatarImg from '@/assets/img/avatar.png'
import {ElMessage} from "element-plus";
import {Female, Male, } from '@element-plus/icons-vue'


const router = useRouter()
const handleClick = (v: any) => {
  router.push({
    name: 'personal',
    query: {
      uid: v.userId
    }
  })
}
const props = defineProps({
  loading: {
    type: Boolean,
    default: () => false
  },
  userList: {
    type: Array,
    default: () => []
  },
  total: { //总人数
    type: Number,
  },
  description: { //数据为空的提示
    type: String,
  }
})
let pageNum = ref(1)//当前分页数
let pageSize = ref<number>(30) //每页显示最大数据条数
const emit = defineEmits(['pageChange'])

//方法
// 点击分页
const handleCurrentChange = (val: number) => {
  //页面到最顶部
  let content = document.querySelector('.content-view') as Element
  content.scrollTop = 0;
  if (val >= 35) {
    ElMessage('系统禁止查看全部数据哦~(｡•ˇ‸ˇ•｡) ')
  } else {
    emit('pageChange', val)
  }
}
</script>

<style lang="less" scoped>
.gender {
  display: inline-block;
  margin-left: 10px;
  margin-top: 16px;
  line-height: 16px;
  text-align: center;
  height: 100%;
  :deep(.el-icon) {
    font-size: 13px;
    border-radius: 50%;
    width: 16px;
    height: 16px;
  }

  :deep(.el-icon:first-child) {
    color: @pinkFont;
    background-color: @pink;
  }

  :deep(.el-icon:last-child) {
    color: #359ccf;
    background-color: #bff3ff;
  }
}
//分页
:deep(.el-pagination.is-background .el-pager li) {
  color: @fontColor;
}

:deep(.el-pagination.is-background .el-pager li:hover) {
  background-color: @pink; //修改默认的背景色
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: @lightTheme; //修改默认的背景色
}

:deep(.el-pagination.is-background .btn-next), :deep(.el-pagination.is-background .btn-prev), :deep(.el-pagination.is-background .el-pager li) {
  background-color: @shallowTheme;
}

.userList-content {
  //padding-bottom: 100px;
}

.el-avatar {
  min-width: 80px;
}

.collectors {
  padding-bottom: 30px;
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  min-width: 900px;

  li {

    flex: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 15px;
    margin-bottom: 20px;
    height: 110px;
    border-radius: 8px;
    //width: 28%;
    margin-right: 2%;
    min-width: 300px;
overflow: hidden;

    li:nth-child(3n) {
      margin-right: 0;
    }

    .text {
      margin-left: 10px;
      display: flex;
      flex-direction: column;
     justify-content: space-between;
      height: 100%;
      span:first-child {
        .long-text;
      }

      .info {
        font-size: 13px;
        color: @lightFontColor;
        display: flex;
        height: 13px;
        line-height: 13px;

        div:first-child {
          border-right: 1px solid @theme;
          padding-right: 20px;
          margin-right: 20px;
        }

      }

      .signature {

        font-size: 13px;
        color: @lightFontColor;
        max-width: 270px;

        text-overflow: ellipsis!important;
        overflow: hidden!important;
        word-break: break-all!important;
        white-space: nowrap!important;

        width: 80%;
        display: inline-block;
        height: 30px;
        margin-top: 15px;
        line-height: 15px;
      }
    }
  }

  li:hover {
    background-color: @shallowTheme;
  }
}
:deep(.el-avatar){
  border:1px solid @lightTheme
}
</style>
