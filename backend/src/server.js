import 'dotenv/config'
import createApp from './app.js'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createDb } from './db/sqlite.js'

const port = Number(process.env.PORT) || 4000

const dataDir = join(process.cwd(), 'data')
mkdirSync(dataDir, { recursive: true })

const dbPath = join(dataDir, 'qrproject.sqlite')
const db = createDb({ filePath: dbPath })

const app = createApp({ db })

app.listen(port, () => {
  process.stdout.write(`backend listening on http://localhost:${port}\n`)
})
