import { z } from 'zod'

export const CreateFuelConsumptionRecordSchema = z.object({
  vehicleId: z.string().min(1, 'vehicleId is required'),
  fuelTypeId: z.string().min(1, 'fuelTypeId is required'),
  date: z.date().optional(),
  startMileage: z.number().nonnegative('startMileage must be ≥ 0'),
  endMileage: z.number().nonnegative('endMileage must be ≥ 0'),
  fuelAdded: z.number().positive('fuelAdded must be > 0'),
  fuelGaugeMeasurement: z
    .object({ before: z.number(), after: z.number() })
    .optional(),
  fuelGaugeTotalCapacity: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export type CreateFuelConsumptionRecordInput = z.infer<
  typeof CreateFuelConsumptionRecordSchema
>
