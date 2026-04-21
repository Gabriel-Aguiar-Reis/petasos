import type { FuelPriceRecord } from '@/src/domain/entities/fuel-price-record'
import type { IFuelPriceRecordRepository } from '@/src/domain/repositories/fuel-price-record.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { fuelPriceRecords } from '@/src/infra/db/schema/fuel-price-records.drizzle-schema'
import { StorageError } from '@/src/lib/errors'
import { desc, eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleFuelPriceRecordRepository implements IFuelPriceRecordRepository {
  constructor(private readonly db: DB) {}

  async create(record: FuelPriceRecord): Promise<FuelPriceRecord> {
    try {
      await this.db.insert(fuelPriceRecords).values({
        id: record.id,
        fuelTypeId: record.fuelTypeId,
        date: record.date,
        pricePerLiter: record.pricePerLiter,
        notes: record.notes ?? null,
      })
      return record
    } catch (err) {
      throw new StorageError('Failed to create fuel price record', err)
    }
  }

  async findLatestByFuelType(
    fuelTypeId: string
  ): Promise<FuelPriceRecord | null> {
    try {
      const rows = await this.db
        .select()
        .from(fuelPriceRecords)
        .where(eq(fuelPriceRecords.fuelTypeId, fuelTypeId))
        .orderBy(desc(fuelPriceRecords.date))
        .limit(1)
      if (rows.length === 0) return null
      return this.toEntity(rows[0])
    } catch (err) {
      throw new StorageError('Failed to find latest fuel price record', err)
    }
  }

  async findAll(): Promise<FuelPriceRecord[]> {
    try {
      const rows = await this.db.select().from(fuelPriceRecords)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to fetch fuel price records', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.delete(fuelPriceRecords).where(eq(fuelPriceRecords.id, id))
    } catch (err) {
      throw new StorageError('Failed to delete fuel price record', err)
    }
  }

  private toEntity(row: typeof fuelPriceRecords.$inferSelect): FuelPriceRecord {
    return {
      id: row.id,
      fuelTypeId: row.fuelTypeId,
      date: row.date,
      pricePerLiter: row.pricePerLiter,
      notes: row.notes ?? undefined,
    }
  }
}
