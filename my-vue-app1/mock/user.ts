// mock/user.ts
import { MockMethod } from 'vite-plugin-mock'

export default [
  // 1. 模拟登录接口
  {
    url: '/mock/user/login',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const { username, password } = body
      if (username === 'admin' && password === 'admin') {
        return {
          success: true,
          code: 200,
          data: {
            token: 'mock-token-admin-12345',
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
  // 2. 获取用户信息
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
  // 3. 获取动态路由菜单 (这里我们增加了 Chat 页面！)
  {
    url: '/mock/user/getUserRoutes',
    method: 'post',
    response: () => {
      return {
        success: true,
        code: 200,
        message: 'ok',
        data: [
          // --- 新增：ToG 对话页面菜单 ---
          {
            id: '100',
            parentId: '0',
            path: '/chat',           // 路由路径
            component: 'chat/index', // 对应 src/views/chat/index.vue
            title: '知识问答',        // 菜单名称
            icon: 'icon-message',    // 图标 (假设系统有这个图标)
            sort: 0,                 // 排在最前面
            hidden: false
          },
          // ---------------------------
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