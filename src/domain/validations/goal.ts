import { z } from 'zod'

export const GoalTypeEnum = z.enum(['daily', 'weekly', 'monthly'])

export const CreateGoalSchema = z.object({
  type: GoalTypeEnum,
  targetAmount: z.number().positive('targetAmount must be > 0'),
  periodStart: z.date().optional(),
})

export const UpdateGoalSchema = z.object({
  type: GoalTypeEnum.optional(),
  targetAmount: z.number().positive('targetAmount must be > 0').optional(),
  periodStart: z.date().optional(),
})

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>
