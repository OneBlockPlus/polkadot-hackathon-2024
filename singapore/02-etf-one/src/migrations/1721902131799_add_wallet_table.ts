import type { Kysely } from 'kysely'

 
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('wallet')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.notNull().primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull())
    .addColumn('name', 'text')
    .addColumn('address', 'text', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull())
    .addColumn('balance', 'numeric', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo('now()'),
    )
    .execute()

  await db.schema
    .createIndex('wallet_user_id_address_index')
    .on('wallet')
    .column('user_id')
    .column('address')
    .unique()
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('wallet').ifExists().execute()
}
