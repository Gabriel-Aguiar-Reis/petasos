import { type UserSettings } from '@/src/domain/entities/user-settings'
import type { IUserSettingsRepository } from '@/src/domain/repositories/user-settings.interface.repository'
import {
  UpdateUserSettingsSchema,
  type UpdateUserSettingsInput,
} from '@/src/domain/validations/user-settings'
import { ValidationError } from '@/src/lib/errors'

export class UpdateUserSettings {
  constructor(private readonly repo: IUserSettingsRepository) { }

  async execute(input: UpdateUserSettingsInput): Promise<UserSettings> {
    const parsed = UpdateUserSettingsSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }

    const current = await this.repo.get()
    const data = parsed.data

    const updated: UserSettings = {
      id: current.id,
      userId: current.userId,
      preferredUnits: data.preferredUnits ?? current.preferredUnits,
      currency: data.currency ?? current.currency,
      displayPreferences: data.displayPreferences
        ? {
          showCosts:
            data.displayPreferences.showCosts ??
            current.displayPreferences.showCosts,
          showProfits:
            data.displayPreferences.showProfits ??
            current.displayPreferences.showProfits,
          showMaintenance:
            data.displayPreferences.showMaintenance ??
            current.displayPreferences.showMaintenance,
          showReminders:
            data.displayPreferences.showReminders ??
            current.displayPreferences.showReminders,
        }
        : current.displayPreferences,
      starredScreen:
        data.starredScreen !== undefined
          ? (data.starredScreen ?? undefined)
          : current.starredScreen,
      tripOfferPill:
        data.tripOfferPill !== undefined
          ? (data.tripOfferPill ?? undefined)
          : current.tripOfferPill,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    }

    return this.repo.upsert(updated)
  }
}
