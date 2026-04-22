import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const costs = sqliteTable('costs', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  amount: real('amount').notNull(), // > 0
  category: text('category').notNull(),
  description: text('description'),
  recurrenceRule: text('recurrence_rule'),
  recurrenceEndDate: integer('recurrence_end_date', { mode: 'timestamp' }),
  recurrenceExceptions: text('recurrence_exceptions'), // JSON array of timestamps
  tags: text('tags'), // JSON array
})
