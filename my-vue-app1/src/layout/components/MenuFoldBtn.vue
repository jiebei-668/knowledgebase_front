
<template>
  <!-- 折叠按钮 -->
  <a-button size="mini" class="gi_hover_btn menu-fold-btn" @click="handleFoldClick">
    <template #icon>
      <icon-menu-fold v-if="!appStore.menuCollapse" :size="18" :stroke-width="3" />
      <icon-menu-unfold v-else :size="18" :stroke-width="3" />
    </template>
  </a-button>

</template>

<script setup lang="ts">
import { useAppStore } from '@/stores'


/** 组件名称 */
defineOptions({ name: 'MenuFoldBtn' })

/** 状态管理 */
const appStore = useAppStore()


/** 处理折叠按钮点击 */
const handleFoldClick = () => {
  appStore.setMenuCollapse(!appStore.menuCollapse)
}
</script>

<style lang="scss" scoped>
.menu-fold-btn {
  flex-shrink: 0;
  background-color: var(--color-secondary-hover) !important;
}

</style>
