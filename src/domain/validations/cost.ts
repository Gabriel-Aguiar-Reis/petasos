import { z } from 'zod'

const RecurrenceSchema = z.object({
  rule: z.string().min(1, 'recurrence rule must not be empty'),
  endDate: z.date().optional(),
  exceptions: z.array(z.date()).optional(),
})

export const CreateCostSchema = z.object({
  amount: z.number().positive('amount must be > 0'),
  category: z.string().min(1, 'category must not be empty'),
  date: z.date().optional(),
  description: z.string().optional(),
  recurrence: RecurrenceSchema.optional(),
  tags: z.array(z.string()).optional(),
})

export const UpdateCostSchema = z.object({
  amount: z.number().positive('amount must be > 0').optional(),
  category: z.string().min(1, 'category must not be empty').optional(),
  date: z.date().optional(),
  description: z.string().nullable().optional(),
  recurrence: RecurrenceSchema.nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
})

export type CreateCostInput = z.infer<typeof CreateCostSchema>
export type UpdateCostInput = z.infer<typeof UpdateCostSchema>
