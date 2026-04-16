import type { Vehicle } from '@/src/domain/entities/vehicle'

export interface IVehicleRepository {
  create(vehicle: Vehicle): Promise<Vehicle>
  findById(id: string): Promise<Vehicle>
  findAll(): Promise<Vehicle[]>
  update(vehicle: Vehicle): Promise<Vehicle>
  delete(id: string): Promise<void>
}
