import { z } from 'zod'

export const CreateProfitSchema = z.object({
  amount: z.number().gt(0, 'amount must be > 0'),
  platformId: z.string().min(1, 'platformId is required'),
  date: z.date().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const UpdateProfitSchema = z.object({
  amount: z.number().gt(0, 'amount must be > 0').optional(),
  platformId: z.string().min(1).optional(),
  date: z.date().optional(),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
})

export type CreateProfitInput = z.infer<typeof CreateProfitSchema>
export type UpdateProfitInput = z.infer<typeof UpdateProfitSchema>
