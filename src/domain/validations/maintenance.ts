import { z } from 'zod'

const DateTriggerSchema = z.object({
  type: z.literal('date'),
  date: z.date(),
})

const MileageTriggerSchema = z.object({
  type: z.literal('mileage'),
  mileage: z.number().positive('Mileage trigger must be > 0'),
})

const TriggerSchema = z.discriminatedUnion('type', [
  DateTriggerSchema,
  MileageTriggerSchema,
])

export const CreateMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'vehicleId is required'),
  title: z.string().min(1, 'title is required'),
  estimatedCost: z.number().positive('estimatedCost must be > 0'),
  trigger: TriggerSchema,
  notes: z.string().optional(),
})

export const UpdateMaintenanceSchema = z.object({
  title: z.string().min(1).optional(),
  estimatedCost: z.number().positive().optional(),
  trigger: TriggerSchema.optional(),
  completedAt: z.date().optional(),
  notes: z.string().nullable().optional(),
})

export type CreateMaintenanceInput = z.infer<typeof CreateMaintenanceSchema>
export type UpdateMaintenanceInput = z.infer<typeof UpdateMaintenanceSchema>
