// mock/user.ts
import { MockMethod } from 'vite-plugin-mock'

export default [
    // 1. 模拟登录接口
    {
        url: '/mock/user/login', // ⚠️ 请确认这里与你的 src/apis/user.ts 中的 url 一致
        method: 'post',
        response: ({ body }) => {
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
                    message: '账号或密码错误（尝试 admin/123456）'
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
    }


] as MockMethod[]