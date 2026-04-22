import type { Profit } from '@/src/domain/entities/profit'
import type { IProfitRepository } from '@/src/domain/repositories/profit.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { profits } from '@/src/infra/db/schema/profits.drizzle-schema'
import { StorageError } from '@/src/lib/errors'
import { between, eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleProfitRepository implements IProfitRepository {
  constructor(private readonly db: DB) { }

  async create(profit: Profit): Promise<Profit> {
    try {
      await this.db.insert(profits).values({
        id: profit.id,
        date: profit.date,
        amount: profit.amount,
        platformId: profit.platformId,
        description: profit.description ?? null,
        tags: profit.tags ? JSON.stringify(profit.tags) : null,
      })
      return profit
    } catch (err) {
      throw new StorageError('Failed to create profit', err)
    }
  }

  async findById(id: string): Promise<Profit | null> {
    try {
      const rows = await this.db.select().from(profits).where(eq(profits.id, id))
      if (rows.length === 0) return null
      return this.toEntity(rows[0])
    } catch (err) {
      throw new StorageError('Failed to find profit', err)
    }
  }

  async findAll(): Promise<Profit[]> {
    try {
      const rows = await this.db.select().from(profits)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list profits', err)
    }
  }

  async findByDateRange(from: Date, to: Date): Promise<Profit[]> {
    try {
      const rows = await this.db
        .select()
        .from(profits)
        .where(between(profits.date, from, to))
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to find profits by date range', err)
    }
  }

  async update(profit: Profit): Promise<Profit> {
    try {
      await this.db
        .update(profits)
        .set({
          date: profit.date,
          amount: profit.amount,
          platformId: profit.platformId,
          description: profit.description ?? null,
          tags: profit.tags ? JSON.stringify(profit.tags) : null,
        })
        .where(eq(profits.id, profit.id))
      return profit
    } catch (err) {
      throw new StorageError('Failed to update profit', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.delete(profits).where(eq(profits.id, id))
    } catch (err) {
      throw new StorageError('Failed to delete profit', err)
    }
  }

  private toEntity(row: typeof profits.$inferSelect): Profit {
    return {
      id: row.id,
      date: row.date,
      amount: row.amount,
      platformId: row.platformId,
      description: row.description ?? undefined,
      tags: row.tags ? (JSON.parse(row.tags) as string[]) : undefined,
    }
  }
}
