import { z } from 'zod'

export const CreateVehicleSchema = z.object({
  name: z.string().min(1, 'name must not be empty'),
  plate: z.string().min(1, 'plate must not be empty'),
  brand: z.string().min(1, 'brand must not be empty'),
  model: z.string().min(1, 'model must not be empty'),
  year: z
    .number()
    .int()
    .min(1900, 'year must be ≥ 1900')
    .max(new Date().getFullYear() + 1, 'year must not be in the future'),
  fuelTypeId: z.string().min(1, 'fuelTypeId must not be empty'),
  typeId: z.string().min(1, 'typeId must not be empty'),
  color: z.string().optional(),
  notes: z.string().optional(),
})

export const UpdateVehicleSchema = z.object({
  name: z.string().min(1, 'name must not be empty').optional(),
  plate: z.string().min(1, 'plate must not be empty').optional(),
  brand: z.string().min(1, 'brand must not be empty').optional(),
  model: z.string().min(1, 'model must not be empty').optional(),
  year: z
    .number()
    .int()
    .min(1900, 'year must be ≥ 1900')
    .max(new Date().getFullYear() + 1, 'year must not be in the future')
    .optional(),
  fuelTypeId: z.string().min(1, 'fuelTypeId must not be empty').optional(),
  typeId: z.string().min(1, 'typeId must not be empty').optional(),
  color: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>
