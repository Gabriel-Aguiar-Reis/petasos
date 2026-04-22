import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(),
  message: text('message').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  alarm: integer('alarm', { mode: 'boolean' }).notNull().default(false),
  recurrenceRule: text('recurrence_rule'),
  recurrenceEndDate: integer('recurrence_end_date', { mode: 'timestamp' }),
  recurrenceExceptions: text('recurrence_exceptions'), // JSON array
  notes: text('notes'),
})
