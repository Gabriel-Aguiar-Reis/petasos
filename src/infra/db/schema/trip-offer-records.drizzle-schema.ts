import { tripPlatforms } from '@/src/infra/db/schema/trip-platforms.drizzle-schema'
import { vehicles } from '@/src/infra/db/schema/vehicles.drizzle-schema'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tripOfferRecords = sqliteTable('trip_offer_records', {
  id: text('id').primaryKey(),
  platformId: text('platform_id')
    .notNull()
    .references(() => tripPlatforms.id),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  offeredFare: real('offered_fare').notNull(),
  estimatedDistance: real('estimated_distance').notNull(),
  deadheadDistance: real('deadhead_distance').notNull(),
  estimatedDuration: real('estimated_duration').notNull(),
  deadheadDuration: real('deadhead_duration').notNull(),
  passengerRating: real('passenger_rating'),
  notes: text('notes'),
})
