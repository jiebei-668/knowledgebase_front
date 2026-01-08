<!--
  @file Main 组件
  @description 主内容区组件，支持路由切换动画、页面缓存和组件重载功能
-->
<template>
  <a-layout class="main">
    <router-view v-slot="{ Component, route }">
      <transition :name="appStore.transitionName" mode="out-in" appear>
        <!--           keep-alive会缓存组件，提高性能。具体来说缓存的页面配置再tabsStore.cacheList中-->
        <!-- 比如标签跳转以后还保存原来的标签的数据等，不用重新加载-->
        <keep-alive :include="(tabsStore.cacheList as string[])">
          <component :is="Component" v-if="tabsStore.reloadFlag" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </a-layout>
</template>

<script setup lang="ts">
import { useAppStore, useTabsStore } from '@/stores'

/** 组件名称 */
defineOptions({ name: 'AppMain' })

/** 状态管理 */
const appStore = useAppStore()
const tabsStore = useTabsStore()
</script>

<style lang="scss" scoped>
.main {
  /* ✅ 关键：不要用 height: 100%，要用 flex: 1 */
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 16px;
  background-color: #f2f3f5;
  
  /* 确保内部的 router-view 渲染出来的 div 也能撑满 */
  :deep(> div) {
    height: 100%;
  }
}
</style>