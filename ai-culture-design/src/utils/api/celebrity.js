import { get } from './request'

export const celebrityApi = {
  getList(params) {
    return get('/celebrity', { params })
  },
  
  getById(id) {
    return get(`/celebrity/${id}`)
  },
  
  getByDynasty(dynasty) {
    return get('/celebrity', { params: { dynasty } })
  },
  
  getByCity(cityId) {
    return get('/celebrity', { params: { cityId } })
  },
  
  search(keyword) {
    return get('/celebrity', { params: { keyword } })
  }
}
