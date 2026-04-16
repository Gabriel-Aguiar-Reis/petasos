import { FuelLog } from '@/src/domain/entities/fuel-log'
import type { IFuelLogRepository } from '@/src/domain/repositories/fuel-log.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { fuelLogs } from '@/src/infra/db/schema/fuel-logs.drizzle-schema'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { asc, eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleFuelLogRepository implements IFuelLogRepository {
  constructor(private readonly db: DB) {}

  async create(log: FuelLog): Promise<FuelLog> {
    try {
      await this.db.insert(fuelLogs).values({
        id: log.id,
        date: log.date,
        fuelType: log.fuelType,
        liters: log.liters,
        totalPrice: log.totalPrice,
        odometer: log.odometer,
      })
      return log
    } catch (err) {
      throw new StorageError('Failed to create fuel log', err)
    }
  }

  async findById(id: string): Promise<FuelLog> {
    try {
      const rows = await this.db
        .select()
        .from(fuelLogs)
        .where(eq(fuelLogs.id, id))
      if (rows.length === 0) throw new NotFoundError('FuelLog', id)
      return this.toEntity(rows[0])
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to find fuel log', err)
    }
  }

  async findAll(): Promise<FuelLog[]> {
    try {
      const rows = await this.db.select().from(fuelLogs)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list fuel logs', err)
    }
  }

  async findByFuelTypeOrderedByOdometer(fuelType: string): Promise<FuelLog[]> {
    try {
      const rows = await this.db
        .select()
        .from(fuelLogs)
        .where(eq(fuelLogs.fuelType, fuelType))
        .orderBy(asc(fuelLogs.odometer))
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to query fuel logs by type', err)
    }
  }

  async update(log: FuelLog): Promise<FuelLog> {
    try {
      await this.findById(log.id)
      await this.db
        .update(fuelLogs)
        .set({
          date: log.date,
          fuelType: log.fuelType,
          liters: log.liters,
          totalPrice: log.totalPrice,
          odometer: log.odometer,
        })
        .where(eq(fuelLogs.id, log.id))
      return log
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to update fuel log', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id)
      await this.db.delete(fuelLogs).where(eq(fuelLogs.id, id))
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to delete fuel log', err)
    }
  }

  private toEntity(row: typeof fuelLogs.$inferSelect): FuelLog {
    return FuelLog.reconstitute({
      id: row.id,
      date: row.date,
      fuelType: row.fuelType,
      liters: row.liters,
      totalPrice: row.totalPrice,
      odometer: row.odometer,
    })
  }
}
