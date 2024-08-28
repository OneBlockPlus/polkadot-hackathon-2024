<template>
  <div class="description">
    <h2>简介</h2>
    <p>&emsp;&emsp;{{ description.briefDesc }}</p>
    <div v-for="v in description.introduction" class="works">
      <h2>{{ v?.ti }}</h2>
      <p> {{ v?.txt }}</p>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, defineProps} from "vue"

const props = defineProps({
  description: {
    type: Object,
    default: () => {
      return {}
    },
  }
})
</script>

<style lang="less" scoped>
h2 {
  margin-bottom: 10px;
}

p {
  line-height: 34px;
  word-break: break-all!important;

  word-wrap: break-word!important;

  white-space: pre-wrap!important;

}

.works {
  padding-bottom: 30px;

  h2 {
    margin-top: 30px;
  }

  p {
    white-space: pre-line;
    white-space: pre;
  }
}
</style>
