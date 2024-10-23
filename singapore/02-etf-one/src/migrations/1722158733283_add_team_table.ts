import type { Kysely } from 'kysely'


export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
    .createTable('team')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.notNull().primaryKey())
    .addColumn('owner_user_id', 'text', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo('now()'),
    )
    .execute()

  await db.schema
    .createTable('team_member')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.notNull().primaryKey())
    .addColumn('team_id', 'text', (col) => col.notNull())
    .addColumn('user_id', 'text', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('role', 'text', (col) => col.notNull())
    .addColumn('address', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo('now()'),
    )
    .execute()

  await db.schema
    .createTable('team_wallet')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.notNull().primaryKey())
    .addColumn('team_id', 'text', (col) => col.notNull())
    .addColumn('wallet_id', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo('now()'),
    )
    .execute()

}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('team').ifExists().execute()
  await db.schema.dropTable('team_member').ifExists().execute()
  await db.schema.dropTable('team_wallet').ifExists().execute()
}
