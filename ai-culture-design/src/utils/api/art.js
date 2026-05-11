import { get } from './request'

export const artApi = {
  getList(params) {
    return get('/art', { params })
  },
  
  getById(id) {
    return get(`/art/${id}`)
  },
  
  getByCategory(category) {
    return get('/art', { params: { category } })
  },
  
  getByCity(cityId) {
    return get('/art', { params: { cityId } })
  },
  
  search(keyword) {
    return get('/art', { params: { keyword } })
  },
  
  getHot(limit = 6) {
    return get('/art', { params: { isHot: true, limit } })
  }
}
