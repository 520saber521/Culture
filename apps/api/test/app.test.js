import test from 'node:test'
import assert from 'node:assert/strict'
import app, { cleanContent, workImagePath } from '../src/app.js'
import { usernameEmail } from '../src/lib.js'

test('health endpoint works without external services', async () => {
  const response = await app.request('/api/health')
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.code, 200)
  assert.equal(body.data.status, 'ok')
  assert.equal(typeof body.timestamp, 'number')
})

test('CORS preflight is handled', async () => {
  const response = await app.request('/api/health', {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:3000' },
  })
  assert.equal(response.status, 204)
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:3000')
})

test('unknown route uses the legacy response envelope', async () => {
  const response = await app.request('/api/does-not-exist')
  const body = await response.json()
  assert.equal(response.status, 404)
  assert.equal(body.code, 404)
  assert.equal(body.data, null)
})

test('username mapping is deterministic and edge-runtime safe', async () => {
  const first = await usernameEmail('苏州用户')
  const second = await usernameEmail('苏州用户')
  assert.equal(first, second)
  assert.match(first, /^u-[a-f0-9]{48}@accounts\.cultural\.example$/)
})

test('work image upload and news editing require authentication', async () => {
  const upload = await app.request('/api/works/upload', { method: 'POST' })
  assert.equal(upload.status, 401)
  const edit = await app.request('/api/admin/news/1', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'test', content: '' }) })
  assert.equal(edit.status, 401)
})

test('published HTML strips executable markup and unsafe attributes', () => {
  const html = cleanContent('<h2 onclick="alert(1)">文化</h2><script>alert(1)</script><p><strong>正文</strong><img src=x onerror=alert(1)></p>')
  assert.equal(html, '<h2>文化</h2><p><strong>正文</strong></p>')
})

test('work image path accepts only platform storage objects', () => {
  assert.equal(workImagePath('42/abc-123.jpg'), '42/abc-123.jpg')
  assert.equal(workImagePath('https://example.supabase.co/storage/v1/object/public/user-works/42/abc-123.jpg'), '42/abc-123.jpg')
  assert.equal(workImagePath('https://attacker.example/image.jpg'), null)
  assert.equal(workImagePath('../other-user.jpg'), null)
})

test('content management requires a signed-in administrator', async () => {
  const list = await app.request('/api/admin/content/news')
  assert.equal(list.status, 401)
  const create = await app.request('/api/admin/content/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: '草稿' }) })
  assert.equal(create.status, 401)
})

test('authentication attempts are throttled before reaching the identity provider', async () => {
  const headers = { 'Content-Type': 'application/json', 'x-real-ip': 'test-rate-limit-user' }
  let response
  for (let index = 0; index < 11; index++) {
    response = await app.request('/api/auth/login', { method: 'POST', headers, body: JSON.stringify({ username: 'testuser', password: 'secret123' }) })
  }
  assert.equal(response.status, 429)
})
