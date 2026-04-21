import { z } from 'zod'

export const CreateTripPlatformSchema = z.object({
  name: z.string().min(1, 'name must not be empty'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const UpdateTripPlatformSchema = z.object({
  name: z.string().min(1, 'name must not be empty').optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type CreateTripPlatformInput = z.infer<typeof CreateTripPlatformSchema>
export type UpdateTripPlatformInput = z.infer<typeof UpdateTripPlatformSchema>
