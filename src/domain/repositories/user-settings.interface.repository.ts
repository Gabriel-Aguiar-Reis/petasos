import type { UserSettings } from '../entities/user-settings'

export interface IUserSettingsRepository {
  get(): Promise<UserSettings>
  upsert(settings: UserSettings): Promise<UserSettings>
}
