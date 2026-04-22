import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { fuelTypes } from './fuel-types.drizzle-schema'
import { vehicles } from './vehicles.drizzle-schema'

export const fuelConsumptionRecords = sqliteTable('fuel_consumption_records', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  fuelTypeId: text('fuel_type_id')
    .notNull()
    .references(() => fuelTypes.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  startMileage: integer('start_mileage').notNull(),
  endMileage: integer('end_mileage').notNull(),
  fuelAdded: real('fuel_added').notNull(),
  averageConsumption: real('average_consumption').notNull(),
  // Flat gauge columns (R-004)
  gaugeBefore: real('gauge_before'),
  gaugeAfter: real('gauge_after'),
  gaugeTotalCapacity: real('gauge_total_capacity'),
  tags: text('tags'), // JSON array
  notes: text('notes'),
})
