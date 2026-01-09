// src/apis/user/index.ts
import axios from 'axios'
import type { AccountDTO, MenuItem } from '@/apis/system'

// 导出同级 type.ts 下的所有类型
export type * from './type'

// 2. 创建一个强制走本地 Mock 的请求实例
const mockRequest = axios.create({
  baseURL: '', // 强制走本地，触发 Mock 拦截
  timeout: 10000 
})

// ✅ 新增：响应拦截器
// 作用：自动剥离 axios 的外壳，直接返回后端数据 { success: true, data: ... }
// 这样你的 Store 代码里写 if (res.success) 就不会报错了
mockRequest.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

const MOCK_PREFIX = '/mock/user'

/** 登录 */
// ⚠️ 重点：加 as Promise<any> 是为了告诉 TS "返回的是数据对象，不是 AxiosResponse"
// 这样就解决了 "不存在属性 success" 的报错
export function login(data: { username: string, password: string }) {
  return mockRequest.post(`${MOCK_PREFIX}/login`, data) as Promise<any>
}

/** 退出登录 */
export function logout() {
  return mockRequest.post(`${MOCK_PREFIX}/logout`) as Promise<any>
}

/** 获取用户信息 */
export const getUserInfo = () => {
  return mockRequest.post(`${MOCK_PREFIX}/getUserInfo`) as Promise<any>
}

/** 获取用户路由信息 */
export const getUserRoutes = () => {
  // 这里泛型也可以配合断言使用
  return mockRequest.post<MenuItem[]>(`${MOCK_PREFIX}/getUserRoutes`) as Promise<any>
}

/** 修改密码 **/
export function updatePassword(data: AccountDTO){
  return mockRequest.post(`${MOCK_PREFIX}/updatePassword`, data) as Promise<any>
}