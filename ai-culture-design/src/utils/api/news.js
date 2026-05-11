import { get } from './request'

export const newsApi = {
  getList(params) {
    return get('/news', { params })
  },
  
  getById(id) {
    return get(`/news/${id}`)
  },
  
  getByCategory(categoryId) {
    return get('/news', { params: { categoryId } })
  },
  
  getHot(limit = 5) {
    return get('/news', { params: { isHot: true, limit } })
  },
  
  getTop(limit = 5) {
    return get('/news', { params: { isTop: true, limit } })
  },
  
  search(keyword) {
    return get('/news', { params: { keyword } })
  }
}
