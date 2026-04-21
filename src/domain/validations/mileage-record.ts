import { z } from 'zod'

export const CreateMileageRecordSchema = z.object({
  vehicleId: z.string().min(1, 'vehicleId must not be empty'),
  mileage: z.number().positive('mileage must be > 0'),
  date: z.date().optional(),
  notes: z.string().optional(),
})

export type CreateMileageRecordInput = z.infer<typeof CreateMileageRecordSchema>
