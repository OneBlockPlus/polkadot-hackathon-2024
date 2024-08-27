<template>
  <el-dropdown ref="dropdownRef" :max-height="300" trigger="click" @visible-change="getHot">
    <!--搜索框-->
    <div class="search">

      <el-input
          v-model="inputValue"
          :border="false"
          class="w-50 m-2"
          input-style="{color:pink}"
          maxlength="'10px'"
          placeholder="Input content"
          split-button
          @click="handleSearch"
          @keyup.enter.native="searchDetail"

      >
        <template #prefix>

          <!--   vue3图标使用方式  -->
          <el-icon class="el-input__icon">
            <component :is="Search" @click="searchDetail"/>
          </el-icon>

        </template>
      </el-input>
    </div>
    <!--展示热搜榜-->
    <template #dropdown>
      <el-dropdown-menu v-loading="loading" element-loading-text="Loading~">

        <!--        热搜部分-->
        <div v-if="inputValue.length===0">
          <div class="dropdown-label">热搜榜</div>

          <el-dropdown-item v-for="(v,i) in hotList" @click="searchDetail(v)">
            <div class="item-container">
              <span class="index">{{ i + 1 }}</span>
              <span class="name">{{ v.searchWord }}</span>
              <!--            <span>人生没有答案</span>-->
            </div>
          </el-dropdown-item>

        </div>
        <!--        搜索建议部分-->
        <div v-else>
          <div v-if="JSON.stringify(suggestList)!=='{}'">

            <div v-show="suggestList?.songs">
              <div class="dropdown-label">
                <i class="iconfont icon-yinle"></i>
                单曲
              </div>
              <el-dropdown-item v-for="v in suggestList.songs" @click="clickSong(v)">
                <div style="margin-left:42px;">{{ v.name }}</div>&nbsp;
                <span v-for="(a,i) in  v.artists">{{ i === 0 ? ' - ' + a.name : '/' + a.name }}</span>
              </el-dropdown-item>
            </div>
            <div v-show="suggestList.artists">
              <div class="dropdown-label">
                <i class="iconfont icon-mic"></i>
                歌手
              </div>
              <el-dropdown-item v-for="v2 in artistList" @click="clickArtist(v2)">
                <div style="margin-left:42px;">{{ v2.name }}</div>
              </el-dropdown-item>
            </div>
            <div v-show="suggestList.albums">
              <div class="dropdown-label">
                <i class="iconfont icon-more"></i>
                专辑
              </div>
              <el-dropdown-item v-for="v3 in suggestList.albums" @click="clickAlbum(v3)">
                <div style="margin-left:42px;">{{ v3.name }}</div>
                <span>&nbsp;- {{
                    v3.artist
                        .name
                  }}</span>
              </el-dropdown-item>
            </div>
            <div v-show="suggestList.playlists">
              <div class="dropdown-label">
                <i class="iconfont icon-gedan"></i>
                歌单
              </div>
              <el-dropdown-item v-for="v4 in suggestList.playlists">
                <div style="margin-left:42px;">{{ v4.name }}</div>
              </el-dropdown-item>
            </div>
          </div>
          <div v-else class="text empty">
            暂无结果哦~(｡•ˇ‸ˇ•｡)
          </div>
        </div>
      </el-dropdown-menu>
    </template>

  </el-dropdown>
</template>

<script setup>
import {ref, watch, toRef, reactive,} from "vue"
import {useRouter, useRoute} from 'vue-router'
import {Search} from '@element-plus/icons-vue';
import {cloudSearch, searchHot, searchSuggest} from '@/api/search/index.ts'
import {useSong} from '@/store/song.ts'
import {songDetail} from '@/api/song/index.ts'
import {useSongDetail} from "@/hooks/useSongDetail.ts";

//变量
const router = useRouter()
const route = useRoute()
const songStore = useSong()
let artistQuery = reactive({ //获取歌手请求参数
  type: 100,//类型
  limit: 3,//返回数量限制
  offset: 0,//偏移量 （30*页码减一)
  keywords: '',//关键词
})
let loading = ref(false)
let dropdownRef = ref(null) //搜索下拉框ref
let inputValue = ref('')//搜索框值
let hotList = ref([])//热搜列表
let suggestList = ref([])//搜索建议
let artistList = ref([]) //歌手搜索建议
//方法
//跳转搜索详情页
const searchDetail = (v) => {
  if (v.searchWord) {
    inputValue.value = v.searchWord
  }
  router.push({
    path: '/search',
    query: {keyWords: inputValue.value}
  })
  setTimeout(() => {
    dropdownRef.value.handleClose()

  })

}
//获得热搜列表
const getHot = (v) => {
  if (v === false) return false
  loading.value = true
  searchHot().then(res => {
    if (res.code == 200) {
      loading.value = false
      hotList.value = res.data

    }
  })
}
//防止刷新浏览器文字丢失
const init = () => {
  if (route.name == 'search' && route.query.keyWords) {
    inputValue.value = route.query.keyWords
  }
}
init()
//点击了单曲
const clickSong = (v) => {

  useSongDetail(v.id)
  dropdownRef.value.handleClose()

}
//点击了歌手
const clickArtist = (v) => {
  router.push({
    name: 'artistDetail',
    query: {
      info: JSON.stringify(v)
    }
  })
}
//点击了专辑
const clickAlbum = (v) => {

  router.push({
    path: '/albumDetail',
    query: {id: v.id}
  })
}
//歌曲详情
const getSongDetail = (ids) => {
  songDetail({ids}).then(res => {
    songStore.currentSong = res.songs[0]
  })
}
//搜索建议
const handleSearch = () => {
  if (inputValue.value.length == 0) return false
  loading.value = true

  getArtist()

  searchSuggest({keywords: inputValue.value}).then(res => {
    loading.value = false
    suggestList.value = res.result

  })
}
//获取歌手搜索结果
//获得歌手列表
const getArtist = () => {
  artistQuery.keywords = inputValue.value
  cloudSearch(artistQuery).then(res => {
    artistList.value = res.result.artists

  })
}
watch(() => inputValue.value, (newVal) => {
  if (newVal) {
    handleSearch()
    dropdownRef.value.handleOpen()
  }
})
</script>

<style lang="less" scoped>
@transparent: rgba(0, 0, 0, 0.05);
@color: rgba(255, 255, 255, 0.86);

.search {

  :deep(.el-input__wrapper) {
    background-color: @transparent;
    border-radius: 50px;
    box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
    width: 170px;
    height: 26px;
    margin-left: 20px;
  }

  :deep(.el-input__icon),
  :deep(.el-input__inner) {
    color: @color;
  }

  :deep(.el-input__icon) {
    cursor: pointer;
  }

  :deep(.el-input__inner::placeholder),
  :deep(.el-input__icon) {
    color: @color;
  }
}

//下拉栏
.el-dropdown {
  margin-top: 9px;
}

:global(.dropdown-label) {
  padding-left: 14px;
  font-size: 14px;
  height: 30px;
  //background-color: pink;
  line-height: 30px;
  color: @lightFontColor;
  margin-top: 10px;
}


:global(.el-dropdown-menu) {
  width: 350px !important;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: @shallowTheme !important;

  .index {
    color: @theme !important;
  }
}

:deep(.el-dropdown-menu__item) {
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 0;
}

:deep(.el-dropdown-menu__item):nth-child(-n+4) {

  .name {
    font-weight: bold;
  }

  .index {
    color: @red;
  }
}


:deep(.item-container) {
  margin-left: 20px;
  display: flex;

  .index {
    margin-right: 20px;
    color: @lightFontColor2;
  }
}

.empty {
  padding: 20px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}

</style>
