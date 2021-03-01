// eslint-disable-next-line
import * as loginService from '@/api/login'
// eslint-disable-next-line
import { BasicLayout, BlankLayout, PageView, RouteView } from '@/layouts'
import { DEFAULT_ROUTE_PATH } from '@/store/mutation-types'
import all from '@/core/icons'
import { validURL } from '@/utils/validate'
// 前端路由表
const constantRouterComponents = {
  // 基础页面 layout 必须引入
  BasicLayout: BasicLayout,
  BlankLayout: BlankLayout,
  RouteView: RouteView,
  PageView: PageView,
  '403': () => import(/* webpackChunkName: "error" */ '@/views/exception/403'),
  '404': () => import(/* webpackChunkName: "error" */ '@/views/exception/404'),
  '500': () => import(/* webpackChunkName: "error" */ '@/views/exception/500'),

  // 你需要动态引入的页面组件
  'Workplace': () => import('@/views/dashboard/Workplace'),
  'Analysis': () => import('@/views/dashboard/Analysis'),

  // list
  // 'TableList': () => import('@/views/list/TableList'),
  // 'StandardList': () => import('@/views/list/BasicList'),
  // 'CardList': () => import('@/views/list/CardList'),
  // 'SearchLayout': () => import('@/views/list/search/SearchLayout'),
  // 'SearchArticles': () => import('@/views/list/search/Article'),
  // 'SearchProjects': () => import('@/views/list/search/Projects'),
  // 'SearchApplications': () => import('@/views/list/search/Applications'),
  // 'ProfileBasic': () => import('@/views/profile/basic'),
  // 'ProfileAdvanced': () => import('@/views/profile/advanced/Advanced'),

  // // result
  // 'ResultSuccess': () => import(/* webpackChunkName: "result" */ '@/views/result/Success'),
  // 'ResultFail': () => import(/* webpackChunkName: "result" */ '@/views/result/Error'),

  // exception
  'Exception403': () => import(/* webpackChunkName: "fail" */ '@/views/exception/403'),
  'Exception404': () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
  'Exception500': () => import(/* webpackChunkName: "fail" */ '@/views/exception/500'),

  // account
  'AccountCenter': () => import('@/views/account/center'),
  'AccountSettings': () => import('@/views/account/settings/Index'),
  'BaseSettings': () => import('@/views/account/settings/BaseSetting'),
  'SecuritySettings': () => import('@/views/account/settings/Security'),
  'CustomSettings': () => import('@/views/account/settings/Custom'),
  'BindingSettings': () => import('@/views/account/settings/Binding'),
  'NotificationSettings': () => import('@/views/account/settings/Notification')

  // 'TestWork': () => import(/* webpackChunkName: "TestWork" */ '@/views/dashboard/TestWork')
}

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
  path: '*', redirect: '/404', hidden: true
}

// // 根级菜单
// const rootRouter = {
//   key: '',
//   name: 'index',
//   path: '',
//   component: 'BasicLayout',
//   redirect: '/dashboard',
//   meta: {
//     title: '首页'
//   },
//   children: []
// }
// 根级菜单
const rootRouter = {
  key: '',
  name: 'index',
  path: '/',
  component: 'BasicLayout',
  redirect: DEFAULT_ROUTE_PATH,
  meta: {
    title: '首页'
  },
  children: []
}

/**
 * 动态生成菜单
 * @param token
 * @returns {Promise<Router>}
 */
export const generatorDynamicRouter = (token) => {
  return new Promise((resolve, reject) => {
    loginService.getCurrentUserNav(token).then(res => {
      // const { result } = res
      const menuNav = []
      // const childrenNav = res.data
      const resList = res.data
      // 设置默认页
      const childrenNav = [{
        path: DEFAULT_ROUTE_PATH,
        name: 'WorkPlace',
        component: 'dashboard/Workplace',
        meta: { title: '工作台', keepAlive: true, icon: all['dashboard' + 'Icon'] }
      }]
      rootRouter.children = childrenNav.concat(resList)
      menuNav.push(rootRouter)
      const routers = generator(menuNav)
      routers.push(notFoundRouter)
      resolve(routers)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 格式化树形结构数据 生成 vue-router 层级路由表
 *
 * @param routerMap
 * @param parent
 * @returns {*}
 */
export const generator = (routerMap, parent) => {
  // console.log('hola hola', routerMap)
  // console.log('格式化树形结构数据 生成 vue-router 层级路由表')
  return routerMap.map(item => {
    const { title, show, hideChildren, hiddenHeaderContent, icon, hidden } = item.meta || {}
    if (item.component) {
      // Layout ParentView 组件特殊处理
      if (item.component === 'Layout') {
        item.component = 'RouteView'
      } else if (item.component === 'ParentView') {
        item.component = 'RouteView'
        item.path = '/' + item.path
      }
    }
    if (item.isFrame === 0) {
      item.target = '_blank'
    }
    // console.log(item)

    const currentRouter = {

      // 如果路由设置了 path，则作为默认 path，否则 路由地址 动态拼接生成如 /dashboard/workplace
      path: item.path || `${parent && parent.path || ''}/${item.key}`,
      // 路由名称，建议唯一
      // name: item.name || item.key || '',
      name: item.name || item.key || '',
      // 该路由对应页面的 组件 :方案1
      // 该路由对应页面的 组件 :方案2 (动态加载)
      component: (constantRouterComponents[item.component || item.key]) || (() => import(`@/views/${item.component}`)),
      hidden: item.hidden,
      // redirect: '/' + item.path || `${parent && parent.path || ''}/${item.key}`,
      // meta: 页面标题, 菜单图标, 页面权限(供指令权限用，可去掉)
      meta: {
        title: title,
        icon: all[String(icon).replace('-', '') + 'Icon'] || icon,
        hiddenHeaderContent: hiddenHeaderContent,
        target: validURL(item.path) ? '_blank' : '',
        permission: item.name,
        keepAlive: true,
        hidden: hidden
      }
    }
    // 是否设置了隐藏菜单
    if (show === false) {
      currentRouter.hidden = true
    }
    // 适配若依，若依为缩写路径，而antdv-pro的pro-layout要求每个路径需为全路径
    if (!constantRouterComponents[item.component || item.key]) {
      currentRouter.path = `${parent && parent.path || ''}/${item.path}`
    }
    // 是否设置了隐藏子菜单
    if (hideChildren) {
      currentRouter.hideChildrenInMenu = true
    }
    // 为了防止出现后端返回结果不规范，处理有可能出现拼接出两个 反斜杠
    // 重定向
    item.redirect && (currentRouter.redirect = item.redirect)
    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      // Recursion
      currentRouter.children = generator(item.children, currentRouter)
    }
    return currentRouter
  })
}

/**
 * 数组转树形结构
 * @param list 源数组
 * @param tree 树
 * @param parentId 父ID
 */
// const listToTree = (list, tree, parentId) => {
//   list.forEach(item => {
//     // 判断是否为父级菜单
//     if (item.parentId === parentId) {
//       const child = {
//         ...item,
//         key: item.key || item.name,
//         children: []
//       }
//       // 迭代 list， 找到当前菜单相符合的所有子菜单
//       listToTree(list, child.children, item.id)
//       // 删掉不存在 children 值的属性
//       if (child.children.length <= 0) {
//         delete child.children
//       }
//       // 加入到树中
//       tree.push(child)
//     }
//   })
// }
