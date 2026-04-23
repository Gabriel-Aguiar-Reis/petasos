import type { UserSettings } from '@/src/domain/entities/user-settings'

export interface IUserSettingsRepository {
  get(): Promise<UserSettings>
  upsert(settings: UserSettings): Promise<UserSettings>
}
