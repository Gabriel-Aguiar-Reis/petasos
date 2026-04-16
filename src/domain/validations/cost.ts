import { z } from 'zod'

export const CreateCostSchema = z.object({
  amount: z.number().positive('amount must be > 0'),
  category: z.string().min(1, 'category must not be empty'),
  date: z.date().optional(),
})

export const UpdateCostSchema = z.object({
  amount: z.number().positive('amount must be > 0').optional(),
  category: z.string().min(1, 'category must not be empty').optional(),
  date: z.date().optional(),
})

export type CreateCostInput = z.infer<typeof CreateCostSchema>
export type UpdateCostInput = z.infer<typeof UpdateCostSchema>
