import { get } from './request'

export const heritageApi = {
  getList(params) {
    return get('/heritage', { params })
  },
  
  getById(id) {
    return get(`/heritage/${id}`)
  },
  
  getByCategory(category) {
    return get('/heritage', { params: { category } })
  },
  
  getByCity(cityId) {
    return get('/heritage', { params: { cityId } })
  },
  
  search(keyword) {
    return get('/heritage', { params: { keyword } })
  },
  
  getHot(limit = 6) {
    return get('/heritage', { params: { isHot: true, limit } })
  }
}
