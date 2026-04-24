import { z } from 'zod'

const RatingThresholdsSchema = z.object({
  redBelow: z.number(),
  orangeBelow: z.number(),
  blueAbove: z.number(),
})

const TripOfferPillSchema = z.object({
  orangeThresholdPct: z.number(),
  blueThresholdPct: z.number(),
  ratingThresholds: RatingThresholdsSchema.optional(),
})

const DisplayPreferencesSchema = z.object({
  showCosts: z.boolean().optional(),
  showProfits: z.boolean().optional(),
  showMaintenance: z.boolean().optional(),
  showReminders: z.boolean().optional(),
})

export const UpdateUserSettingsSchema = z.object({
  preferredUnits: z.enum(['km/l', 'mpg', 'l/100km']).optional(),
  currency: z
    .string()
    .min(3, 'currency must be at least 3 characters')
    .optional(),
  displayPreferences: DisplayPreferencesSchema.optional(),
  starredScreen: z.string().nullable().optional(),
  tripOfferPill: TripOfferPillSchema.nullable().optional(),
})

export type UpdateUserSettingsInput = z.infer<typeof UpdateUserSettingsSchema>
