import { z } from 'zod'

export const CreatePlatformProfitGoalSchema = z.object({
  platformId: z.string().min(1, 'platformId is required'),
  targetAmount: z.number().gt(0, 'targetAmount must be > 0'),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export const UpdatePlatformProfitGoalSchema = z.object({
  targetAmount: z.number().gt(0, 'targetAmount must be > 0').optional(),
  tags: z.array(z.string()).nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type CreatePlatformProfitGoalInput = z.infer<
  typeof CreatePlatformProfitGoalSchema
>
export type UpdatePlatformProfitGoalInput = z.infer<
  typeof UpdatePlatformProfitGoalSchema
>
