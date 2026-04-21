import type { TripPlatform } from '@/src/domain/entities/trip-platform'
import type { ITripPlatformRepository } from '@/src/domain/repositories/trip-platform.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { tripPlatforms } from '@/src/infra/db/schema/trip-platforms.drizzle-schema'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleTripPlatformRepository implements ITripPlatformRepository {
  constructor(private readonly db: DB) {}

  async create(tripPlatform: TripPlatform): Promise<TripPlatform> {
    try {
      await this.db.insert(tripPlatforms).values({
        id: tripPlatform.id,
        name: tripPlatform.name,
        description: tripPlatform.description ?? null,
        tags: tripPlatform.tags ? JSON.stringify(tripPlatform.tags) : null,
      })
      return tripPlatform
    } catch (err) {
      throw new StorageError('Failed to create trip platform', err)
    }
  }

  async findById(id: string): Promise<TripPlatform> {
    try {
      const rows = await this.db
        .select()
        .from(tripPlatforms)
        .where(eq(tripPlatforms.id, id))
      if (rows.length === 0) throw new NotFoundError('TripPlatform', id)
      return this.toEntity(rows[0])
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to find trip platform', err)
    }
  }

  async findAll(): Promise<TripPlatform[]> {
    try {
      const rows = await this.db.select().from(tripPlatforms)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list trip platforms', err)
    }
  }

  async update(tripPlatform: TripPlatform): Promise<TripPlatform> {
    try {
      await this.findById(tripPlatform.id)
      await this.db
        .update(tripPlatforms)
        .set({
          name: tripPlatform.name,
          description: tripPlatform.description ?? null,
          tags: tripPlatform.tags ? JSON.stringify(tripPlatform.tags) : null,
        })
        .where(eq(tripPlatforms.id, tripPlatform.id))
      return tripPlatform
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to update trip platform', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id)
      await this.db.delete(tripPlatforms).where(eq(tripPlatforms.id, id))
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to delete trip platform', err)
    }
  }

  private toEntity(row: typeof tripPlatforms.$inferSelect): TripPlatform {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      tags: row.tags ? (JSON.parse(row.tags) as string[]) : undefined,
    }
  }
}
