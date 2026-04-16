import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const fuelLogs = sqliteTable('fuel_logs', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  fuelType: text('fuel_type').notNull(), // required, free-form string
  liters: real('liters').notNull(), // > 0
  totalPrice: real('total_price').notNull(), // > 0
  odometer: real('odometer').notNull(), // km; > previous same fuelType
})
