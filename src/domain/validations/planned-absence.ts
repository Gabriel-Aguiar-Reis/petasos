import { z } from 'zod'

const DayOffSchema = z.object({
  type: z.literal('day_off'),
  date: z.date(),
  endDate: z
    .undefined({
      message: 'day_off cannot have an endDate',
    })
    .optional(),
  notes: z.string().optional(),
})

const VacationSchema = z
  .object({
    type: z.literal('vacation'),
    date: z.date(),
    endDate: z.date(),
    notes: z.string().optional(),
  })
  .refine((v) => v.endDate >= v.date, {
    message: 'endDate must be >= date',
    path: ['endDate'],
  })

export const CreatePlannedAbsenceSchema = z.discriminatedUnion('type', [
  DayOffSchema,
  VacationSchema,
])

export const UpdatePlannedAbsenceSchema = z.object({
  workedDays: z.array(z.date()).optional(),
  cancelledAt: z.date().optional(),
  notes: z.string().nullable().optional(),
})

export type CreatePlannedAbsenceInput = z.infer<
  typeof CreatePlannedAbsenceSchema
>
export type UpdatePlannedAbsenceInput = z.infer<
  typeof UpdatePlannedAbsenceSchema
>
