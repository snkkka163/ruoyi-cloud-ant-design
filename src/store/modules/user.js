import storage from 'store'
import { login, getInfo, logout } from '@/api/login'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          const result = response.data
          console.log(result.access_token)
          storage.set(ACCESS_TOKEN, result.access_token, 7 * 24 * 60 * 60 * 1000)
          commit('SET_TOKEN', result.access_token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          console.log(response)
          // const result = response.result
          const result = response
          if (result.roles && result.permissions.length > 0) {
            const user = result.user
            const avatar = user.avatar
            if (result.roles && result.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              commit('SET_ROLES', result.roles)
              // 权限暂时不设置
              // commit('SET_PERMISSIONS', result.permissions)
            } else {
              commit('SET_ROLES', ['ROLE_DEFAULT'])
            }
            // commit('SET_NAME', user.nickName)
            commit('SET_NAME', { name: user.nickName, welcome: welcome() })
            commit('SET_AVATAR', avatar)
            resolve(response)
          }
          // GetInfo一旦失败就说明这个token不是过期就是丢失了,直接走catch并让调用方跳转路由
          if (result.code === 500) {
            reject(result)
          }
        }).catch(error => {
          console.log(error)
          console.log('失败了')
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          storage.remove(ACCESS_TOKEN)
          resolve()
        }).catch(() => {
          resolve()
        }).finally(() => {
        })
      })
    }

  }
}

export default user
