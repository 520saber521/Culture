import { createClient } from '@supabase/supabase-js'
import { Redis } from '@upstash/redis'

export class AppError extends Error {
  constructor(status, message, code = status) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function env(c, key, fallback = undefined) {
  if (c?.env?.[key] !== undefined) return c.env[key]
  if (typeof process !== 'undefined' && process.env?.[key] !== undefined) return process.env[key]
  return fallback
}

function supabaseOptions(extra = {}) {
  return {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    ...extra,
  }
}

export function getSupabase(c, accessToken) {
  const url = env(c, 'SUPABASE_URL')
  const key = env(c, 'SUPABASE_PUBLISHABLE_KEY') || env(c, 'SUPABASE_ANON_KEY')
  if (!url || !key) throw new AppError(503, 'Supabase 公共配置未完成')
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
  return createClient(url, key, supabaseOptions(headers ? { global: { headers } } : {}))
}

export function getAdmin(c) {
  const url = env(c, 'SUPABASE_URL')
  const key = env(c, 'SUPABASE_SECRET_KEY') || env(c, 'SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new AppError(503, 'Supabase 服务端配置未完成')
  return createClient(url, key, supabaseOptions())
}

export function getRedis(c) {
  const url = env(c, 'UPSTASH_REDIS_REST_URL')
  const token = env(c, 'UPSTASH_REDIS_REST_TOKEN')
  return url && token ? new Redis({ url, token }) : null
}

export function ok(c, data = null, message = '操作成功', status = 200) {
  return c.json({ code: 200, message, data, timestamp: Date.now() }, status)
}

export function fail(c, status, message, code = status) {
  return c.json({ code, message, data: null, timestamp: Date.now() }, status)
}

export function pageParams(c) {
  const pageNum = Math.max(1, Number(c.req.query('pageNum') || 1) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(c.req.query('pageSize') || c.req.query('limit') || 10) || 10))
  return { pageNum, pageSize, from: (pageNum - 1) * pageSize, to: pageNum * pageSize - 1 }
}

export function pageResult(records, total, pageNum, pageSize) {
  return { records: camelize(records), total, size: pageSize, current: pageNum, pages: Math.ceil(total / pageSize) }
}

export function camelize(value) {
  if (Array.isArray(value)) return value.map(camelize)
  if (!value || typeof value !== 'object' || value instanceof Date) return value
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key === 'created_at' ? 'createTime' : key === 'updated_at' ? 'updateTime' : key.replace(/_([a-z])/g, (_, char) => char.toUpperCase()),
    camelize(item),
  ]))
}

export function snakeObject(value, allowed) {
  const result = {}
  for (const [key, item] of Object.entries(value || {})) {
    const snake = key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)
    if (allowed.includes(snake) && item !== undefined) result[snake] = item
  }
  return result
}

export function safeSearch(value) {
  return String(value || '').trim().slice(0, 80).replace(/[,%()]/g, ' ')
}

export async function usernameEmail(username) {
  const normalized = String(username || '').trim().toLowerCase()
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized))
  const encoded = [...new Uint8Array(digest)].slice(0, 24).map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `u-${encoded}@accounts.cultural.example`
}

export async function requireUser(c) {
  const header = c.req.header('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) throw new AppError(401, '用户未登录')

  const client = getSupabase(c, token)
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) throw new AppError(401, '登录状态已失效')

  const admin = getAdmin(c)
  const profileResult = await admin.from('profiles').select('*').eq('auth_user_id', data.user.id).eq('deleted', false).single()
  if (profileResult.error || !profileResult.data) throw new AppError(401, '用户资料不存在')
  if (profileResult.data.status !== 1) throw new AppError(403, '用户已被禁用')
  return { token, authUser: data.user, profile: profileResult.data, admin }
}

export async function cached(c, key, seconds, loader) {
  const redis = getRedis(c)
  if (redis) {
    try {
      const existing = await redis.get(key)
      if (existing !== null && existing !== undefined) return existing
    } catch (error) {
      console.warn('Redis read failed:', error.message)
    }
  }
  const value = await loader()
  if (redis) {
    try {
      await redis.set(key, value, { ex: seconds })
    } catch (error) {
      console.warn('Redis write failed:', error.message)
    }
  }
  return value
}

export function assertDb(result, fallback = '数据库操作失败') {
  if (result.error) throw new AppError(500, result.error.message || fallback)
  return result.data
}
