<!-- 无数据组件，如：列表为空 -->
<template>
  <div class="w-full flex items-center justify-center no-data">
    <img src="@/assets/images/data-null.png" />
    <div class="text">{{ textInfo }}</div>
  </div>
</template>

<script lang="ts">
export default { name: "NoData" };
</script>

<script setup lang="ts">
  defineProps({
    textInfo: {
      type: String,
      default: '暂无数据'
    },
  });
</script>

<style lang="scss" scoped>
.no-data {
  flex-direction: column;
  img { width: 155px; height: 160px; }
  .text { margin-top: 24px; font-size: 14px; color: #909399; }
}
</style>
