<template>

  <div class="text-collapse" v-if="contentText">
    <el-collapse v-model="activeName" @change="textFormatter()">
      <el-collapse-item :title="headerText" name="1">
        <div class="description">
          {{ contentText }}
        </div>

      </el-collapse-item>

    </el-collapse>
  </div>
  <span v-else>暂无简介</span>
</template>

<script setup>
import {ref, reactive, defineProps, watch} from "vue"

const props = defineProps({
  text: {
    type: String,
    default: () => ''
  }
})
let activeName = ref([]) //折叠控件
let headerText = ref('')//折叠header展示的文字
let contentText = ref('')//被折叠部分文字

//处理字符串
const textFormatter = () => {
  //最多只能展示33个字符
  let index = props.text.indexOf('\n') !== -1 ? (props.text.indexOf('\n') <= 33 ? props.text.indexOf('\n') : 33) : 33
  headerText.value = activeName.value.length === 0 ? props.text.slice(0, index) + '…' : props.text.slice(0, index)
  contentText.value = props.text.slice(headerText.value?.length, props.text.length)

}

watch(() => props.text, (newVal) => {
  if (newVal?.length === 0||!newVal) return false
  textFormatter()

})
</script>

<style lang="less" scoped>
@collapseWidth: 500px;

:deep(.el-collapse-item__header) {
  border: 0;
  line-height: normal;
  height: 100%;
  font-size: 13px;
  margin-top: 2px;
  color: @fontColor2;
  margin-bottom: 3px;
}

:deep(.el-collapse-item__wrap) {
  border: 0;
}

:deep(.el-collapse ) {
  border: 0;
  width: @collapseWidth;

}

.description {
  //margin-top: -20px;  //这句有时要，有时不能要。。。
  //.long-text;
  //width: 700px;
  max-width: 420px;

}

.text {
  width: @collapseWidth;
  color: #646464;
}
</style>
