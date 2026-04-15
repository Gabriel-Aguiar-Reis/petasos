import type { GoalType } from '@/src/domain/entities/goal'
import { Goal } from '@/src/domain/entities/goal'
import type { IGoalRepository } from '@/src/domain/repositories/goal.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { goals } from '@/src/infra/db/schema/goals.drizzle-schema'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleGoalRepository implements IGoalRepository {
  constructor(private readonly db: DB) { }

  async create(goal: Goal): Promise<Goal> {
    try {
      await this.db.insert(goals).values({
        id: goal.id,
        type: goal.type,
        targetAmount: goal.targetAmount,
        periodStart: goal.periodStart,
      })
      return goal
    } catch (err) {
      throw new StorageError('Failed to create goal', err)
    }
  }

  async findById(id: string): Promise<Goal> {
    try {
      const rows = await this.db.select().from(goals).where(eq(goals.id, id))
      if (rows.length === 0) throw new NotFoundError('Goal', id)
      return this.toEntity(rows[0])
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to find goal', err)
    }
  }

  async findAll(): Promise<Goal[]> {
    try {
      const rows = await this.db.select().from(goals)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list goals', err)
    }
  }

  async findByType(type: GoalType): Promise<Goal[]> {
    try {
      const rows = await this.db.select().from(goals).where(eq(goals.type, type))
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to filter goals by type', err)
    }
  }

  async update(goal: Goal): Promise<Goal> {
    try {
      await this.findById(goal.id)
      await this.db
        .update(goals)
        .set({
          type: goal.type,
          targetAmount: goal.targetAmount,
          periodStart: goal.periodStart,
        })
        .where(eq(goals.id, goal.id))
      return goal
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to update goal', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id)
      await this.db.delete(goals).where(eq(goals.id, id))
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to delete goal', err)
    }
  }

  private toEntity(row: typeof goals.$inferSelect): Goal {
    return Goal.reconstitute({
      id: row.id,
      type: row.type as GoalType,
      targetAmount: row.targetAmount,
      periodStart: row.periodStart,
    })
  }
}
