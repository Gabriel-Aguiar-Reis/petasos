import { z } from 'zod'

export const CreateSpecialDaySchema = z.object({
  date: z.date(),
  description: z.string().min(1, 'description is required'),
  type: z.string().optional(),
})

export const CreateOfficialSpecialDaySchema = z.object({
  id: z.string().min(1),
  date: z.date(),
  description: z.string().min(1),
  type: z.string().optional(),
})

export type CreateSpecialDayInput = z.infer<typeof CreateSpecialDaySchema>
export type CreateOfficialSpecialDayInput = z.infer<
  typeof CreateOfficialSpecialDaySchema
>
