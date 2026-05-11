/**
 * API 调用封装模块
 * 与后端接口完全对齐
 */

import { heritageApi } from './heritage'
import { newsApi } from './news'
import { celebrityApi } from './celebrity'
import { artApi } from './art'
import { getToken, setToken, removeToken, request, get, post, put, del } from './request'

export { getToken, setToken, removeToken, request, get, post, put, del }
export { heritageApi, newsApi, celebrityApi, artApi }

export const authApi = {
  login: (data) => post('/auth/login', data),
  register: (data) => post('/auth/register', data),
  logout: () => post('/auth/logout'),
  getCurrentUser: () => get('/auth/info'),
  updateCurrentUser: (data) => put('/auth/info', data),
  updatePassword: (oldPassword, newPassword) => {
    const params = new URLSearchParams({ oldPassword, newPassword })
    return put(`/auth/password?${params.toString()}`)
  },
}

export const cityApi = {
  getList: () => get('/cities/list'),
}

export const traditionalArtApi = {
  getList: (params) => get('/traditional-arts/list', params),
  getDetail: (id) => get(`/traditional-arts/detail/${id}`),
}

export const userWorkApi = {
  getList: (params) => get('/works/list', params),
  getMyWorks: (params) => get('/works/my', params),
  getDetail: (id) => get(`/works/detail/${id}`),
  create: (data) => post('/works', data),
  update: (data) => put('/works', data),
  delete: (id) => del(`/works/${id}`),
  like: (id) => post(`/works/like/${id}`),
}

export const collectionApi = {
  toggle: (data) => post('/collections/toggle', data),
  getHeritageCollections: (params) => get('/collections/heritage', params),
  getArtCollections: (params) => get('/collections/art', params),
  getNewsCollections: (params) => get('/collections/news', params),
  getWorkCollections: (params) => get('/collections/work', params),
}

export const commentApi = {
  getList: (params) => get('/comments/list', params),
  create: (data) => post('/comments', data),
  delete: (id) => del(`/comments/${id}`),
  like: (id) => post(`/comments/like/${id}`),
}

export const searchApi = {
  search: (params) => get('/search', params),
  getHotKeywords: (limit = 10) => get('/search/hot-keywords', { limit }),
  getHistory: (limit = 10) => get('/search/history', { limit }),
  clearHistory: () => del('/search/history'),
}

export const categoryApi = {
  getList: (type) => get('/categories/list', type ? { type } : {}),
  getAll: () => get('/categories/all'),
}

export const aiApi = {
  generateDesign: (data) => post('/api/ai/design/generate', data),
  generateImage: (data) => post('/api/ai/image/generate', data),
  getDesignHistory: (params) => get('/api/ai/design/history', params),
}

export const culturalApi = {
  getHeritageList: (params) => heritageApi.getList(params),
  getNewsList: (params) => newsApi.getList(params),
  getCityInfo: (cityId) => cityApi.getList(),
  getCelebritiesList: (params) => celebrityApi.getList(params),
  getTraditionalArtsList: (params) => traditionalArtApi.getList(params),
}

export default {
  get,
  post,
  put,
  delete: del,
  getToken,
  setToken,
  removeToken,
  authApi,
  heritageApi,
  newsApi,
  cityApi,
  celebrityApi,
  traditionalArtApi,
  userWorkApi,
  collectionApi,
  commentApi,
  searchApi,
  categoryApi,
  culturalApi,
  aiApi,
}
