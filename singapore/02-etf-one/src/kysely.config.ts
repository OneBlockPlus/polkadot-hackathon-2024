import { defineConfig } from 'kysely-ctl'
import { config } from 'dotenv'
import { Pool } from 'pg'
import { PostgresDialect } from 'kysely'

let ssl = false
if(process.env.MIGRATION === 'REMOTE'){
  config({path: '.env.development.local', override:true})
  ssl = true
}

export default defineConfig({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: process.env.POSTGRES_DATABASE,
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl
    })
  })
})