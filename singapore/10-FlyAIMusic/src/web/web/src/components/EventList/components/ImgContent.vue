<template>
  <div :class="props.imgList.length===2?'two-img':(props.imgList.length>2?'many-img':'')" class="img-container">
    <el-image v-for="(v,i) in props.imgList" :hide-on-click-modal="true"
              :initial-index="clickIndex "
              :preview-src-list="srcList"
              :src="v?.originUrl"
              alt=""
              @click="clickIndex =i"/>
  </div>
</template>

<script setup>
import {ref, reactive, defineProps, watch} from "vue"

const props = defineProps({
  imgList: {
    type: Array,
    default: () => []
  }
})
//图片src数组
let srcList = ref([])
let clickIndex = ref(0) //点击的那张图索引

const getSrcList = () => {
  props.imgList.forEach(v => {
    srcList.value.push(v.originUrl)
  })
}
getSrcList()

</script>

<style lang="less" scoped>
:deep(.el-image-viewer__wrapper){
  //bottom: 60px;
  //top: 46px;
  z-index:9999!important;
}

//预览图片的大小
:deep(.el-image-viewer__img) {
  height: 80%!important;
  width: auto!important;

}

.img-container {
  :deep(.el-image) {
    margin-top: 10px;
    width: 300px;
    border-radius: 5px;
    margin-right: 10px;
    cursor: zoom-in;
  }
}


//两模式
.two-img {
  :deep(.el-image) {
    width: 250px !important;
    height: 250px !important;
  }
}

//多图模式
.many-img {
  width: 700px;

  :deep(.el-image) {
    width: 150px !important;
    height: 150px !important;
  }
}

</style>
