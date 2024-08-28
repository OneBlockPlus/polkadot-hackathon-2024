import { Kysely } from 'kysely'

 
export async function up(db: Kysely<any>): Promise<void> {
  // Add new columns to users table
  await db.schema
    .alterTable('users')
    .addColumn('public_address', 'text')
    .execute()

  await db.schema
    .alterTable('users')
    .addColumn('login_nonce', 'text')
    .execute()

  await db.schema
    .alterTable('users')
    .addColumn('login_nonce_expired_at', 'timestamp')
    .execute()

  // Create unique index on public_address
  await db.schema
    .createIndex('users_public_address_index')
    .on('users')
    .column('public_address')
    .unique()
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the index
  await db.schema
    .dropIndex('users_public_address_index')
    .execute()

  // Remove the added columns
  await db.schema
    .alterTable('users')
    .dropColumn('login_nonce_expired_at')
    .execute()

  await db.schema
    .alterTable('users')
    .dropColumn('login_nonce')
    .execute()

  await db.schema
    .alterTable('users')
    .dropColumn('public_address')
    .execute()
}