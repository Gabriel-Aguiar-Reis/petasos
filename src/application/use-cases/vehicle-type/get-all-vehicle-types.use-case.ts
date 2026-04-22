import type { VehicleType } from '@/src/domain/entities/vehicle-type'
import type { IVehicleTypeRepository } from '@/src/domain/repositories/vehicle-type.interface.repository'

export class GetAllVehicleTypes {
  constructor(private readonly vehicleTypeRepository: IVehicleTypeRepository) {}

  async execute(): Promise<VehicleType[]> {
    return this.vehicleTypeRepository.findAll()
  }
}
