// import storage from 'store'
import { login, getInfo, logout } from '@/api/login'
// import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

const user = {
  state: {
    userId: 0,
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
    email: '',
    phonenumber: '',
    sex: 0,
    permissions: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      // localStorage.setItem('token', token)
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
    },
    SET_SEX: (state, sex) => {
      state.sex = sex
    },
    SET_EMAIL: (state, email) => {
      state.email = email
    },
    SET_PHONE: (state, phonenumber) => {
      state.phonenumber = phonenumber
    },
    SET_USER_ID: (state, userId) => {
      state.userId = userId
    },
    SET_PERMISSION: (state, permissions) => {
      state.permissions = permissions
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          // 保证登录成功以后才来获取token
          if (response.code === 200) {
            const result = response.data
            localStorage.setItem('token', result.access_token)
          }
          // storage.set(ACCESS_TOKEN, result.access_token, 7 * 24 * 60 * 60 * 1000)
          // localStorage.setItem('token', result.access_token)
          // commit('SET_TOKEN', result.access_token)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          // const result = response.result
          const result = response
          if (result.roles && result.permissions.length > 0) {
            const user = result.user
            const avatar = user.avatar
            if (result.roles && result.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              commit('SET_ROLES', result.roles)
              commit('SET_PERMISSION', result.permissions)
            } else {
              commit('SET_ROLES', ['ROLE_DEFAULT'])
            }
            // commit('SET_NAME', user.nickName)
            commit('SET_NAME', { name: user.nickName, welcome: welcome() })
            commit('SET_AVATAR', avatar)
            commit('SET_SEX', user.sex)
            commit('SET_EMAIL', user.email)
            commit('SET_PHONE', user.phonenumber)
            commit('SET_USER_ID', user.userId)
            resolve(response)
          }
          // GetInfo一旦失败就说明这个token不是过期就是丢失了,直接走catch并让调用方跳转路由
          if (result.code === 500) {
            reject(result)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSION', [])
          // storage.remove(ACCESS_TOKEN)
          localStorage.removeItem('token')
          resolve()
        }).catch((error) => {
          reject(error)
        }).finally(() => {
        })
      })
    }

  }
}

export default user
