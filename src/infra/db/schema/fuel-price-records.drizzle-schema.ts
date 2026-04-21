import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { fuelTypes } from './fuel-types.drizzle-schema'

export const fuelPriceRecords = sqliteTable('fuel_price_records', {
  id: text('id').primaryKey(),
  fuelTypeId: text('fuel_type_id')
    .notNull()
    .references(() => fuelTypes.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  pricePerLiter: real('price_per_liter').notNull(),
  notes: text('notes'),
})
