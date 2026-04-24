import { users } from '@/src/infra/db/schema/users.drizzle-schema'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const userSettings = sqliteTable('user_settings', {
  id: text('id').primaryKey(), // always 'default'
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  preferredUnits: text('preferred_units').notNull().default('km/l'),
  currency: text('currency').notNull().default('BRL'),
  displayPreferences: text('display_preferences').notNull(), // JSON
  starredScreen: text('starred_screen'), // e.g. 'costs', 'profits', 'maintenance', 'reminders', 'trips', 'fuel'
  tripOfferPill: text('trip_offer_pill'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
