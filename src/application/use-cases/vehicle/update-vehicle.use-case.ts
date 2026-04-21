import type { Vehicle } from '@/src/domain/entities/vehicle'
import type { IVehicleRepository } from '@/src/domain/repositories/vehicle.interface.repository'
import type { UpdateVehicleInput } from '@/src/domain/validations/vehicle'

export class UpdateVehicle {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    const existing = await this.vehicleRepository.findById(id)
    const updated = existing.update(input)
    return this.vehicleRepository.update(updated)
  }
}
