import type { UserSettings } from '@/src/domain/entities/user-settings'
import type { IUserSettingsRepository } from '@/src/domain/repositories/user-settings.interface.repository'

export class GetUserSettings {
  constructor(private readonly repo: IUserSettingsRepository) {}

  async execute(): Promise<UserSettings> {
    return this.repo.get()
  }
}
