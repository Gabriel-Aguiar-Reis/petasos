import {
  DEFAULT_USER_SETTINGS,
  type UserSettings,
} from '@/src/domain/entities/user-settings'
import type { IUserSettingsRepository } from '@/src/domain/repositories/user-settings.interface.repository'

export class InMemoryUserSettingsRepository implements IUserSettingsRepository {
  private stored: UserSettings | null = null

  async get(): Promise<UserSettings> {
    if (!this.stored) {
      const now = new Date()
      return {
        id: 'default',
        userId: '',
        ...DEFAULT_USER_SETTINGS,
        createdAt: now,
        updatedAt: now,
      }
    }
    return this.stored
  }

  async upsert(settings: UserSettings): Promise<UserSettings> {
    this.stored = settings
    return settings
  }
}
