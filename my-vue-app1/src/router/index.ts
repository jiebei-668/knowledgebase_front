// src/router/index.ts

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import createRouteGuard from "@/router/guard";
import { useRouteStore } from "@/stores";

/** 默认布局组件 (带有侧边栏和顶部的框架) */
const Layout = () => import('@/layout/index.vue')

/** 基础路由配置 (登录、重定向等) */
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

// === 主业务路由配置 ===
const homeRoute: RouteRecordRaw = {
    path: '/',
    name: 'Home',
    component: Layout, // 使用布局外壳
    redirect: '/chat', // ✅ 修改 1：默认跳转到你的运维聊天界面
    children: [
        {
            // ✅ 修改 2：配置运维聊天界面
            path: '/chat',
            name: 'OpsChat', // 给路由起个名字，叫运维对话
            // ⚠️ 指向你存放文件的位置
            component: () => import('@/views/chat/index.vue'),
            meta: {
                title: '智能运维助手',  // ✅ 菜单栏显示的文字
                icon: 'icon-robot',    // ✅ 图标改为机器人，符合运维场景
                svgIcon: 'menu-chat',  
                affix: true,           // 固定在标签页
                hidden: false          // 显示在侧边栏
            }
        },
        {
            // 旧首页 (保留作为备用，可以随时切回去)
            path: '/home',
            name: 'HomeIndex',
            component: () => import('@/components/Hello.vue'),
            meta: {
                title: '系统概览',     // 改个名字区别一下
                icon: 'icon-dashboard',
                hidden: false
            }
        },
        {
            path: '/hello',
            name: 'Hello',
            component: () => import('@/components/Hello.vue'),
            meta: { hidden: true }
        },
    ],
}

/** 错误页面路由配置 */
const errorRoutes: RouteRecordRaw[] = []

/** 实验室路由 (保持不变) */
const labRoute: RouteRecordRaw = {
    path: '/lab',
    name: 'Lab',
    component: Layout,
    redirect: '/lab/test',
    meta: {
        title: '实验室',
        icon: 'icon-experiment',
        svgIcon: 'menu-lab',
        hidden: false,
    },
    children: [
        {
            path: '/lab/test',
            name: 'LabTest',
            component: () => import('@/components/Bye.vue'),
            meta: {
                title: '实验测试',
                icon: 'icon-bulb',
                hidden: false,
            }
        }
    ]
}

/** 汇总所有路由 */
export const constantRoutes: RouteRecordRaw[] = [...baseRoutes, ...errorRoutes, homeRoute, labRoute]

// 创建路由器实例
const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: constantRoutes,
    scrollBehavior: () => ({ left: 0, top: 0 }),
})

// 创建路由守卫
createRouteGuard(router)

/** 重置路由工具函数 */
export function resetRouter(): void {
    try {
        const routeStore = useRouteStore()
        routeStore.asyncRoutes.forEach((route) => {
            const { name } = route
            if (name && router.hasRoute(name)) {
                router.removeRoute(name)
            }
        })
    } catch (error) {
        console.error('重置路由失败:', error)
        window.location.reload()
    }
}

export default router