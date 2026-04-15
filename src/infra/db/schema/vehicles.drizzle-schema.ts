import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  plate: text('plate'), // nullable
})
