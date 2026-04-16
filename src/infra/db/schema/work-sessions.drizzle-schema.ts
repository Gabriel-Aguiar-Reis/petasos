import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const workSessions = sqliteTable('work_sessions', {
  id: text('id').primaryKey(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }), // nullable
})
