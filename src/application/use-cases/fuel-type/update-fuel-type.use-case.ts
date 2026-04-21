import type { FuelType } from '@/src/domain/entities/fuel-type'
import type { IFuelTypeRepository } from '@/src/domain/repositories/fuel-type.interface.repository'
import type { UpdateFuelTypeInput } from '@/src/domain/validations/fuel-type'

export class UpdateFuelType {
  constructor(private readonly fuelTypeRepository: IFuelTypeRepository) {}

  async execute(id: string, input: UpdateFuelTypeInput): Promise<FuelType> {
    const existing = await this.fuelTypeRepository.findById(id)
    const updated: FuelType = {
      ...existing,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.tags !== undefined && { tags: input.tags }),
    }
    return this.fuelTypeRepository.update(updated)
  }
}
