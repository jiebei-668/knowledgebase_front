/**
 * @file 标签页状态管理模块
 * @description 处理标签页（Tabs）的状态管理，包括页签的增删改查和缓存控制
 */

import { defineStore } from 'pinia'
import { nextTick, ref } from 'vue'
import { type RouteLocationNormalized, type RouteRecordName, useRouter } from 'vue-router'
import { eachTree } from 'xe-utils'
// 注意：如果你没有 useRouteStore，这行可能会报错，如果报错请注释掉相关逻辑
import { useRouteStore } from '@/stores' 

/**
 * 标签页 Store 的核心设置逻辑
 * @description 管理标签页相关的状态和操作
 */
const storeSetup = () => {
    const router = useRouter()

    /**
     * 标签页列表
     * 存储当前打开的所有标签页
     * 默认给一个首页，防止空屏
     */
    const tabList = ref<RouteLocationNormalized[]>([
        { 
            path: '/home', 
            fullPath: '/home', 
            name: 'Home', 
            meta: { title: '首页', affix: true } 
        } as unknown as RouteLocationNormalized
    ])

    /**
     * 缓存组件列表
     * 存储需要被 keep-alive 缓存的组件名称
     */
    const cacheList = ref<RouteRecordName[]>([])

    /**
     * 页面重载标志
     * 用于控制页面的重新加载
     */
    const reloadFlag = ref(true)

    /**
     * 添加标签页
     * @description 添加新的标签页，如果已存在则更新
     * @param {RouteLocationNormalized} item - 路由对象
     */
const addTabItem = (item: RouteLocationNormalized) => {
        // 过滤不需要显示的页面
        if (item.meta?.hideInTabs) return 

        const index = tabList.value.findIndex((i) => i.path === item.path)

        // 🟢 关键修改：手动提取需要的字段，创建一个新对象
        // 这样就断开了与 route 的响应式连接
        const newTab = {
            path: item.path,
            fullPath: item.fullPath,
            name: item.name,
            meta: { ...item.meta } // 复制 meta
        } as RouteLocationNormalized

        if (index >= 0) {
            // 更新已存在的标签页
            if (tabList.value[index]!.fullPath !== item.fullPath) {
                tabList.value[index] = newTab
            }
        } else {
            // 添加新标签页
            if (item.meta?.showInTabs ?? true) {
                tabList.value.push(newTab)
            }
        }
        
        // 自动添加缓存
        if (item.name && item.meta?.keepAlive !== false) {
             if (!cacheList.value.includes(item.name)) {
                 cacheList.value.push(item.name)
             }
        }
    }

    /**
     * 删除标签页
     * @description 删除指定路径的标签页，如果是当前页则自动跳转
     * @param {string} path - 要删除的标签页路径
     */
    const deleteTabItem = (path: string) => {
        const index = tabList.value.findIndex((item) => item.path === path && !item.meta?.affix)
        if (index < 0) return

        // TS修复：使用 ! 断言
        const isActive = router.currentRoute.value.path === tabList.value[index]!.path
        
        // 删除缓存
        const deletedItem = tabList.value[index]
        if (deletedItem?.name) {
            deleteCacheItem(deletedItem.name)
        }
        
        tabList.value.splice(index, 1)

        // 如果删除的是当前页，则跳转到最后一个标签页
        if (isActive && tabList.value.length) {
            // TS修复：增加 ?. 判断，防止数组为空时报错
            const lastTab = tabList.value[tabList.value.length - 1]
            if (lastTab) {
                router.push(lastTab.fullPath || lastTab.path)
            } else {
                router.push('/')
            }
        }
    }

    /**
     * 清空标签页列表
     * @description 清空所有标签页，保留固定的标签页（affix: true）
     */
    const clearTabList = () => {
        // 如果你还没写 useRouteStore，这一块可以先注释掉，防止报错
        try {
            const routeStore = useRouteStore()
            const affixTabs: RouteLocationNormalized[] = []
        
            eachTree(routeStore.routes, (item) => {
                if (item.meta?.affix) {
                    affixTabs.push(item as unknown as RouteLocationNormalized)
                }
            })
            tabList.value = affixTabs
        } catch (e) {
            // 降级处理：只保留首页
            tabList.value = tabList.value.filter(item => item.path === '/home')
        }
    }

    /**
     * 设置标签页标题
     * @description 修改当前标签页的标题
     * @param {string} title - 新的标题
     * @returns {boolean} 是否设置成功
     */
    const setTabTitle = (title: string): boolean => {
        if (!title) return false

        const route = router.currentRoute.value
        const path = route?.fullPath || route.path
        const index = tabList.value.findIndex((i) => i.fullPath === path)

        if (index >= 0) {
            // TS修复：使用 ! 断言
            tabList.value[index]!.meta.title = title
            return true
        }
        return false
    }

    /**
     * 添加缓存组件
     * @description 将需要缓存的组件添加到 keep-alive 列表
     * @param {RouteLocationNormalized} item - 路由对象
     */
    const addCacheItem = (item: RouteLocationNormalized) => {
        if (!item.name || !item.meta?.keepAlive) return
        if (!cacheList.value.includes(item.name)) {
            cacheList.value.push(item.name)
        }
    }

    /**
     * 删除缓存组件
     * @description 从 keep-alive 列表中移除指定组件
     * @param {RouteRecordName} name - 组件名称
     */
    const deleteCacheItem = (name: RouteRecordName) => {
        const index = cacheList.value.findIndex((i) => i === name)
        if (index >= 0) {
            cacheList.value.splice(index, 1)
        }
    }

    /**
     * 清空缓存列表
     * @description 清空所有 keep-alive 缓存的组件
     */
    const clearCacheList = () => {
        cacheList.value = []
    }

    /**
     * 关闭当前标签页
     * @description 关闭指定路径的标签页并清除其缓存
     * @param {string} path - 要关闭的标签页路径
     */
    const closeCurrent = (path: string) => {
        const item = tabList.value.find((i) => i.path === path)
        if (item?.name) {
            deleteCacheItem(item.name)
        }
        deleteTabItem(path)
    }

    /**
     * 关闭其他标签页
     * @description 关闭除指定路径外的所有标签页
     * @param {string} path - 要保留的标签页路径
     */
    const closeOther = (path: string) => {
        const otherTabs = tabList.value.filter((i) => i.path !== path)
        otherTabs.forEach((item) => {
            deleteTabItem(item.path)
            item?.name && deleteCacheItem(item.name)
        })
    }

    /**
     * 关闭右侧标签页
     * @description 关闭指定路径右侧的所有标签页
     * @param {string} path - 参考标签页路径
     */
    const closeRight = (path: string) => {
        const index = tabList.value.findIndex((i) => i.path === path)
        if (index < 0) return

        const rightTabs = tabList.value.filter((_, n) => n > index)
        rightTabs.forEach((item) => {
            deleteTabItem(item.path)
            item?.name && deleteCacheItem(item.name)
        })
    }

    /**
     * 关闭所有标签页
     * @description 关闭所有标签页并跳转到首页
     */
    const closeAll = () => {
        clearTabList()
        clearCacheList()
        router.push('/')
    }

    /**
     * 重置标签页状态
     * @description 清空标签页和缓存列表
     */
    const reset = () => {
        clearTabList()
        clearCacheList()
    }

    /**
     * 初始化标签页
     * @description 初始化标签页状态，如果没有非固定标签页则重置
     */
    const init = () => {
        if (tabList.value.some((i) => !i?.meta?.affix)) return
        reset()
    }

    /**
     * 重新加载当前页面
     * @description 清除当前页面的缓存并重新加载
     */
    const reloadPage = () => {
        const route = router.currentRoute.value
        if (!route.name) return

        deleteCacheItem(route.name as string)
        reloadFlag.value = false

        nextTick(() => {
            reloadFlag.value = true
            addCacheItem(route)
        })
    }

    return {
        tabList,
        cacheList,
        reloadFlag,
        addTabItem,
        deleteTabItem,
        clearTabList,
        setTabTitle,
        addCacheItem,
        deleteCacheItem,
        clearCacheList,
        closeCurrent,
        closeOther,
        closeRight,
        closeAll,
        reset,
        init,
        reloadPage
    }
}

/**
 * 标签页状态管理 Store
 * @description 创建标签页相关的状态管理 store，使用 sessionStorage 进行持久化存储
 */
export const useTabsStore = defineStore('tabs', storeSetup, {
    persist: { storage: sessionStorage }
})