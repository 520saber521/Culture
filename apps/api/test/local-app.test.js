import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createLocalApp } from '../src/local-app.js'

test('local registration, login and gallery survive a restart', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cultural-api-'))
  try {
    let app = createLocalApp(dir)
    const json = async (path, method, body, token) => {
      const res = await app.request(path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
      return { status: res.status, body: await res.json() }
    }
    const registered = await json('/api/auth/register', 'POST', { username: 'visitor', password: 'secret123', confirmPassword: 'secret123' })
    assert.equal(registered.status, 200)
    const logged = await json('/api/auth/login', 'POST', { username: 'visitor', password: 'secret123' })
    assert.equal(logged.status, 200)
    const token = logged.body.data.token
    const denied = await json('/api/admin/content/news', 'GET', null, token)
    assert.equal(denied.status, 403)
    const png = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])
    const form = new FormData()
    form.append('file', new Blob([png], { type: 'image/png' }), 'work.png')
    const uploaded = await app.request('/api/works/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
    assert.equal(uploaded.status, 200)
    const path = (await uploaded.json()).data.path
    const created = await json('/api/works', 'POST', { title: '园林', imagePath: path, isPublic: true }, token)
    assert.equal(created.status, 200)
    app = createLocalApp(dir)
    const works = await json('/api/works/list', 'GET')
    assert.equal(works.body.data.total, 1)
    assert.equal(works.body.data.records[0].title, '园林')
    const image = await app.request(works.body.data.records[0].imageUrl)
    assert.equal(image.status, 200)
    assert.equal(image.headers.get('content-type'), 'image/png')

    const file = join(dir, 'data.json')
    const db = JSON.parse(readFileSync(file, 'utf8'))
    db.users[0].role = 'admin'
    writeFileSync(file, JSON.stringify(db))
    app = createLocalApp(dir)
    const adminLogin = await json('/api/auth/login', 'POST', { username: 'visitor', password: 'secret123' })
    assert.equal(adminLogin.body.data.userInfo.role, 'admin')
    const createdNews = await json('/api/admin/content/news', 'POST', { title: '文化动态草稿' }, adminLogin.body.data.token)
    assert.equal(createdNews.status, 200)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})
