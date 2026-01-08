<template>
  <a-layout class="layout-default">
    <Asider></Asider>
    
    <a-layout class="layout-default__right">
      <Header></Header>
      
      <TagsView></TagsView>
      
      <Main></Main>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTabsStore } from '@/stores' // ✅ 确保指向你的 stores

// 引入组件
import Header from './components/Header/index.vue'
import Main from './components/Main.vue'
import Asider from './components/Asider/index.vue'
import TagsView from './components/TagsView/index.vue' // ✅ 引入 TagsView

defineOptions({ name: 'LayoutDefault' })

const route = useRoute()
const tabsStore = useTabsStore()

// 核心逻辑：监听路由变化，自动添加标签
//ww 放在 Layout 这一层最合适，因为它永远存在
watch(() => route.path, () => {
  tabsStore.addTabItem(route)
}, { immediate: true })
</script>

<style lang="scss" scoped>
.layout-default {
  width: 100%;
  height: 100%;
  display: flex;

  &__right {
    display: flex;
    flex-direction: column;
    /* ✅ 关键：flex: 1 让它自动占满剩余空间，修复缩放问题 */
    flex: 1; 
    width: 0; 
    height: 100%; 
    overflow: hidden;
  }
}
</style>