<template>
  <div class="sort">
    <!--    全部类型-->
    <div class="all-kinds">

      <el-popover
          ref="popoverRef"
          :width="450"
          placement="bottom"
          trigger="click"
      >
        <template #reference>
          <el-button class="white-btn" round><!-- @click="show=true"-->
            {{ activeName }} <i class="iconfont icon-arrow-right-bold"></i>
          </el-button>
        </template>
        <!--弹出框内容-->

        <div class="popover-container">
          <ul>
            <li
                v-for="(v,i) in props.kinds" :key="v"
                :class="activeName===v.name?'active-kind':''"
                @click="selectKinds(i,v)"
            >{{ v.name }}
            </li>
          </ul>

        </div>
      </el-popover>
    </div>
    <!--    部分类型-->
    <div class="some-kinds">
      <ul>
        <!--类名根据是否是当前选中的项决定-->
        <li
            v-for="(v,i) in props.kinds"
            v-show="i<8"
            :key="v"
            :class="activeName ===v.name? 'active-kind' :''"
            @click="handleClick(v)">
          {{ v.name }}
        </li>
      </ul>

    </div>
  </div>


</template>

<script lang="ts" setup>
import {defineProps, ref, defineEmits} from "vue"
import {useRoute} from "vue-router";

const route = useRoute()
const emit = defineEmits(['selectCat'])
const props = defineProps({
  kinds: {},
  title:{
    type:String,
    default:()=>''
  } //标题
})

let activeName = ref<String>(route.name === 'songListIndex' ? '华语' : '现场') //选中的类型名称（歌单类型默认未华语，mv类型默认未现场）

// 记录当前点击的哪一个类型
const handleClick = (v: any) => {
  activeName.value = v.name
  emit('selectCat', v)
}
//变量
const popoverRef = ref<any>(null); //获得弹出框组件的ref

//选择了种类
const selectKinds = (i: number, v: any) => {
  emit('selectCat', v)
  activeName.value = v.name
  //通过弹出框的ref控制弹出框显示
  popoverRef.value.hide();
}
</script>

<style lang="less" scoped>

.sort {
  display: flex;
  justify-content: space-between;

  padding-right: 20px;
}

.el-button {
  padding: 0 16px 0 26px;
  color: @fontColor;
  border: 1px solid @lightTheme;
  line-height: 32px!important;
}

//框架按钮样式
.el-button:focus {
  background-color: #fff;
  border: 1px solid @lightTheme;
}

.el-button:hover {
  background-color: @shallowTheme;
  border: 1px solid @lightTheme;;
}

.popover-container {
  padding-top: 20px;
display: flex;

  flex-direction: column;
  ul {
    display: block;

    li {
      font-size: 12px;
      text-align: center;
      display: inline-block;
      width: 97px;
      height: 30px;
      line-height: 30px;
      margin-bottom: 10px;
      border-radius: 30px;
      cursor: pointer;
      float: left;
      padding: 0 8px;
      margin-right: 10px;
      .long-text;

    }

    li:hover {
      color: @pinkFont;
    }

    li:nth-child(4n) {
      margin-right: 0;
    }

  }
}

.some-kinds {
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

</style>
<style lang="less">
.el-popover.el-popper {


  max-height: 350px;
  left: 152px !important;
  overflow: auto;
  padding: 0 ;
}

.el-popover__title {
  padding: 20px 20px;
  border-bottom: 1px solid #ebebeb;
}

.el-popper .el-popper__arrow::before {
  width: 0;
  height: 0;
}
</style>