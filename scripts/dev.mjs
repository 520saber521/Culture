import { spawn } from 'node:child_process'

const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const options = { stdio: 'inherit', shell: process.platform === 'win32' }
async function check(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1500) })
    return response.ok ? response : null
  } catch { return null }
}
const apiResponse = await check('http://127.0.0.1:8787/api/health')
if (apiResponse) {
  const health = await apiResponse.json()
  if (health.data?.supabase === false && !health.data?.mode) {
    console.error('8787 端口运行着旧版未配置的 API，请先停止它再运行 npm run dev。')
    process.exit(1)
  }
}
const webResponse = await check('http://127.0.0.1:3000/')
const children = []
if (!apiResponse) children.push(spawn(command, ['run', 'dev:api'], options))
else console.log('API 已运行：http://localhost:8787')
if (!webResponse) children.push(spawn(command, ['run', 'dev:web'], options))
else console.log('前端已运行：http://localhost:3000')

let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) if (child.exitCode === null) child.kill()
  process.exitCode = code
}
for (const child of children) {
  child.on('error', (error) => { console.error(error); stop(1) })
  child.on('exit', (code) => stop(code || 0))
}
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
