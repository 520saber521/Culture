const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const TOKEN_KEY = 'auth_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem('isLogin', 'true')
    console.log('Token已保存:', token.substring(0, 20) + '...')
  }
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('isLogin')
  localStorage.removeItem('username')
  localStorage.removeItem('nickname')
  localStorage.removeItem('avatar')
}

export async function request(url, options = {}) {
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
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, mergedOptions)
    const data = await response.json()
    
    if (response.status === 401) {
      removeToken()
      localStorage.removeItem('isLogin')
      localStorage.removeItem('username')
      window.location.href = '/login'
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
