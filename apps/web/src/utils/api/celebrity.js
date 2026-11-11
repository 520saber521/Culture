import { get } from './request'

export const celebrityApi = {
  getList(params) {
    return get('/celebrities/list', params)
  },

  getById(id) {
    return get(`/celebrities/detail/${id}`)
  },

  getByDynasty(dynasty) {
    return get('/celebrities/list', { dynasty })
  },

  getByCity(cityId) {
    return get('/celebrities/list', { cityId })
  },

  search(keyword) {
    return get('/celebrities/list', { keyword })
  }
}
