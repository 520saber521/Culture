import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { z } from 'zod'
import {
  AppError, assertDb, cached, camelize, env, fail, getAdmin, getSupabase,
  ok, pageParams, pageResult, requireUser, safeSearch, snakeObject, usernameEmail, getRedis,
} from './lib.js'

const app = new Hono()
const targetTables = {
  heritage: 'heritage', art: 'traditional_arts', celebrity: 'celebrities', news: 'news', work: 'user_works',
}

app.use('*', logger())
app.use('*', async (c, next) => {
  const requestOrigin = c.req.header('origin') || ''
  const configured = String(env(c, 'CORS_ORIGINS', 'http://localhost:3000')).split(',').map((item) => item.trim())
  const origin = configured.includes('*') ? '*' : configured.includes(requestOrigin) ? requestOrigin : configured[0]
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Vary', 'Origin')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (c.req.method === 'OPTIONS') return c.body(null, 204)
  await next()
})

app.onError((error, c) => {
  if (error instanceof AppError) return fail(c, error.status, error.message, error.code)
  if (error instanceof z.ZodError) return fail(c, 400, error.issues[0]?.message || '请求参数错误', 400)
  console.error(error)
  return fail(c, 500, '服务器内部错误', 500)
})

app.get('/', (c) => ok(c, { name: 'cultural-backend-node', runtime: 'serverless' }))
app.get('/api/health', (c) => ok(c, {
  status: 'ok',
  supabase: Boolean(env(c, 'SUPABASE_URL') && (env(c, 'SUPABASE_SECRET_KEY') || env(c, 'SUPABASE_SERVICE_ROLE_KEY'))),
  redis: Boolean(env(c, 'UPSTASH_REDIS_REST_URL') && env(c, 'UPSTASH_REDIS_REST_TOKEN')),
}))

app.post('/api/ai/image/generate', async (c) => {
  await requireUser(c)
  const apiKey = env(c, 'VOLCENGINE_API_KEY')
  if (!apiKey) throw new AppError(503, '图像生成服务未配置')
  const body = await c.req.json()
  const prompt = String(body.prompt || '').trim()
  if (!prompt || prompt.length > 2000) throw new AppError(400, '提示词长度应为 1-2000 个字符')

  const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: body.model || 'doubao-seedream-4-5-251128',
      prompt,
      size: body.size || '2048x2048',
      response_format: 'url',
      watermark: body.watermark !== false,
    }),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new AppError(response.status, payload?.error?.message || payload?.message || '图像生成失败')
  const url = payload?.data?.[0]?.url
  if (!url) throw new AppError(502, '图像生成服务返回格式异常')
  return ok(c, { url }, '图像生成成功')
})

const imageExtensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
app.post('/api/works/upload', async (c) => {
  const { profile, admin } = await requireUser(c)
  const form = await c.req.formData()
  const file = form.get('file')
  if (!file || typeof file.arrayBuffer !== 'function') throw new AppError(400, '请选择图片')
  const extension = imageExtensions[file.type]
  if (!extension) throw new AppError(400, '仅支持 JPG、PNG、WebP 图片')
  if (file.size < 1 || file.size > 5 * 1024 * 1024) throw new AppError(400, '图片大小需在 5 MB 以内')
  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const isJpeg = file.type === 'image/jpeg' && signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff
  const isPng = file.type === 'image/png' && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => signature[index] === byte)
  const isWebp = file.type === 'image/webp' && String.fromCharCode(...signature.slice(0, 4)) === 'RIFF' && String.fromCharCode(...signature.slice(8, 12)) === 'WEBP'
  if (!isJpeg && !isPng && !isWebp) throw new AppError(400, '图片内容与文件格式不匹配')
  const path = `${profile.id}/${crypto.randomUUID()}.${extension}`
  const bucket = 'user-works'
  const result = await admin.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false })
  if (result.error) throw new AppError(502, `图片上传失败：${result.error.message}`)
  const { data } = admin.storage.from(bucket).getPublicUrl(path)
  return ok(c, { url: data.publicUrl, path }, '上传成功')
})

app.put('/api/admin/news/:id', async (c) => {
  const { profile, admin } = await requireUser(c)
  if (profile.role !== 'admin') throw new AppError(403, '仅管理员可编辑文化动态')
  const id = Number(c.req.param('id'))
  if (!Number.isSafeInteger(id) || id < 1) throw new AppError(400, '无效的新闻 ID')
  const body = z.object({
    title: z.string().trim().min(1).max(200),
    summary: z.string().trim().max(500).default(''),
    content: z.string().max(100000),
  }).parse(await c.req.json())
  const result = await admin.from('news').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).eq('deleted', false).select('id').maybeSingle()
  assertDb(result)
  if (!result.data) throw new AppError(404, '新闻不存在')
  const redis = getRedis(c)
  if (redis) {
    try { await redis.del(`detail:news:${id}`) }
    catch (error) { console.warn('Redis invalidation failed:', error.message) }
  }
  return ok(c, result.data.id, '保存成功')
})

const loginSchema = z.object({
  username: z.string().trim().min(3, '用户名至少 3 个字符').max(50),
  password: z.string().min(6, '密码至少 6 个字符').max(72),
})
const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(6),
  email: z.email('邮箱格式不正确').optional().or(z.literal('')),
  nickname: z.string().trim().min(2).max(50).optional(),
})

app.post('/api/auth/register', async (c) => {
  const body = registerSchema.parse(await c.req.json())
  if (body.password !== body.confirmPassword) throw new AppError(400, '两次输入的密码不一致')
  const admin = getAdmin(c)
  const duplicate = await admin.from('profiles').select('id').eq('username', body.username).eq('deleted', false).maybeSingle()
  if (duplicate.data) throw new AppError(400, '用户名已存在')

  const authResult = await admin.auth.admin.createUser({
    email: await usernameEmail(body.username),
    password: body.password,
    email_confirm: true,
    user_metadata: { username: body.username },
  })
  if (authResult.error) throw new AppError(400, authResult.error.message)

  const profile = await admin.from('profiles').insert({
    auth_user_id: authResult.data.user.id,
    username: body.username,
    nickname: body.nickname || body.username,
    email: body.email || null,
  })
  if (profile.error) {
    await admin.auth.admin.deleteUser(authResult.data.user.id)
    throw new AppError(500, profile.error.message)
  }
  return ok(c, null, '注册成功')
})

app.post('/api/auth/login', async (c) => {
  const body = loginSchema.parse(await c.req.json())
  const client = getSupabase(c)
  const result = await client.auth.signInWithPassword({ email: await usernameEmail(body.username), password: body.password })
  if (result.error || !result.data.session) throw new AppError(401, '用户名或密码错误')
  const admin = getAdmin(c)
  const profile = assertDb(await admin.from('profiles').select('*').eq('auth_user_id', result.data.user.id).eq('deleted', false).single())
  await admin.from('profiles').update({ last_login_time: new Date().toISOString() }).eq('id', profile.id)
  return ok(c, {
    token: result.data.session.access_token,
    refreshToken: result.data.session.refresh_token,
    expiresIn: result.data.session.expires_in,
    userInfo: camelize(profile),
  }, '登录成功')
})

app.post('/api/auth/logout', async (c) => {
  const { token } = await requireUser(c)
  const result = await getAdmin(c).auth.admin.signOut(token, 'global')
  if (result.error) throw new AppError(400, result.error.message)
  return ok(c, null, '退出成功')
})

app.post('/api/auth/refresh', async (c) => {
  const body = await c.req.json()
  if (!body.refreshToken) throw new AppError(400, '缺少刷新令牌')
  const result = await getSupabase(c).auth.refreshSession({ refresh_token: body.refreshToken })
  if (result.error || !result.data.session) throw new AppError(401, '登录状态已失效')
  return ok(c, {
    token: result.data.session.access_token,
    refreshToken: result.data.session.refresh_token,
    expiresIn: result.data.session.expires_in,
  }, '令牌刷新成功')
})

app.get('/api/auth/info', async (c) => {
  const { profile } = await requireUser(c)
  return ok(c, camelize(profile))
})

app.put('/api/auth/info', async (c) => {
  const { profile, admin } = await requireUser(c)
  const body = await c.req.json()
  const values = snakeObject(body, ['nickname', 'email', 'phone', 'avatar', 'gender', 'bio'])
  const updated = assertDb(await admin.from('profiles').update(values).eq('id', profile.id).select('*').single())
  return ok(c, camelize(updated), '更新成功')
})

app.put('/api/auth/password', async (c) => {
  const { profile, authUser, admin } = await requireUser(c)
  const oldPassword = c.req.query('oldPassword') || ''
  const newPassword = c.req.query('newPassword') || ''
  if (newPassword.length < 6) throw new AppError(400, '新密码至少 6 个字符')
  const check = await getSupabase(c).auth.signInWithPassword({ email: await usernameEmail(profile.username), password: oldPassword })
  if (check.error) throw new AppError(400, '原密码错误')
  const result = await admin.auth.admin.updateUserById(authUser.id, { password: newPassword })
  if (result.error) throw new AppError(400, result.error.message)
  return ok(c, null, '密码修改成功，请重新登录')
})

async function listSimple(c, table, order = 'sort_order') {
  return cached(c, `list:${table}`, 300, async () => {
    const result = await getAdmin(c).from(table).select('*').eq('status', 1).eq('deleted', false).order(order)
    return camelize(assertDb(result))
  })
}

app.get('/api/cities/list', async (c) => ok(c, await listSimple(c, 'cities')))
app.get('/api/categories/all', async (c) => ok(c, await listSimple(c, 'categories', 'type')))
app.get('/api/categories/list', async (c) => {
  const type = c.req.query('type')
  let query = getAdmin(c).from('categories').select('*').eq('status', 1).eq('deleted', false)
  if (type) query = query.eq('type', type)
  return ok(c, camelize(assertDb(await query.order('sort_order'))))
})

const contentConfig = {
  heritage: { table: 'heritage', title: 'name', filters: ['category', 'city'], search: ['name', 'description'], notFound: '非遗信息不存在' },
  arts: { table: 'traditional_arts', title: 'name', filters: ['category', 'city'], search: ['name', 'description'], notFound: '传统艺术信息不存在' },
  celebrities: { table: 'celebrities', title: 'name', filters: ['city', 'dynasty'], search: ['name', 'title', 'description'], notFound: '名人信息不存在' },
  news: { table: 'news', title: 'title', filters: ['category'], search: ['title', 'summary'], notFound: '新闻不存在' },
}

async function contentList(c, config) {
  const { pageNum, pageSize, from, to } = pageParams(c)
  let query = getAdmin(c).from(config.table).select('*', { count: 'exact' }).eq('status', 1).eq('deleted', false)
  for (const filter of config.filters) if (c.req.query(filter)) query = query.eq(filter, c.req.query(filter))
  if (c.req.query('categoryId')) query = query.eq('category_id', c.req.query('categoryId'))
  if (c.req.query('cityId')) query = query.eq('city_id', c.req.query('cityId'))
  if (c.req.query('isHot') !== undefined && ['heritage', 'news'].includes(config.table)) query = query.eq('is_hot', c.req.query('isHot') === 'true' ? 1 : 0)
  if (c.req.query('isTop') !== undefined && config.table === 'news') query = query.eq('is_top', c.req.query('isTop') === 'true' ? 1 : 0)
  const keyword = safeSearch(c.req.query('keyword'))
  if (keyword) query = query.or(config.search.map((field) => `${field}.ilike.%${keyword}%`).join(','))
  const result = await query.order(config.table === 'news' ? 'publish_time' : 'created_at', { ascending: false }).range(from, to)
  assertDb(result)
  return pageResult(camelize(result.data), result.count || 0, pageNum, pageSize)
}

async function contentDetail(c, config) {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'ID 格式错误')
  const data = await cached(c, `detail:${config.table}:${id}`, 300, async () => {
    const result = await getAdmin(c).from(config.table).select('*').eq('id', id).eq('deleted', false).maybeSingle()
    assertDb(result)
    return result.data ? camelize(result.data) : null
  })
  if (!data) throw new AppError(404, config.notFound)
  await getAdmin(c).rpc('increment_counter', { table_name: config.table, row_id: id, column_name: 'view_count' })
  return data
}

for (const [route, config] of Object.entries(contentConfig)) {
  app.get(`/api/${route}/list`, async (c) => ok(c, await contentList(c, config)))
  app.get(`/api/${route}/detail/:id`, async (c) => ok(c, await contentDetail(c, config)))
}

// Compatibility aliases used by the older Vue API wrappers.
app.get('/api/heritage', async (c) => ok(c, await contentList(c, contentConfig.heritage)))
app.get('/api/heritage/:id', async (c) => ok(c, await contentDetail(c, contentConfig.heritage)))
app.get('/api/art', async (c) => ok(c, await contentList(c, contentConfig.arts)))
app.get('/api/art/:id', async (c) => ok(c, await contentDetail(c, contentConfig.arts)))
app.get('/api/celebrity', async (c) => ok(c, await contentList(c, contentConfig.celebrities)))
app.get('/api/celebrity/:id', async (c) => ok(c, await contentDetail(c, contentConfig.celebrities)))
app.get('/api/news', async (c) => ok(c, await contentList(c, contentConfig.news)))
app.get('/api/news/:id', async (c) => ok(c, await contentDetail(c, contentConfig.news)))

app.post('/api/heritage/like/:id', async (c) => {
  const id = Number(c.req.param('id'))
  assertDb(await getAdmin(c).rpc('increment_counter', { table_name: 'heritage', row_id: id, column_name: 'like_count' }))
  return ok(c, null, '点赞成功')
})

async function workQuery(c, mine = false) {
  const { pageNum, pageSize, from, to } = pageParams(c)
  let user = null
  if (mine) user = await requireUser(c)
  let query = getAdmin(c).from('user_works').select('*, profiles!user_id(username,nickname,avatar)', { count: 'exact' }).eq('status', 1).eq('deleted', false)
  if (mine) query = query.eq('user_id', user.profile.id)
  else query = query.eq('is_public', 1)
  const keyword = safeSearch(c.req.query('keyword'))
  if (keyword) query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
  if (c.req.query('culturalElement')) query = query.ilike('cultural_element', `%${safeSearch(c.req.query('culturalElement'))}%`)
  const result = await query.order('created_at', { ascending: false }).range(from, to)
  assertDb(result)
  const records = result.data.map((work) => ({
    ...camelize(work),
    userNickname: work.profiles?.nickname || work.profiles?.username,
    userAvatar: work.profiles?.avatar,
    profiles: undefined,
    isPublic: work.is_public === 1,
    isFeatured: work.is_featured === 1,
  }))
  return pageResult(records, result.count || 0, pageNum, pageSize)
}

app.get('/api/works/list', async (c) => ok(c, await workQuery(c)))
app.get('/api/works/my', async (c) => ok(c, await workQuery(c, true)))
app.get('/api/works/detail/:id', async (c) => {
  const result = await getAdmin(c).from('user_works').select('*, profiles!user_id(username,nickname,avatar)').eq('id', c.req.param('id')).eq('deleted', false).maybeSingle()
  assertDb(result)
  if (!result.data) throw new AppError(404, '作品不存在')
  await getAdmin(c).rpc('increment_counter', { table_name: 'user_works', row_id: Number(c.req.param('id')), column_name: 'view_count' })
  const data = camelize(result.data)
  data.userNickname = data.profiles?.nickname || data.profiles?.username
  data.userAvatar = data.profiles?.avatar
  delete data.profiles
  return ok(c, data)
})

const workFields = ['title', 'description', 'image_url', 'prompt', 'style', 'cultural_element', 'is_public']
app.post('/api/works', async (c) => {
  const { profile, admin } = await requireUser(c)
  const body = await c.req.json()
  if (!body.title?.trim() || !body.imageUrl?.trim()) throw new AppError(400, '标题和图片不能为空')
  const values = { ...snakeObject(body, workFields), user_id: profile.id, status: 1 }
  if ('is_public' in values) values.is_public = values.is_public ? 1 : 0
  const data = assertDb(await admin.from('user_works').insert(values).select('id').single())
  return ok(c, data.id, '创建成功')
})

app.put('/api/works', async (c) => {
  const { profile, admin } = await requireUser(c)
  const body = await c.req.json()
  if (!body.id) throw new AppError(400, '作品 ID 不能为空')
  const existing = assertDb(await admin.from('user_works').select('user_id').eq('id', body.id).eq('deleted', false).maybeSingle())
  if (!existing) throw new AppError(404, '作品不存在')
  if (existing.user_id !== profile.id) throw new AppError(403, '无权限修改此作品')
  const values = snakeObject(body, workFields)
  if ('is_public' in values) values.is_public = values.is_public ? 1 : 0
  assertDb(await admin.from('user_works').update(values).eq('id', body.id))
  return ok(c, null, '更新成功')
})

app.delete('/api/works/:id', async (c) => {
  const { profile, admin } = await requireUser(c)
  const existing = assertDb(await admin.from('user_works').select('user_id').eq('id', c.req.param('id')).eq('deleted', false).maybeSingle())
  if (!existing) throw new AppError(404, '作品不存在')
  if (existing.user_id !== profile.id) throw new AppError(403, '无权限删除此作品')
  assertDb(await admin.from('user_works').update({ deleted: true }).eq('id', c.req.param('id')))
  return ok(c, null, '删除成功')
})

app.post('/api/works/like/:id', async (c) => {
  assertDb(await getAdmin(c).rpc('increment_counter', { table_name: 'user_works', row_id: Number(c.req.param('id')), column_name: 'like_count' }))
  return ok(c, null, '点赞成功')
})

app.get('/api/comments/list', async (c) => {
  const { pageNum, pageSize, from, to } = pageParams(c)
  let query = getAdmin(c).from('comments').select('*, profiles!user_id(username,nickname,avatar)', { count: 'exact' }).eq('status', 1).eq('deleted', false)
  if (c.req.query('targetType')) query = query.eq('target_type', c.req.query('targetType'))
  if (c.req.query('targetId')) query = query.eq('target_id', c.req.query('targetId'))
  const result = await query.order('created_at', { ascending: false }).range(from, to)
  assertDb(result)
  const records = result.data.map((item) => ({ ...camelize(item), userNickname: item.profiles?.nickname || item.profiles?.username, userAvatar: item.profiles?.avatar, profiles: undefined }))
  return ok(c, pageResult(records, result.count || 0, pageNum, pageSize))
})

app.post('/api/comments', async (c) => {
  const { profile, admin } = await requireUser(c)
  const body = await c.req.json()
  if (!targetTables[body.targetType] || !body.targetId || !String(body.content || '').trim()) throw new AppError(400, '评论参数不完整')
  const values = { ...snakeObject(body, ['target_type', 'target_id', 'parent_id', 'reply_user_id', 'content', 'images']), user_id: profile.id }
  const data = assertDb(await admin.from('comments').insert(values).select('id').single())
  return ok(c, data.id, '评论成功')
})

app.delete('/api/comments/:id', async (c) => {
  const { profile, admin } = await requireUser(c)
  const item = assertDb(await admin.from('comments').select('user_id').eq('id', c.req.param('id')).eq('deleted', false).maybeSingle())
  if (!item) throw new AppError(404, '评论不存在')
  if (item.user_id !== profile.id && profile.role !== 'admin') throw new AppError(403, '无权限删除此评论')
  assertDb(await admin.from('comments').update({ deleted: true }).eq('id', c.req.param('id')))
  return ok(c, null, '删除成功')
})

app.post('/api/comments/like/:id', async (c) => {
  assertDb(await getAdmin(c).rpc('increment_counter', { table_name: 'comments', row_id: Number(c.req.param('id')), column_name: 'like_count' }))
  return ok(c, null, '点赞成功')
})

app.post('/api/collections/toggle', async (c) => {
  const { profile, admin } = await requireUser(c)
  const body = await c.req.json()
  if (!targetTables[body.targetType] || !body.targetId) throw new AppError(400, '收藏参数错误')
  const existing = assertDb(await admin.from('user_collections').select('id,deleted').eq('user_id', profile.id).eq('target_type', body.targetType).eq('target_id', body.targetId).maybeSingle())
  let collected
  if (existing) {
    collected = existing.deleted
    assertDb(await admin.from('user_collections').update({ deleted: !existing.deleted }).eq('id', existing.id))
  } else {
    collected = true
    assertDb(await admin.from('user_collections').insert({ user_id: profile.id, target_type: body.targetType, target_id: body.targetId }))
  }
  return ok(c, collected, collected ? '收藏成功' : '取消收藏成功')
})

async function collectionList(c, type) {
  const { profile, admin } = await requireUser(c)
  const { pageNum, pageSize, from, to } = pageParams(c)
  const links = await admin.from('user_collections').select('target_id', { count: 'exact' }).eq('user_id', profile.id).eq('target_type', type).eq('deleted', false).order('created_at', { ascending: false }).range(from, to)
  assertDb(links)
  const ids = links.data.map((item) => item.target_id)
  if (!ids.length) return pageResult([], links.count || 0, pageNum, pageSize)
  const records = assertDb(await admin.from(targetTables[type]).select('*').in('id', ids).eq('deleted', false))
  const byId = new Map(records.map((item) => [item.id, item]))
  return pageResult(camelize(ids.map((id) => byId.get(id)).filter(Boolean)), links.count || 0, pageNum, pageSize)
}

for (const type of ['heritage', 'art', 'news', 'work']) {
  app.get(`/api/collections/${type}`, async (c) => ok(c, await collectionList(c, type)))
}

app.get('/api/search', async (c) => {
  const keyword = safeSearch(c.req.query('keyword'))
  const type = c.req.query('searchType') || 'all'
  const { pageNum, pageSize } = pageParams(c)
  if (!keyword) return ok(c, pageResult([], 0, pageNum, pageSize))
  let profile = null
  try { profile = (await requireUser(c)).profile } catch (error) { if (error.status !== 401) throw error }
  const admin = getAdmin(c)
  await admin.from('search_history').insert({ user_id: profile?.id || null, keyword, search_type: type })

  const configs = {
    heritage: { table: 'heritage', title: 'name', description: 'description', cover: 'cover_image' },
    art: { table: 'traditional_arts', title: 'name', description: 'description', cover: 'cover_image' },
    celebrity: { table: 'celebrities', title: 'name', description: 'description', cover: 'avatar' },
    news: { table: 'news', title: 'title', description: 'summary', cover: 'cover_image' },
    work: { table: 'user_works', title: 'title', description: 'description', cover: 'image_url' },
  }
  const selected = type === 'all' ? Object.entries(configs) : Object.entries(configs).filter(([name]) => name === type)
  const groups = await Promise.all(selected.map(async ([name, config]) => {
    const result = await admin.from(config.table).select('*').eq('status', 1).eq('deleted', false).or(`${config.title}.ilike.%${keyword}%,${config.description}.ilike.%${keyword}%`).order('view_count', { ascending: false }).limit(20)
    assertDb(result)
    return result.data.map((item) => ({ id: item.id, type: name, title: item[config.title], description: item[config.description], cover_image: item[config.cover], category: item.category, city: item.city, view_count: item.view_count, like_count: item.like_count, created_at: item.created_at }))
  }))
  const all = groups.flat().sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
  const start = (pageNum - 1) * pageSize
  return ok(c, pageResult(camelize(all.slice(start, start + pageSize)), all.length, pageNum, pageSize))
})

app.get('/api/search/hot-keywords', async (c) => {
  const limit = Math.min(50, Math.max(1, Number(c.req.query('limit') || 10)))
  const result = await getAdmin(c).from('search_history').select('keyword').order('created_at', { ascending: false }).limit(2000)
  assertDb(result)
  const counts = new Map()
  for (const item of result.data) counts.set(item.keyword, (counts.get(item.keyword) || 0) + 1)
  return ok(c, [...counts].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([keyword]) => keyword))
})

app.get('/api/search/history', async (c) => {
  const { profile, admin } = await requireUser(c)
  const limit = Math.min(50, Math.max(1, Number(c.req.query('limit') || 10)))
  const result = await admin.from('search_history').select('keyword').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(limit * 3)
  return ok(c, [...new Set(assertDb(result).map((item) => item.keyword))].slice(0, limit))
})

app.delete('/api/search/history', async (c) => {
  const { profile, admin } = await requireUser(c)
  assertDb(await admin.from('search_history').delete().eq('user_id', profile.id))
  return ok(c, null, '清空成功')
})

app.notFound((c) => fail(c, 404, '接口不存在', 404))

export default app
