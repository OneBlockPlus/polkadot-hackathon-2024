<template>
  <div class="container">
    <div class="kinds">
      <div>
        <span class="text">Language:</span>
        <ul>
          <!--类名根据是否是当前选中的项决定-->
          <li
              v-for="v in areaList"
              :key="v.value"
              :class="queryParams.area === v.value ? 'active-kind' : ''"
              @click="handleClick(v.value, 1)">
            {{ v.label }}
          </li>
        </ul>
      </div>
      <div>
        <span class="text">Category:</span>
        <ul>
          <!--类名根据是否是当前选中的项决定-->
          <li
              v-for="v in typeList"
              :key="v.value"
              :class="queryParams.type === v.value ? 'active-kind' : ''"
              @click="handleClick(v.value, 2)">
            {{ v.label }}
          </li>
        </ul>
      </div>
      <div>
        <span class="text">Filter:</span>
        <ul>
          <!--类名根据是否是当前选中的项决定-->
          <li
              v-for="v in letter"
              :key="v.value"
              :class="queryParams.initial === v.value ? 'active-kind' : ''"
              @click="handleClick(v.value, 3)">
            {{ v.label }}
          </li>
        </ul>
      </div>
    </div>

    <SongCard :dropdownRefresh="true" :loading="loading" :playList="artists" type="artist" @handleJump='handleJump'
              @loadData="loadData"></SongCard>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue"
import { useRouter } from 'vue-router'
import SongCard from "@/components/Card/SongCard/index.vue"
import { artistList } from "@/api/artist/index.ts"
import { artistAlbum } from '@/api/album/index.ts'
import { throttle } from '@/utils/index.ts'

const router = useRouter()
let loading = ref(false)

const areaList = reactive([{  //语种选项数据
  label: 'All',
  value: -1
}, {
  label: 'Chinese',
  value: 7
}, {
  label: 'Western',
  value: 96
}, {
  label: 'Japanese',
  value: 8
}, {
  label: 'Korean',
  value: 16
}, {
  label: 'Others',
  value: 0
}])
//种类选项数据
const typeList = reactive([{
  label: 'All',
  value: -1
}, {
  label: 'Male Singer',
  value: 1
}, {
  label: 'Female Singer',
  value: 2
}, {
  label: 'Band',
  value: 3
}])
let letter = ref([
  {
    label: 'Popular',
    value: '-1'
  },
])

let artists = ref([])
let queryParams = reactive({
  type: -1, //分类
  area: -1, //语种
  initial: '-1', //按字母筛选
  offset: 0//   (页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
})

//生成字母排序数据
const getLetter = () => {
  for (let i = 65; i < 91; i++) {
    let value = { label: String.fromCharCode(i), value: String.fromCharCode(i).toLowerCase() }
    letter.value.push(value)
  }
}
getLetter()
//跳转到歌手详情页
const handleJump = (row: any) => {
  //跳转到歌手详情页
  router.push({
    name: 'artistDetail',
    query: {
      info: JSON.stringify(row)
    }
  })
}
//加载更多歌手数据
const loadData = () => {
  if (artists.value.length > 0) {
    queryParams.offset += 30
  }
  getartistList()
}
//选择类型
const handleClick = (v: number | string, type: 1 | 2 | 3) => {
  queryParams.offset = 0
  if (type === 1) { //重选了语种
    queryParams.area = v as number
  } else if (type === 2) { //重选了分类
    queryParams.type = v as number
  } else { //重选了字母筛选
    queryParams.initial = v as string
  }
  artists.value = []
  getartistList()
}
//获得歌手列表
const getartistList = () => {
  loading.value = true
  artistList(queryParams).then((res: any) => {
    if (res.code === 200) {
      // console.log('获得的歌手列表', res)
      loading.value = false
      artists.value.push(...res.artists)
    }
  })
}
// getartistList()
</script>
<style>

</style>
<style lang="less" scoped>
.container {
  padding-right: 30px;
}
:deep(.some-container), :deep(.some-container ul) {
  width: 100% !important;
}

:deep(.some-container li) {
  font-size: 14px !important;
  padding: 0 20px !important;
}

.kinds {
  .active-kind {
    background-color: @shallowTheme;
    color: @pinkFont;
    border-radius: 30px;
  }

  ul {
    display: flex;
    flex-wrap: wrap;

    li {
      margin-top: 3px;
      cursor: pointer;
      max-width: 86px;
      .long-text;
      font-size: 13px;
      padding: 0 10px;
      height: 30px;
      line-height: 30px;
      margin-left: 10px;
    }
  }
}

.target {
  margin-top: -70px;
}
</style>
