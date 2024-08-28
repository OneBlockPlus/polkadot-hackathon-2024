import { Kysely } from 'kysely'


export async function up(db: Kysely<any>): Promise<void> {
  // Create accounts table
  await db.schema
    .createTable('accounts')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.notNull().primaryKey())
    .addColumn('userId', 'text', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull())
    .addColumn('provider', 'text', (col) => col.notNull())
    .addColumn('providerAccountId', 'text', (col) => col.notNull())
    .addColumn('refresh_token', 'text')
    .addColumn('access_token', 'text')
    .addColumn('expires_at', 'integer')
    .addColumn('token_type', 'text')
    .addColumn('scope', 'text')
    .addColumn('id_token', 'text')
    .addColumn('session_state', 'text')
    .addColumn('oauth_token_secret', 'text')
    .addColumn('oauth_token', 'text')
    .execute()

  // Create sessions table
  await db.schema
    .createTable('sessions')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.notNull())
    .addColumn('sessionToken', 'text', (col) => col.notNull().primaryKey())
    .addColumn('userId', 'text', (col) => col.notNull())
    .addColumn('expires', 'timestamp', (col) => col.notNull())
    .execute()

  // Create users table
  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.notNull().primaryKey())
    .addColumn('name', 'text')
    .addColumn('email', 'text')
    .addColumn('emailVerified', 'timestamp')
    .addColumn('image', 'text')
    .addColumn('address', 'text')
    .addColumn('hashedPassword', 'text')
    .execute()

  // Create verification_tokens table
  await db.schema
    .createTable('verification_tokens')
    .ifNotExists()
    .addColumn('identifier', 'text', (col) => col.notNull())
    .addColumn('token', 'text', (col) => col.notNull().primaryKey())
    .addColumn('expires', 'timestamp', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('accounts').ifExists().execute()
  await db.schema.dropTable('sessions').ifExists().execute()
  await db.schema.dropTable('users').ifExists().execute()
  await db.schema.dropTable('verification_tokens').ifExists().execute()
}