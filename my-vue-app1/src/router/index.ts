// src/router/index.ts

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import createRouteGuard from "@/router/guard";
import {useRouteStore} from "@/stores";

/** 默认布局组件 */
const Layout = () => import('@/layout/index.vue')

/** 基础路由配置 */
const baseRoutes: RouteRecordRaw[] = [
    {
        path: '/redirect',
        component: Layout,
        meta: { hidden: true },
        children: [
            {
                path: '/redirect/:path(.*)',
                component: () => import('@/views/redirect/index.vue')
            }
        ]
    },
    {
        path: '/login',
        component: () => import('@/views/login/index.vue'),
        meta: { hidden: true }
    },
    {
        path: '/bye',
        component: () => import('@/components/Bye.vue'),
        meta: { hidden: true }
    }
]
const homeRoute: RouteRecordRaw = {
    // 主页路由

    path: '/',
    name: 'Home',
    component: () => import('../layout/index.vue'),
    redirect: '/home',
    children: [
        {
            path: '/home',
            component: () => import('../components/Hello.vue'),
            name: 'HomeIndex',
            meta: {
                title: '首页',
                icon: 'icon-dashboard',
                svgIcon: 'menu-home',
                affix: true,
                hidden: false,
                breadcrumb: false
            }
        },
        {
            path: '/hello',
            name: 'Hello',
            component: () => import('../components/Hello.vue'),
        },
    ],


}

/** 错误页面路由配置 */
const errorRoutes: RouteRecordRaw[] = [
    // {
    //   path: '/:pathMatch(.*)*',
    //   component: () => import('@/views/error/404.vue'),
    //   meta: { hidden: true }
    // },
    // {
    //   path: '/403',
    //   component: () => import('@/views/error/403.vue'),
    //   meta: { hidden: true }
    // }
]


const labRoute: RouteRecordRaw = {
    path: '/lab',
    name: 'Lab',
    component: () => import('@/layout/index.vue'),
    redirect: '/lab/test',
    meta: {
        title: '实验室',
        icon: 'icon-experiment',
        svgIcon: 'menu-lab', // 如果你有对应的SVG图标
        hidden: false,
    },
    children: [
        {
            path: '/lab/test',
            name: 'LabTest',
            component: () => import('@/components/Bye.vue'), // 确保这个文件存在
            meta: {
                title: '实验测试',
                icon: 'icon-bulb',
                hidden: false,
            }
        }
    ]
}

/** 静态路由配置 */
export const constantRoutes: RouteRecordRaw[] = [...baseRoutes, ...errorRoutes, homeRoute, labRoute]
// 创建路由器实例
const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: constantRoutes,
    scrollBehavior: () => ({ left: 0, top: 0 }),
})

// 创建路由守卫
createRouteGuard(router)

/** 重置路由配置 - 清除所有动态添加的路由 */
export function resetRouter(): void {
    try {
        const routeStore = useRouteStore()
        // 移除所有动态路由
        routeStore.asyncRoutes.forEach((route) => {
            const { name } = route
            if (name && router.hasRoute(name)) {
                router.removeRoute(name)
            }
        })
    } catch (error) {
        console.error('重置路由失败:', error)
        // 降级处理：刷新页面以重置路由状态
        window.location.reload()
    }
}

export default router
