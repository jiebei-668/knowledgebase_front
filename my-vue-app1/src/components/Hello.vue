<!-- src/components/Hello.vue -->

<script setup lang="ts">
// 无需导入，因为组件会通过 unplugin-vue-components 自动导入
</script>

<template>
  <div class="button-container">
    <a-button type="primary">Hello</a-button>
    <a-button type="secondary">次要按钮</a-button>
    <a-button type="dashed">虚线按钮</a-button>
    <a-button type="text">文本按钮</a-button>
    <a-button type="danger">危险按钮</a-button>
    <a-button type="outline">边框按钮</a-button>
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  gap: 16px;
  padding: 20px;
  flex-wrap: wrap;
  height: 200px;
}
</style>
