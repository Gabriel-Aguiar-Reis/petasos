import type { VehicleType } from '@/src/domain/entities/vehicle-type'

export interface IVehicleTypeRepository {
  create(vehicleType: VehicleType): Promise<VehicleType>
  findById(id: string): Promise<VehicleType>
  findAll(): Promise<VehicleType[]>
  update(vehicleType: VehicleType): Promise<VehicleType>
  delete(id: string): Promise<void>
}
