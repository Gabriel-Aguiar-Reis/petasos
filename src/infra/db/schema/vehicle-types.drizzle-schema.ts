import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const vehicleTypes = sqliteTable('vehicle_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  tags: text('tags'), // JSON array of strings
})
