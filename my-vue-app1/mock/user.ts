// mock/user.ts
import { MockMethod } from 'vite-plugin-mock'

export default [
    // 1. 模拟登录接口
    {
        url: '/mock/user/login',
        method: 'post',
        // ❌ 修改前: response: ({ body }) => {
        // ✅ 修改后: 显式声明 body 的类型 (最简单的办法是给个 any)
        response: ({ body }: { body: any }) => {
            // 简单模拟验证逻辑
            const { username, password } = body
            if (username === 'admin' && password === 'admin') {
                return {
                    success: true,
                    code: 200,
                    data: {
                        token: 'mock-token-admin-12345', // 返回假的 token
                    },
                    message: '登录成功'
                }
            } else {
                return {
                    success: false,
                    code: 401,
                    data: null,
                    message: '账号或密码错误（尝试 admin/admin）'
                }
            }
        },
    },
    {
        url: '/mock/user/getUserInfo',
        method: 'post',
        response: () => {
            return {
                success: true,
                code: 200,
                data: {
                    username: 'admin',
                    roles: ['admin'],
                    permissions: ['read', 'write', 'delete'],
                },
                message: '获取用户信息成功'
            }
        }
    },
    {
        url: '/mock/user/getUserRoutes',
        method: 'post',
        response: () => {
            return {
                success: true,
                code: 200,
                message: 'ok',
                data: [
                    {
                        id: '1',
                        parentId: '0',
                        path: '/system',
                        component: 'Layout',
                        title: '系统管理',
                        icon: 'icon-settings',
                        sort: 1,
                        hidden: false,
                        children: [
                            {
                                id: '2',
                                parentId: '1',
                                path: '/system/user',
                                component: 'system/user/index',
                                title: '用户管理',
                                icon: 'icon-user',
                                sort: 1,
                                hidden: false
                            }
                        ]
                    },
                    {
                        id: '3',
                        parentId: '0',
                        path: '/news',
                        component: 'Layout',
                        title: '信息发布',
                        icon: 'icon-send',
                        sort: 2,
                        hidden: false,
                        children: [
                            {
                                id: '4',
                                parentId: '3',
                                path: '/newsRelease/edit',
                                component: 'news/edit',
                                title: '编辑发布',
                                icon: 'icon-edit',
                                sort: 1,
                                hidden: false
                            }
                        ]
                    }
                ]
            }
        }
    }
] as MockMethod[]