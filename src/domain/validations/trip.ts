import { z } from 'zod'

export const CreateTripSchema = z.object({
  earnings: z.number().min(0, 'earnings must be ≥ 0'),
  platformId: z.string().min(1, 'platformId must not be empty'),
  date: z.date().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  distance: z.number().min(0, 'distance must be ≥ 0').optional(),
  duration: z.number().min(0, 'duration must be ≥ 0').optional(),
  vehicleId: z.uuidv4().optional(),
})

export const UpdateTripSchema = z.object({
  earnings: z.number().min(0, 'earnings must be ≥ 0').optional(),
  platformId: z.string().min(1, 'platformId must not be empty').optional(),
  date: z.date().optional(),
  origin: z.string().nullable().optional(),
  destination: z.string().nullable().optional(),
  distance: z.number().min(0, 'distance must be ≥ 0').nullable().optional(),
  duration: z.number().min(0, 'duration must be ≥ 0').nullable().optional(),
  vehicleId: z.uuidv4().nullable().optional(),
})

export type CreateTripInput = z.infer<typeof CreateTripSchema>
export type UpdateTripInput = z.infer<typeof UpdateTripSchema>
