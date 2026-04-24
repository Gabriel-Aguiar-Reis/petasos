import {
  DEFAULT_USER_SETTINGS,
  type UserSettings,
} from '@/src/domain/entities/user-settings'
import type { IUserSettingsRepository } from '@/src/domain/repositories/user-settings.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { userSettings } from '@/src/infra/db/schema/user-settings.drizzle-schema'
import { StorageError } from '@/src/lib/errors'
import { eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleUserSettingsRepository implements IUserSettingsRepository {
  constructor(private readonly db: DB) {}

  async get(): Promise<UserSettings> {
    try {
      const rows = await this.db
        .select()
        .from(userSettings)
        .where(eq(userSettings.id, 'default'))
      if (rows.length === 0) {
        const now = new Date()
        return {
          id: 'default',
          userId: '',
          ...DEFAULT_USER_SETTINGS,
          createdAt: now,
          updatedAt: now,
        }
      }
      return this.toEntity(rows[0])
    } catch (err) {
      throw new StorageError('Failed to get user settings', err)
    }
  }

  async upsert(settings: UserSettings): Promise<UserSettings> {
    try {
      await this.db
        .insert(userSettings)
        .values({
          id: settings.id,
          userId: settings.userId,
          preferredUnits: settings.preferredUnits,
          currency: settings.currency,
          displayPreferences: JSON.stringify(settings.displayPreferences),
          starredScreen: settings.starredScreen ?? null,
          tripOfferPill: settings.tripOfferPill
            ? JSON.stringify(settings.tripOfferPill)
            : null,
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt,
        })
        .onConflictDoUpdate({
          target: userSettings.id,
          set: {
            preferredUnits: settings.preferredUnits,
            currency: settings.currency,
            displayPreferences: JSON.stringify(settings.displayPreferences),
            starredScreen: settings.starredScreen ?? null,
            tripOfferPill: settings.tripOfferPill
              ? JSON.stringify(settings.tripOfferPill)
              : null,
            updatedAt: settings.updatedAt,
          },
        })
      return settings
    } catch (err) {
      throw new StorageError('Failed to upsert user settings', err)
    }
  }

  private toEntity(row: typeof userSettings.$inferSelect): UserSettings {
    return {
      id: row.id,
      userId: row.userId,
      preferredUnits: row.preferredUnits as UserSettings['preferredUnits'],
      currency: row.currency,
      displayPreferences: JSON.parse(
        row.displayPreferences
      ) as UserSettings['displayPreferences'],
      starredScreen:
        (row.starredScreen as UserSettings['starredScreen']) ?? undefined,
      tripOfferPill: row.tripOfferPill
        ? (JSON.parse(row.tripOfferPill) as UserSettings['tripOfferPill'])
        : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
