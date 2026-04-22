import type { FuelType } from '@/src/domain/entities/fuel-type'
import type { IFuelTypeRepository } from '@/src/domain/repositories/fuel-type.interface.repository'
import type { CreateFuelTypeInput } from '@/src/domain/validations/fuel-type'
import { v4 as uuidv4 } from 'uuid'

export class CreateFuelType {
  constructor(private readonly fuelTypeRepository: IFuelTypeRepository) {}

  async execute(input: CreateFuelTypeInput): Promise<FuelType> {
    const fuelType: FuelType = { id: uuidv4(), ...input }
    return this.fuelTypeRepository.create(fuelType)
  }
}
