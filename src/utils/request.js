import axios from 'axios'
import store from '@/store'
// import storage from 'store'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
// import { ACCESS_TOKEN } from '@/store/mutation-types'
import { tansParams } from '@/utils/ruoyi'
// import errorCode from '@/utils/errorCode'
// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  // baseURL: process.env.VUE_APP_API_BASE_URL,
  baseURL: '/api',
  timeout: 6000 // 请求超时时间
})

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    // 从 localstorage 获取 token
    const token = localStorage.getItem('token')
    // const token = storage.get(ACCESS_TOKEN)
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
      if (token) {
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        })
      }
    }
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  // const token = storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    // config.headers['Access-Token'] = token
    config.headers['Authorization'] = 'Bearer ' + token
  }
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?'
    for (const propName of Object.keys(config.params)) {
      const value = config.params[propName]
      var part = encodeURIComponent(propName) + '='
      if (value !== null && typeof (value) !== 'undefined') {
        if (typeof value === 'object') {
          for (const key of Object.keys(value)) {
            const params = propName + '[' + key + ']'
            var subPart = encodeURIComponent(params) + '='
            url += subPart + encodeURIComponent(value[key]) + '&'
          }
        } else {
          url += part + encodeURIComponent(value) + '&'
        }
      }
    }
    url = url.slice(0, -1)
    config.params = {}
    config.url = url
  }
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  return response.data
}, errorHandler)

// response interceptor
// request.interceptors.response.use((res) => {
//   // 未设置状态码则默认成功状态
//   const code = res.data.code || 200
//   // 获取错误信息
//   const msg = errorCode[code] || res.data.msg || errorCode['default']
//   if (code === 401) {
//     notification.open({
//       message: '系统提示',
//       description: '登录状态已过期，您可以继续留在该页面，或者重新登录',
//       btn: h => {
//         return h(
//           'a-button',
//           {
//             props: {
//               type: 'primary',
//               size: 'small'
//             },
//             on: {
//               click: () => {
//                 store.dispatch('Logout').then(() => {
//                   location.href = '/index'
//                 })
//               }
//             }
//           },
//           '确认'
//         )
//       },
//       duration: 0,
//       onClose: close
//     })
//   } else if (code === 500) {
//     notification.error({
//       message: msg,
//       description: msg
//     })
//   } else if (code !== 200) {
//     notification.error({
//       message: msg
//     })
//   } else {
//     return res.data
//   }
//   return Promise.reject(msg)
// }, errorHandler)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}

// 通用下载方法
export function download (url, params, filename) {
  return request.post(url, params, {
    transformRequest: [(params) => {
      return tansParams(params)
    }],
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    responseType: 'blob'
  }).then((data) => {
    const content = data
    const blob = new Blob([content])
    if ('download' in document.createElement('a')) {
      const elink = document.createElement('a')
      elink.download = filename
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href)
      document.body.removeChild(elink)
    } else {
      navigator.msSaveBlob(blob, filename)
    }
  }).catch((r) => {
    console.error(r)
  })
}
