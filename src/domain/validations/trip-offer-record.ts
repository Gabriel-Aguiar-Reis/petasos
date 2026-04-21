import { z } from 'zod'

export const CreateTripOfferRecordSchema = z.object({
  platformId: z.string().min(1, 'platformId is required'),
  vehicleId: z.string().min(1, 'vehicleId is required'),
  date: z.date().optional(),
  offeredFare: z.number().nonnegative('offeredFare must be ≥ 0'),
  estimatedDistance: z.number().nonnegative('estimatedDistance must be ≥ 0'),
  deadheadDistance: z.number().nonnegative('deadheadDistance must be ≥ 0'),
  estimatedDuration: z.number().nonnegative('estimatedDuration must be ≥ 0'),
  deadheadDuration: z.number().nonnegative('deadheadDuration must be ≥ 0'),
  passengerRating: z.number().min(0).max(5).optional(),
  notes: z.string().optional(),
})

export type CreateTripOfferRecordInput = z.infer<
  typeof CreateTripOfferRecordSchema
>
