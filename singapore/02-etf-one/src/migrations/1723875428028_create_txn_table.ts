import type { Kysely } from 'kysely'


export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('transaction')
    .addColumn('id', 'text', (col) => col.notNull().primaryKey())
    .addColumn('from', 'text', col => col.notNull()) // 使用 `text` 类型
    .addColumn('wallet_name', 'text', col => col.notNull()) // 使用 `text` 类型
    .addColumn('to', 'text', col => col.notNull())   // 使用 `text` 类型
    .addColumn('amount', 'numeric(10, 2)', col => col.notNull()) // 使用 `numeric` 类型
    .addColumn('created_by', 'text', col => col.notNull()) // 使用 `text` 类型
    .addColumn('status', 'text', col => col.notNull()) // 使用 `text` 类型
    .addColumn('description', 'text') // 使用 `text` 类型
    .addColumn('created_at', 'timestamp', col => col.defaultTo('now()').notNull()) // 使用 `timestamp` 类型
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('transaction').execute()
}
