<template>
  <div class="album-view">
    <text>Favourite Singers ({{artistList.length}})</text>

    <SongCard
        :loading="loading"
        @handleJump='handleJump'
        :dropdownRefresh="true"
        :playList="artistList"
        :total="total"
        type="artist"  @loadData="loadData"></SongCard>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SongCard from "@/components/Card/SongCard/index.vue"
import { artistSublist } from "@/api/artist/index.ts";
let loading = ref(false)

const route = useRoute()
const router = useRouter()
let total = ref(0) // Total songs

let artistQuery = reactive({ // Search result request parameters

  limit: 30, // Limit returned
  offset: 0, // Offset (30 * page number minus one)

})
let artistList = ref([]) // Album data
// Load more singer data
const loadData = () => {
  if (artistList.value.length > 0) {
    artistQuery.offset += 30
  }
  getData()
}

// Get singer list
const getData = () => {
  loading.value = true
  artistSublist(artistQuery).then(res => {
    loading.value = false
    if (!res.data) return false
    artistList.value.push(...res.data)
    total.value = res.count
  })
}
// getData()
// Jump to singer details page
const handleJump = (row) => {
  // Jump to singer details page
  router.push({
    name: 'artistDetail',
    query: {
      info: JSON.stringify(row)
    }
  })
}
</script>

<style lang="less" scoped>
.artist-view {
  position: relative;
  //padding-bottom: 130px;
  //margin-left: -10px;
}
:deep(.scroll) {

  //height: 100%!important;
}
</style>