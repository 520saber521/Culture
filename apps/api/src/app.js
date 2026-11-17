import { Hono } from 'hono'
import { z } from 'zod'
import sanitizeHtml from 'sanitize-html'
import {
  AppError, assertDb, cached, camelize, env, fail, getAdmin, getSupabase,
  ok, pageParams, pageResult, requireUser, safeSearch, snakeObject, usernameEmail, getRedis, rateLimit,
} from './lib.js'

const app = new Hono()
const targetTables = {
  heritage: 'heritage', art: 'traditional_arts', celebrity: 'celebrities', news: 'news', work: 'user_works',
}
const workBucket = 'user-works'
const htmlOptions = {
  allowedTags: ['p', 'br', 'strong', 'em', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
  allowedAttributes: {},
}

export function workImagePath(value) {
  const raw = String(value || '')
  if (/^\d+\/[\w-]+\.(jpg|png|webp)$/.test(raw)) return raw
  const marker = `/storage/v1/object/public/${workBucket}/`
  try {
    const url = new URL(raw)
    const position = url.pathname.indexOf(marker)
    if (position !== -1) return decodeURIComponent(url.pathname.slice(position + marker.length))
  } catch { /* An external legacy image has no storage path. */ }
  return null
}

export function cleanContent(value) {
  return sanitizeHtml(value || '', htmlOptions)
}

async function presentWork(c, work) {
  const data = camelize(work)
  const path = workImagePath(work.image_url)
  if (path) {
    const signed = await getAdmin(c).storage.from(workBucket).createSignedUrl(path, 3600)
    if (signed.error) {
      console.warn('Work image signing failed:', signed.error.message)
      data.imageUrl = null
    } else data.imageUrl = signed.data.signedUrl
  } else if (work.is_public !== 1) data.imageUrl = null
  return data
}

async function optionalUser(c) {
  if (!c.req.header('authorization')) return null
  try { return (await requireUser(c)).profile }
  catch (error) { if (error.status === 401) return null; throw error }
}

async function requirePublicTarget(c, type, rawId) {
  const id = Number(rawId)
  if (!targetTables[type] || !Number.isSafeInteger(id) || id < 1) throw new AppError(400, '目标参数无效')
  let query = getAdmin(c).from(targetTables[type]).select('id').eq('id', id).eq('status', 1).eq('deleted', false)
  if (type === 'work') query = query.eq('is_public', 1)
  const found = assertDb(await query.maybeSingle())
  if (!found) throw new AppError(404, '目标不存在或未公开')
  return id
}

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

app.use('/api/*', async (c, next) => {
  const path = c.req.path
  const method = c.req.method
  let rule = null
  if (method === 'POST' && /^\/api\/auth\/(login|register|refresh)$/.test(path)) rule = ['auth', 10, 60]
  else if (method === 'POST' && path === '/api/ai/image/generate') rule = ['ai', 5, 3600]
  else if (method === 'POST' && /\/(like|comments|collections\/toggle|reports)(\/|$)/.test(path)) rule = ['interaction', 30, 60]
  else if (method === 'GET' && path === '/api/search') rule = ['search', 60, 60]
  if (rule) {
    const identity = c.req.header('authorization') || c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || 'anonymous'
    await rateLimit(c, rule[0], identity, rule[1], rule[2])
  }
  await next()
})

app.get('/', (c) => ok(c, { name: 'cultural-backend-node', runtime: 'serverless' }))
app.get('/api/health', (c) => ok(c, {
  status: 'ok',
  supabase: Boolean(env(c, 'SUPABASE_URL') && (env(c, 'SUPABASE_SECRET_KEY') || env(c, 'SUPABASE_SERVICE_ROLE_KEY'))),
  redis: Boolean(env(c, 'UPSTASH_REDIS_REST_URL') && env(c, 'UPSTASH_REDIS_REST_TOKEN')),
}))
app.get('/api/health/ready', async (c) => {
  const result = await getAdmin(c).from('cities').select('id', { head: true, count: 'exact' }).limit(1)
  if (result.error) throw new AppError(503, '数据库暂时不可用')
  return ok(c, { status: 'ready' })
})

app.post('/api/ai/image/generate', async (c) => {
  const { profile, admin } = await requireUser(c)
  const apiKey = env(c, 'VOLCENGINE_API_KEY')
  if (!apiKey) throw new AppError(503, '图像生成服务未配置')
  const body = await c.req.json()
  const prompt = String(body.prompt || '').trim()
  if (!prompt || prompt.length > 2000) throw new AppError(400, '提示词长度应为 1-2000 个字符')
  const image = body.image == null ? '' : String(body.image)
  if (image) {
    const dataImage = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image)
    if (dataImage) {
      if (dataImage[1].length * 3 / 4 > 10 * 1024 * 1024) throw new AppError(400, '参考图需在 10 MB 以内')
    } else {
      let url
      try { url = new URL(image) } catch { throw new AppError(400, '参考图地址无效') }
      if (url.protocol !== 'https:' || url.username || url.password || image.length > 2048 || /^(?:localhost|127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/i.test(url.hostname)) {
        throw new AppError(400, '参考图地址无效')
      }
    }
  }
  const dailyLimit = Math.min(100, Math.max(1, Number(env(c, 'AI_DAILY_LIMIT', 5)) || 5))
  const reservation = await admin.rpc('reserve_ai_generation', { p_user_id: profile.id, p_daily_limit: dailyLimit })
  if (reservation.error) {
    if (reservation.error.message.includes('daily image generation limit reached')) throw new AppError(429, '今日生图额度已用完')
    throw new AppError(500, reservation.error.message)
  }
  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      signal: AbortSignal.timeout(45000),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: env(c, 'VOLCENGINE_MODEL', 'doubao-seedream-4-5-251128'),
        prompt,
        ...(image ? { image } : {}),
        size: '2048x2048',
        response_format: 'url',
        watermark: true,
      }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) throw new AppError(502, payload?.error?.message || payload?.message || '图像生成失败')
    const url = payload?.data?.[0]?.url
    if (!url) throw new AppError(502, '图像生成服务返回格式异常')
    await admin.from('ai_generations').update({ status: 'succeeded', updated_at: new Date().toISOString() }).eq('id', reservation.data)
    return ok(c, { url }, '图像生成成功')
  } catch (error) {
    await admin.from('ai_generations').update({ status: 'failed', error_message: String(error.message).slice(0, 500), updated_at: new Date().toISOString() }).eq('id', reservation.data)
    throw error
  }
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
  const result = await admin.storage.from(workBucket).upload(path, file, { contentType: file.type, upsert: false })
  if (result.error) throw new AppError(502, `图片上传失败：${result.error.message}`)
  return ok(c, { path }, '上传成功')
})

app.delete('/api/works/upload', async (c) => {
  const { profile, admin } = await requireUser(c)
  const path = workImagePath(c.req.query('path'))
  if (!path || !path.startsWith(`${profile.id}/`)) throw new AppError(400, '图片路径无效')
  const linked = assertDb(await admin.from('user_works').select('id').eq('image_url', path).eq('deleted', false).limit(1))
  if (linked.length) throw new AppError(409, '图片已关联作品')
  const result = await admin.storage.from(workBucket).remove([path])
  if (result.error) throw new AppError(502, '图片清理失败')
  return ok(c, null, '图片已清理')
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
  body.content = cleanContent(body.content)
  const result = await admin.from('news').update({ ...body, updated_by: profile.id, updated_at: new Date().toISOString() }).eq('id', id).eq('deleted', false).select('id').maybeSingle()
  assertDb(result)
  if (!result.data) throw new AppError(404, '新闻不存在')
  await audit(admin, profile.id, 'update', 'news', id)
  await invalidateContent(c, 'news', id)
  return ok(c, result.data.id, '保存成功')
})

const adminText = (length) => z.string().trim().max(length)
const adminMetadata = {
  sourceUrl: adminText(2000), licenseNote: adminText(500),
  verifiedAt: z.iso.datetime().nullable(),
}
const adminContent = {
  heritage: { table: 'heritage', required: 'name', fields: { name: adminText(100), description: adminText(500), content: adminText(100000), category: adminText(50), city: adminText(50), coverImage: adminText(2000), level: z.number().int().min(0).max(10), history: adminText(10000), features: z.array(adminText(200)).max(30), tags: z.array(adminText(30)).max(20), ...adminMetadata } },
  arts: { table: 'traditional_arts', required: 'name', fields: { name: adminText(100), description: adminText(500), content: adminText(100000), category: adminText(50), city: adminText(50), coverImage: adminText(2000), artForm: adminText(50), levelLabel: adminText(30), history: adminText(10000), features: z.array(adminText(200)).max(30), representatives: z.array(adminText(200)).max(30), ...adminMetadata } },
  celebrities: { table: 'celebrities', required: 'name', fields: { name: adminText(50), description: adminText(500), content: adminText(100000), city: adminText(50), dynasty: adminText(50), title: adminText(100), field: adminText(50), avatar: adminText(2000), achievements: z.array(adminText(200)).max(30), works: z.array(adminText(200)).max(30), birthYear: z.number().int(), deathYear: z.number().int(), ...adminMetadata } },
  news: { table: 'news', required: 'title', fields: { title: adminText(200), summary: adminText(500), content: adminText(100000), category: adminText(50), coverImage: adminText(2000), source: adminText(100), ...adminMetadata } },
  cities: { table: 'cities', required: 'name', fields: { name: adminText(50), code: adminText(20), description: adminText(500), coverImage: adminText(2000), sortOrder: z.number().int() } },
  categories: { table: 'categories', required: 'name', fields: { name: adminText(50), code: adminText(50), type: adminText(30), description: adminText(200), sortOrder: z.number().int() } },
  cityFeatures: { table: 'city_features', required: 'name', fields: { name: adminText(100), city: adminText(50), featureType: z.enum(['attraction', 'activity', 'food']), description: adminText(10000), imageUrl: adminText(2000), highlights: z.array(adminText(100)).max(20), level: adminText(50), tips: adminText(1000), crowd: adminText(100), season: adminText(100), history: adminText(10000), taste: adminText(200), restaurant: adminText(200), ...adminMetadata } },
}

async function adminContext(c) {
  const user = await requireUser(c)
  if (user.profile.role !== 'admin') throw new AppError(403, '仅管理员可维护内容')
  const config = adminContent[c.req.param('type')]
  if (!config) throw new AppError(404, '内容类型不存在')
  return { ...user, config }
}

function adminId(c) {
  const id = Number(c.req.param('id'))
  if (!Number.isSafeInteger(id) || id < 1) throw new AppError(400, '内容 ID 无效')
  return id
}

async function audit(admin, operatorId, action, type, id) {
  const result = await admin.from('operation_logs').insert({ operator_id: operatorId, action, target_type: type, target_id: id })
  if (result.error) console.warn('Operation log failed:', result.error.message)
}

async function recordMetric(admin, eventType, succeeded) {
  try {
    const result = await admin.from('metric_events').insert({ event_type: eventType, succeeded })
    if (result.error) console.warn('Metric write failed:', result.error.message)
  } catch (error) { console.warn('Metric write failed:', error.message) }
}

async function invalidateContent(c, table, id) {
  const redis = getRedis(c)
  if (!redis) return
  try {
    await redis.del(`detail:${table}:${id}`)
    if (table === 'cities' || table === 'categories') await redis.del(`list:${table}`)
  } catch (error) { console.warn('Content cache invalidation failed:', error.message) }
}

app.get('/api/admin/content/:type', async (c) => {
  const { admin, config } = await adminContext(c)
  const { pageNum, pageSize, from, to } = pageParams(c)
  const result = await admin.from(config.table).select('*', { count: 'exact' }).eq('deleted', false).order('updated_at', { ascending: false }).range(from, to)
  assertDb(result)
  return ok(c, pageResult(result.data, result.count || 0, pageNum, pageSize))
})

app.get('/api/admin/content/:type/:id', async (c) => {
  const { admin, config } = await adminContext(c)
  const record = assertDb(await admin.from(config.table).select('*').eq('id', adminId(c)).eq('deleted', false).maybeSingle())
  if (!record) throw new AppError(404, '内容不存在')
  return ok(c, camelize(record))
})

app.post('/api/admin/content/:type', async (c) => {
  const { profile, admin, config } = await adminContext(c)
  const body = z.strictObject(config.fields).partial().parse(await c.req.json())
  if (!body[config.required]) throw new AppError(400, '缺少必填标题或名称')
  if (config.table === 'categories' && (!body.code || !body.type)) throw new AppError(400, '分类编码和类型不能为空')
  if (config.table === 'cities' && !body.code) throw new AppError(400, '城市编码不能为空')
  if (config.table === 'city_features' && (!body.city || !body.featureType)) throw new AppError(400, '城市和资料类型不能为空')
  if (body.content) body.content = cleanContent(body.content)
  const values = { ...snakeObject(body, Object.keys(config.fields).map((key) => key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`))), status: 0 }
  if (['heritage', 'traditional_arts', 'celebrities', 'news', 'city_features'].includes(config.table)) values.updated_by = profile.id
  const record = assertDb(await admin.from(config.table).insert(values).select('id').single())
  await audit(admin, profile.id, 'create', c.req.param('type'), record.id)
  await invalidateContent(c, config.table, record.id)
  return ok(c, record.id, '草稿已创建')
})

app.put('/api/admin/content/:type/:id', async (c) => {
  const { profile, admin, config } = await adminContext(c)
  const id = adminId(c)
  const body = z.strictObject(config.fields).partial().parse(await c.req.json())
  if (!Object.keys(body).length) throw new AppError(400, '没有可更新的字段')
  if (config.required in body && !body[config.required]) throw new AppError(400, '标题或名称不能为空')
  if (body.content) body.content = cleanContent(body.content)
  const values = snakeObject(body, Object.keys(config.fields).map((key) => key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)))
  if (['heritage', 'traditional_arts', 'celebrities', 'news', 'city_features'].includes(config.table)) values.updated_by = profile.id
  const record = assertDb(await admin.from(config.table).update(values).eq('id', id).eq('deleted', false).select('id').maybeSingle())
  if (!record) throw new AppError(404, '内容不存在')
  await audit(admin, profile.id, 'update', c.req.param('type'), id)
  await invalidateContent(c, config.table, id)
  return ok(c, id, '保存成功')
})

app.post('/api/admin/content/:type/:id/status', async (c) => {
  const { profile, admin, config } = await adminContext(c)
  const id = adminId(c)
  const { status } = z.object({ status: z.union([z.literal(0), z.literal(1), z.literal(2)]) }).parse(await c.req.json())
  const values = { status }
  if (config.table === 'news' && status === 1) values.publish_time = new Date().toISOString()
  const record = assertDb(await admin.from(config.table).update(values).eq('id', id).eq('deleted', false).select('id').maybeSingle())
  if (!record) throw new AppError(404, '内容不存在')
  await audit(admin, profile.id, ['draft', 'publish', 'withdraw'][status], c.req.param('type'), id)
  await invalidateContent(c, config.table, id)
  return ok(c, { id, status }, '状态已更新')
})

app.delete('/api/admin/content/:type/:id', async (c) => {
  const { profile, admin, config } = await adminContext(c)
  const id = adminId(c)
  const record = assertDb(await admin.from(config.table).update({ deleted: true }).eq('id', id).eq('deleted', false).select('id').maybeSingle())
  if (!record) throw new AppError(404, '内容不存在')
  await audit(admin, profile.id, 'delete', c.req.param('type'), id)
  await invalidateContent(c, config.table, id)
  return ok(c, null, '内容已删除')
})

app.get('/api/admin/operation-logs', async (c) => {
  const { profile, admin } = await requireUser(c)
  if (profile.role !== 'admin') throw new AppError(403, '仅管理员可查看操作记录')
  const { pageNum, pageSize, from, to } = pageParams(c)
  const result = await admin.from('operation_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to)
  assertDb(result)
  return ok(c, pageResult(result.data, result.count || 0, pageNum, pageSize))
})

app.get('/api/admin/metrics', async (c) => {
  const { profile, admin } = await requireUser(c)
  if (profile.role !== 'admin') throw new AppError(403, '仅管理员可查看统计')
  const tables = ['profiles', 'heritage', 'traditional_arts', 'celebrities', 'news', 'city_features', 'user_works', 'comments']
  const counts = await Promise.all(tables.map(async (table) => {
    const result = await admin.from(table).select('id', { count: 'exact', head: true }).eq('deleted', false)
    if (result.error) throw new AppError(500, result.error.message)
    return [table, result.count || 0]
  }))
  const metrics = assertDb(await admin.rpc('get_operational_metrics'))
  return ok(c, { counts: Object.fromEntries(counts), last7Days: metrics })
})

app.get('/api/admin/reports', async (c) => {
  const { profile, admin } = await requireUser(c)
  if (profile.role !== 'admin') throw new AppError(403, '仅管理员可查看举报')
  const { pageNum, pageSize, from, to } = pageParams(c)
  const result = await admin.from('content_reports').select('*', { count: 'exact' }).eq('status', 'pending').order('created_at', { ascending: false }).range(from, to)
  assertDb(result)
  return ok(c, pageResult(result.data, result.count || 0, pageNum, pageSize))
})

app.post('/api/admin/reports/:id/review', async (c) => {
  const { profile, admin } = await requireUser(c)
  if (profile.role !== 'admin') throw new AppError(403, '仅管理员可处理举报')
  const id = adminId(c)
  const { action } = z.object({ action: z.enum(['dismiss', 'hide']) }).parse(await c.req.json())
  const report = assertDb(await admin.from('content_reports').select('*').eq('id', id).eq('status', 'pending').maybeSingle())
  if (!report) throw new AppError(404, '待处理举报不存在')
  if (action === 'hide') {
    const table = report.target_type === 'work' ? 'user_works' : 'comments'
    assertDb(await admin.from(table).update({ status: 2 }).eq('id', report.target_id))
  }
  assertDb(await admin.from('content_reports').update({ status: action === 'hide' ? 'hidden' : 'dismissed', reviewed_by: profile.id, reviewed_at: new Date().toISOString() }).eq('id', id))
  await audit(admin, profile.id, action === 'hide' ? 'hide' : 'dismiss', report.target_type, report.target_id)
  return ok(c, null, '举报已处理')
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
  const { oldPassword, newPassword } = z.object({ oldPassword: z.string(), newPassword: z.string().min(6).max(72) }).parse(await c.req.json())
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

app.get('/api/city-features/list', async (c) => {
  const { pageNum, pageSize, from, to } = pageParams(c)
  let query = getAdmin(c).from('city_features').select('*', { count: 'exact' }).eq('status', 1).eq('deleted', false)
  if (c.req.query('city')) query = query.eq('city', c.req.query('city'))
  if (c.req.query('featureType')) query = query.eq('feature_type', c.req.query('featureType'))
  const result = await query.order('created_at', { ascending: false }).range(from, to)
  assertDb(result)
  return ok(c, pageResult(result.data, result.count || 0, pageNum, pageSize))
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
    const result = await getAdmin(c).from(config.table).select('*').eq('id', id).eq('status', 1).eq('deleted', false).maybeSingle()
    assertDb(result)
    return result.data ? camelize(result.data) : null
  })
  if (!data) throw new AppError(404, config.notFound)
  if (config.table === 'news') data.content = cleanContent(data.content)
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

async function toggleLike(c, type) {
  const { profile, admin } = await requireUser(c)
  const id = Number(c.req.param('id'))
  if (!Number.isSafeInteger(id) || id < 1) throw new AppError(400, '点赞目标无效')
  if (type === 'comment') {
    const comment = assertDb(await admin.from('comments').select('target_type,target_id').eq('id', id).eq('deleted', false).maybeSingle())
    if (!comment) throw new AppError(404, '评论不存在')
    await requirePublicTarget(c, comment.target_type, comment.target_id)
  }
  const result = await admin.rpc('toggle_like', { p_user_id: profile.id, p_type: type, p_target_id: id })
  if (result.error) throw new AppError(400, result.error.message)
  return ok(c, { liked: result.data }, result.data ? '点赞成功' : '已取消点赞')
}

app.post('/api/heritage/like/:id', async (c) => {
  return toggleLike(c, 'heritage')
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
  const records = await Promise.all(result.data.map(async (work) => ({
    ...await presentWork(c, work),
    userNickname: work.profiles?.nickname || work.profiles?.username,
    userAvatar: work.profiles?.avatar,
    profiles: undefined,
    isPublic: work.is_public === 1,
    isFeatured: work.is_featured === 1,
  })))
  return pageResult(records, result.count || 0, pageNum, pageSize)
}

app.get('/api/works/list', async (c) => ok(c, await workQuery(c)))
app.get('/api/works/my', async (c) => ok(c, await workQuery(c, true)))
app.get('/api/works/detail/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isSafeInteger(id) || id < 1) throw new AppError(400, '作品 ID 无效')
  const result = await getAdmin(c).from('user_works').select('*, profiles!user_id(username,nickname,avatar)').eq('id', id).eq('status', 1).eq('deleted', false).maybeSingle()
  assertDb(result)
  if (!result.data) throw new AppError(404, '作品不存在')
  const viewer = await optionalUser(c)
  if (result.data.is_public !== 1 && result.data.user_id !== viewer?.id && viewer?.role !== 'admin') throw new AppError(404, '作品不存在')
  await getAdmin(c).rpc('increment_counter', { table_name: 'user_works', row_id: id, column_name: 'view_count' })
  const data = await presentWork(c, result.data)
  data.userNickname = data.profiles?.nickname || data.profiles?.username
  data.userAvatar = data.profiles?.avatar
  delete data.profiles
  return ok(c, data)
})

const workFields = ['title', 'description', 'prompt', 'style', 'cultural_element', 'is_public', 'category', 'tags', 'allow_download']
app.post('/api/works', async (c) => {
  const { profile, admin } = await requireUser(c)
  const body = await c.req.json()
  const title = String(body.title || '').trim()
  if (!title || title.length > 200) throw new AppError(400, '标题长度应为 1-200 个字符')
  if (String(body.description || '').length > 1000) throw new AppError(400, '说明不能超过 1000 个字符')
  if (body.tags !== undefined && (!Array.isArray(body.tags) || body.tags.length > 5 || body.tags.some((tag) => typeof tag !== 'string' || tag.length > 30))) throw new AppError(400, '标签最多 5 个，每个不超过 30 字')
  const path = workImagePath(body.imagePath)
  if (!path || !path.startsWith(`${profile.id}/`)) throw new AppError(400, '请使用本人上传的图片')
  const image = await admin.storage.from(workBucket).info(path)
  if (image.error) throw new AppError(400, '图片不存在或不可用')
  const values = { ...snakeObject(body, workFields), title, image_url: path, user_id: profile.id, status: 1 }
  if ('is_public' in values) values.is_public = values.is_public ? 1 : 0
  const inserted = await admin.from('user_works').insert(values).select('id').single()
  await recordMetric(admin, 'work_save', !inserted.error)
  const data = assertDb(inserted)
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
  if ('title' in values && (!String(values.title).trim() || String(values.title).length > 200)) throw new AppError(400, '标题长度应为 1-200 个字符')
  if ('description' in values && String(values.description).length > 1000) throw new AppError(400, '说明不能超过 1000 个字符')
  if ('tags' in values && (!Array.isArray(values.tags) || values.tags.length > 5 || values.tags.some((tag) => typeof tag !== 'string' || tag.length > 30))) throw new AppError(400, '标签最多 5 个，每个不超过 30 字')
  if ('is_public' in values) values.is_public = values.is_public ? 1 : 0
  assertDb(await admin.from('user_works').update(values).eq('id', body.id))
  return ok(c, null, '更新成功')
})

app.delete('/api/works/:id', async (c) => {
  const { profile, admin } = await requireUser(c)
  const existing = assertDb(await admin.from('user_works').select('user_id,image_url').eq('id', c.req.param('id')).eq('deleted', false).maybeSingle())
  if (!existing) throw new AppError(404, '作品不存在')
  if (existing.user_id !== profile.id) throw new AppError(403, '无权限删除此作品')
  assertDb(await admin.from('user_works').update({ deleted: true }).eq('id', c.req.param('id')))
  const path = workImagePath(existing.image_url)
  if (path) {
    const linked = assertDb(await admin.from('user_works').select('id').eq('image_url', existing.image_url).eq('deleted', false).limit(1))
    if (!linked.length) {
      const removed = await admin.storage.from(workBucket).remove([path])
      if (removed.error) console.warn('Work image cleanup failed:', removed.error.message)
    }
  }
  return ok(c, null, '删除成功')
})

app.post('/api/works/like/:id', async (c) => {
  return toggleLike(c, 'work')
})

app.get('/api/comments/list', async (c) => {
  const { pageNum, pageSize, from, to } = pageParams(c)
  const targetType = c.req.query('targetType')
  const targetId = c.req.query('targetId')
  if (!targetType || !targetId) throw new AppError(400, '请选择评论目标')
  await requirePublicTarget(c, targetType, targetId)
  let query = getAdmin(c).from('comments').select('*, profiles!user_id(username,nickname,avatar)', { count: 'exact' }).eq('status', 1).eq('deleted', false)
  query = query.eq('target_type', targetType).eq('target_id', targetId)
  const result = await query.order('created_at', { ascending: false }).range(from, to)
  assertDb(result)
  const records = result.data.map((item) => ({ ...camelize(item), userNickname: item.profiles?.nickname || item.profiles?.username, userAvatar: item.profiles?.avatar, profiles: undefined }))
  return ok(c, pageResult(records, result.count || 0, pageNum, pageSize))
})

app.post('/api/comments', async (c) => {
  const { profile, admin } = await requireUser(c)
  const body = await c.req.json()
  const content = String(body.content || '').trim()
  if (!content || content.length > 1000) throw new AppError(400, '评论长度应为 1-1000 个字符')
  const targetId = await requirePublicTarget(c, body.targetType, body.targetId)
  if (body.parentId) {
    const parent = assertDb(await admin.from('comments').select('id').eq('id', body.parentId).eq('target_type', body.targetType).eq('target_id', targetId).eq('deleted', false).maybeSingle())
    if (!parent) throw new AppError(400, '回复的评论不存在')
  }
  const values = { ...snakeObject(body, ['target_type', 'target_id', 'parent_id', 'reply_user_id', 'content', 'images']), user_id: profile.id }
  values.target_id = targetId
  values.content = content
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
  return toggleLike(c, 'comment')
})

app.post('/api/reports', async (c) => {
  const { profile, admin } = await requireUser(c)
  const body = z.object({
    targetType: z.enum(['work', 'comment']),
    targetId: z.number().int().positive(),
    reason: z.string().trim().min(5).max(500),
  }).parse(await c.req.json())
  if (body.targetType === 'work') await requirePublicTarget(c, 'work', body.targetId)
  else {
    const comment = assertDb(await admin.from('comments').select('target_type,target_id').eq('id', body.targetId).eq('status', 1).eq('deleted', false).maybeSingle())
    if (!comment) throw new AppError(404, '评论不存在')
    await requirePublicTarget(c, comment.target_type, comment.target_id)
  }
  const result = await admin.from('content_reports').insert({ reporter_id: profile.id, target_type: body.targetType, target_id: body.targetId, reason: body.reason })
  if (result.error?.code === '23505') throw new AppError(409, '你已举报过该内容，请等待处理')
  assertDb(result)
  return ok(c, null, '举报已提交')
})

app.post('/api/collections/toggle', async (c) => {
  const { profile, admin } = await requireUser(c)
  const body = await c.req.json()
  const targetId = await requirePublicTarget(c, body.targetType, body.targetId)
  const result = await admin.rpc('toggle_collection', { p_user_id: profile.id, p_type: body.targetType, p_target_id: targetId })
  if (result.error) throw new AppError(400, result.error.message)
  const collected = result.data
  return ok(c, collected, collected ? '收藏成功' : '取消收藏成功')
})

async function collectionList(c, type) {
  const { profile, admin } = await requireUser(c)
  const { pageNum, pageSize, from, to } = pageParams(c)
  const links = await admin.from('user_collections').select('target_id', { count: 'exact' }).eq('user_id', profile.id).eq('target_type', type).eq('deleted', false).order('created_at', { ascending: false }).range(from, to)
  assertDb(links)
  const ids = links.data.map((item) => item.target_id)
  if (!ids.length) return pageResult([], links.count || 0, pageNum, pageSize)
  let query = admin.from(targetTables[type]).select('*').in('id', ids).eq('status', 1).eq('deleted', false)
  if (type === 'work') query = query.eq('is_public', 1)
  const records = assertDb(await query)
  const byId = new Map(records.map((item) => [item.id, item]))
  const visible = ids.map((id) => byId.get(id)).filter(Boolean)
  const items = type === 'work' ? await Promise.all(visible.map((item) => presentWork(c, item))) : camelize(visible)
  return pageResult(items, links.count || 0, pageNum, pageSize)
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
    let query = admin.from(config.table).select('*').eq('status', 1).eq('deleted', false)
    if (name === 'work') query = query.eq('is_public', 1)
    const result = await query.or(`${config.title}.ilike.%${keyword}%,${config.description}.ilike.%${keyword}%`).order('view_count', { ascending: false }).limit(20)
    assertDb(result)
    return Promise.all(result.data.map(async (item) => ({ id: item.id, type: name, title: item[config.title], description: item[config.description], cover_image: name === 'work' ? (await presentWork(c, item)).imageUrl : item[config.cover], category: item.category, city: item.city, view_count: item.view_count, like_count: item.like_count, created_at: item.created_at })))
  }))
  const all = groups.flat().sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
  await recordMetric(admin, 'search', all.length > 0)
  const start = (pageNum - 1) * pageSize
  return ok(c, pageResult(camelize(all.slice(start, start + pageSize)), all.length, pageNum, pageSize))
})

app.get('/api/search/hot-keywords', async (c) => {
  const limit = Math.min(50, Math.max(1, Number(c.req.query('limit') || 10)))
  const result = await getAdmin(c).from('search_history').select('keyword').order('created_at', { ascending: false }).limit(2000)
  assertDb(result)
  const counts = new Map()
  for (const item of result.data) counts.set(item.keyword, (counts.get(item.keyword) || 0) + 1)
  return ok(c, [...counts].filter(([, count]) => count >= 3).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([keyword]) => keyword))
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
