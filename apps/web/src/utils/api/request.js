const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8787/api' : '/api')

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setToken(token, refreshToken) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem('isLogin', 'true')
  }
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem('isLogin')
  localStorage.removeItem('username')
  localStorage.removeItem('nickname')
  localStorage.removeItem('avatar')
}

export async function request(url, options = {}, canRetry = true) {
  const token = getToken()
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`
  }
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }
  if (mergedOptions.body instanceof FormData) delete mergedOptions.headers['Content-Type']
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, mergedOptions)
    const data = await response.json()
    
    if (response.status === 401 && canRetry && url !== '/auth/login' && url !== '/auth/refresh') {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        const refreshData = await refreshResponse.json()
        if (refreshResponse.ok && refreshData.code === 200) {
          setToken(refreshData.data.token, refreshData.data.refreshToken)
          return request(url, options, false)
        }
      }
      removeToken()
      localStorage.removeItem('isLogin')
      localStorage.removeItem('username')
      window.location.href = '/login'
      return data
    }

    if (response.status === 401) {
      removeToken()
      return data
    }
    
    return data
  } catch (error) {
    console.error('API 请求错误:', error)
    return {
      code: 500,
      message: '网络请求失败，请检查网络连接',
      data: null
    }
  }
}

export function get(url, params = {}) {
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  const fullUrl = queryString ? `${url}?${queryString}` : url
  return request(fullUrl, { method: 'GET' })
}

export function post(url, data = {}) {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function put(url, data = {}) {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function del(url) {
  return request(url, { method: 'DELETE' })
}

export function upload(url, file) {
  const body = new FormData()
  body.append('file', file)
  return request(url, { method: 'POST', body })
}
