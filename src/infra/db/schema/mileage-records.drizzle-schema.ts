import { vehicles } from '@/src/infra/db/schema/vehicles.drizzle-schema'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const mileageRecords = sqliteTable('mileage_records', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  mileage: integer('mileage').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  notes: text('notes'),
})
