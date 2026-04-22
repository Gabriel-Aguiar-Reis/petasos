import type { SavedProfitGoal } from '@/src/domain/entities/saved-profit-goal'
import type { ISavedProfitGoalRepository } from '@/src/domain/repositories/saved-profit-goal.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { savedProfitGoals } from '@/src/infra/db/schema/profit-goals.drizzle-schema'
import { StorageError } from '@/src/lib/errors'
import { eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleSavedProfitGoalRepository implements ISavedProfitGoalRepository {
  constructor(private readonly db: DB) { }

  async create(goal: SavedProfitGoal): Promise<SavedProfitGoal> {
    try {
      await this.db.insert(savedProfitGoals).values({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        period: goal.period ?? null,
        tags: goal.tags ? JSON.stringify(goal.tags) : null,
        notes: goal.notes ?? null,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      })
      return goal
    } catch (err) {
      throw new StorageError('Failed to create saved profit goal', err)
    }
  }

  async findById(id: string): Promise<SavedProfitGoal | null> {
    try {
      const rows = await this.db
        .select()
        .from(savedProfitGoals)
        .where(eq(savedProfitGoals.id, id))
      if (rows.length === 0) return null
      return this.toEntity(rows[0])
    } catch (err) {
      throw new StorageError('Failed to find saved profit goal', err)
    }
  }

  async findAll(): Promise<SavedProfitGoal[]> {
    try {
      const rows = await this.db.select().from(savedProfitGoals)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list saved profit goals', err)
    }
  }

  async update(goal: SavedProfitGoal): Promise<SavedProfitGoal> {
    try {
      await this.db
        .update(savedProfitGoals)
        .set({
          name: goal.name,
          targetAmount: goal.targetAmount,
          period: goal.period ?? null,
          tags: goal.tags ? JSON.stringify(goal.tags) : null,
          notes: goal.notes ?? null,
          updatedAt: goal.updatedAt,
        })
        .where(eq(savedProfitGoals.id, goal.id))
      return goal
    } catch (err) {
      throw new StorageError('Failed to update saved profit goal', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.delete(savedProfitGoals).where(eq(savedProfitGoals.id, id))
    } catch (err) {
      throw new StorageError('Failed to delete saved profit goal', err)
    }
  }

  private toEntity(row: typeof savedProfitGoals.$inferSelect): SavedProfitGoal {
    return {
      id: row.id,
      name: row.name,
      targetAmount: row.targetAmount,
      period: (row.period as SavedProfitGoal['period']) ?? undefined,
      tags: row.tags ? (JSON.parse(row.tags) as string[]) : undefined,
      notes: row.notes ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
