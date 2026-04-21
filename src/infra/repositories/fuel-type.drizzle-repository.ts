import type { FuelType } from '@/src/domain/entities/fuel-type'
import type { IFuelTypeRepository } from '@/src/domain/repositories/fuel-type.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { fuelTypes } from '@/src/infra/db/schema/fuel-types.drizzle-schema'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleFuelTypeRepository implements IFuelTypeRepository {
  constructor(private readonly db: DB) {}

  async create(fuelType: FuelType): Promise<FuelType> {
    try {
      await this.db.insert(fuelTypes).values({
        id: fuelType.id,
        name: fuelType.name,
        description: fuelType.description ?? null,
        tags: fuelType.tags ? JSON.stringify(fuelType.tags) : null,
      })
      return fuelType
    } catch (err) {
      throw new StorageError('Failed to create fuel type', err)
    }
  }

  async findById(id: string): Promise<FuelType> {
    try {
      const rows = await this.db
        .select()
        .from(fuelTypes)
        .where(eq(fuelTypes.id, id))
      if (rows.length === 0) throw new NotFoundError('FuelType', id)
      return this.toEntity(rows[0])
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to find fuel type', err)
    }
  }

  async findAll(): Promise<FuelType[]> {
    try {
      const rows = await this.db.select().from(fuelTypes)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list fuel types', err)
    }
  }

  async update(fuelType: FuelType): Promise<FuelType> {
    try {
      await this.findById(fuelType.id)
      await this.db
        .update(fuelTypes)
        .set({
          name: fuelType.name,
          description: fuelType.description ?? null,
          tags: fuelType.tags ? JSON.stringify(fuelType.tags) : null,
        })
        .where(eq(fuelTypes.id, fuelType.id))
      return fuelType
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to update fuel type', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id)
      await this.db.delete(fuelTypes).where(eq(fuelTypes.id, id))
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to delete fuel type', err)
    }
  }

  private toEntity(row: typeof fuelTypes.$inferSelect): FuelType {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      tags: row.tags ? (JSON.parse(row.tags) as string[]) : undefined,
    }
  }
}
