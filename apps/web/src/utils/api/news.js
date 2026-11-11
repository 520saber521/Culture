import { get } from './request'

export const newsApi = {
  getList(params) {
    return get('/news/list', params)
  },

  getById(id) {
    return get(`/news/detail/${id}`)
  },

  getByCategory(categoryId) {
    return get('/news/list', { categoryId })
  },

  getHot(limit = 5) {
    return get('/news/list', { isHot: true, pageSize: limit })
  },

  getTop(limit = 5) {
    return get('/news/list', { isTop: true, pageSize: limit })
  },

  search(keyword) {
    return get('/news/list', { keyword })
  }
}
