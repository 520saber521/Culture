import { randomBytes, randomUUID, createHmac, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import sanitizeHtml from 'sanitize-html'

const types = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const cities = ['南京','无锡','徐州','常州','苏州','南通','连云港','淮安','盐城','扬州','镇江','泰州','宿迁']
const page = (items, c) => {
  const current = Math.max(1, Number(c.req.query('pageNum')) || 1)
  const size = Math.min(100, Math.max(1, Number(c.req.query('pageSize')) || 10))
  return { records: items.slice((current - 1) * size, current * size), total: items.length, current, size, pages: Math.ceil(items.length / size) }
}
const reply = (c, data = null, message = '操作成功') => c.json({ code: 200, message, data, timestamp: Date.now() })
const error = (status, message) => Object.assign(new Error(message), { status })
const publicUser = (user) => ({ id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar || null, email: user.email || null, phone: user.phone || null, bio: user.bio || null, role: user.role || 'user' })
const hashPassword = (password, salt) => scryptSync(password, salt, 64).toString('hex')

export function createLocalApp(root = fileURLToPath(new URL('../.local-data', import.meta.url))) {
  mkdirSync(join(root, 'images'), { recursive: true })
  const dbFile = join(root, 'data.json')
  const db = existsSync(dbFile) ? JSON.parse(readFileSync(dbFile, 'utf8')) : { secret: randomBytes(32).toString('hex'), users: [], sessions: [], works: [], comments: [], collections: [], likes: [] }
  db.news ||= []
  const save = () => {
    const temp = `${dbFile}.${process.pid}.tmp`
    writeFileSync(temp, JSON.stringify(db, null, 2))
    renameSync(temp, dbFile)
  }
  if (!existsSync(dbFile)) save()
  const app = new Hono()
  app.use('*', cors({ origin: 'http://localhost:3000', allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }))
  app.onError((e, c) => c.json({ code: e.status || 500, message: e.status ? e.message : '本地服务出错', data: null, timestamp: Date.now() }, e.status || 500))
  const auth = (c) => {
    const token = (c.req.header('authorization') || '').replace(/^Bearer /, '')
    const session = db.sessions.find((item) => item.token === token)
    const user = session && db.users.find((item) => item.id === session.userId)
    if (!user) throw error(401, '请先登录')
    return { user, session }
  }
  const admin = (c) => {
    const { user } = auth(c)
    if (user.role !== 'admin') throw error(403, '仅管理员可维护内容')
    return user
  }
  const signedUrl = (c, path) => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const sig = createHmac('sha256', db.secret).update(`${path}:${exp}`).digest('hex')
    return `${new URL(c.req.url).origin}/api/local-images/${path}?exp=${exp}&sig=${sig}`
  }
  const present = (c, work) => {
    const user = db.users.find((item) => item.id === work.userId)
    return { ...work, imageUrl: signedUrl(c, work.imagePath), userNickname: user?.nickname || user?.username || '用户', userAvatar: user?.avatar || null, userId: work.userId, isPublic: work.isPublic, likeCount: db.likes.filter((item) => item.type === 'work' && item.targetId === work.id).length, collectCount: db.collections.filter((item) => item.type === 'work' && item.targetId === work.id).length, commentCount: db.comments.filter((item) => item.targetType === 'work' && item.targetId === work.id).length }
  }
  const ownedPath = (user, path) => typeof path === 'string' && new RegExp(`^${user.id}/[a-f0-9-]+\\.(jpg|png|webp)$`).test(path)
  const publicWork = (id) => db.works.find((item) => item.id === Number(id) && item.isPublic)

  app.get('/api/health', (c) => reply(c, { status: 'ok', mode: 'local' }))
  app.get('/api/health/ready', (c) => reply(c, { status: 'ready', mode: 'local' }))
  app.post('/api/auth/register', async (c) => {
    const body = await c.req.json()
    const username = String(body.username || '').trim()
    if (username.length < 3 || username.length > 50 || String(body.password || '').length < 6 || body.password !== body.confirmPassword) throw error(400, '用户名或密码不符合要求')
    if (db.users.some((item) => item.username.toLowerCase() === username.toLowerCase())) throw error(409, '用户名已存在')
    const salt = randomBytes(16).toString('hex')
    db.users.push({ id: db.users.length + 1, username, nickname: body.nickname || username, role: 'user', salt, passwordHash: hashPassword(body.password, salt) })
    save()
    return reply(c, null, '注册成功')
  })
  app.post('/api/auth/login', async (c) => {
    const body = await c.req.json()
    const user = db.users.find((item) => item.username.toLowerCase() === String(body.username || '').trim().toLowerCase())
    const supplied = user ? hashPassword(String(body.password || ''), user.salt) : ''
    if (!user || !timingSafeEqual(Buffer.from(user.passwordHash), Buffer.from(supplied))) throw error(401, '用户名或密码错误')
    const session = { userId: user.id, token: randomBytes(32).toString('hex'), refreshToken: randomBytes(32).toString('hex') }
    db.sessions.push(session)
    save()
    return reply(c, { token: session.token, refreshToken: session.refreshToken, userInfo: publicUser(user) }, '登录成功')
  })
  app.post('/api/auth/refresh', async (c) => {
    const body = await c.req.json()
    const session = db.sessions.find((item) => item.refreshToken === body.refreshToken)
    if (!session) throw error(401, '登录状态已失效')
    session.token = randomBytes(32).toString('hex')
    session.refreshToken = randomBytes(32).toString('hex')
    save()
    return reply(c, { token: session.token, refreshToken: session.refreshToken })
  })
  app.post('/api/auth/logout', (c) => {
    const { session } = auth(c)
    db.sessions.splice(db.sessions.indexOf(session), 1)
    save()
    return reply(c, null, '已退出')
  })
  app.get('/api/auth/info', (c) => reply(c, publicUser(auth(c).user)))
  app.put('/api/auth/info', async (c) => {
    const { user } = auth(c)
    const body = await c.req.json()
    for (const field of ['nickname','avatar','email','phone','bio']) if (field in body) user[field] = body[field]
    save()
    return reply(c, publicUser(user), '更新成功')
  })
  app.put('/api/auth/password', async (c) => {
    const { user } = auth(c)
    const body = await c.req.json()
    if (hashPassword(String(body.oldPassword || ''), user.salt) !== user.passwordHash || String(body.newPassword || '').length < 6) throw error(400, '原密码错误或新密码过短')
    user.salt = randomBytes(16).toString('hex')
    user.passwordHash = hashPassword(body.newPassword, user.salt)
    db.sessions = db.sessions.filter((item) => item.userId !== user.id)
    save()
    return reply(c, null, '密码已修改，请重新登录')
  })
  app.post('/api/works/upload', async (c) => {
    const { user } = auth(c)
    const file = (await c.req.formData()).get('file')
    if (!file || !types[file.type] || file.size < 1 || file.size > 5 * 1024 * 1024) throw error(400, '仅支持 5 MB 内的 JPG、PNG、WebP 图片')
    const bytes = new Uint8Array(await file.arrayBuffer())
    const valid = file.type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : file.type === 'image/png' ? [137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n) : String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP'
    if (!valid) throw error(400, '图片内容与格式不匹配')
    const path = `${user.id}/${randomUUID()}.${types[file.type]}`
    const destination = join(root, 'images', path)
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, bytes)
    return reply(c, { path }, '上传成功')
  })
  app.get('/api/local-images/:owner/:name', (c) => {
    const path = `${c.req.param('owner')}/${c.req.param('name')}`
    const exp = Number(c.req.query('exp'))
    const sig = c.req.query('sig') || ''
    const expected = createHmac('sha256', db.secret).update(`${path}:${exp}`).digest('hex')
    if (!/^\d+\/[a-f0-9-]+\.(jpg|png|webp)$/.test(path) || exp < Date.now() / 1000 || sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) throw error(403, '图片链接无效')
    const file = join(root, 'images', path)
    if (!existsSync(file)) throw error(404, '图片不存在')
    const mime = path.endsWith('.png') ? 'image/png' : path.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
    return c.body(readFileSync(file), 200, { 'Content-Type': mime, 'Cache-Control': 'private, max-age=300' })
  })
  app.delete('/api/works/upload', (c) => {
    const { user } = auth(c)
    const path = c.req.query('path')
    if (!ownedPath(user, path) || db.works.some((item) => item.imagePath === path)) throw error(400, '图片不可清理')
    const file = join(root, 'images', path)
    if (existsSync(file)) unlinkSync(file)
    return reply(c)
  })
  app.post('/api/works', async (c) => {
    const { user } = auth(c)
    const body = await c.req.json()
    const path = body.imagePath
    if (!ownedPath(user, path) || !existsSync(join(root, 'images', path)) || db.works.some((item) => item.imagePath === path)) throw error(400, '请使用本人新上传的图片')
    const title = String(body.title || '').trim()
    if (!title || title.length > 200) throw error(400, '作品名称应为 1-200 字')
    const work = { id: db.works.length + 1, userId: user.id, title, description: String(body.description || '').slice(0, 1000), imagePath: path, category: body.category || '', tags: Array.isArray(body.tags) ? body.tags.slice(0, 5) : [], isPublic: body.isPublic !== false, allowDownload: body.allowDownload === true, createTime: new Date().toISOString(), viewCount: 0 }
    db.works.push(work)
    save()
    return reply(c, work.id, '创建成功')
  })
  app.get('/api/works/list', (c) => reply(c, page(db.works.filter((item) => item.isPublic).slice().reverse().map((item) => present(c, item)), c)))
  app.get('/api/works/my', (c) => { const { user } = auth(c); return reply(c, page(db.works.filter((item) => item.userId === user.id).slice().reverse().map((item) => present(c, item)), c)) })
  app.get('/api/works/detail/:id', (c) => {
    const work = db.works.find((item) => item.id === Number(c.req.param('id')))
    if (!work || (!work.isPublic && work.userId !== auth(c).user.id)) throw error(404, '作品不存在')
    work.viewCount++
    save()
    return reply(c, present(c, work))
  })
  app.delete('/api/works/:id', (c) => {
    const { user } = auth(c)
    const index = db.works.findIndex((item) => item.id === Number(c.req.param('id')) && item.userId === user.id)
    if (index < 0) throw error(404, '作品不存在')
    const [work] = db.works.splice(index, 1)
    const file = join(root, 'images', work.imagePath)
    if (existsSync(file)) unlinkSync(file)
    save()
    return reply(c, null, '删除成功')
  })
  app.post('/api/works/like/:id', (c) => {
    const { user } = auth(c)
    const work = publicWork(c.req.param('id'))
    if (!work) throw error(404, '作品不存在')
    const index = db.likes.findIndex((item) => item.userId === user.id && item.type === 'work' && item.targetId === work.id)
    if (index >= 0) db.likes.splice(index, 1)
    else db.likes.push({ userId: user.id, type: 'work', targetId: work.id })
    save()
    return reply(c, { liked: index < 0 })
  })
  app.post('/api/collections/toggle', async (c) => {
    const { user } = auth(c)
    const body = await c.req.json()
    if (body.targetType !== 'work' || !publicWork(body.targetId)) throw error(404, '作品不存在')
    const index = db.collections.findIndex((item) => item.userId === user.id && item.type === 'work' && item.targetId === Number(body.targetId))
    if (index >= 0) db.collections.splice(index, 1)
    else db.collections.push({ userId: user.id, type: 'work', targetId: Number(body.targetId) })
    save()
    return reply(c, index < 0)
  })
  app.get('/api/collections/work', (c) => { const { user } = auth(c); return reply(c, page(db.collections.filter((item) => item.userId === user.id).map((item) => publicWork(item.targetId)).filter(Boolean).map((item) => present(c, item)), c)) })
  app.get('/api/comments/list', (c) => {
    const targetId = Number(c.req.query('targetId'))
    if (c.req.query('targetType') !== 'work' || !publicWork(targetId)) throw error(404, '作品不存在')
    return reply(c, page(db.comments.filter((item) => item.targetId === targetId).slice().reverse(), c))
  })
  app.post('/api/comments', async (c) => {
    const { user } = auth(c)
    const body = await c.req.json()
    if (body.targetType !== 'work' || !publicWork(body.targetId) || !String(body.content || '').trim()) throw error(400, '评论参数错误')
    const comment = { id: db.comments.length + 1, targetType: 'work', targetId: Number(body.targetId), userId: user.id, userNickname: user.nickname, userAvatar: user.avatar || null, content: String(body.content).trim().slice(0, 1000), likeCount: 0, createTime: new Date().toISOString() }
    db.comments.push(comment)
    save()
    return reply(c, comment.id, '评论成功')
  })
  app.post('/api/comments/like/:id', (c) => { auth(c); const item = db.comments.find((entry) => entry.id === Number(c.req.param('id'))); if (!item) throw error(404, '评论不存在'); item.likeCount++; save(); return reply(c, { liked: true }) })
  app.get('/api/cities/list', (c) => reply(c, cities.map((name, index) => ({ id: index + 1, name: `${name}市` }))))
  app.get('/api/categories/list', (c) => reply(c, []))
  app.get('/api/categories/all', (c) => reply(c, []))
  app.get('/api/news/list', (c) => reply(c, page(db.news.filter((item) => item.status === 1).slice().reverse(), c)))
  app.get('/api/news/detail/:id', (c) => {
    const item = db.news.find((entry) => entry.id === Number(c.req.param('id')) && entry.status === 1)
    if (!item) throw error(404, '文化动态不存在')
    return reply(c, item)
  })
  app.get('/api/admin/content/news', (c) => { admin(c); return reply(c, page(db.news.slice().reverse(), c)) })
  app.get('/api/admin/content/news/:id', (c) => {
    admin(c)
    const item = db.news.find((entry) => entry.id === Number(c.req.param('id')))
    if (!item) throw error(404, '文化动态不存在')
    return reply(c, item)
  })
  app.post('/api/admin/content/news', async (c) => {
    admin(c)
    const body = await c.req.json()
    const title = String(body.title || '').trim()
    if (!title || title.length > 200) throw error(400, '标题应为 1-200 字')
    const item = { id: Math.max(0, ...db.news.map((entry) => entry.id)) + 1, title, summary: String(body.summary || '').slice(0, 500), content: sanitizeHtml(body.content || ''), status: 0, createTime: new Date().toISOString() }
    db.news.push(item)
    save()
    return reply(c, item.id, '草稿已创建')
  })
  app.put('/api/admin/content/news/:id', async (c) => {
    admin(c)
    const item = db.news.find((entry) => entry.id === Number(c.req.param('id')))
    if (!item) throw error(404, '文化动态不存在')
    const body = await c.req.json()
    if ('title' in body) {
      const title = String(body.title || '').trim()
      if (!title || title.length > 200) throw error(400, '标题应为 1-200 字')
      item.title = title
    }
    if ('summary' in body) item.summary = String(body.summary || '').slice(0, 500)
    if ('content' in body) item.content = sanitizeHtml(String(body.content || ''))
    item.updateTime = new Date().toISOString()
    save()
    return reply(c, item.id, '保存成功')
  })
  app.post('/api/admin/content/news/:id/status', async (c) => {
    admin(c)
    const item = db.news.find((entry) => entry.id === Number(c.req.param('id')))
    if (!item) throw error(404, '文化动态不存在')
    const body = await c.req.json()
    if (![0,1,2].includes(body.status)) throw error(400, '状态无效')
    item.status = body.status
    if (body.status === 1) item.publishTime = new Date().toISOString()
    save()
    return reply(c, { id: item.id, status: item.status }, '状态已更新')
  })
  for (const name of ['heritage','arts','celebrities','city-features']) app.get(`/api/${name}/list`, (c) => reply(c, page([], c)))
  app.notFound((c) => c.json({ code: 404, message: '接口不存在', data: null, timestamp: Date.now() }, 404))
  return app
}
