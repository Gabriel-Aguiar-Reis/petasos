import type { IVehicleTypeRepository } from '@/src/domain/repositories/vehicle-type.interface.repository'

export class DeleteVehicleType {
  constructor(private readonly vehicleTypeRepository: IVehicleTypeRepository) {}

  async execute(id: string): Promise<void> {
    return this.vehicleTypeRepository.delete(id)
  }
}
