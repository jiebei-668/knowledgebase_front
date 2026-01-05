/** 系统部门类型 */
export interface DeptItem {
  id: string
  name: string
  sort: number
  status: Status
  createTime: string
  parentId: string
  children?: DeptItem[]
  description: string
}

/** 系统角色类型 */
export interface RoleItem {
  id: string
  createUserString: string
  createTime: string
  disabled: boolean
  name: string
  code: string
  sort: number
  status: Status
  type: number
  description: string
}

/** 系统用户类型 */
export interface UserItem {
  id: string
  createUserString: string
  createTime: string
  disabled: boolean
  deptId: string
  deptName: string
  username: string
  nickname: string
  gender: Gender
  avatar: string
  email: string
  phone: string
  status: Status
  type: 1 | 2
  description: string
}

export type UserDetail = UserItem & { roleNames: string }

/** 系统菜单类型 */
export interface MenuItem {
  activeMenu: string
  alwaysShow: boolean
  breadcrumb: boolean
  children: MenuItem[]
  component: string
  hidden: boolean
  icon: string
  id: string
  keepAlive: boolean
  parentId: string
  path: string
  permission: string
  redirect: string
  roles: string[]
  showInTabs: boolean
  sort: number
  status: Status
  svgIcon: string
  title: string
  type: 1 | 2
  affix: boolean
}

export interface MenuOptionsItem {
  id: string
  title: string
  children: MenuOptionsItem[]
}

export interface SystemDictItem {
  id: string
  createUserString: string
  createTime: string
  name: string
  code: string
  sort: number
  status: Status
  description: string
}

export type DictDetail = SystemDictItem

export type DictDataItem = {
  id: string
  name: string
  value: string | number
  status: Status
}
// 账号dto
export interface AccountDTO{
  username: string | null,
  password: string | null,
}

/** 首页统计数据参数**/
export interface AnalysisParamDTO{
  campusId: number | null;
  semesterId: number | null;
}
export interface AnalysisDTO{
  inFee: number | null;
  classNum: number | null;
  full: number | null;
  notFull: number | null;
  teacherNum: number | null;
  studentNum: number | null;
  newStudent: number | null;
  oldStudent: number | null;
  staffNum: number | null;
  fiftyNum: number | null;
  sixtyNum: number | null;
  seventyNum: number | null;
  eightyNum: number | null;
  manNum: number | null;
  womenNum: number | null;
  fullNotFull: string | null;
  newNotNew: string | null;
}