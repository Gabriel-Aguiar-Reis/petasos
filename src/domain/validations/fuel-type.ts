import { z } from 'zod'

export const CreateFuelTypeSchema = z.object({
  name: z.string().min(1, 'name must not be empty'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const UpdateFuelTypeSchema = z.object({
  name: z.string().min(1, 'name must not be empty').optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type CreateFuelTypeInput = z.infer<typeof CreateFuelTypeSchema>
export type UpdateFuelTypeInput = z.infer<typeof UpdateFuelTypeSchema>
