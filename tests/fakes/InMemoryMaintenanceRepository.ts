import type { Maintenance } from '@/src/domain/entities/maintenance'
import type { IMaintenanceRepository } from '@/src/domain/repositories/maintenance.interface.repository'

export class InMemoryMaintenanceRepository implements IMaintenanceRepository {
  private store: Map<string, Maintenance> = new Map()

  async create(maintenance: Maintenance): Promise<Maintenance> {
    this.store.set(maintenance.id, maintenance)
    return maintenance
  }

  async findById(id: string): Promise<Maintenance | null> {
    return this.store.get(id) ?? null
  }

  async findByVehicle(vehicleId: string): Promise<Maintenance[]> {
    return Array.from(this.store.values()).filter(
      (m) => m.vehicleId === vehicleId
    )
  }

  async findPending(): Promise<Maintenance[]> {
    return Array.from(this.store.values()).filter((m) => m.completedAt == null)
  }

  async update(maintenance: Maintenance): Promise<Maintenance> {
    this.store.set(maintenance.id, maintenance)
    return maintenance
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
