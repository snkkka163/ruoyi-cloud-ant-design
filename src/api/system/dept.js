import request from '@/utils/request'

const api = {
  treeselect: '/system/dept/treeselect'
}

export default api

export function getTreeSelect () {
  return request({
    url: api.treeselect,
    method: 'get'
  })
}
