import request from '@/utils/request'

const api = {
  list: '/system/user/list',
  profile: '/system/user/profile',
  updatePwd: '/system/user/profile/updatePwd'
}

export default api

export function getUserList (parameter) {
  return request({
    url: api.list,
    method: 'get',
    params: parameter
  })
}

export function profile (parameter) {
  return request({
    url: api.profile,
    method: 'put',
    data: parameter
  })
}

export function updatePwd (parameter) {
  return request({
    url: api.updatePwd,
    method: 'put',
    params: parameter
  })
}
