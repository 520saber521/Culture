import { get } from './request'

export const heritageApi = {
  getList(params) {
    return get('/heritage/list', params)
  },

  getById(id) {
    return get(`/heritage/detail/${id}`)
  },

  getByCategory(category) {
    return get('/heritage/list', { category })
  },

  getByCity(cityId) {
    return get('/heritage/list', { cityId })
  },

  search(keyword) {
    return get('/heritage/list', { keyword })
  },

  getHot(limit = 6) {
    return get('/heritage/list', { isHot: true, pageSize: limit })
  }
}
