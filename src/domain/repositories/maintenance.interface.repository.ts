import type { Maintenance } from '../entities/maintenance'

export interface IMaintenanceRepository {
  create(maintenance: Maintenance): Promise<Maintenance>
  findById(id: string): Promise<Maintenance | null>
  findByVehicle(vehicleId: string): Promise<Maintenance[]>
  findPending(): Promise<Maintenance[]>
  update(maintenance: Maintenance): Promise<Maintenance>
  delete(id: string): Promise<void>
}
