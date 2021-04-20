import { constantRouterMap } from '@/config/router.config'
import { getRouters } from '@/api/menu'
/**
 * 过滤账户是否拥有某一个权限，并将菜单从加载列表移除
 *
 * @param permission
 * @param route
 * @returns {boolean}
 */
// function hasPermission (permission, route) {
//   if (route.meta && route.meta.permission) {
//     let flag = false
//     for (let i = 0, len = permission.length; i < len; i++) {
//       flag = route.meta.permission.includes(permission[i])
//       if (flag) {
//         return true
//       }
//     }
//     return false
//   }
//   return true
// }

/**
 * 单账户多角色时，使用该方法可过滤角色不存在的菜单
 *
 * @param roles
 * @param route
 * @returns {*}
 */
// eslint-disable-next-line
function hasRole(roles, route) {
  if (route.meta && route.meta.roles) {
    return route.meta.roles.includes(roles.id)
  } else {
    return true
  }
}

function filterAsyncRouter (routerMap) {
  // const accessedRouters = routerMap.filter(route => {
  //   if (hasPermission(roles.permissionList, route)) {
  //     if (route.children && route.children.length) {
  //       route.children = filterAsyncRouter(route.children, roles)
  //     }
  //     return true
  //   }
  //   return false
  // })
  // return accessedRouters
  return routerMap.filter(route => {
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    return true
  })
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    // GenerateRoutes ({ commit }, data) {
    //   return new Promise(resolve => {
    //     const { roles } = data
    //     const accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
    //     commit('SET_ROUTERS', accessedRouters)
    //     resolve()
    //   })
    // }
    // 生成路由
    GenerateRoutes ({ commit }) {
      return new Promise(resolve => {
        // 向后端请求路由数据
        getRouters().then(res => {
          const accessedRoutes = filterAsyncRouter(res.data)
          accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
          commit('SET_ROUTERS', accessedRoutes)
          resolve(accessedRoutes)
        })
      })
    }
  }
}

export default permission
