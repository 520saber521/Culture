import { randomBytes, scryptSync } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const file = fileURLToPath(new URL('../.local-data/data.json', import.meta.url))
if (!existsSync(file)) {
  console.error('请先启动一次本地 API，创建本地数据目录。')
  process.exit(1)
}
const db = JSON.parse(readFileSync(file, 'utf8'))
const username = process.argv[2] || 'admin'
if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
  console.error('用户名需为 3-50 位字母、数字或下划线。')
  process.exit(2)
}
if (db.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
  console.error('用户名已存在；请使用其他用户名，或通过管理员角色命令提升现有账号。')
  process.exit(1)
}
const password = randomBytes(18).toString('base64url')
const salt = randomBytes(16).toString('hex')
db.users.push({
  id: Math.max(0, ...db.users.map((user) => user.id)) + 1,
  username,
  nickname: '管理员',
  role: 'admin',
  salt,
  passwordHash: scryptSync(password, salt, 64).toString('hex'),
})
const temp = `${file}.${process.pid}.tmp`
writeFileSync(temp, JSON.stringify(db, null, 2))
renameSync(temp, file)
console.log(`本地管理员用户名：${username}`)
console.log(`一次性初始密码：${password}`)
console.log('请妥善保存初始密码；如需修改，可调用已登录的 /api/auth/password 接口。')
