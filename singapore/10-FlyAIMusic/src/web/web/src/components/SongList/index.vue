<!--歌曲列表-->
<template>
  <div v-infinite-scroll="handleInfiniteOnLoad"
       :class="props.dropdownRefresh?'scroll song-list':'song-list'"
       :infinite-scroll-disabled="scrollDisabled"
       :infinite-scroll-distance="300"
       :infinite-scroll-immediate-check="false"
       :infinite-scroll-watch-disabled="scrollDisabled"
  >
    <!--        <el-empty v-show="props.songList?.length===0" description="暂时没有歌曲哦~(｡•ˇ‸ˇ•｡)"/>-->

    <!--    @contextmenu.prevent="rightClick" 组织浏览器默认右击-->
    <el-table
        v-show="props.songList.length>0"
        :cell-style="{border:'none'}"
        :data="props.songList"
        :header-cell-style="{border:'none'}"
        :row-style="rowStyle"
        @cell-dblclick="changeSong"
    >
      <el-table-column width="60">
        <template #default="scope">
          <span class="index">{{ scope.$index < 9 ? '0' + (scope.$index + 1) : scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="scope">

          <img v-if="useLikedFormat(scope.row.id,ids)"
               alt="" src="@/assets/img/heart.png" style="width: 15px;height: 14px;margin-left: 3px;margin-right: 4px;"
               @click="handleLiked(scope.row.id,useLikedFormat(scope.row.id,ids))">
          <span v-else><i
              class="iconfont icon-xihuan"
              @click.stop="handleLiked(scope.row.id,useLikedFormat(scope.row.id,ids))"></i></span>
          <i class="iconfont icon-download"></i>
        </template>
      </el-table-column>
      <el-table-column label="音乐标题">
        <template #default="scope">
          <div class="title-content">
            <span class="song-title">{{ scope.row?.name }}</span>
            &nbsp;
            <span>
          <i v-if="scope.row.fee===1" class="tag vip-tag">VIP</i>
          <i v-if="scope.row.mv!==0" class="tag mv-tag">MV</i>
          <i v-if="scope.row?.sq" class="tag mv-tag">SQ</i></span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="歌手" width="200px">
        <template #default="scope">
          <span
              v-for="(v,i) in scope.row.ar"
              :key="v.id"
              class="artist-name"
              @click="toArtist(v)">{{
              scope.row.ar?.length > 1 && i !== 0 ? '/' : ''
            }}{{ v?.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="专辑" width="290px">
        <template #default="scope">
          <span @click="jumpAlbum(scope.row.al?.id)">{{ scope.row.al?.name }}</span>

        </template>
      </el-table-column>
      <el-table-column class="index" label="时长" width="80px">
        <template #default="scope">
          {{ scope.row.dt ? useDurationFormat(scope.row.dt) : '' }}
        </template>
      </el-table-column>

    </el-table>
    <el-empty v-show="props.songList?.length===0&&!props.loading" description="暂时没有歌曲哦~(｡•ˇ‸ˇ•｡)"/>

    <div v-show="props.loading" v-loading="props.loading" element-loading-text="数据加载中~"
         style="height: 100px;margin-top: 30px;"></div>
    <!--分页-->


    <el-pagination
        v-if="props.showPagination"
        v-model:current-page="currentPage"
        :hide-on-single-page="Number(props.songList?.length)<30"
        :page-size="30"
        :pager-count="9"
        :total="Number(props.total)"
        background
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
    />
  </div>
</template>

<script lang="ts" setup>
import {defineProps, PropType, reactive, ref, watch} from "vue"
import {Song} from "@/types/playlist.d.ts"
import {useDurationFormat} from "@/hooks/useDurationFormat.ts"
import {getLikelist, likeSong} from "@/api/song/index"
import {useLikedFormat} from "@/hooks/useLikedFormat.ts"
import {useSong} from "@/store/song.ts"
import {useUser} from "@/store/user";
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {useArtistInfo} from "../../hooks/useArtistInfo";


//变量

const router = useRouter()
const emit = defineEmits(['currentChange'])
const userStore = useUser() //获取store
const props = defineProps({
  //是否开启数据的下拉刷新
  dropdownRefresh: {
    type: Boolean,
    default: () => false
  },
  // 歌曲总量
  total: {
    type: Number,//
    default: () => 0
  },
  //是否展示loading
  loading: {
    type: Boolean,
    default: () => false,
  },
  //是否展示分页
  showPagination: {
    type: Boolean,
    default: () => false,
  },
  songList: {
    default: () => [],

    type: Array as PropType<Song[]>,
  },
  userId: { //用户id
    type: Number,
  },
  playListId: { //歌单id号码
    type: Number
  }
})
let scrollDisabled = ref(false) //无线下拉滚动控制器（是否禁止


const songStore = useSong()
let currentPage = ref(1)//当前页码
let currentRowId = ref(null)//当行id
let ids = ref([])//用户喜欢的歌曲的id列表
let likeQuery = reactive({ //喜欢歌曲请求参数
  id: <number>0,
  like: <boolean>true,
})


//方法
const handleInfiniteOnLoad = () => {
  scrollDisabled.value = true
  // 加载数据列表
  console.log('滑到了底部，加载新数据1')
  emit('loadData')
}
//跳转到歌手页
const toArtist = async (v) => {
  //歌手信息
  let info = await useArtistInfo(v)
  await router.push({
    name: 'artistDetail',
    query: {
      info: JSON.stringify(info)
    }
  })
}
//获得应用所有喜欢的歌曲id
const getLikeIds = () => {
  if (!userStore.accountInfo) return false

  getLikelist({uid: props.userId}).then((res: any) => {
    if (res.code === 200) {
      userStore.likedIds = ids.value = res.ids
    }
  })
}
getLikeIds()
//切换页码
const handleCurrentChange = () => {
  emit('currentChange', currentPage.value)
}
//鼠标右击
const rightClick = () => {
  console.log('右击了')
}
//跳转到专辑
const jumpAlbum = (id) => {
  router.push({
    path: '/albumDetail',
    query: {id}
  })
}
//喜欢歌曲
const handleLiked = (id: number, like: boolean) => { //获得该歌曲当前喜欢状态
  if (!userStore.accountInfo) {
    ElMessage('请先登录哦~(｡•ˇ‸ˇ•｡)')
    return false
  }
  likeQuery.id = id
  likeQuery.like = !like
  likeSong(likeQuery).then((res: any) => {
    if (res.code === 200) {
      //歌曲小红心响应式
      if (like) {
        ids.value.some((v, i) => {
          if (v === id) {
            ids.value.splice(i, 1)
            return true
          }
        })
      } else {
        ids.value.push(id)
        return true
      }
    }
  })
}


//切换音乐
const changeSong = (row: any) => {
  songStore.currentSong = row
  //在歌单中点击了一首歌，并且播放列表没一首歌，则把整个歌单的歌添加进去
  // 若歌单id变化，则表示播放的其他歌单的歌，替换全部播放列表。
  if (songStore.playListId !== props.playListId || songStore.playList.length === 0) {
    songStore.playList = props.songList
  }
}


// 在row-style的处理函数中返回选中行的样式
const rowStyle = (row: any) => {
  if (currentRowId.value === row.rowIndex + 1) { //row.rowIndex+1是当行索引号+1
    // 此处返回选中行的样式对象，按需设置
    return {
      'background-color': '#efd5e2!important',
    }
  }
}
//因为props.mvList期间会被重新赋值。所以深度监听
watch(() => [...props.songList], (newVal) => {
  console.log('监听到数据变化', props.songList.length)
  if (props.dropdownRefresh) {
    if (props.songList.length > 0) {
      //   数据更新后，可再次运行触发load事件
      scrollDisabled.value = false
      console.log('滚动开启')
    } else {
      scrollDisabled.value = true
      console.log('滚动禁用')
    }
  }
}, {deep: true})

</script>

<style lang="less" scoped>
.scroll {

  height: @height1;
}

.song-list {
  position: relative;
  height: 100%;
  //margin-bottom: 40px;
}

:deep(.el-pagination) {
  margin-top: 20px;
}

:deep(.el-table td.el-table__cell:last-child div) {
  color: @lightFontColor;
}

:deep(.cell) {
  .long-text;
  font-weight: 400;
}

.liked {
  font-size: 16px;
  //color: @theme;
  color: #ec4141;
}

.title-content {
  display: flex;
  white-space: nowrap;

  .song-title {
    .long-text;
  }
}

.iconfont {
  font-size: 13px;
  color: @lightFontColor;
}

.index {
  color: #cccccc;
}

:deep(.el-table__row:nth-child(odd)) {
  //background-color: @shallowTheme!important;
  background-color: rgba(253, 246, 250, 0.69);
}

.el-table__row:focus {
  //border: none!important;
  background-color: red !important;
}

.el-table {
  margin-top: 30px;
  --el-table-row-hover-bg-color: @pink;
  --el-table-tr-focus-bg-color: red;

}

:deep(.el-table__row) {
  cursor: pointer;
}

.tag:first-child {
  margin-left: 5px;
}


.mv-tag:hover {
  color: @pinkFont;
  border-color: @pinkFont;
}

.loading {
  //background-color: red;
  height: 170px;
}
</style>
<style>

</style>
