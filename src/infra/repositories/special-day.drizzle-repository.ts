import {
  SpecialDay,
  type SpecialDaySource,
} from '@/src/domain/entities/special-day'
import type { ISpecialDayRepository } from '@/src/domain/repositories/special-day.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { specialDays } from '@/src/infra/db/schema/special-days.drizzle-schema'
import { ConflictError, StorageError } from '@/src/lib/errors'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleSpecialDayRepository implements ISpecialDayRepository {
  constructor(private readonly db: DB) {}

  async create(specialDay: SpecialDay): Promise<SpecialDay> {
    try {
      await this.db.insert(specialDays).values({
        id: specialDay.id,
        date: specialDay.date,
        description: specialDay.description,
        source: specialDay.source,
        type: specialDay.type ?? null,
      })
      return specialDay
    } catch (err) {
      throw new StorageError('Failed to create special day', err)
    }
  }

  async findByDateRange(from: Date, to: Date): Promise<SpecialDay[]> {
    try {
      const rows = await this.db
        .select()
        .from(specialDays)
        .where(and(gte(specialDays.date, from), lte(specialDays.date, to)))
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to find special days by date range', err)
    }
  }

  async findByYear(year: number): Promise<SpecialDay[]> {
    try {
      const from = new Date(`${year}-01-01`)
      const to = new Date(`${year}-12-31`)
      return this.findByDateRange(from, to)
    } catch (err) {
      throw new StorageError('Failed to find special days by year', err)
    }
  }

  async upsertOfficial(specialDay: SpecialDay): Promise<SpecialDay> {
    try {
      await this.db
        .insert(specialDays)
        .values({
          id: specialDay.id,
          date: specialDay.date,
          description: specialDay.description,
          source: specialDay.source,
          type: specialDay.type ?? null,
        })
        .onConflictDoUpdate({
          target: specialDays.id,
          set: {
            description: sql`excluded.description`,
            type: sql`excluded.type`,
          },
        })
      return specialDay
    } catch (err) {
      throw new StorageError('Failed to upsert official special day', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const rows = await this.db
        .select()
        .from(specialDays)
        .where(eq(specialDays.id, id))
      if (rows.length > 0 && rows[0].source === 'official') {
        throw new ConflictError('Cannot delete official special day')
      }
      await this.db.delete(specialDays).where(eq(specialDays.id, id))
    } catch (err) {
      if (err instanceof ConflictError) throw err
      throw new StorageError('Failed to delete special day', err)
    }
  }

  private toEntity(row: typeof specialDays.$inferSelect): SpecialDay {
    return SpecialDay.reconstitute({
      id: row.id,
      date: row.date,
      description: row.description,
      source: row.source as SpecialDaySource,
      type: row.type ?? undefined,
    })
  }
}
