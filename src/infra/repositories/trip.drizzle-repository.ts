import { Trip } from '@/src/domain/entities/trip'
import type { ITripRepository } from '@/src/domain/repositories/trip.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { trips } from '@/src/infra/db/schema/trips.drizzle-schema'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import type { TripFilter } from '@/src/types/shared.types'
import { and, between, eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleTripRepository implements ITripRepository {
  constructor(private readonly db: DB) {}

  async create(trip: Trip): Promise<Trip> {
    try {
      await this.db.insert(trips).values({
        id: trip.id,
        date: trip.date,
        earnings: trip.earnings,
        platformId: trip.platformId,
        distance: trip.distance,
        duration: trip.duration,
        origin: trip.origin,
        destination: trip.destination,
        vehicleId: trip.vehicleId,
      })
      return trip
    } catch (err) {
      throw new StorageError('Failed to create trip', err)
    }
  }

  async findById(id: string): Promise<Trip> {
    try {
      const rows = await this.db.select().from(trips).where(eq(trips.id, id))
      if (rows.length === 0) throw new NotFoundError('Trip', id)
      return this.toEntity(rows[0])
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to find trip', err)
    }
  }

  async findAll(): Promise<Trip[]> {
    try {
      const rows = await this.db.select().from(trips)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list trips', err)
    }
  }

  async findByFilter(filters: TripFilter): Promise<Trip[]> {
    try {
      const conditions = []
      if (filters.dateRange) {
        conditions.push(
          between(trips.date, filters.dateRange.from, filters.dateRange.to)
        )
      }
      if (filters.platform) {
        conditions.push(eq(trips.platformId, filters.platform))
      }
      if (filters.vehicleId) {
        conditions.push(eq(trips.vehicleId, filters.vehicleId))
      }
      const rows =
        conditions.length > 0
          ? await this.db
              .select()
              .from(trips)
              .where(and(...conditions))
          : await this.db.select().from(trips)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to filter trips', err)
    }
  }

  async update(trip: Trip): Promise<Trip> {
    try {
      await this.findById(trip.id)
      await this.db
        .update(trips)
        .set({
          date: trip.date,
          earnings: trip.earnings,
          platformId: trip.platformId,
          distance: trip.distance,
          duration: trip.duration,
          origin: trip.origin,
          destination: trip.destination,
          vehicleId: trip.vehicleId,
        })
        .where(eq(trips.id, trip.id))
      return trip
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to update trip', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id)
      await this.db.delete(trips).where(eq(trips.id, id))
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to delete trip', err)
    }
  }

  private toEntity(row: typeof trips.$inferSelect): Trip {
    return Trip.reconstitute({
      id: row.id,
      date: row.date,
      earnings: row.earnings,
      platformId: row.platformId,
      distance: row.distance ?? null,
      duration: row.duration ?? null,
      origin: row.origin ?? null,
      destination: row.destination ?? null,
      vehicleId: row.vehicleId ?? null,
    })
  }
}
