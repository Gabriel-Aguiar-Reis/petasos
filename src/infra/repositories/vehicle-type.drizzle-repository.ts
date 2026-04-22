import type { VehicleType } from '@/src/domain/entities/vehicle-type'
import type { IVehicleTypeRepository } from '@/src/domain/repositories/vehicle-type.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { vehicleTypes } from '@/src/infra/db/schema/vehicle-types.drizzle-schema'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleVehicleTypeRepository implements IVehicleTypeRepository {
  constructor(private readonly db: DB) {}

  async create(vehicleType: VehicleType): Promise<VehicleType> {
    try {
      await this.db.insert(vehicleTypes).values({
        id: vehicleType.id,
        name: vehicleType.name,
        description: vehicleType.description ?? null,
        tags: vehicleType.tags ? JSON.stringify(vehicleType.tags) : null,
      })
      return vehicleType
    } catch (err) {
      throw new StorageError('Failed to create vehicle type', err)
    }
  }

  async findById(id: string): Promise<VehicleType> {
    try {
      const rows = await this.db
        .select()
        .from(vehicleTypes)
        .where(eq(vehicleTypes.id, id))
      if (rows.length === 0) throw new NotFoundError('VehicleType', id)
      return this.toEntity(rows[0])
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to find vehicle type', err)
    }
  }

  async findAll(): Promise<VehicleType[]> {
    try {
      const rows = await this.db.select().from(vehicleTypes)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list vehicle types', err)
    }
  }

  async update(vehicleType: VehicleType): Promise<VehicleType> {
    try {
      await this.findById(vehicleType.id)
      await this.db
        .update(vehicleTypes)
        .set({
          name: vehicleType.name,
          description: vehicleType.description ?? null,
          tags: vehicleType.tags ? JSON.stringify(vehicleType.tags) : null,
        })
        .where(eq(vehicleTypes.id, vehicleType.id))
      return vehicleType
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to update vehicle type', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id)
      await this.db.delete(vehicleTypes).where(eq(vehicleTypes.id, id))
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to delete vehicle type', err)
    }
  }

  private toEntity(row: typeof vehicleTypes.$inferSelect): VehicleType {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      tags: row.tags ? (JSON.parse(row.tags) as string[]) : undefined,
    }
  }
}
