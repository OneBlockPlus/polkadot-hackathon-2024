<template>
  <div class="user-view">

    <UserList :loading="loading" :description="closed?'Access restricted by the owner~(｡•ˇ‸ˇ•｡)':route.name==='follows'?'No followers yet~(｡•ˇ‸ˇ•｡)':'No fans yet~(｡•ˇ‸ˇ•｡)'" :total="total" :userList="userList"
              @pageChange="getOffset"></UserList>
  </div>
</template>

<script setup>
import {ref, reactive} from "vue"
import UserList from "@/components/UserList/index.vue"
import {useRoute, useRouter} from "vue-router";
import {cloudSearch} from "@/api/search/index.ts";
let total = ref(0) // Total number of data entries
const route = useRoute()
let loading =ref(false)
let userQuery = reactive({ // Request parameters for fetching search results
  type: 1002, // Type
  limit: 30, // Limit on the number of returned entries
  offset: 0, // Offset (30 * page number - 1)
  keywords: route.query.keyWords || '', // Keywords
})
let userList =ref([])
// Fetch the list of users
const getData = () => {
  loading.value =true

  cloudSearch(userQuery).then(res => {
    loading.value =false
    if(!res.result.userprofiles) return false
    userList.value =res.result.userprofiles
    total.value = res.result.userprofileCount
  })
}
getData()
// Get the offset for pagination in the user list component
const getOffset = (pageNum) => {
  userQuery.offset = (pageNum - 1) * 30
  getData()
}
</script>

<style lang="less" scoped>
.user-view{
  position: relative;
  padding-bottom: 25px;
}
</style>