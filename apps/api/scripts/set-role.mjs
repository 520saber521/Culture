import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const [username, role] = process.argv.slice(2)
if (!username || !['user', 'admin'].includes(role)) {
  console.error('用法：node scripts/set-role.mjs <用户名> <user|admin>')
  process.exit(2)
}

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('请先配置服务端 Supabase 环境变量')
  process.exit(2)
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const result = await admin.from('profiles').update({ role }).eq('username', username).eq('deleted', false).select('id').maybeSingle()
if (result.error || !result.data) {
  console.error(result.error?.message || '用户不存在')
  process.exit(1)
}

const log = await admin.from('operation_logs').insert({ action: 'set_role', target_type: 'profile', target_id: result.data.id })
if (log.error) console.warn('角色已更新，但操作日志写入失败：', log.error.message)
console.log(`已将 ${username} 的角色设为 ${role}`)
