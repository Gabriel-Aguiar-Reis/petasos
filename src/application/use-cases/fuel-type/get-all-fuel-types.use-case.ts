import type { FuelType } from '@/src/domain/entities/fuel-type'
import type { IFuelTypeRepository } from '@/src/domain/repositories/fuel-type.interface.repository'

export class GetAllFuelTypes {
  constructor(private readonly fuelTypeRepository: IFuelTypeRepository) {}

  async execute(): Promise<FuelType[]> {
    return this.fuelTypeRepository.findAll()
  }
}
