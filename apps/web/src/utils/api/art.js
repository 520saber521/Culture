import { get } from './request'

export const artApi = {
  getList(params) {
    return get('/traditional-arts/list', params)
  },

  getById(id) {
    return get(`/traditional-arts/detail/${id}`)
  },

  getByCategory(category) {
    return get('/traditional-arts/list', { category })
  },

  getByCity(cityId) {
    return get('/traditional-arts/list', { cityId })
  },

  search(keyword) {
    return get('/traditional-arts/list', { keyword })
  },

  getHot(limit = 6) {
    return get('/traditional-arts/list', { isHot: true, pageSize: limit })
  }
}
