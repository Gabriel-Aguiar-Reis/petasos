import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'daily' | 'weekly' | 'monthly'
  targetAmount: real('target_amount').notNull(), // > 0
  periodStart: integer('period_start', { mode: 'timestamp' }).notNull(),
})
