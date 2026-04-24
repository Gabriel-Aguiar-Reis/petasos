import type { PlatformProfitGoal } from '@/src/domain/entities/platform-profit-goal'
import type { IPlatformProfitGoalRepository } from '@/src/domain/repositories/platform-profit-goal.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { platformProfitGoals } from '@/src/infra/db/schema/profit-goals.drizzle-schema'
import { StorageError } from '@/src/lib/errors'
import { eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzlePlatformProfitGoalRepository implements IPlatformProfitGoalRepository {
  constructor(private readonly db: DB) {}

  async create(goal: PlatformProfitGoal): Promise<PlatformProfitGoal> {
    try {
      await this.db.insert(platformProfitGoals).values({
        id: goal.id,
        platformId: goal.platformId,
        targetAmount: goal.targetAmount,
        tags: goal.tags ? JSON.stringify(goal.tags) : null,
        notes: goal.notes ?? null,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      })
      return goal
    } catch (err) {
      throw new StorageError('Failed to create platform profit goal', err)
    }
  }

  async findById(id: string): Promise<PlatformProfitGoal | null> {
    try {
      const rows = await this.db
        .select()
        .from(platformProfitGoals)
        .where(eq(platformProfitGoals.id, id))
      if (rows.length === 0) return null
      return this.toEntity(rows[0])
    } catch (err) {
      throw new StorageError('Failed to find platform profit goal', err)
    }
  }

  async findByPlatform(platformId: string): Promise<PlatformProfitGoal[]> {
    try {
      const rows = await this.db
        .select()
        .from(platformProfitGoals)
        .where(eq(platformProfitGoals.platformId, platformId))
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError(
        'Failed to find platform profit goals by platform',
        err
      )
    }
  }

  async update(goal: PlatformProfitGoal): Promise<PlatformProfitGoal> {
    try {
      await this.db
        .update(platformProfitGoals)
        .set({
          targetAmount: goal.targetAmount,
          tags: goal.tags ? JSON.stringify(goal.tags) : null,
          notes: goal.notes ?? null,
          updatedAt: goal.updatedAt,
        })
        .where(eq(platformProfitGoals.id, goal.id))
      return goal
    } catch (err) {
      throw new StorageError('Failed to update platform profit goal', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db
        .delete(platformProfitGoals)
        .where(eq(platformProfitGoals.id, id))
    } catch (err) {
      throw new StorageError('Failed to delete platform profit goal', err)
    }
  }

  private toEntity(
    row: typeof platformProfitGoals.$inferSelect
  ): PlatformProfitGoal {
    return {
      id: row.id,
      platformId: row.platformId,
      targetAmount: row.targetAmount,
      tags: row.tags ? (JSON.parse(row.tags) as string[]) : undefined,
      notes: row.notes ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
