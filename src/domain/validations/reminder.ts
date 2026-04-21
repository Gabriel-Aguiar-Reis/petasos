import { z } from 'zod'

const RecurrenceSchema = z.object({
  rule: z.string().min(1),
  endDate: z.date().optional(),
  exceptions: z.array(z.date()).optional(),
})

export const CreateReminderSchema = z.object({
  message: z.string().min(1, 'message is required'),
  date: z.date(),
  alarm: z.boolean(),
  recurrence: RecurrenceSchema.optional(),
  notes: z.string().optional(),
})

export const UpdateReminderSchema = z.object({
  message: z.string().min(1).optional(),
  date: z.date().optional(),
  alarm: z.boolean().optional(),
  recurrence: RecurrenceSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type CreateReminderInput = z.infer<typeof CreateReminderSchema>
export type UpdateReminderInput = z.infer<typeof UpdateReminderSchema>
