// src/stores/user.ts
/** @file 用户状态管理模块 - 处理用户登录、权限和信息管理 */

import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { resetRouter } from '@/router'
// ✅ 修复: 移除了未使用的 logout as logoutApi
import { type UserInfo, getUserInfo as getUserInfoApi, login as loginApi } from '@/apis/user'
import { clearToken, getToken, setToken } from '@/utils/auth'
import { Message } from '@arco-design/web-vue'

/** 登录参数接口 */
interface LoginParams {
    username: string
    password: string
    code?: string
}

/** 用户 Store 的核心设置逻辑 - 管理用户相关的状态和操作 */
const storeSetup = () => {
    /** 用户基本信息 */
    const userInfo = reactive<Pick<UserInfo, 'nickname' | 'avatar' | 'campusIds' | 'username'>>({
        nickname: '',
        avatar: '',
        campusIds: [],
        username: ''
    })

    /** 用户昵称 */
    const name = computed(() => userInfo.nickname)

    /** 用户头像 */
    const avatar = computed(() => userInfo.avatar)

    /** 用户令牌 */
    const token = ref<string>(getToken() || '')

    /**账号 **/
    const username = ref<string>('')

    /** 重置用户令牌 - 清除令牌并重置路由权限标志 */
    const resetToken = () => {
        token.value = ''
        clearToken()
    }

    /**
     * 用户登录
     * @description 处理用户登录请求并保存令牌
     * @param {LoginParams} params - 登录参数
     * @throws {Error} 当登录失败时抛出错误
     */
    const login = async (params: LoginParams): Promise<void> => {
        try {
            // 这里 await loginApi(params) 返回的是 any (经过 API 层处理后的数据对象)
            const res = await loginApi(params)
            
            // 验证后端返回的 success 字段
            if(!res.success) {
                Message.error(res.message || '账号密码错误，请重试！')
                return
            }
            
            // 解构 token
            const { token: newToken } = res.data
            setToken(newToken)
            token.value = newToken
            Message.success('登录成功!')
        } catch (error) {
            console.error('登录失败:', error)
            throw error
        }
    }

    /**
     * 用户退出
     * @description 处理用户退出请求并清除状态
     * @returns {Promise<boolean>} 退出是否成功
     */
    const logout = async (): Promise<boolean> => {
        try {
            // 如果以后需要调用后端退出接口，可以直接用 mockRequest.post('/logout')
            // 目前仅前端清除状态
            token.value = ''
            resetToken()
            resetRouter()
            return true
        } catch (error) {
            console.error('退出失败:', error)
            return false
        }
    }

    /**
     * 获取用户信息
     * @description 获取用户详细信息，包括角色和权限
     * @throws {Error} 当获取用户信息失败时抛出错误
     */
    const getInfo = async (): Promise<void> => {
        try {
            const res = await getUserInfoApi()
            console.log('用户信息:', res)
            
            // 根据你的 Mock 数据结构绑定信息
            // 假设 res.data 包含这些字段
            if (res.success && res.data) {
                const data = res.data
                userInfo.nickname = data.username || 'Admin'
                userInfo.avatar = data.avatar || ''
                // 其他字段按需赋值...
            }
        } catch (error) {
            console.error('获取用户信息失败:', error)
            throw error
        }
    }

    /**
     * 更新令牌（仅用于开发测试）
     * @description 用于模拟令牌过期场景
     * @param {string} value - 新的令牌值
     */
    const editToken = (value: string): void => {
        token.value = value
        setToken(value)
    }

    return {
        userInfo,
        name,
        avatar,
        token,
        username,
        login,
        logout,
        getInfo,
        resetToken,
        editToken
    }
}

/**
 * 用户状态管理 Store
 * @description 创建用户相关的状态管理 store，使用 localStorage 进行持久化存储
 */
export const useUserStore = defineStore('user', storeSetup, {
    persist: {
        key: 'user-store', // 建议加上 key
        storage: localStorage,
        // ✅ 修复: pinia-plugin-persistedstate v4 使用 `pick` 而不是 `paths`
        pick: ['token'] 
    }
})