import { vehicles } from '@/src/infra/db/schema/vehicles.drizzle-schema'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const trips = sqliteTable('trips', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  earnings: real('earnings').notNull(), // ≥ 0
  platformId: text('platform_id').notNull(),
  distance: real('distance'), // nullable
  duration: integer('duration'), // nullable, minutes
  origin: text('origin'), // nullable
  destination: text('destination'), // nullable
  vehicleId: text('vehicle_id').references(() => vehicles.id), // FK, nullable
})
