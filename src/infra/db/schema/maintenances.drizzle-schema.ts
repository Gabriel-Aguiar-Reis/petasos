import { vehicles } from '@/src/infra/db/schema/vehicles.drizzle-schema'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const maintenances = sqliteTable('maintenances', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  title: text('title').notNull(),
  estimatedCost: real('estimated_cost').notNull(),
  triggerType: text('trigger_type').notNull(), // 'date' | 'mileage'
  triggerDate: integer('trigger_date', { mode: 'timestamp' }),
  triggerMileage: real('trigger_mileage'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  notes: text('notes'),
})
