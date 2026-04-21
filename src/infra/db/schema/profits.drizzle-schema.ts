import { tripPlatforms } from '@/src/infra/db/schema/trip-platforms.drizzle-schema'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const profits = sqliteTable('profits', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  amount: real('amount').notNull(),
  platformId: text('platform_id')
    .notNull()
    .references(() => tripPlatforms.id),
  description: text('description'),
  tags: text('tags'), // JSON array
})
