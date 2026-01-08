<template>
  <div class="tags-view-container">
    <a-space>
      <a-tag
        v-for="tag in tabsStore.tabList"
        :key="tag.fullPath || tag.path"
        :color="route.path === tag.path ? 'arcoblue' : ''"
        closable
        checkable
        @click="handleClickTag(tag)"
        @close="handleCloseTag(tag.path)"
        style="cursor: pointer"
      >
        {{ tag.meta?.title || tag.name || '未命名' }}
      </a-tag>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/stores' // 指向你的 store

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

// 点击标签跳转
const handleClickTag = (tag: any) => {
  router.push(tag.fullPath || tag.path)
}

// 关闭标签
const handleCloseTag = (path: string) => {
  tabsStore.deleteTabItem(path)
}
</script>

<style scoped>
.tags-view-container {
  height: 34px;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  align-items: center;
  padding: 0 16px;
  overflow-x: auto;
}
</style>