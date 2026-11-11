import test from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'
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
