// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout, RouteView } from '@/layouts'
// import { bxAnaalyse } from '@/core/icons'

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
          component: () => import('@/views/system/User'),
          meta: { title: '用户管理', keepAlive: false }
        }
        // {
        //   path: '/system/role',
        //   name: 'Role',
        //   component: () => import('@/views/permission/RoleList'),
        //   meta: { title: '角色管理', keepAlive: false }
        // },
        // {
        //   path: '/system/resource',
        //   name: 'Resource',
        //   component: () => import('@/views/permission/ResourceList'),
        //   meta: { title: '资源管理', keepAlive: false }
        // }
      ]
    }]
  },
  {
    path: '*', redirect: '/404', hidden: true
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
