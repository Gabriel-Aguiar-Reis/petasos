import { Vehicle } from '@/src/domain/entities/vehicle'
import type { IVehicleRepository } from '@/src/domain/repositories/vehicle.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { vehicles } from '@/src/infra/db/schema/vehicles.drizzle-schema'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleVehicleRepository implements IVehicleRepository {
  constructor(private readonly db: DB) { }

  async create(vehicle: Vehicle): Promise<Vehicle> {
    try {
      await this.db.insert(vehicles).values({
        id: vehicle.id,
        name: vehicle.name,
        plate: vehicle.plate,
      })
      return vehicle
    } catch (err) {
      throw new StorageError('Failed to create vehicle', err)
    }
  }

  async findById(id: string): Promise<Vehicle> {
    try {
      const rows = await this.db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, id))
      if (rows.length === 0) throw new NotFoundError('Vehicle', id)
      return this.toEntity(rows[0])
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to find vehicle', err)
    }
  }

  async findAll(): Promise<Vehicle[]> {
    try {
      const rows = await this.db.select().from(vehicles)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list vehicles', err)
    }
  }

  async update(vehicle: Vehicle): Promise<Vehicle> {
    try {
      await this.findById(vehicle.id)
      await this.db
        .update(vehicles)
        .set({ name: vehicle.name, plate: vehicle.plate })
        .where(eq(vehicles.id, vehicle.id))
      return vehicle
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to update vehicle', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id)
      await this.db.delete(vehicles).where(eq(vehicles.id, id))
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to delete vehicle', err)
    }
  }

  private toEntity(row: typeof vehicles.$inferSelect): Vehicle {
    return Vehicle.reconstitute({
      id: row.id,
      name: row.name,
      plate: row.plate ?? null,
    })
  }
}
