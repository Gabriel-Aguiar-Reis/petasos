import type { MaintenanceTrigger } from '@/src/domain/entities/maintenance'
import { Maintenance } from '@/src/domain/entities/maintenance'
import type { IMaintenanceRepository } from '@/src/domain/repositories/maintenance.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { maintenances } from '@/src/infra/db/schema/maintenances.drizzle-schema'
import { StorageError } from '@/src/lib/errors'
import { eq, isNull } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleMaintenanceRepository implements IMaintenanceRepository {
  constructor(private readonly db: DB) {}

  async create(maintenance: Maintenance): Promise<Maintenance> {
    try {
      await this.db.insert(maintenances).values({
        id: maintenance.id,
        vehicleId: maintenance.vehicleId,
        title: maintenance.title,
        estimatedCost: maintenance.estimatedCost,
        triggerType: maintenance.trigger.type,
        triggerDate:
          maintenance.trigger.type === 'date' ? maintenance.trigger.date : null,
        triggerMileage:
          maintenance.trigger.type === 'mileage'
            ? maintenance.trigger.mileage
            : null,
        completedAt: maintenance.completedAt ?? null,
        notes: maintenance.notes ?? null,
      })
      return maintenance
    } catch (err) {
      throw new StorageError('Failed to create maintenance', err)
    }
  }

  async findById(id: string): Promise<Maintenance | null> {
    try {
      const rows = await this.db
        .select()
        .from(maintenances)
        .where(eq(maintenances.id, id))
      if (rows.length === 0) return null
      return this.toEntity(rows[0])
    } catch (err) {
      throw new StorageError('Failed to find maintenance', err)
    }
  }

  async findByVehicle(vehicleId: string): Promise<Maintenance[]> {
    try {
      const rows = await this.db
        .select()
        .from(maintenances)
        .where(eq(maintenances.vehicleId, vehicleId))
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list maintenances by vehicle', err)
    }
  }

  async findPending(): Promise<Maintenance[]> {
    try {
      const rows = await this.db
        .select()
        .from(maintenances)
        .where(isNull(maintenances.completedAt))
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list pending maintenances', err)
    }
  }

  async update(maintenance: Maintenance): Promise<Maintenance> {
    try {
      await this.db
        .update(maintenances)
        .set({
          title: maintenance.title,
          estimatedCost: maintenance.estimatedCost,
          triggerType: maintenance.trigger.type,
          triggerDate:
            maintenance.trigger.type === 'date'
              ? maintenance.trigger.date
              : null,
          triggerMileage:
            maintenance.trigger.type === 'mileage'
              ? maintenance.trigger.mileage
              : null,
          completedAt: maintenance.completedAt ?? null,
          notes: maintenance.notes ?? null,
        })
        .where(eq(maintenances.id, maintenance.id))
      return maintenance
    } catch (err) {
      throw new StorageError('Failed to update maintenance', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.delete(maintenances).where(eq(maintenances.id, id))
    } catch (err) {
      throw new StorageError('Failed to delete maintenance', err)
    }
  }

  private toEntity(row: typeof maintenances.$inferSelect): Maintenance {
    let trigger: MaintenanceTrigger
    if (row.triggerType === 'date' && row.triggerDate != null) {
      trigger = { type: 'date', date: row.triggerDate }
    } else if (row.triggerType === 'mileage' && row.triggerMileage != null) {
      trigger = { type: 'mileage', mileage: row.triggerMileage }
    } else {
      throw new StorageError(
        `Invalid trigger data for maintenance ${row.id}`,
        undefined
      )
    }
    return Maintenance.reconstitute({
      id: row.id,
      vehicleId: row.vehicleId,
      title: row.title,
      estimatedCost: row.estimatedCost,
      trigger,
      completedAt: row.completedAt ?? undefined,
      notes: row.notes ?? undefined,
    })
  }
}
