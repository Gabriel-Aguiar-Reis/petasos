import { Cost } from '@/src/domain/entities/cost'
import type { ICostRepository } from '@/src/domain/repositories/cost.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { costs } from '@/src/infra/db/schema/costs.drizzle-schema'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import type { CostFilter } from '@/src/types/shared.types'
import { and, between, eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleCostRepository implements ICostRepository {
  constructor(private readonly db: DB) { }

  async create(cost: Cost): Promise<Cost> {
    try {
      await this.db.insert(costs).values({
        id: cost.id,
        date: cost.date,
        amount: cost.amount,
        category: cost.category,
      })
      return cost
    } catch (err) {
      throw new StorageError('Failed to create cost', err)
    }
  }

  async findById(id: string): Promise<Cost> {
    try {
      const rows = await this.db.select().from(costs).where(eq(costs.id, id))
      if (rows.length === 0) throw new NotFoundError('Cost', id)
      return this.toEntity(rows[0])
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to find cost', err)
    }
  }

  async findAll(): Promise<Cost[]> {
    try {
      const rows = await this.db.select().from(costs)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list costs', err)
    }
  }

  async findByFilter(filters: CostFilter): Promise<Cost[]> {
    try {
      const conditions = []
      if (filters.dateRange) {
        conditions.push(
          between(costs.date, filters.dateRange.from, filters.dateRange.to)
        )
      }
      if (filters.category) {
        conditions.push(eq(costs.category, filters.category))
      }
      const rows =
        conditions.length > 0
          ? await this.db
            .select()
            .from(costs)
            .where(and(...conditions))
          : await this.db.select().from(costs)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to filter costs', err)
    }
  }

  async update(cost: Cost): Promise<Cost> {
    try {
      await this.findById(cost.id)
      await this.db
        .update(costs)
        .set({ date: cost.date, amount: cost.amount, category: cost.category })
        .where(eq(costs.id, cost.id))
      return cost
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to update cost', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id)
      await this.db.delete(costs).where(eq(costs.id, id))
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to delete cost', err)
    }
  }

  private toEntity(row: typeof costs.$inferSelect): Cost {
    return Cost.reconstitute({
      id: row.id,
      date: row.date,
      amount: row.amount,
      category: row.category,
    })
  }
}
