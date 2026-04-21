import type { MileageRecord } from '@/src/domain/entities/mileage-record'
import type { IMileageRecordRepository } from '@/src/domain/repositories/mileage-record.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { mileageRecords } from '@/src/infra/db/schema/mileage-records.drizzle-schema'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { desc, eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleMileageRecordRepository implements IMileageRecordRepository {
  constructor(private readonly db: DB) {}

  async create(record: MileageRecord): Promise<MileageRecord> {
    try {
      await this.db.insert(mileageRecords).values({
        id: record.id,
        vehicleId: record.vehicleId,
        mileage: record.mileage,
        date: record.date,
        notes: record.notes ?? null,
      })
      return record
    } catch (err) {
      throw new StorageError('Failed to create mileage record', err)
    }
  }

  async findLatestByVehicle(vehicleId: string): Promise<MileageRecord | null> {
    try {
      const rows = await this.db
        .select()
        .from(mileageRecords)
        .where(eq(mileageRecords.vehicleId, vehicleId))
        .orderBy(desc(mileageRecords.mileage))
        .limit(1)
      return rows.length > 0 ? this.toEntity(rows[0]) : null
    } catch (err) {
      throw new StorageError('Failed to find latest mileage record', err)
    }
  }

  async findByVehicle(vehicleId: string): Promise<MileageRecord[]> {
    try {
      const rows = await this.db
        .select()
        .from(mileageRecords)
        .where(eq(mileageRecords.vehicleId, vehicleId))
        .orderBy(desc(mileageRecords.mileage))
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list mileage records', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const rows = await this.db
        .select()
        .from(mileageRecords)
        .where(eq(mileageRecords.id, id))
      if (rows.length === 0) throw new NotFoundError('MileageRecord', id)
      await this.db.delete(mileageRecords).where(eq(mileageRecords.id, id))
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to delete mileage record', err)
    }
  }

  private toEntity(row: typeof mileageRecords.$inferSelect): MileageRecord {
    return {
      id: row.id,
      vehicleId: row.vehicleId,
      mileage: row.mileage,
      date: row.date,
      notes: row.notes ?? undefined,
    }
  }
}
