import { z } from 'zod'

export const CreateVehicleTypeSchema = z.object({
  name: z.string().min(1, 'name must not be empty'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const UpdateVehicleTypeSchema = z.object({
  name: z.string().min(1, 'name must not be empty').optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type CreateVehicleTypeInput = z.infer<typeof CreateVehicleTypeSchema>
export type UpdateVehicleTypeInput = z.infer<typeof UpdateVehicleTypeSchema>
