import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { fuelTypes } from './fuel-types.drizzle-schema'
import { vehicleTypes } from './vehicle-types.drizzle-schema'

export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  plate: text('plate').notNull(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  fuelTypeId: text('fuel_type_id')
    .notNull()
    .references(() => fuelTypes.id),
  typeId: text('type_id')
    .notNull()
    .references(() => vehicleTypes.id),
  color: text('color'),
  notes: text('notes'),
})
