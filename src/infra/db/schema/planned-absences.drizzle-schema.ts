import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const plannedAbsences = sqliteTable('planned_absences', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'day_off' | 'vacation'
  date: integer('date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  workedDays: text('worked_days'), // JSON array of timestamps
  cancelledAt: integer('cancelled_at', { mode: 'timestamp' }),
  notes: text('notes'),
})
