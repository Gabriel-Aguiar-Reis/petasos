import { z } from 'zod'

export const CreateFuelPriceRecordSchema = z.object({
  fuelTypeId: z.string().min(1, 'fuelTypeId is required'),
  date: z.date().optional(),
  pricePerLiter: z.number().positive('pricePerLiter must be > 0'),
  notes: z.string().optional(),
})

export type CreateFuelPriceRecordInput = z.infer<
  typeof CreateFuelPriceRecordSchema
>
