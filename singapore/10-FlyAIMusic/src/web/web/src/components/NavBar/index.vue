<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane v-for="(v,i) in props.tabsData" :label="v.label" :name="v.value">
    </el-tab-pane>
  </el-tabs>
</template>


<script lang="ts" setup>
import {ref, reactive,defineProps,PropType,watch} from "vue"
import { useRouter ,useRoute} from "vue-router"
import type { TabsPaneContext } from 'element-plus'
// route是用来获取路由信息的，router是用来操作路由的。
const router = useRouter()
const route = useRoute()
const emit =defineEmits('tabClick')
const props = defineProps({
  tabsData:Array as PropType<TabsData[]>,
  //是否导航式跳转
  isRoute:{default:()=>true}
})
//tab栏选中的
const activeName = ref(props.isRoute?route.name||props.tabsData![0].value:props.tabsData![0].value) //若没有点击过，就默认展示第一个（刷新浏览器状态也在）

const handleClick = (tab: TabsPaneContext) => {
  emit('tabClick',tab.paneName)
  if(!props.isRoute) return false
  router.push({
    name: tab.paneName as string
  })
}

// 监听路由变化
watch(()=>route.name,(newVal)=>{
  activeName.value = newVal as string
})




</script>

<style  scoped lang="less">
.el-tabs{
  padding-left:30px;
  left: 0px;
  top: 0;
  padding-top: 10px;
  position:relative;
  background-color: #fff;
  width: 100%;
  z-index:999;
  //margin-top: -8px;
}
:deep(.el-tabs__item.is-active) {
  .font-weight
}
:deep(.el-tabs__item){
  font-size: 16px;
  color: @fontColor;

}
/*去掉tabs底部的下划线*/
:deep(.el-tabs__nav-wrap:after) {
  position: static !important;
}
:deep(.el-tabs__active-bar){
  transition:none;
  height: 3px;
}
:deep(.el-tabs__header){
  margin: 0;
}
</style>
