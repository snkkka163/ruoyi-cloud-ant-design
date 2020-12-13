import request from '@/utils/request'

const api = {
  list: '/system/user/list'
}

export default api

export function getUserList (parameter) {
  return request({
    url: api.list,
    method: 'get',
    params: parameter
  })
}
