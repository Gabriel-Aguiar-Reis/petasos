import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const specialDays = sqliteTable('special_days', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  description: text('description').notNull(),
  source: text('source').notNull(), // 'custom' | 'official'
  type: text('type'),
})
