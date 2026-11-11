import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './app.js'

const port = Number(process.env.PORT || 8787)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Cultural API is running at http://localhost:${info.port}`)
})
