<!--
  @file Layout 组件
  @description 布局根组件，支持默认布局、混合布局和顶部布局三种模式
-->
<template>
  <component :is="currentLayout" />
</template>

<script setup lang="ts">
import LayoutDefault from './LayoutDefault.vue'
import { useAppStore } from '@/stores'

/** 组件名称 */
defineOptions({ name: 'Layout' })

/** 状态管理 */
const appStore = useAppStore()

/** 布局组件映射 */
const layoutMap = {
  default: LayoutDefault
} as const

/** 当前布局组件 */
const currentLayout = computed(() =>
  layoutMap[appStore.layout as keyof typeof layoutMap] || layoutMap.default
)

// 新增以下代码：组件挂载后打印
onMounted(() => {
    console.log('当前布局组件:', currentLayout.value)
    console.log('当前布局模式:', appStore.layout)
})
</script>

<style lang="scss" scoped></style>
