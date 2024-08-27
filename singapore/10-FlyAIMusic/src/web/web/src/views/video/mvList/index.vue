<template>
  <div class="container">
    <div class="kinds">
      <div>
        <span class="text">Region:</span>
        <ul>
          <!-- Class name depends on whether it is the currently selected item -->
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
        <span class="text">Type:</span>
        <ul>
          <!-- Class name depends on whether it is the currently selected item -->
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
        <span class="text">Sort:</span>
        <ul>
          <li
              v-for="v in order"
              :key="v.value"
              :class="queryParams.order === v.value ? 'active-kind' : ''"
              @click="handleClick(v.value, 3)">
            {{ v.label }}
          </li>
        </ul>
      </div>
    </div>
    <div class="mt20">
      <MvCard :dropdownRefresh="true" :loading="loading" :mvList="mvList" type="mv" @handleJump='handleJump'
              @loadData="loadData">
      </MvCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, reactive} from "vue"
import {useRouter} from 'vue-router'
import MvCard from "@/components/Card/MvCard/index.vue"
import {mvAll} from "../../../api/mv";

let loading = ref(false)

const router = useRouter()
const areaList = reactive([{  // Region categories
  label: 'All',
  value: 'All'
}, {
  label: 'Mainland',
  value: 'Mainland'
}, {
  label: 'Hong Kong/Taiwan',
  value: 'Hong Kong/Taiwan'
}, {
  label: 'Europe/America',
  value: 'Europe/America'
}, {
  label: 'Korea',
  value: 'Korea'
}, {
  label: 'Japan',
  value: 'Japan'
}])
// Type options data
const typeList = reactive([{
  label: 'All',
  value: 'All'
}, {
  label: 'Official',
  value: 'Official'
}, {
  label: 'Original Soundtrack',
  value: 'Original Soundtrack'
}, {
  label: 'Live',
  value: 'Live'
}, {
  label: 'Produced by NetEase',
  value: 'Produced by NetEase'
}])
let order = ref([
  {
    label: 'Fastest Rising',
    value: 'Fastest Rising'
  }, {
    label: 'Hottest',
    value: 'Hottest'
  }, {
    label: 'Newest',
    value: 'Newest'
  },
])

let mvList = ref([])
let queryParams = reactive({
  type: 'All', // Type
  area: 'All', // Region
  order: 'Fastest Rising', // Sort
  limit: 30,
  offset: 0 // (Page number - 1) * 30, where 30 is the value of limit, default is 0
})

// Load more data
const loadData = () => {
  if (mvList.value.length > 0) {
    queryParams.offset += 30
  }
  getMvList()
}
// Select type
const handleClick = (v: string, type: 1 | 2 | 3) => {
  queryParams.offset = 0
  if (type === 1) { // Re-selected region/language
    queryParams.area = v
  } else if (type === 2) { // Re-selected category
    queryParams.type = v
  } else { // Re-selected sort
    queryParams.order = v
  }
  mvList.value = []
  getMvList()
}
// Get list
const getMvList = () => {
  loading.value = true
  mvAll(queryParams).then((res: any) => {
    if (res.code === 200) {
      loading.value = false
      mvList.value.push(...res.data)
    }
  })
}
// getMvList()

</script>
<style>

</style>
<style lang="less" scoped>
.container {
  //margin-left: -10px;
}

:deep(.some-container), :deep(.some-container ul) {
  width: 100% !important;
}

:deep(.some-container li) {
  font-size: 14px !important;
  padding: 0 20px !important;
}

.kinds {
  margin-bottom: 0;

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

.kinds > div {
  margin-bottom: 0;
}
</style>
