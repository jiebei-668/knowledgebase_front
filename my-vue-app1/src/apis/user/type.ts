export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  roles: string[]
  permissions: string[]
  campusIds: number[]
  username: string
}

export interface Login {
  token: string
}
