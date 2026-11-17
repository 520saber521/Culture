import 'dotenv/config'
import { serve } from '@hono/node-server'

const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
const configured = process.env.LOCAL_API_MODE !== '1' && Boolean(
  process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('YOUR_PROJECT') &&
  serviceKey && !serviceKey.endsWith('xxx') && publicKey && !publicKey.endsWith('xxx')
)
const app = configured ? (await import('./app.js')).default : (await import('./local-app.js')).createLocalApp()
const port = Number(process.env.PORT || 8787)
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Cultural API (${configured ? 'Supabase' : 'local development'}) running at http://localhost:${info.port}`)
})
