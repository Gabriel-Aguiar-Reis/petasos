import { tripPlatforms } from '@/src/infra/db/schema/trip-platforms.drizzle-schema'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const savedProfitGoals = sqliteTable('saved_profit_goals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  targetAmount: real('target_amount').notNull(),
  period: text('period'), // 'daily' | 'weekly' | 'monthly' | 'custom' | null
  tags: text('tags'), // JSON array
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const platformProfitGoals = sqliteTable('platform_profit_goals', {
  id: text('id').primaryKey(),
  platformId: text('platform_id')
    .notNull()
    .references(() => tripPlatforms.id),
  targetAmount: real('target_amount').notNull(),
  tags: text('tags'), // JSON array
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
