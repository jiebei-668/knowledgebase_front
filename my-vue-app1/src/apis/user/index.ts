import type * as T from './type'
import http from '@/utils/http'
import type { AccountDTO, MenuItem } from '@/apis/system'

export type * from './type'

/** 登录 */
export function login(data: { username: string, password: string }) {
  return http.post('/user/login', data)
}

/** 退出登录 */
export function logout() {
  return http.post('/user/logout')
}

/** 获取用户信息 */
export const getUserInfo = () => {
  return http.get('/user/getUserInfo')
}

/** 获取用户路由信息 */
export const getUserRoutes = () => {
  return http.get<MenuItem[]>('/user/getUserRoutes')
}
/** 修改密码 **/
export function updatePassword(data: AccountDTO){
  return http.post('/user/updatePassword', data)
}
