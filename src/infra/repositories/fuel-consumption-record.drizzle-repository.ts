import type { FuelConsumptionRecord } from '@/src/domain/entities/fuel-consumption-record'
import type { IFuelConsumptionRecordRepository } from '@/src/domain/repositories/fuel-consumption-record.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { fuelConsumptionRecords } from '@/src/infra/db/schema/fuel-consumption-records.drizzle-schema'
import { StorageError } from '@/src/lib/errors'
import { eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleFuelConsumptionRecordRepository implements IFuelConsumptionRecordRepository {
  constructor(private readonly db: DB) {}

  async create(record: FuelConsumptionRecord): Promise<FuelConsumptionRecord> {
    try {
      await this.db.insert(fuelConsumptionRecords).values({
        id: record.id,
        vehicleId: record.vehicleId,
        fuelTypeId: record.fuelTypeId,
        date: record.date,
        startMileage: record.startMileage,
        endMileage: record.endMileage,
        fuelAdded: record.fuelAdded,
        averageConsumption: record.averageConsumption,
        gaugeBefore: record.fuelGaugeMeasurement?.before ?? null,
        gaugeAfter: record.fuelGaugeMeasurement?.after ?? null,
        gaugeTotalCapacity: record.fuelGaugeTotalCapacity ?? null,
        tags: record.tags ? JSON.stringify(record.tags) : null,
        notes: record.notes ?? null,
      })
      return record
    } catch (err) {
      throw new StorageError('Failed to create fuel consumption record', err)
    }
  }

  async findById(id: string): Promise<FuelConsumptionRecord | null> {
    try {
      const rows = await this.db
        .select()
        .from(fuelConsumptionRecords)
        .where(eq(fuelConsumptionRecords.id, id))
        .limit(1)
      if (rows.length === 0) return null
      return this.toEntity(rows[0])
    } catch (err) {
      throw new StorageError('Failed to find fuel consumption record', err)
    }
  }

  async findByVehicle(vehicleId: string): Promise<FuelConsumptionRecord[]> {
    try {
      const rows = await this.db
        .select()
        .from(fuelConsumptionRecords)
        .where(eq(fuelConsumptionRecords.vehicleId, vehicleId))
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError(
        'Failed to fetch fuel consumption records by vehicle',
        err
      )
    }
  }

  async findAll(): Promise<FuelConsumptionRecord[]> {
    try {
      const rows = await this.db.select().from(fuelConsumptionRecords)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to fetch fuel consumption records', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db
        .delete(fuelConsumptionRecords)
        .where(eq(fuelConsumptionRecords.id, id))
    } catch (err) {
      throw new StorageError('Failed to delete fuel consumption record', err)
    }
  }

  private toEntity(
    row: typeof fuelConsumptionRecords.$inferSelect
  ): FuelConsumptionRecord {
    return {
      id: row.id,
      vehicleId: row.vehicleId,
      fuelTypeId: row.fuelTypeId,
      date: row.date,
      startMileage: row.startMileage,
      endMileage: row.endMileage,
      fuelAdded: row.fuelAdded,
      averageConsumption: row.averageConsumption,
      fuelGaugeMeasurement:
        row.gaugeBefore != null && row.gaugeAfter != null
          ? { before: row.gaugeBefore, after: row.gaugeAfter }
          : undefined,
      fuelGaugeTotalCapacity: row.gaugeTotalCapacity ?? undefined,
      tags: row.tags ? (JSON.parse(row.tags) as string[]) : undefined,
      notes: row.notes ?? undefined,
    }
  }
}
