import type { VehicleType } from '@/src/domain/entities/vehicle-type'
import type { IVehicleTypeRepository } from '@/src/domain/repositories/vehicle-type.interface.repository'
import type { UpdateVehicleTypeInput } from '@/src/domain/validations/vehicle-type'

export class UpdateVehicleType {
  constructor(private readonly vehicleTypeRepository: IVehicleTypeRepository) {}

  async execute(
    id: string,
    input: UpdateVehicleTypeInput
  ): Promise<VehicleType> {
    const existing = await this.vehicleTypeRepository.findById(id)
    const updated: VehicleType = {
      ...existing,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.tags !== undefined && { tags: input.tags }),
    }
    return this.vehicleTypeRepository.update(updated)
  }
}
