import { z } from 'zod'

export const CreateSavedProfitGoalSchema = z.object({
  name: z.string().min(1, 'name is required'),
  targetAmount: z.number().gt(0, 'targetAmount must be > 0'),
  period: z.enum(['daily', 'weekly', 'monthly', 'custom']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export const UpdateSavedProfitGoalSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().gt(0, 'targetAmount must be > 0').optional(),
  period: z.enum(['daily', 'weekly', 'monthly', 'custom']).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type CreateSavedProfitGoalInput = z.infer<
  typeof CreateSavedProfitGoalSchema
>
export type UpdateSavedProfitGoalInput = z.infer<
  typeof UpdateSavedProfitGoalSchema
>
