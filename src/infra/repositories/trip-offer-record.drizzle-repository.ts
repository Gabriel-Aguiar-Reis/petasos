import type { TripOfferRecord } from '@/src/domain/entities/trip-offer-record'
import type { ITripOfferRecordRepository } from '@/src/domain/repositories/trip-offer-record.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { tripOfferRecords } from '@/src/infra/db/schema/trip-offer-records.drizzle-schema'
import { StorageError } from '@/src/lib/errors'
import { and, eq, gte, lte } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleTripOfferRecordRepository implements ITripOfferRecordRepository {
  constructor(private readonly db: DB) {}

  async create(record: TripOfferRecord): Promise<TripOfferRecord> {
    try {
      await this.db.insert(tripOfferRecords).values({
        id: record.id,
        platformId: record.platformId,
        vehicleId: record.vehicleId,
        date: record.date,
        offeredFare: record.offeredFare,
        estimatedDistance: record.estimatedDistance,
        deadheadDistance: record.deadheadDistance,
        estimatedDuration: record.estimatedDuration,
        deadheadDuration: record.deadheadDuration,
        passengerRating: record.passengerRating ?? null,
        notes: record.notes ?? null,
      })
      return record
    } catch (err) {
      throw new StorageError('Failed to create trip offer record', err)
    }
  }

  async findById(id: string): Promise<TripOfferRecord | null> {
    try {
      const rows = await this.db
        .select()
        .from(tripOfferRecords)
        .where(eq(tripOfferRecords.id, id))
        .limit(1)
      if (rows.length === 0) return null
      return this.toEntity(rows[0])
    } catch (err) {
      throw new StorageError('Failed to find trip offer record', err)
    }
  }

  async findAll(): Promise<TripOfferRecord[]> {
    try {
      const rows = await this.db.select().from(tripOfferRecords)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to fetch trip offer records', err)
    }
  }

  async findByDateRange(from: Date, to: Date): Promise<TripOfferRecord[]> {
    try {
      const rows = await this.db
        .select()
        .from(tripOfferRecords)
        .where(
          and(gte(tripOfferRecords.date, from), lte(tripOfferRecords.date, to))
        )
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError(
        'Failed to fetch trip offer records by date range',
        err
      )
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.delete(tripOfferRecords).where(eq(tripOfferRecords.id, id))
    } catch (err) {
      throw new StorageError('Failed to delete trip offer record', err)
    }
  }

  private toEntity(row: typeof tripOfferRecords.$inferSelect): TripOfferRecord {
    return {
      id: row.id,
      platformId: row.platformId,
      vehicleId: row.vehicleId,
      date: row.date,
      offeredFare: row.offeredFare,
      estimatedDistance: row.estimatedDistance,
      deadheadDistance: row.deadheadDistance,
      estimatedDuration: row.estimatedDuration,
      deadheadDuration: row.deadheadDuration,
      passengerRating: row.passengerRating ?? undefined,
      notes: row.notes ?? undefined,
    }
  }
}
