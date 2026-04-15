import { z } from 'zod'

export const CreateFuelLogSchema = z.object({
  fuelType: z.string().min(1, 'fuelType must not be empty'),
  liters: z.number().positive('liters must be > 0'),
  totalPrice: z.number().positive('totalPrice must be > 0'),
  odometer: z.number().min(0, 'odometer must be ≥ 0'),
  date: z.date().optional(),
})

export type CreateFuelLogInput = z.infer<typeof CreateFuelLogSchema>
