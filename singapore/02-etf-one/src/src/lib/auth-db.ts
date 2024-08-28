import { NeonDialect } from 'kysely-neon'
import { Kysely } from 'kysely'
import { neonConfig } from '@neondatabase/serverless'
import { createKysely } from '@vercel/postgres-kysely'
import { Database } from '@auth/kysely-adapter'


export let AuthDB: Kysely<Database>
// if we're running locally
if (process.env.POSTGRES_DATABASE !== 'verceldb') {
  console.log('🖥️ Running locally, using Docker container for PostgreSQL 🐳')
  // Set the WebSocket proxy to work with the local instance
  neonConfig.wsProxy = (host) => `${host}:5433/v1`
  // Disable all authentication and encryption
  neonConfig.useSecureWebSocket = false
  neonConfig.pipelineTLS = false
  neonConfig.pipelineConnect = false
  AuthDB = new Kysely<Database>({
    dialect: new NeonDialect({
      connectionString: process.env.POSTGRES_URL,
    })
  })

}else{
  console.log('🚀 Running on Vercel, using Vercel PostgreSQL hosting 🐘')
  AuthDB = createKysely<Database>()
}


