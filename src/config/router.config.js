// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout, RouteView } from '@/layouts'

// const RouteView = {
//   name: 'RouteView',
//   render: (h) => h('router-view')
// }

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect: '/dashboard/workplace',
    children: [{
      path: '/dashboard/workplace',
      name: 'WorkPlace',
      component: () => import('@/views/dashboard/Workplace'),
      meta: { title: '工作台', keepAlive: false, icon: 'dashboard' }
    }, {
      path: '/system',
      name: 'system',
      redirect: '/system/user',
      component: RouteView,
      meta: { title: '系统管理', keepAlive: true, icon: 'control' },
      children: [
        {
          path: '/system/user',
          name: 'User',
          component: () => import('@/views/system/user'),
          meta: { title: '用户管理', keepAlive: false }
        },
        {
          path: '/system/role',
          name: 'Role',
          component: () => import('@/views/system/role'),
          meta: { title: '角色管理', keepAlive: true }
        }
        // {
        //   path: '/system/menu',
        //   name: 'Menu',
        //   component: () => import('@/views/system/menu'),
        //   meta: { title: '菜单管理', keepAlive: false }
        // }
      ]
    },
  // account
  {
    path: '/account',
    component: RouteView,
    redirect: '/account/center',
    name: 'account',
    meta: { title: '个人页', icon: 'user', keepAlive: true, permission: [ 'user' ] },
    children: [
      {
        path: '/account/center',
        name: 'center',
        component: () => import('@/views/account/center'),
        meta: { title: '个人中心', keepAlive: true, permission: [ 'user' ] }
      },
      {
        path: '/account/settings',
        name: 'settings',
        component: () => import('@/views/account/settings/Index'),
        meta: { title: '个人设置', hideHeader: true, permission: [ 'user' ] },
        redirect: '/account/settings/base',
        hideChildrenInMenu: true,
        children: [
          {
            path: '/account/settings/base',
            name: 'BaseSettings',
            component: () => import('@/views/account/settings/BaseSetting'),
            meta: { title: '基本设置', hidden: true, permission: [ 'user' ] }
          },
          {
            path: '/account/settings/security',
            name: 'SecuritySettings',
            component: () => import('@/views/account/settings/Security'),
            meta: { title: '安全设置', hidden: true, keepAlive: true, permission: [ 'user' ] }
          },
          {
            path: '/account/settings/custom',
            name: 'CustomSettings',
            component: () => import('@/views/account/settings/Custom'),
            meta: { title: '个性化设置', hidden: true, keepAlive: true, permission: [ 'user' ] }
          },
          {
            path: '/account/settings/binding',
            name: 'BindingSettings',
            component: () => import('@/views/account/settings/Binding'),
            meta: { title: '账户绑定', hidden: true, keepAlive: true, permission: [ 'user' ] }
          },
          {
            path: '/account/settings/notification',
            name: 'NotificationSettings',
            component: () => import('@/views/account/settings/Notification'),
            meta: { title: '新消息通知', hidden: true, keepAlive: true, permission: [ 'user' ] }
          }
        ]
      }
    ]
  },
    // 任务日志
    {
      path: '/job',
      name: 'job',
      redirect: '/monitor/job',
      component: RouteView,
      meta: { title: '定时任务', keepAlive: true, icon: 'control' },
      children: [{
        path: '/job/log',
        name: 'JobLog',
        component: () => import('@/views/monitor/job/log'),
        meta: { title: '调度日志', keepAlive: true },
        hidden: true
      }]
    },
    {
      path: '/dict',
      name: 'dict',
      redirect: '/system/dict',
      component: RouteView,
      meta: { title: '字典管理', keepAlive: true, icon: 'control' },
      children: [{
        path: 'type/data/:dictId(\\d+)',
        name: 'Data',
        component: () => import('@/views/system/dict/data'),
        meta: { title: '字典子项' },
        hidden: true
      }]
    },
    {
      path: '/gen',
      name: 'gen',
      redirect: '/tool/gen',
      component: RouteView,
      meta: { title: '代码生成', keepAlive: true, icon: 'control' },
      children: [{
        path: 'edit/:tableId(\\d+)',
        name: 'GenEdit',
        component: () => import('@/views/tool/gen/modules/GenEdit'),
        meta: { title: '数据表编辑' },
        hidden: true
      }]
    }]
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
