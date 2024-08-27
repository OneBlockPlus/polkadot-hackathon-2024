<template>
  <div class="content-view">
    <span class="font-weight">{{ userInfo.nickname }}'s Events</span>
    <EventList :dropdownRefresh="dropdownRefresh" :eventList="eventList" :loading="loading" :userInfo="userInfo"
               @loadData="loadData"></EventList>
  </div>
</template>

<script setup>
import {ref, reactive} from "vue"
import {useRoute} from "vue-router"
import {getUserEvent} from '@/api/userEvent/index.ts'
import EventList from '@/components/EventList/index.vue'

let loading = ref(true)
const route = useRoute()
let dropdownRefresh = ref(true) // Enable data pull-down refresh
let userInfo = ref({}) // User personal information
// Request parameters
let queryParams = reactive({
  uid: 0,
  limit: 30,
  lasttime: -1 // The lasttime of the returned data, default is -1. Pass in the lasttime of the previous result to get the next page of data.
})
let isMore = ref(true) // Data not fully retrieved
let eventList = ref([])
// Get user events
const getEvent = () => {
  loading.value = true
  getUserEvent(queryParams).then(res => {
    if (res.code === 200) {
      loading.value = false
      queryParams.lasttime = res.lasttime
      isMore.value = res.more
      // No matter how many times it is forwarded, there are at most two layers of JSON. The last layer is always the original event.
      let arr = res.events.filter((v, i) => {

        if (v.json) {
          v.mainInfo = JSON.parse(v.json)
          if (v.mainInfo?.event?.json) {
            v.mainInfo.event.mainInfo = JSON.parse(v.mainInfo?.event?.json)
          }
        }
        // Type 56 indicates content hidden by the user
        return (v.type !== 56 && v.type !== 58)
      })
      eventList.value.push(...arr)
      console.log('An event', eventList.value[39])
      dropdownRefresh.value = res.more
    }
  })
}
// Load more data
const loadData = () => {
  if (dropdownRefresh.value) {
    getEvent()
  }
}
const init = () => {
  userInfo.value = JSON.parse(route.query.info)
  queryParams.uid = userInfo.value.userId
}
init()
</script>

<style lang="less" scoped>
.content-view {
  height: calc(100% - 37px);

}

// The pink part
:deep(.item-content) {
  cursor: pointer;

  .el-image{
    max-width: 200px;
    //max-height: 200px;
    border-radius: 5px;
  }

  margin-top: 10px;
  background-color: @shallowTheme;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding-left: 13px;
  width: 100%;
  overflow-x: hidden;


  .el-image {
    border-radius: 5px;
  }

  .content-right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 20px;
    width: 100%;

    .artist-row {
      display: flex;
      white-space: nowrap;
    }

    .name {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .artist {
      font-size: 13px;
      color: @lightFontColor;
    }
  }
}
</style>